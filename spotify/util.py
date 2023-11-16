from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get


BASE_URL = "https://api.spotify.com/v1/"


def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)

    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(
    session_id, access_token, token_type, expires_in, refresh_token
):
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
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)

        return True

    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token
    )


def execute_spotify_api_request(
    session_id, endpoint, post_=False, put_=False, data=None
):
    tokens = get_user_tokens(session_id)
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokens.access_token,
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
        return {"Error": "Issue with request"}


def play_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/pause", put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/next", post_=True)


def spotify_tracks(session_id, search_input):
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
        for track in spotify_data["tracks"]["items"]
    ]

    return tracks
