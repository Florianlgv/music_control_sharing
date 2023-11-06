from rest_framework.exceptions import NotFound


def ensure_session(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()
