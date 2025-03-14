const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sessionData = {};

app.post("/ussd", (req, res) => {
  const sessionId = req.body.sessionId || "";
  const phoneNumber = req.body.phoneNumber || "";
  const text = req.body.text || "";

  if (!sessionData[sessionId]) {
    sessionData[sessionId] = { step: 0 };
  }

  let response = "";
  const userSession = sessionData[sessionId];
  const step = userSession.step;

  if (text === "") {
    response =
      "CON Welcome to Smart Farming\n" +
      "1. Register for Recommendations and Reminders\n" +
      "2. Get Current Recommendation in your Area\n" +
      "3. Check Area Registered To\n" +
      "4. Unsubscribe from Smart Farming";
  } else if (text === "1" && step === 0) {
    response = "CON Please Enter your Location (City/County):";
    userSession.step = 1;
  } else if (step === 1) {
    const location = text.split("*").pop()?.trim() || "";
    console.log(`User ${phoneNumber} registered in location: ${location}`);
    response = `END Your location has been saved as: ${location}`;
    try {
      fetch(`${process.env.SERVER_URL}/get-weather`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });
    } catch (error) {
      console.log(error);
    }
    userSession.location = location;
    userSession.step = 0;
  } else if (text === "2") {
    response = `END This is your phone number: ${phoneNumber}`;
  } else if (text === "3") {
    const location = userSession.location || "Not registered";
    response = `END You are registered in: ${location}`;
  } else if (text === "4") {
    delete sessionData[sessionId];
    response = "END You have unsubscribed from Smart Farming.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD service running on port ${PORT}`);
});
