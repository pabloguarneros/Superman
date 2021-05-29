from django.urls import path
from . import views

urlpatterns = [
    path('done_activity', views.done_activity),
    path('done_friend', views.done_friend),
    path('done_emotion', views.done_emotion)
]