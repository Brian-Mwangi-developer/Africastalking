"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helper_1 = require("./utils/helper");
dotenv_1.default.config({ path: '.env' });
const app = (0, express_1.default)();
const AT_apiKey = process.env.API_KEY || '';
const AT_username = process.env.USERNAME || '';
const AT_virtualNumber = process.env.VIRTUAL_NUMBER || '';
const APP_URL = process.env.URL || '';
const ATVoice = new helper_1.VoiceHelper({
    AT_apiKey,
    AT_username,
    AT_virtualNumber,
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const credentials = {
    apiKey: AT_apiKey,
    username: AT_username,
};
// app.post('/voice', (req: Request, res: Response) => {
//     const { sessionId, callerNumber } = req.body;
//     const africastalkingVoice = africastalking(credentials);
//     const response = new africastalkingVoice.VOICE
//     response.say('Welcome to my voice application! Press 1 for English or 2 for Swahili.');
//     response.collectDigits({
//         timeout: 10,
//         finishOnKey: '#',
//         numDigits: 1,
//         callbackUrl: '',
//     });
//     res.set('Content-Type', 'text/plain');
//     res.send(response.toString());
// });
app.post('/voice/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const callActions = ATVoice.ongea({
            textPrompt: 'Welcome to Ongea services. Press 1 to report hunger, press 2 to report Water Shortage, Press 3 for medical emergency. After selection, press the hash key',
            finishOnKey: '#',
            timeout: 7,
            callbackUrl: `${APP_URL}/ongea`,
        });
        const responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
        return res.send(responseAction);
    }
    catch (err) {
        console.error({ err });
        return res.sendStatus(500);
    }
}));
const handleSelection = (req, res, prompt, callbackPath) => {
    let callActions = '';
    let responseAction;
    let done = false;
    let pressedKey = req.body.dtmfDigits;
    if (pressedKey === 'undefined') {
        return res.end();
    }
    if (!isNaN(pressedKey)) {
        pressedKey = Number(pressedKey);
        console.log(`Number pressed ${pressedKey}`);
        if ([1, 2, 3].includes(pressedKey)) {
            callActions = ATVoice.ongea({
                textPrompt: prompt,
                finishOnKey: '#',
                timeout: 15,
                callbackUrl: `${APP_URL}/${callbackPath}`,
            });
            done = true;
        }
        else {
            callActions = ATVoice.saySomething({ speech: 'Sorry, our system has some difficulty' });
        }
    }
    if (!done) {
        callActions = ATVoice.saySomething({ speech: 'Sorry, you have pressed an invalid key' });
    }
    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
};
app.post('/ongea', (req, res) => {
    handleSelection(req, res, 'Please select your region. Press 1 for Nairobi, 2 for Turkana, and 3 for Kiambu', 'region');
});
app.post('/region', (req, res) => {
    handleSelection(req, res, 'Your regional office will get back to you', '');
});
app.post('/water', (req, res) => {
    handleSelection(req, res, 'Your regional office will get back to you about fixing your issue', '');
});
app.post('/emergency', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let callActions = '';
    let responseAction;
    let done = false;
    let pressedKey = req.body.dtmfDigits;
    if (pressedKey === 'undefined') {
        return res.end();
    }
    if (!isNaN(pressedKey)) {
        pressedKey = Number(pressedKey);
        console.log(`Number pressed ${pressedKey}`);
        if ([1, 2, 3].includes(pressedKey)) {
            callActions = ATVoice.recordAudio({
                introductionText: 'Can you describe your emergency and then press the hash key.',
                audioProcessingUrl: `${APP_URL}/emergency-response`,
            });
            done = true;
        }
        else {
            callActions = ATVoice.saySomething({ speech: 'Sorry, our system has some difficulty' });
        }
    }
    if (!done) {
        callActions = ATVoice.saySomething({ speech: 'Sorry, you did not press any key. Goodbye' });
    }
    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
}));
app.post('/emergency-response', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('User recording response', req.body);
    const callActions = ATVoice.saySomething({
        speech: 'Your audio response has been captured. We will send officers to your location. Thank you.',
    });
    const responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
}));
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
