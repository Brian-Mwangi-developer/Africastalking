import africastalking from 'africastalking';

interface VoiceHelperConfig {
    AT_apiKey: string;
    AT_username: string;
    AT_virtualNumber: string;
}

interface OngeaOptions {
    textPrompt?: string;
    audioFile?: string;
    timeout?: number;
    fallbackNotice?: string;
    finishOnKey?: string;
    callbackUrl: string;
}

interface SaySomethingOptions {
    speech: string;
}

interface RecordAudioOptions {
    introductionText: string;
    audioProcessingUrl: string;
    maxDuration?: number;
    maxTimeout?: number;
}

class VoiceHelper {
    private AT_apiKey: string;
    private AT_username: string;
    private AT_virtualNumber: string;
    private ATVOICE: any;

    constructor({ AT_apiKey, AT_username, AT_virtualNumber }: VoiceHelperConfig) {
        this.AT_apiKey = AT_apiKey;
        this.AT_username = AT_username;
        this.AT_virtualNumber = AT_virtualNumber;

        this.ATVOICE = africastalking({
            apiKey: this.AT_apiKey,
            username: this.AT_username,
        }).voice as any;
    }

    ongea({
        textPrompt,
        audioFile,
        timeout = 10,
        fallbackNotice = "Sorry, we didn't get any response, goodbye",
        finishOnKey,
        callbackUrl,
    }: OngeaOptions): string {
        if (!textPrompt && !audioFile) {
            throw new Error('Provide at least one: "textPrompt" or "audioFile"');
        }

        if (!callbackUrl) {
            throw new Error('Provide "callbackUrl" for ongea');
        }

        let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`;

        if (textPrompt) {
            callAction += `<Say>${textPrompt}</Say>`;
        } else if (audioFile) {
            callAction += `<Play>${audioFile}</Play>`;
        }

        callAction += `</GetDigits><Say>${fallbackNotice}</Say>`;
        return callAction;
    }

    saySomething({ speech }: SaySomethingOptions): string {
        if (!speech) {
            throw new Error('Provide a speech');
        }

        const neuralNetVoice = 'en-US-Wavenet-C' //|| 'en-GB-Neural2-A';
        const callActions = `<Say playBeep="true" voice="${neuralNetVoice}"><speak>${speech}</speak></Say>`;
        return callActions;
    }

    recordAudio({
        introductionText,
        audioProcessingUrl,
        maxDuration = 10,
        maxTimeout = 10,
    }: RecordAudioOptions): string {
        if (!introductionText) {
            throw new Error('Provide an introduction text');
        }

        maxDuration = maxDuration < 10 ? maxDuration : 10;
        maxTimeout = maxTimeout < 10 ? maxTimeout : 10;

        const callActions = `<Record finishOnKey="#" maxLength="${maxDuration}" timeout="${maxTimeout}" trimSilence="true" playBeep="true" callbackUrl="${audioProcessingUrl}"><Say>${introductionText}</Say></Record>`;
        return callActions;
    }
}

export { VoiceHelper };