import logging
import random
import re

from django.conf import settings

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


def send_otp_sms(phone, otp):
    logger.info('OTP dispatched to %s', f'***{phone[-4:]}' if len(phone) >= 4 else '***')
    if getattr(settings, 'DEBUG', False):
        return {'debug_otp': otp}
    return {}
