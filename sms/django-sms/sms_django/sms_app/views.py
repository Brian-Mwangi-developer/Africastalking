from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import africastalking
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
username = os.getenv("AFRICASTALKING_USERNAME")
api_key = os.getenv("AFRICASTALKING_API_KEY")
# Initialize Africa's Talking
africastalking.initialize(username, api_key)

sms = africastalking.SMS


@csrf_exempt  # Disable CSRF for simplicity (not recommended for production)
def send_sms(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone_number = data.get("phoneNumber")


# the Phone number should start with country code + 254712345678 -> format
            if not phone_number:
                return JsonResponse({"message": "Phone number not found"}, status=400)

            response = sms.send(
                sender_id="AFTKNG", # your Alphanumeric sender ID
                message="Hey, Welcome to Africa's Talking!",
                recipients=[phone_number],
               
            )

            return JsonResponse({"status": "success", "data": response}, status=200)
        except Exception as e:
            return JsonResponse({"message": "An error occurred while sending SMS", "error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request method"}, status=405)
