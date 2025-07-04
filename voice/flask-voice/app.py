import os

from dotenv import load_dotenv
from flask import Flask, Response, request

from utils.helper import VoiceHelper

load_dotenv()
app = Flask(__name__)

# Load environment variables
AT_apiKey = os.getenv("AFRICASTALKING_API_KEY")
AT_username = os.getenv("AFRICASTALKING_USERNAME")
AT_virtualNumber = os.getenv("VIRTUAL_NUMBER")
APP_URL = "http://localhost:5001"

ATVoice = VoiceHelper(AT_apiKey, AT_username, AT_virtualNumber)


@app.route("/voice", methods=["POST"])
def voice():
    session_id = request.form.get("sessionId")
    caller_number = request.form.get("callerNumber")

    response = f"<?xml version='1.0' encoding='UTF-8'?><Response>"
    response += f"<Say>Welcome to my voice application! Press 1 for English or 2 for Swahili.</Say>"
    response += f"<CollectDigits timeout='10' finishOnKey='#' numDigits='1' callbackUrl=f'{APP_URL}/voice/callback'/>"
    response += "</Response>"

    return Response(response, mimetype="text/xml")


@app.route("/voice/callback", methods=["POST"])
def voice_callback():
    try:
        callback_url = f"{APP_URL}/ongea"
        print(f"DEBUG: callbackUrl = {callback_url}")
        call_actions = ATVoice.ongea(
            textPrompt="Welcome to Ongea services. Press 1 to report hunger, press 2 to report water shortage, press 3 for medical emergency.",
            finishOnKey="#",
            timeout=7,
            callbackUrl=callback_url  # ✅ Correctly passing the callback URL
        )
        response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
        return Response(response_action, mimetype="text/xml")
    except Exception as e:
        print({"error": str(e)})
        return Response(status=500)


@app.route("/ongea", methods=["POST"])
def ongea():
    try:
        pressed_key = request.form.get("dtmfDigits")
        print(f"DEBUG: Pressed key = {pressed_key}")

        if pressed_key in [None, "undefined"]:
            return Response("", status=204)

        call_actions = None
        done = False

        if pressed_key.isdigit():
            pressed_key = int(pressed_key)
            print(f"Number pressed: {pressed_key}")

            if pressed_key == 1:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to emergency services.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/emergency"
                )
                done = True
            elif pressed_key == 2:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to the water department.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/water"
                )
                done = True
            elif pressed_key == 3:
                call_actions = ATVoice.ongea(
                    textPrompt="Connecting you to the regional health officer.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/region"
                )
                done = True
            else:
                call_actions = ATVoice.saySomething({
                    "speech": "Sorry, our system has some difficulty."
                })

        if not done:
            call_actions = ATVoice.saySomething({
                "speech": "Sorry, you have pressed an invalid key."
            })

        response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
        return Response(response_action, mimetype="text/xml")

    except Exception as e:
        print({"error": str(e)})
        return Response(status=500)


@app.route("/region", methods=["POST"])
def region():
    pressed_key = request.form.get("dtmfDigits")
    responses = {
        "1": "Nairobi region office will get back to you",
        "2": "Turkana region office will get back to you",
        "3": "Kiambu region office will get back to you"
    }
    return Response(generate_response(pressed_key, responses), mimetype="text/xml")


@app.route("/water", methods=["POST"])
def water():
    pressed_key = request.form.get("dtmfDigits")
    responses = {
        "1": "Nairobi region office will address your water issue",
        "2": "Turkana region office will address your water issue",
        "3": "Kiambu region office will address your water issue"
    }
    return Response(generate_response(pressed_key, responses), mimetype="text/xml")


@app.route("/emergency", methods=["POST"])
def emergency():
    pressed_key = request.form.get("dtmfDigits")
    response_action = ATVoice.recordAudio({
        "introductionText": "Can you describe your emergency and then press the hash key.",
        "audioProcessingUrl": f"{APP_URL}/emergency-response"
    }) if pressed_key in ["1", "2", "3"] else ATVoice.saySomething({"speech": "Invalid selection."})

    return Response(f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", mimetype="text/xml")


@app.route("/emergency-response", methods=["POST"])
def emergency_response():
    response_action = ATVoice.saySomething({
        "speech": "Your audio response has been captured. We will send officers to your location. Thank you."
    })
    return Response(f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", mimetype="text/xml")


def handle_selection(pressed_key, region_url, water_url, emergency_url):
    actions = {
        "1": ATVoice.ongea({
            "textPrompt": "Thank you for reporting hunger. Select your region: Press 1 for Nairobi, 2 for Turkana, 3 for Kiambu.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{region_url}"
        }),
        "2": ATVoice.ongea({
            "textPrompt": "Thank you for reporting water shortage. Select your region: Press 1 for Nairobi, 2 for Turkana, 3 for Kiambu.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{water_url}"
        }),
        "3": ATVoice.ongea({
            "textPrompt": "Thank you for reporting a medical emergency. Select your region and press the hash key.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{emergency_url}"
        })
    }
    return f"<?xml version='1.0' encoding='UTF-8'?><Response>{actions.get(pressed_key, ATVoice.saySomething({'speech': 'Invalid selection.'}))}</Response>"


def generate_response(pressed_key, responses):
    speech = responses.get(pressed_key, "Invalid selection. Goodbye.")
    return f"<?xml version='1.0' encoding='UTF-8'?><Response>{ATVoice.saySomething({'speech': speech})}</Response>"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
