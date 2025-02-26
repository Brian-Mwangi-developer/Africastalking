const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ussd', (req, res) => {
    let sessionId = req.body.sessionId;
    let serviceCode = req.body.serviceCode;
    let phoneNumber = req.body.phoneNumber;
    let text = req.body.text|| "";
    let response = "";

    if (text === "") {
        response = "CON What would you want to check?\n";
        response += "1. My Account\n";
        response += "2. My phone number";
    } else if (text === "1") {
        response = "CON Choose account information you want to view\n";
        response += "1. Account number\n";
        response += "2. Account balance";
    } else if (text === "1*1") {
        response = "END Your account number is ACC1001";
    } else if (text === "1*2") {
        response = "END Your balance is KES 10,000";
    } else if (text === "2") {
        response = `END This is your phone number ${phoneNumber}`;
    } else {
        response = "CON Invalid input. Please try again.";
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD service running on port ${PORT}`);
});
