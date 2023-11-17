def ensure_session_exist(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()
