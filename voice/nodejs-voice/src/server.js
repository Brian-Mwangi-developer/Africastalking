const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { response } = require("express");
const { VoiceHelper } = require("../utils/voiceHelper");
require("dotenv").config({ path: ".env" });
const app = express();

app.use(cors());

let AT_apiKey = process.env.AFRICASTALKING_API_KEY;
let AT_username = process.env.AFRICASTALKING_USERNAME;
let AT_virtualNumber = process.env.VIRTUAL_NUMBER;

const atVoice = new VoiceHelper({
  AT_apiKey,
  AT_username,
  AT_virtualNumber,
});

const credentials = {
  apiKey: AT_apiKey,
  username: AT_username,
};

const africastalking = require("africastalking")(credentials);
const voice = africastalking.VOICE;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let APP_URL = "http://localhost:5001";
//the callback
app.post("/response-callback", async (req, res) => {
  const phoneNumber = req.body.entries[0].phoneNumber; //check Req.body for other properties

  const message =
    "Welcome to Africa's Talking Call Center How may we assist you today?";
  const response = `<Response><Say>${message}</Say><Hangup/></Response>`;
  //customize
  //<Say voice="alice" language="en-US">Thank you for your response.</Say>

  res.send(response);
});

//setup route to handle incoming voice calls
app.post("/voice/callback", async (req, res) => {
  try {
    console.log("Incoming call request:", req.body);
    callback_url = `${APP_URL}/talking-center`;
    const { direction } = req.body;
    let callActions, responseAction;
    if (direction === "Inbound") {
      callActions = atVoice.ongea({
        textPrompt:
          "Welcome to Africa's Talking Call Center How may we assist you today?",
        finishOnKey: "#",
        timeout: 15,
        callbackUrl: callback_url,
      });
    } else if (direction === "Outbound") {
      const { callerNumber } = req.body;
      callActions = atVoice.ongea({
        textPrompt: "I am the Africastalking assistant here to help",
        finishOnKey: "#",
        timeout: 15,
        callbackUrl: `${APP_URL}/response-callback`,
      });
      responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
      return res.send(responseAction);
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.post("/talking-center", (req, res) => {
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
        callActions = atVoice.ongea({
          textPrompt: "Hello, how can I help you?",
          finishOnKey: "#",
          timeout: 15,
          callbackUrl: `${APP_URL}/emergency`,
        });
        done = true;
        break;

      default:
        callActions = atVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = atVoice.saySomething({
      speech: "Sorry, you have pressed an invalid key",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

app.post("/make-call", async (req, res) => {
  const callTo = req.body.callTo;

  if (!callTo) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required." });
  }
  try {
    // Call the function to make a call
    const callResponse = await makeCall(callTo);

    // Log the call response for debugging purposes
    console.log("Call response:", callResponse);

    // Send the response only after the call has been initiated
    res.json({ success: true, message: "Call initiated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate the call." });
  }
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
        callActions = atVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey, after the Beep",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      case 2:
        callActions = atVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey.",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      case 3:
        callActions = atVoice.recordAudio({
          introductionText:
            "Can you describe your emergency and then press the hashkey.",
          audioProcessingUrl: `${APP_URL}/emergency-response`,
        });
        done = true;
        break;

      default:
        callActions = atVoice.saySomething({
          speech: "Sorry, our system has some difficulty",
        });
    }
  }

  if (!done) {
    callActions = atVoice.saySomething({
      speech: "Sorry you did not press any keey goodBye",
    });
  }
  responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
  return res.send(responseAction);
});

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
