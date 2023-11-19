from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room
from .serializers import (
    RoomSerializer,
    CreateRoomSerializer,
    UpdateRoomSerializer,
)
from .utils import ensure_session_exist


class RoomView(generics.ListAPIView):
    """
    API view to list all rooms.
    """

    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    """
    API view to retrieve a specific room by code.
    """

    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room_query = Room.objects.filter(code=code)
            if room_query.exists():
                room = room_query.first()
                data = RoomSerializer(room).data
                data["is_host"] = self.request.session.session_key == room.host
                return Response(data, status=status.HTTP_200_OK)
            return Response(
                {"Room Not Found": "Invalid Room Code"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"Bad Request": "Code parameter not found in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class JoinRoom(APIView):
    """
    API view to join a room.
    """

    lookup_url_kwarg = "code"

    def post(self, request, format=None):
        ensure_session_exist(self.request)

        code = request.data.get(self.lookup_url_kwarg)
        if code is not None:
            room_query = Room.objects.filter(code=code)
            if room_query.exists():
                self.request.session["room_code"] = code
                return Response(
                    {"message": "Room Joined!"}, status=status.HTTP_200_OK
                )
            return Response(
                {"Bad Request": "Invalid Room Code"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"Bad Request": "Invalid post data, did not find a code key"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        ensure_session_exist(self.request)

        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"Bad Request": "Invalid data..."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        guest_can_pause = serializer.data.get("guest_can_pause")
        votes_to_skip = serializer.data.get("votes_to_skip")
        host = self.request.session.session_key
        room, created = Room.objects.update_or_create(
            host=host,
            guest_can_pause=guest_can_pause,
            votes_to_skip=votes_to_skip,
        )

        self.request.session["room_code"] = room.code
        return Response(
            RoomSerializer(room).data, status=status.HTTP_201_CREATED
        )


class UserInRoom(APIView):
    def get(self, request, format=None):
        ensure_session_exist(self.request)

        data = {"code": self.request.session.get("room_code")}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            code = self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        ensure_session_exist(self.request)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response(
                    {"msg": "Room not found"}, status=status.HTTP_404_NOT_FOUND
                )

            room = queryset[0]
            user_id = self.request.session.session_key

            if room.host != user_id:
                return Response(
                    {"msg": "You are not the host of this room"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])
            return Response(
                RoomSerializer(room).data, status=status.HTTP_200_OK
            )

        return Response(
            {"Bad Request": "Invalid data..."},
            status=status.HTTP_400_BAD_REQUEST,
        )
