import africastalking


class VoiceHelper:
    def __init__(self, AT_apiKey, AT_username, AT_virtualNumber):
        self.AT_apiKey = AT_apiKey
        self.AT_username = AT_username
        self.AT_virtualNumber = AT_virtualNumber

        africastalking.initialize(
            api_key=self.AT_apiKey,
            username=self.AT_username
        )
        self.ATVOICE = africastalking.Voice

    def ongea(self, textPrompt=None, timeout=10, fallbackNotice=None, finishOnKey="#", callbackUrl=None):
        print("Callback from voice helper", callbackUrl)
        if not textPrompt:
            raise ValueError(
                "Provide at least one: 'textPrompt' ")

        if not callbackUrl:
            raise ValueError("Provide 'callbackUrl' for ongea")

        fallbackNotice = fallbackNotice or "Sorry, we didn't get any response, goodbye"
        callAction = f'<GetDigits timeout="{timeout}" finishOnKey="{finishOnKey}" callbackUrl="{callbackUrl}">'

        if textPrompt:
            callAction += f'<Say>{textPrompt}</Say>'

        callAction += f'</GetDigits><Say>{fallbackNotice}</Say>'
        return callAction

    def saySomething(self, speech):
        if not speech:
            raise ValueError("Provide a speech")
        neuralNetVoice = "en-US-Wavenet-C"
        callActions = f'<Say playBeep="true" voice="{neuralNetVoice}"><speak>{speech}</speak></Say>'
        return callActions

    def recordAudio(self, introductionText, audioProcessingUrl, maxDuration=10, maxTimeout=10):
        if not introductionText:
            raise ValueError("Provide an introduction text")
        maxDuration = min(maxDuration, 10)
        maxTimeout = min(maxTimeout, 10)

        callActions = (
            f'<Record finishOnKey="#" maxLength="{maxDuration}" timeout="{maxTimeout}" trimSilence="true" '
            f'playBeep="true" callbackUrl="{audioProcessingUrl}"><Say>{introductionText}</Say></Record>'
        )
        return callActions
