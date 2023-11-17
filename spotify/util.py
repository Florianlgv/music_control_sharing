from datetime import timedelta
from requests import get, post, put
from django.utils import timezone

from .credentials import CLIENT_ID, CLIENT_SECRET
from .models import SpotifyToken

BASE_URL = "https://api.spotify.com/v1/"


def get_user_tokens(session_id):
    """
    Retrieve Spotify tokens for a given session ID.
    """
    user_tokens = SpotifyToken.objects.filter(user=session_id)

    return user_tokens.first()


def update_or_create_user_tokens(
    session_id, access_token, token_type, expires_in, refresh_token
):
    """
    Update or create Spotify tokens for a user based on the session ID.
    """
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    SpotifyToken.objects.update_or_create(
        user=session_id,
        defaults={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": token_type,
            "expires_in": expires_in,
        },
    )


def is_spotify_authenticated(session_id):
    """
    Check if a Spotify session is authenticated based on the session ID.
    """
    tokens = get_user_tokens(session_id)
    if tokens:
        if tokens.expires_in <= timezone.now():
            refresh_spotify_token(session_id)
        return True

    return False


def refresh_spotify_token(session_id):
    """
    Refresh the Spotify access token for the given session ID.
    """
    tokens = get_user_tokens(session_id)
    if not tokens:
        return

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": tokens.refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, tokens.refresh_token
    )


def execute_spotify_api_request(
    session_id, endpoint, post_=False, put_=False, data=None
):
    """
    Execute an API request to Spotify.
    """
    tokens = get_user_tokens(session_id)
    if not tokens:
        return {"Error": "No tokens available"}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {tokens.access_token}",
    }

    url = BASE_URL + endpoint
    if post_:
        response = post(url, headers=headers, json=data)
    elif put_:
        response = put(url, headers=headers, json=data)
    else:
        response = get(url, headers=headers)

    try:
        return response.json()
    except ValueError:
        return {"Error": "Invalid response"}


def play_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(
        session_id, "me/player/pause", put_=True
    )


def skip_song(session_id):
    return execute_spotify_api_request(
        session_id, "me/player/next", post_=True
    )


def spotify_tracks(session_id, search_input):
    """
    Retrieve tracks from Spotify based on the search input.
    """
    endpoint = f"search?q={search_input}&type=track&limit=8"
    spotify_data = execute_spotify_api_request(session_id, endpoint)

    if "Error" in spotify_data:
        return spotify_data

    tracks = [
        {
            "id": track["id"],
            "name": track["name"],
            "artist": ", ".join(artist["name"] for artist in track["artists"]),
            "album": track["album"]["name"],
            "cover": track["album"]["images"][0]["url"],
        }
        for track in spotify_data.get("tracks", {}).get("items", [])
    ]

    return tracks


def playlist_tracks(session_id, playlist_id):
    """
    Retrieve all track IDs from a specific playlist.
    """
    endpoint = f"playlists/{playlist_id}/tracks"
    playlist_data = execute_spotify_api_request(session_id, endpoint)
    playlist_tracks = [
        item["track"]["id"] for item in playlist_data.get("items", [])
    ]
    return playlist_tracks
