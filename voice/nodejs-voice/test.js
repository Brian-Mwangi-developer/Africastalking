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
    textPrompt,
    audioFile,
    timeout,
    fallbackNotice,
    finishOnKey,
    callbackUrl,
  }) {
    console.log(textPrompt);
    if (!textPrompt && !audioFile) {
      throw new Error(`provide atleast one: "textprompt" or "audioPropt" `);
    }

    if (!callbackUrl) {
      throw new Error(`provide "callback" for ongea`);
    }

    timeout = timeout || 10;

    fallbackNotice =
      fallbackNotice ||
      "Sorry, we didn't get any response from you, you can alternatively call this number, goodbye";
    console.log(`${textPrompt} 2`);

    let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`;
    console.log(`${textPrompt} 3`);
    if (textPrompt) {
      callAction += `<Say voice="en-US-Standard-C" >${textPrompt}</Say>`;
    } else if (audioFile) {
      callAction += `<Play>${audioFile}</Play>`;
    }

    console.log(`${textPrompt} 4`);
    callAction += `</GetDigits><Say>${fallbackNotice}</Say>`;
    console.log(`${textPrompt} 5`);
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





// const africastalking = require("africastalking");

// class VoiceHelper {
//   constructor({ AT_apiKey, AT_username, AT_virtualNumber }) {
//     this.AT_apiKey = AT_apiKey;
//     this.AT_username = AT_username;
//     this.AT_virtualNumber = AT_virtualNumber;

//     this.ATVOICE = africastalking({
//       apiKey: this.AT_apiKey,
//       username: this.AT_username,
//     }).VOICE;
//   }
//   voice_app({ textPrompt, timeout, fallbackNotice, finishOnKey, callbackUrl }) {
//     if (!textPrompt) {
//       throw new Error("No Text Prompt was provided");
//     }
//     if (!callbackUrl) {
//       throw new Error(`provide "callback" for ongea`);
//     }
//     timeout = timeout || 30;
//     fallbackNotice =
//       fallbackNotice || "Sorry, we didn't get any reponse, goodbye";
//     let callAction = `<GetDigits timeout="${timeout}" finishOnKey="${finishOnKey}" callbackUrl="${callbackUrl}">`;
//     callAction += `<Say>${textPrompt}</Say>`;
//     callAction += `</GetDigits><Say>${fallbackNotice}</Say>`;
//     return callAction;
//   }
//   saySomething({ speech }) {
//     if (!speech) {
//       throw new Error("Provide a speech");
//     }
//     let neuralNetVoice = "en-US-Wavenet-C" || "en-GB-Neural2-A";
//     let callActions = `<Say playBeep="true" voice="${neuralNetVoice}"><speak>${speech}</speak></Say>`;
//     return callActions;
//   }
//   recordAudio({
//     introductionText,
//     audioProcessingUrl,
//     maxDuration,
//     maxTimeout,
//   }) {
//     if (!introductionText) {
//       throw new Error("Provide an introduction text");
//     }
//     maxDuration = maxDuration && maxDuration < 10 ? maxDuration : 10;
//     maxTimeout = maxTimeout && maxTimeout < 10 ? maxTimeout : 10;

//     let callActions = `<Record finishOnKey="#" maxLength="${maxDuration}" timeout="${maxTimeout}" trimSilence="true" playBeep="true" callbackUrl="${audioProcessingUrl}"><Say>${introductionText}</Say></Record>`;
//     return callActions;
//   }
//   playAudioFile({ introductionText, audioFileUrl }) {
//     if (!audioFileUrl) {
//       throw new Error(`Provide an "audioFileUrl"`);
//     }

//     let callActions;
//     if (introductionText) {
//       callActions = `<Say>${introductionText}</Say><Play url="${audioFileUrl}"/><Say>Goodbye</Say><Hangup/>`;
//       return callActions;
//     } else {
//       callActions = `<Play url="${audioFileUrl}"/><Say>Goodbye</Say><Hangup/>`;
//       return callActions;
//     }
//   }
// }

// module.exports = {
//   VoiceHelper,
// };