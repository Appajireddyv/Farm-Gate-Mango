import logging
import random
import re

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

PHONE_RE = re.compile(r'^\d{10}$')


def normalize_phone(phone):
    return re.sub(r'\D', '', str(phone or ''))[-10:]


def validate_phone(phone):
    normalized = normalize_phone(phone)
    if not PHONE_RE.match(normalized):
        raise ValueError('Enter a valid 10-digit mobile number.')
    return normalized


def generate_otp():
    return f'{random.randint(100000, 999999)}'


def send_otp_sms(phone, otp, email=None):
    logger.info('OTP dispatched to %s', f'***{phone[-4:]}' if len(phone) >= 4 else '***')

    recipient_email = (email or '').strip().lower()
    fallback_to_response = getattr(settings, 'OTP_FALLBACK_TO_RESPONSE', True)
    email_backend = str(getattr(settings, 'EMAIL_BACKEND', '')).lower()
    email_host = str(getattr(settings, 'EMAIL_HOST', '')).strip()
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)

    if recipient_email and from_email:
        if email_backend.endswith('smtp.emailbackend') and not email_host:
            logger.warning('SMTP email host is not configured; returning OTP in response instead.')
        else:
            try:
                send_mail(
                    subject='Farm 2 Door verification code',
                    message=(
                        f'Your Farm 2 Door verification code is {otp}. '
                        'Use this code to complete farmer registration.'
                    ),
                    from_email=from_email,
                    recipient_list=[recipient_email],
                    fail_silently=False,
                )
                return {}
            except Exception as exc:
                logger.warning('OTP email delivery failed: %s', exc)

    if getattr(settings, 'DEBUG', False) or fallback_to_response:
        return {'debug_otp': otp}
    return {}
