import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { VoiceHelper } from './utils/helper';

dotenv.config({ path: '.env' });

const app = express();

const AT_apiKey: string = process.env.API_KEY || '';
const AT_username: string = process.env.USERNAME || '';
const AT_virtualNumber: string = process.env.VIRTUAL_NUMBER || '';
const APP_URL: string = process.env.URL || '';

const ATVoice = new VoiceHelper({
    AT_apiKey,
    AT_username,
    AT_virtualNumber,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const credentials = {
    apiKey: AT_apiKey,
    username: AT_username,
}
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

app.post('/voice/callback', async (req: Request, res: Response): Promise<any> => {
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
    } catch (err) {
        console.error({ err });
        return res.sendStatus(500);
    }
});

const handleSelection = (req: Request, res: Response, prompt: string, callbackPath: string) => {
    let callActions: string = '';
    let responseAction: string;
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
        } else {
            callActions = ATVoice.saySomething({ speech: 'Sorry, our system has some difficulty' });
        }
    }

    if (!done) {
        callActions = ATVoice.saySomething({ speech: 'Sorry, you have pressed an invalid key' });
    }

    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
};

app.post('/ongea', (req: Request, res: Response) => {
    handleSelection(req, res, 'Please select your region. Press 1 for Nairobi, 2 for Turkana, and 3 for Kiambu', 'region');
});

app.post('/region', (req: Request, res: Response) => {
    handleSelection(req, res, 'Your regional office will get back to you', '');
});

app.post('/water', (req: Request, res: Response) => {
    handleSelection(req, res, 'Your regional office will get back to you about fixing your issue', '');
});

app.post('/emergency', async (req: Request, res: Response): Promise<any> => {
    let callActions: string = '';
    let responseAction: string;
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
        } else {
            callActions = ATVoice.saySomething({ speech: 'Sorry, our system has some difficulty' });
        }
    }

    if (!done) {
        callActions = ATVoice.saySomething({ speech: 'Sorry, you did not press any key. Goodbye' });
    }

    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
});

app.post('/emergency-response', async (req: Request, res: Response): Promise<any> => {
    console.log('User recording response', req.body);
    const callActions = ATVoice.saySomething({
        speech: 'Your audio response has been captured. We will send officers to your location. Thank you.',
    });
    const responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
});

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
