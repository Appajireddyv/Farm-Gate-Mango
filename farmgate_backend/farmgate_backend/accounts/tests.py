from django.core import mail
from django.test import TestCase, override_settings

from .otp_utils import send_otp_sms


class OTPUtilsTests(TestCase):
    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        EMAIL_HOST='smtp.example.com',
        EMAIL_HOST_USER='noreply@example.com',
        DEFAULT_FROM_EMAIL='noreply@example.com',
    )
    def test_send_otp_sms_sends_email_when_configured(self):
        response = send_otp_sms('9876543210', '123456', email='farmer@example.com')

        self.assertEqual(response, {})
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('123456', mail.outbox[0].body)

    @override_settings(
        DEBUG=False,
        EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
        EMAIL_HOST='',
        EMAIL_HOST_USER='',
        DEFAULT_FROM_EMAIL='noreply@example.com',
        OTP_FALLBACK_TO_RESPONSE=True,
    )
    def test_send_otp_sms_returns_debug_code_when_email_is_unavailable(self):
        response = send_otp_sms('9876543210', '123456', email='farmer@example.com')

        self.assertEqual(response, {'debug_otp': '123456'})
