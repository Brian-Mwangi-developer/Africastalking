import os
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
from utils.helper import VoiceHelper

load_dotenv()

AT_apiKey = os.getenv("AFRICASTALKING_API_KEY")
AT_username = os.getenv("AFRICASTALKING_USERNAME")
AT_virtualNumber = os.getenv("VIRTUAL_NUMBER")
APP_URL = "http://localhost:8000"

ATVoice = VoiceHelper(AT_apiKey, AT_username, AT_virtualNumber)


@csrf_exempt
def voice(request):
    if request.method == "POST":
        session_id = request.POST.get("sessionId")
        caller_number = request.POST.get("callerNumber")
        response = "<?xml version='1.0' encoding='UTF-8'?><Response>"
        response += "<Say>Welcome to my voice application! Press 1 for English or 2 for Swahili.</Say>"
        response += f"<CollectDigits timeout='10' finishOnKey='#' numDigits='1' callbackUrl='{APP_URL}/voice/callback/'/>"
        response += "</Response>"
        return HttpResponse(response, content_type="text/xml")
    return HttpResponse(status=405)


@csrf_exempt
def voice_callback(request):
    if request.method == "POST":
        try:
            callback_url = f"{APP_URL}/ongea/"
            call_actions = ATVoice.ongea(
                textPrompt="Welcome to Ongea services. Press 1 to report hunger, press 2 to report water shortage, press 3 for medical emergency.",
                finishOnKey="#",
                timeout=7,
                callbackUrl=callback_url
            )
            response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
            return HttpResponse(response_action, content_type="text/xml")
        except Exception as e:
            print({"error": str(e)})
            return HttpResponse(status=500)
    return HttpResponse(status=405)


@csrf_exempt
def ongea(request):
    if request.method == "POST":
        pressed_key = request.POST.get("dtmfDigits")
        if pressed_key in [None, "undefined"]:
            return HttpResponse("", status=204)
        call_actions = None
        done = False
        if pressed_key.isdigit():
            pressed_key = int(pressed_key)
            if pressed_key == 1:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to emergency services.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/emergency/"
                )
                done = True
            elif pressed_key == 2:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to the water department.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/water/"
                )
                done = True
            elif pressed_key == 3:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to the regional health officer.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/region/"
                )
                done = True
            else:
                call_actions = ATVoice.saySomething(
                    {"speech": "Sorry, our system has some difficulty."})
        if not done:
            call_actions = ATVoice.saySomething(
                {"speech": "Sorry, you have pressed an invalid key."})
        response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
        return HttpResponse(response_action, content_type="text/xml")
    return HttpResponse(status=405)


@csrf_exempt
def region(request):
    if request.method == "POST":
        pressed_key = request.POST.get("dtmfDigits")
        responses = {
            "1": "Nairobi region office will get back to you",
            "2": "Turkana region office will get back to you",
            "3": "Kiambu region office will get back to you"
        }
        return HttpResponse(generate_response(pressed_key, responses), content_type="text/xml")
    return HttpResponse(status=405)


@csrf_exempt
def water(request):
    if request.method == "POST":
        pressed_key = request.POST.get("dtmfDigits")
        responses = {
            "1": "Nairobi region office will address your water issue",
            "2": "Turkana region office will address your water issue",
            "3": "Kiambu region office will address your water issue"
        }
        return HttpResponse(generate_response(pressed_key, responses), content_type="text/xml")
    return HttpResponse(status=405)


@csrf_exempt
def emergency(request):
    if request.method == "POST":
        pressed_key = request.POST.get("dtmfDigits")
        if pressed_key in ["1", "2", "3"]:
            response_action = ATVoice.recordAudio({
                "introductionText": "Can you describe your emergency and then press the hash key.",
                "audioProcessingUrl": f"{APP_URL}/emergency-response/"
            })
        else:
            response_action = ATVoice.saySomething(
                {"speech": "Invalid selection."})
        return HttpResponse(f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", content_type="text/xml")
    return HttpResponse(status=405)


@csrf_exempt
def emergency_response(request):
    if request.method == "POST":
        response_action = ATVoice.saySomething({
            "speech": "Your audio response has been captured. We will send officers to your location. Thank you."
        })
        return HttpResponse(f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", content_type="text/xml")
    return HttpResponse(status=405)


def generate_response(pressed_key, responses):
    speech = responses.get(pressed_key, "Invalid selection. Goodbye.")
    return f"<?xml version='1.0' encoding='UTF-8'?><Response>{ATVoice.saySomething({'speech': speech})}</Response>"
