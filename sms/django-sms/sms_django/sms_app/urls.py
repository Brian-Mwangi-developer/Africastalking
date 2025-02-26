from django.urls import path
from .views import send_sms

urlpatterns = [
    path('send-sms/', send_sms, name='send_sms'),
]
