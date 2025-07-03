const africastalking = require("africastalking");

class VoiceHelper {
  constructor({ AT_apiKey, AT_username, AT_virtualNumber }) {
    this.AT_apiKey = AT_apiKey;
    this.AT_username = AT_username;
    this.AT_virtualNumber = AT_virtualNumber;

    this.ATVOICE = africastalking({
      apiKey: this.AT_apiKey,
      username: this.AT_username,
    }).VOICE;
  }

  ongea({
    textPrompt = null,
    timeout = 10,
    fallbackNotice = null,
    finishOnKey = "#",
    callbackUrl = null,
  }) {
    console.log("Callback from voice helper", callbackUrl);

    if (!textPrompt) {
      throw new Error("Provide at least one: 'textPrompt'");
    }

    if (!callbackUrl) {
      throw new Error("Provide 'callbackUrl' for ongea");
    }

    fallbackNotice =
      fallbackNotice || "Sorry, we didn't get any response, goodbye";

    let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`;

    if (textPrompt) {
      callAction += `<Say>${textPrompt}</Say>`;
    }

    callAction += `</GetDigits><Say>${fallbackNotice}</Say>`;
    return callAction;
  }

  saySomething({ speech }) {
    if (!speech) {
      throw new Error("Provide a speech");
    }
    let neuralNetVoice = "en-US-Wavenet-B" || "en-GB-Neural2-A";
    let callActions = `<Say playBeep="true" voice="en-US-Wavenet-C"><speak>${speech}</speak></Say>`;
    return callActions;
  }

  recordAudio({
    introductionText,
    audioProcessingUrl,
    maxDuration,
    maxTimeout,
  }) {
    if (!introductionText) {
      throw new Error("Provide an introduction text");
    }
    maxDuration = maxDuration && maxDuration < 10 ? maxDuration : 10;
    maxTimeout = maxTimeout && maxTimeout < 10 ? maxTimeout : 10;

    let callActions = `<Record finishOnKey="#" maxLength="${maxDuration}" timeout="${maxTimeout}" trimSilence="true" playBeep="true" callbackUrl="${audioProcessingUrl}"><Say>${introductionText}</Say></Record>`;
    return callActions;
  }
}

module.exports = {
  VoiceHelper,
};
