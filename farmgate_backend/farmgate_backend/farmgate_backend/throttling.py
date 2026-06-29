"""IP- and user-based rate limiting for all API endpoints."""

from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle, UserRateThrottle


def get_client_ip(request) -> str:
    """Resolve client IP, honoring reverse-proxy headers (e.g. Render)."""
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class IPAnonRateThrottle(AnonRateThrottle):
    """Anonymous requests: rate limit by client IP."""

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        ident = get_client_ip(request)
        if not ident:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class UserRateThrottle(UserRateThrottle):
    """Authenticated requests: rate limit by user primary key."""


class AuthRateThrottle(ScopedRateThrottle):
    """Stricter IP-based limit for authentication and token endpoints."""

    scope = 'auth'

    def get_cache_key(self, request, view):
        ident = get_client_ip(request)
        if not ident:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': ident}
