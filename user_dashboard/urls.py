from django.urls import path
from . import views

urlpatterns = [
    path('done_activity', views.done_activity)
]