from django.urls import path
from .views import *

urlpatterns = [
    path("get-auth-url", AuthURL.as_view()),
    path("redirect", spotify_callback),
    path("is-authenticated", IsAuthenticated.as_view()),
    path("current-song", CurrentSong.as_view()),
    path("pause", PauseSong.as_view()),
    path("play", PlaySong.as_view()),
    path("skip-vote", SkipSongVote.as_view()),
    path("search-song", SearchSong.as_view()),
    path("add-song-to-playlist", AddSongToPlaylist.as_view()),
    path("check-user-vote", check_user_vote),
]
