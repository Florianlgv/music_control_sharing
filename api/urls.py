from django.urls import path
from .views import RoomView

urlpatterns = [
    path("room", RoomView.as_view()),
    path("", RoomView.as_view()),
]
