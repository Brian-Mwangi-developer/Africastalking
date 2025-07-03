from django.urls import path
from . import views

urlpatterns = [
    path('voice/', views.voice, name='voice'),
    path('voice/callback/', views.voice_callback, name='voice_callback'),
    path('ongea/', views.ongea, name='ongea'),
    path('region/', views.region, name='region'),
    path('water/', views.water, name='water'),
    path('emergency/', views.emergency, name='emergency'),
    path('emergency-response/', views.emergency_response,
         name='emergency_response'),
]
