const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log("Text received:", text);
  let response = "";

  if (!text || text === "") {
    response = "CON What would you want to check \n";
    response += "1. My Account \n";
    response += "2. My phone number";
  } else if (text === "1") {
    response = "CON Choose account information you want to view \n";
    response += "1. Account number \n";
    response += "2. Account balance";
  } else if (text === "1*1") {
    response = "END Your account number is ACC1001";
  } else if (text === "1*2") {
    response = "END Your balance is KES 10,000";
  } else if (text === "2") {
    response = "END This is your phone number " + phoneNumber;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

app.listen(8000, () => {
  console.log("USSD app listening on port 8000!");
});
