from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests


def verify_google_token(credential: str) -> dict:
    """Verify a Google ID token and return the decoded payload."""
    client_id = settings.GOOGLE_OAUTH_CLIENT_ID
    if not client_id:
        raise ValueError('Google OAuth is not configured on the server.')

    payload = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        client_id,
    )
    if payload.get('iss') not in ('accounts.google.com', 'https://accounts.google.com'):
        raise ValueError('Invalid token issuer.')
    return payload
