from django.urls import include, path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('dashboard', views.home),
    path('logout', views.logout),
    path('api/activities', views.seeActivities.as_view()),
    path('api/emotions', views.seeEmotions.as_view()),
    path('api/friends', views.seeFriends.as_view())
]