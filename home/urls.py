from django.urls import include, path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('dashboard', views.home, name="home"),
    path('logout', views.logout)
]