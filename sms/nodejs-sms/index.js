const express = require('express');
const africastalking_api = require('africastalking');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

const africastalking = africastalking_api({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username:process.env.AFRICASTALKING_USERNAME
})

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

//Your account should be activated by the Africastalking team for this to work successfully
app.post('/send-sms',async(req,res) =>{
   
    //the Phone number should start with country code +254712345678 ->format
    const {phoneNumber} = req.body
    if(!phoneNumber){
        return res.status(404).json({ message: 'Phone number not found' });
    }
    try{

        const result = await africastalking.SMS.send({
            from:'AFTKNG',//Your Alphanumeric Sender ID, it will be different
            to:phoneNumber,
            message:"Hey Welcome to Africastalking"
        });

        res.status(200).json({
            status: "success",
            data: {
                result
            }
        })

    }catch(error){
      console.log("Error",error);
      res.status(500).json({message:'An error occured while sending SMS'})
    }
})

app.listen(port,()=>{
    console.log(`Server is running on Port ${port}`)
})

