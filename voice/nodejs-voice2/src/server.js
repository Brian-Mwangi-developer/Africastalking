const express = require("express");
require("dotenv").config({ path: ".env" });
const app = express();
const africastalking = require("africastalking");
const { VoiceHelper } = require("../utils/helper");
const { response } = require("express");

let AT_apiKey = process.env.API_KEY;
let AT_username = process.env.USERNAME;
let AT_virtualNumber = process.env.VIRTUAL_NUMBER;
let APP_URL = "http://localhost:3002";

const ATVoice = new VoiceHelper({
  AT_apiKey,
  AT_username,
  AT_virtualNumber,
});

// Set up middleware to handle POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up route to handle incoming voice calls
app.post("/voice", (req, res) => {
  const { sessionId, callerNumber } = req.body;

  // Create a new response object
  const response = new africastalking.voice.Response();

  // Say a greeting to the caller
  response.say(
    "Welcome to my voice application! Press 1 for English or 2 for Swahili."
  );

  // Collect user input
  response.collectDigits({
    timeout: 10,
    finishOnKey: "#",
    numDigits: 1,
    callbackUrl: ``,
  });

  // Send the response to the caller
  res.set("Content-Type", "text/plain");
  res.send(response.toString());
});

// Set up route to handle incoming calls
app.post("/voice/callback", async (req, res) => {
  try {
    let callActions, responseAction;
    console.log(req);
    callActions = ATVoice.ongea({
      textPrompt: `Welcome to ongea services. Press 1 to report hunger, press 2 to report Water Shortage, Press 3 for medical emergency. After selection option, press the hash key`,
      finishOnKey: "#",
      timeout: 7,
      callbackUrl: `${APP_URL}/ongea`,
    });
    console.log(callActions);
    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    console.log(response);
    return res.send(responseAction);
  } catch (err) {
    console.log({ err });
    return res.sendStatus(500);
  }
});

app.post("/ongea", (req, res) => {
  let callActions,
    responseAction,
    done = false,
    pressedKey = req.body.dtmfDigits;
  if (pressedKey === "undefined") {
    res.end();
  }
  if (!isNaN(pressedKey)) {
    pressedKey = Number(pressedKey);
    console.log(`Number pressed ${pressedKey}`);
    switch (pressedKey) {
      case 1:
        callActions = ATVoice.ongea({
          textPrompt: `Thank you for reporting hunger in your area. Please select your region. Press 1 for Nairobi, 2 for Turkana, and 3 for Kiambu`,
          finishOnKey: "#",
          timeout: 15,
          callbackUrl: `${APP_URL}/region`,
        });
        done = true;
        break;

      case 2:
        callActions = ATVoice.ongea({
          textPrompt: `Thank you for reporting water shortage in your area. Please select your region. Press 1 for Nairobi, 2 for Turkana, and 3 for Kiambu`,
          finishOnKey: "#",
          timeout: 15,
          callbackUrl: `${APP_URL}/water`,
        });
        done = true;
        break;

      case 3:
        callActions = ATVoice.ongea({
          textPrompt: `Thank you for reporting medical emergency in your area. Please select your region. Press 1 for Nairobi, 2 for Turkana, and 3 for Kiambu and then press the hashkey`,
          finishOnKey: "#",
          timeout: 15,
          callbackUrl: `${APP_URL}/emergency`,
        });
        done = true;
        break;

      default:
        callActions = ATVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = ATVoice.saySomething({
      speech: "Sorry, you have pressed an invalid key",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

app.post("/region", (req, res) => {
  let callActions,
    responseAction,
    done = false,
    pressedKey = req.body.dtmfDigits;
  if (pressedKey === "undefined") {
    res.end();
  }
  if (!isNaN(pressedKey)) {
    pressedKey = Number(pressedKey);
    console.log(`Number pressed ${pressedKey}`);
    switch (pressedKey) {
      case 1:
        callActions = ATVoice.saySomething({
          speech: "Nairobi region office will get back to you",
        });
        done = true;
        break;

      case 2:
        callActions = ATVoice.saySomething({
          speech: "Turkana region office will get back to you",
        });
        done = true;
        break;

      case 3:
        callActions = ATVoice.saySomething({
          speech: "Kiambu region office will get back to you",
        });
        done = true;
        break;

      default:
        callActions = ATVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = ATVoice.saySomething({
      speech: "Sorry you did not press any keey goodBye",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

app.post("/water", (req, res) => {
  let callActions,
    responseAction,
    done = false,
    pressedKey = req.body.dtmfDigits;
  if (pressedKey === "undefined") {
    res.end();
  }
  if (!isNaN(pressedKey)) {
    pressedKey = Number(pressedKey);
    console.log(`Number pressed ${pressedKey}`);
    switch (pressedKey) {
      case 1:
        callActions = ATVoice.saySomething({
          speech:
            "Nairobi region office will get back to you about fixing your issue",
        });
        done = true;
        break;

      case 2:
        callActions = ATVoice.saySomething({
          speech:
            "Turkana region office will get back to you about fixing your issue",
        });
        done = true;
        break;

      case 3:
        callActions = ATVoice.saySomething({
          speech:
            "Kiambu region office will get back to you about fixing your issue",
        });
        done = true;
        break;

      default:
        callActions = ATVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = ATVoice.saySomething({
      speech: "Sorry you did not press any keey goodBye",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

app.post("/emergency", (req, res) => {
  let callActions,
    responseAction,
    done = false,
    pressedKey = req.body.dtmfDigits;
  if (pressedKey === "undefined") {
    res.end();
  }
  if (!isNaN(pressedKey)) {
    pressedKey = Number(pressedKey);
    console.log(`Number pressed ${pressedKey}`);
    switch (pressedKey) {
      case 1:
        callActions = ATVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey.",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      case 2:
        callActions = ATVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey.",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      case 3:
        callActions = ATVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey.",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      default:
        callActions = ATVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = ATVoice.saySomething({
      speech: "Sorry you did not press any keey goodBye",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

app.post("/emergency-response", (req, res) => {
  console.log("user recording response");
  console.log(req);
  let callActions,
    responseAction,
    done = false,
    pressedKey = req.body.dtmfDigits;
  callActions = ATVoice.saySomething({
    speech:
      "Your Audio response has been captured and  we will send officiers to your location thank you.",
  });
  done = true;
  if (!done) {
    callActions = ATVoice.saySomething({
      speech: "Sorry you did not press any keey goodBye",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});
// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
