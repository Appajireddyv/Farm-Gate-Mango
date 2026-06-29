from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if isinstance(exc, Throttled):
        wait = int(exc.wait()) if exc.wait() is not None else None
        headers = {}
        if wait is not None:
            headers['Retry-After'] = str(wait)
        return Response(
            {
                'error': 'Too many requests. Please try again later.',
                'retry_after_seconds': wait,
            },
            status=429,
            headers=headers,
        )
    return response
