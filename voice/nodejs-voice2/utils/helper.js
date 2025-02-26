const africastalking = require("africastalking")

class VoiceHelper {
    constructor({ AT_apiKey, AT_username, AT_virtualNumber }) {
        this.AT_apiKey = AT_apiKey
        this.AT_username = AT_username
        this.AT_virtualNumber = AT_virtualNumber

        this.ATVOICE = africastalking({
            apiKey: this.AT_apiKey,
            username: this.AT_username
        }).VOICE
    }


    ongea({
        textPrompt,
        audioFile,
        timeout,
        fallbackNotice,
        finishOnKey,
        callbackUrl
    }) {
        console.log(textPrompt)
        if (!textPrompt && !audioFile) {
            throw new Error(
                `provide atleast one: "textprompt" or "audioPropt" `
            );
        }

        if (!callbackUrl) {
            throw new Error(`provide "callback" for ongea`)
        }

        timeout = timeout || 10

        fallbackNotice = fallbackNotice || "Sorry, we didn't get any reponse, goodbye"
        console.log(`${textPrompt} 2`)

        let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`
        console.log(`${textPrompt} 3`)
        if (textPrompt) {
            callAction += `<Say>${textPrompt}</Say>`
        } else if (audioFile) {
            callAction += `<Play>${audioFile}</Play>`
        }

        console.log(`${textPrompt} 4`)
        callAction += `</GetDigits><Say>${fallbackNotice}</Say>`
        console.log(`${textPrompt} 5`)
        return callAction
    }

    saySomething({ speech }) {
        if (!speech) {
            throw new Error("Provide a speech")
        }
        let neuralNetVoice = 'en-US-Wavenet-C' || 'en-GB-Neural2-A'
        let callActions = `<Say playBeep="true" voice="${neuralNetVoice}"><speak>${speech}</speak></Say>`
        return callActions
    }

    recordAudio({
        introductionText,
        audioProcessingUrl,
        maxDuration,
        maxTimeout
    }) {
        if (!introductionText) {
            throw new Error("Provide an introduction text")
        }
        maxDuration = maxDuration && maxDuration < 10 ? maxDuration : 10
        maxTimeout = maxTimeout && maxTimeout < 10 ? maxTimeout : 10

        let callActions = `<Record finishOnKey="#" maxLength="${maxDuration}" timeout="${maxTimeout}" trimSilence="true" playBeep="true" callbackUrl="${audioProcessingUrl}"><Say>${introductionText}</Say></Record>`
        return callActions
    }
}

module.exports = {
    VoiceHelper
}