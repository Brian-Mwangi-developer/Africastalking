"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceHelper = void 0;
const africastalking_1 = __importDefault(require("africastalking"));
class VoiceHelper {
    constructor({ AT_apiKey, AT_username, AT_virtualNumber }) {
        this.AT_apiKey = AT_apiKey;
        this.AT_username = AT_username;
        this.AT_virtualNumber = AT_virtualNumber;
        this.ATVOICE = (0, africastalking_1.default)({
            apiKey: this.AT_apiKey,
            username: this.AT_username,
        }).voice;
    }
    ongea({ textPrompt, audioFile, timeout = 10, fallbackNotice = "Sorry, we didn't get any response, goodbye", finishOnKey, callbackUrl, }) {
        if (!textPrompt && !audioFile) {
            throw new Error('Provide at least one: "textPrompt" or "audioFile"');
        }
        if (!callbackUrl) {
            throw new Error('Provide "callbackUrl" for ongea');
        }
        let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`;
        if (textPrompt) {
            callAction += `<Say>${textPrompt}</Say>`;
        }
        else if (audioFile) {
            callAction += `<Play>${audioFile}</Play>`;
        }
        callAction += `</GetDigits><Say>${fallbackNotice}</Say>`;
        return callAction;
    }
    saySomething({ speech }) {
        if (!speech) {
            throw new Error('Provide a speech');
        }
        const neuralNetVoice = 'en-US-Wavenet-C'; //|| 'en-GB-Neural2-A';
        const callActions = `<Say playBeep="true" voice="${neuralNetVoice}"><speak>${speech}</speak></Say>`;
        return callActions;
    }
    recordAudio({ introductionText, audioProcessingUrl, maxDuration = 10, maxTimeout = 10, }) {
        if (!introductionText) {
            throw new Error('Provide an introduction text');
        }
        maxDuration = maxDuration < 10 ? maxDuration : 10;
        maxTimeout = maxTimeout < 10 ? maxTimeout : 10;
        const callActions = `<Record finishOnKey="#" maxLength="${maxDuration}" timeout="${maxTimeout}" trimSilence="true" playBeep="true" callbackUrl="${audioProcessingUrl}"><Say>${introductionText}</Say></Record>`;
        return callActions;
    }
}
exports.VoiceHelper = VoiceHelper;
