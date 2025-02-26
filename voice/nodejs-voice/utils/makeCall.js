require('dotenv').config();

let AT_apiKey = process.env.AFRICASTALKING_API_KEY
let AT_username = process.env.AFRICASTALKING_USERNAME

const credentials ={
    api_key:AT_apiKey,
    username: AT_username
}

const africastalking = require('africastalking')(credentials);

const voice = africastalking.voice;

let APP_URL = process.env.URL

function makeCall(callTo){
    return new Promise((resolve,reject) =>{
        const options ={
            callFrom: process.env.VIRTUAL_NUMBER,
            callTo: callTo,
            callbackUrl:`${APP_URL}/response-callback`
        }
        voice.call(options)
        .then(response =>{
            resolve(response);
        })
        .catch(error =>{
            console.error(error);
            reject(error)
        });
    });
}

module.exports = {makeCall}