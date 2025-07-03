import os

from dotenv import load_dotenv
from fastapi import FastAPI, Form, Request
from fastapi.responses import Response

from utils.helper import VoiceHelper

load_dotenv()
app = FastAPI()

# Load environment variables
AT_apiKey = os.getenv("AFRICASTALKING_API_KEY")
AT_username = os.getenv("AFRICASTALKING_USERNAME")
AT_virtualNumber = os.getenv("VIRTUAL_NUMBER")
APP_URL = "https://advertisement-flickr-street-parcel.trycloudflare.com"

ATVoice = VoiceHelper(AT_apiKey, AT_username, AT_virtualNumber)


@app.post("/voice")
async def voice(
    sessionId: str = Form(None),
    callerNumber: str = Form(None)
):
    response = "<?xml version='1.0' encoding='UTF-8'?><Response>"
    response += "<Say>Welcome to my voice application! Press 1 for English or 2 for Swahili.</Say>"
    response += f"<CollectDigits timeout='10' finishOnKey='#' numDigits='1' callbackUrl='{APP_URL}/voice/callback'/>"
    response += "</Response>"
    return Response(content=response, media_type="text/xml")


@app.post("/voice/callback")
async def voice_callback():
    try:
        callback_url = f"{APP_URL}/ongea"
        print(f"DEBUG: callbackUrl = {callback_url}")
        call_actions = await maybe_await(
            ATVoice.ongea(
                textPrompt="Welcome to Ongea services. Press 1 to report hunger, press 2 to report water shortage, press 3 for medical emergency.",
                finishOnKey="#",
                timeout=7,
                callbackUrl=callback_url
            )
        )
        response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
        return Response(content=response_action, media_type="text/xml")
    except Exception as e:
        print({"error": str(e)})
        return Response(status_code=500)


@app.post("/ongea")
async def ongea(
    dtmfDigits: str = Form(None)
):
    try:
        pressed_key = dtmfDigits
        print(f"DEBUG: Pressed key = {pressed_key}")

        if pressed_key in [None, "undefined"]:
            return Response(content="", status_code=204)

        call_actions = None

        # Check if the entered digits are exactly "2545"
        if pressed_key == "2545":
            call_actions = await maybe_await(
                ATVoice.ongea(
                    textPrompt="Welcome Back to Medicare Services.",
                    finishOnKey="#",
                    timeout=15,
                    callbackUrl=f"{APP_URL}/emergency"
                )
            )
        else:
            call_actions = await maybe_await(
                ATVoice.saySomething({
                    "speech": "The hash entered is not valid."
                })
            )

        response_action = f"<?xml version='1.0' encoding='UTF-8'?><Response>{call_actions}</Response>"
        return Response(content=response_action, media_type="text/xml")

    except Exception as e:
        print({"error": str(e)})
        return Response(status_code=500)


@app.post("/region")
async def region(
    dtmfDigits: str = Form(None)
):
    responses = {
        "1": "Nairobi region office will get back to you",
        "2": "Turkana region office will get back to you",
        "3": "Kiambu region office will get back to you"
    }
    return Response(content=await generate_response(pressed_key=dtmfDigits, responses=responses), media_type="text/xml")


@app.post("/water")
async def water(
    dtmfDigits: str = Form(None)
):
    responses = {
        "1": "Nairobi region office will address your water issue",
        "2": "Turkana region office will address your water issue",
        "3": "Kiambu region office will address your water issue"
    }
    return Response(content=await generate_response(pressed_key=dtmfDigits, responses=responses), media_type="text/xml")


@app.post("/emergency")
async def emergency(
    dtmfDigits: str = Form(None)
):
    if dtmfDigits in ["1", "2", "3"]:
        response_action = await maybe_await(
            ATVoice.recordAudio({
                "introductionText": "Can you describe your emergency and then press the hash key.",
                "audioProcessingUrl": f"{APP_URL}/emergency-response"
            })
        )
    else:
        response_action = await maybe_await(
            ATVoice.saySomething({"speech": "Invalid selection."})
        )

    return Response(content=f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", media_type="text/xml")


@app.post("/emergency-response")
async def emergency_response():
    response_action = await maybe_await(
        ATVoice.saySomething({
            "speech": "Your audio response has been captured. We will send officers to your location. Thank you."
        })
    )
    return Response(content=f"<?xml version='1.0' encoding='UTF-8'?><Response>{response_action}</Response>", media_type="text/xml")


async def handle_selection(pressed_key, region_url, water_url, emergency_url):
    actions = {
        "1": await maybe_await(ATVoice.ongea({
            "textPrompt": "Thank you for reporting hunger. Select your region: Press 1 for Nairobi, 2 for Turkana, 3 for Kiambu.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{region_url}"
        })),
        "2": await maybe_await(ATVoice.ongea({
            "textPrompt": "Thank you for reporting water shortage. Select your region: Press 1 for Nairobi, 2 for Turkana, 3 for Kiambu.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{water_url}"
        })),
        "3": await maybe_await(ATVoice.ongea({
            "textPrompt": "Thank you for reporting a medical emergency. Select your region and press the hash key.",
            "finishOnKey": "#",
            "timeout": 15,
            "callbackUrl": f"{APP_URL}/{emergency_url}"
        }))
    }
    return f"<?xml version='1.0' encoding='UTF-8'?><Response>{actions.get(pressed_key, await maybe_await(ATVoice.saySomething({'speech': 'Invalid selection.'})))}</Response>"


async def generate_response(pressed_key, responses):
    speech = responses.get(pressed_key, "Invalid selection. Goodbye.")
    say = await maybe_await(ATVoice.saySomething({'speech': speech}))
    return f"<?xml version='1.0' encoding='UTF-8'?><Response>{say}</Response>"


async def maybe_await(result):
   
    if hasattr(result, "__await__"):
        return await result
    return result

# To run: uvicorn app:app --host 0.0.0.0 --port 5001
