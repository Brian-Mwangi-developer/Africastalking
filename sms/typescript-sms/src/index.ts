import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Africastaking from 'africastalking';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const at = Africastaking({
    apiKey: process.env.AFRICASTALKING_API_KEY!,
    username: process.env.AFRICASTALKING_USERNAME!
})

// Initialize the Express app
const sms = at.SMS


// Endpoint to send a message
app.post('/send-sms', async(req: Request, res: Response):Promise<any> => {
    const { phoneNumber } = req.body;
    //the Phone number should start with country code +254712345678 ->format
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number not found 4' });
    }
    try {
        const result = await sms.send({
            from: 'AFTKNG',//The Alphanumeric sender ID, yours will be different so change it to yours
            to: phoneNumber,
            message: 'Hello from AfricasTalking!',
        });

        res.status(200).json({
            status: 'success',
            data: { result }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred while sending SMS' });
    }
});



// Start the server

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
