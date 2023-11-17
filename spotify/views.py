from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .models import Vote
from .util import *
from api.models import Room
from django.http import JsonResponse
from django.shortcuts import redirect, render


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = (
            "user-read-playback-state user-modify-playback-state "
            "user-read-currently-playing playlist-read-private "
            "playlist-modify-public playlist-modify-private"
        )
        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key,
        access_token,
        token_type,
        expires_in,
        refresh_token,
    )

    return redirect("frontend:")


class IsAuthenticated(APIView):
    """
    API View to check if a user is authenticated with Spotify.
    """

    def get(self, request, format=None):
        try:
            is_authenticated = is_spotify_authenticated(
                self.request.session.session_key
            )
            return Response(
                {"status": is_authenticated}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return JsonResponse({"error": e}, status=500)


class CurrentSong(APIView):
    """
    API View to get the current song playing in the host Spotify app.
    """

    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "me/player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        playlist_id = self._playlist_id(response, host)

        artist_string = ""
        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "votes": votes,
            "votes_required": room.votes_to_skip,
            "id": song_id,
            "playlist_id": playlist_id,
            "playlist_name": room.current_playlist,
        }

        self._update_room_song(room, song_id, playlist_id)

        return Response(song, status=status.HTTP_200_OK)

    def _update_room_song(self, room, song_id, playlist_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.current_playlist = self._playlist_name(playlist_id, room.host)
            room.save(update_fields=["current_song", "current_playlist"])
            votes = Vote.objects.filter(room=room).delete()

    def _playlist_id(self, response, host):
        playback_data = response
        if (
            "context" in playback_data
            and playback_data["context"]
            and "playlist" in playback_data["context"]["type"]
        ):
            playlist_url = playback_data["context"]["external_urls"]["spotify"]
            playlist_id = playlist_url.split("/")[-1]
        return playlist_id

    def _playlist_name(self, playlist_id, host):
        endpoint = f"playlists/{playlist_id}"
        playlist_name = execute_spotify_api_request(host, endpoint)
        if "Error" in playlist_name:
            return {"Error": "Api rate"}

        return playlist_name["name"]


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code).first()
        if (
            self.request.session.session_key == room.host
            or room.guest_can_pause
        ):
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code).first()
        if (
            self.request.session.session_key == room.host
            or room.guest_can_pause
        ):
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSongVote(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code).first()

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if len(votes) + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
        else:
            Vote.objects.create(
                user=request.session.session_key,
                room=room,
                song_id=room.current_song,
            )

        return Response({}, status.HTTP_204_NO_CONTENT)


def check_user_vote(request):
    """
    Check if the current user has already voted.
    """
    vote_exists = Vote.objects.filter(
        user=request.session.session_key
    ).exists()
    return JsonResponse({"hasVoted": vote_exists})


class SearchSong(APIView):
    """
    API View for searching songs.
    """

    def get(self, request, format=None):
        room_code = request.session.get("room_code")
        room = Room.objects.filter(code=room_code).first()

        if not room:
            return Response(
                {"message": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )

        search_input = request.query_params.get("query", None)
        if search_input is None:
            return Response({})

        return Response(spotify_tracks(room.host, search_input))


class AddSongToPlaylist(APIView):
    """
    API View to add a song to a playlist.
    """

    def post(self, request, format=None):
        room_code = request.session.get("room_code")
        song_id = request.data.get("song_id")
        playlist_id = request.data.get("playlist_id")

        if not song_id or not playlist_id:
            return Response(
                {"message": "Missing song_id or playlist_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            room = Room.objects.get(code=room_code)
            endpoint = f"playlists/{playlist_id}/tracks"
            response = execute_spotify_api_request(
                room.host,
                endpoint,
                post_=True,
                data={"uris": [f"spotify:track:{song_id}"]},
            )

            if "error" in response:
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {"message": "Song added to playlist"},
                status=status.HTTP_200_OK,
            )

        except Room.DoesNotExist:
            return Response(
                {"message": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )
