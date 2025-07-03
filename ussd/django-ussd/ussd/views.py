from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Disable CSRF for simplicity (not recommended for production)
def ussd_callback(request):
    session_id = request.POST.get("sessionId", None)
    service_code = request.POST.get("serviceCode", None)
    phone_number = request.POST.get("phoneNumber", None)
    text = request.POST.get("text", "")

    if text == '':
        response = "CON What would you want to check \n"
        response += "1. My Account \n"
        response += "2. My phone number"
    elif text == '1':
        response = "CON Choose account information you want to view \n"
        response += "1. Account number \n"
        response += "2. Account balance"
    elif text == '1*1':
        accountNumber = "ACC1001"
        response = "END Your account number is " + accountNumber
    elif text == '1*2':
        balance = "KES 10,000"
        response = "END Your balance is " + balance
    elif text == '2':
        response = "END This is your phone number " + phone_number
    else:
        response = "END Invalid input"

    return HttpResponse(response, content_type="text/plain")
