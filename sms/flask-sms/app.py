from flask import Flask, request, jsonify
import africastalking
import os
from dotenv import load_dotenv
from flask_cors import CORS


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Africa's Talking
username = os.getenv("AFRICASTALKING_USERNAME")
api_key = os.getenv("AFRICASTALKING_API_KEY")

africastalking.initialize(
    username,
    api_key
    )

sms = africastalking.SMS


@app.route('/send-sms', methods=['POST'])
def send_sms():
    data = request.get_json()
    phone_number = data.get("phoneNumber")

    if not phone_number:
        return jsonify({"message": "Phone number not found"}), 400

    try:
        response = sms.send(
            message="Hello from AfricasTalking!",
            recipients=[phone_number],
            sender_id="AFTKNG"  # your Alphanumeric sender ID
        )  

        return jsonify({"status": "success", "data": response}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred while sending SMS", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
