import requests
import base64
from datetime import datetime
from decouple import config


class MpesaService:
    def __init__(self):
        self.consumer_key = config('MPESA_CONSUMER_KEY')
        self.consumer_secret = config('MPESA_CONSUMER_SECRET')
        self.passkey = config('MPESA_PASSKEY')
        self.shortcode = config('MPESA_SHORTCODE')
        self.env = config('MPESA_ENV', default='sandbox')

        if self.env == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'

    def get_access_token(self):
        url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        response = requests.get(url, auth=(self.consumer_key, self.consumer_secret))
        result = response.json()
        return result['access_token']

    def generate_password(self):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        raw = f"{self.shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(raw.encode()).decode()
        return encoded, timestamp

    def stk_push(self, phone_number, amount, callback_url, reference):
        access_token = self.get_access_token()
        password, timestamp = self.generate_password()

        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }

        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': self.shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': callback_url,
            'AccountReference': reference,
            'TransactionDesc': f'Payment for {reference}',
        }

        url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        response = requests.post(url, json=payload, headers=headers)
        return response.json()

    def stk_push_mock(self, phone_number, amount, callback_url, reference):
        print(f"[MOCK STK] Phone: {phone_number} | Amount: {amount} | Ref: {reference}")
        return {
            'CheckoutRequestID': f'mock-checkout-{reference}',
            'ResponseCode': '0',
            'ResponseDescription': 'Success. Request accepted for processing',
        }