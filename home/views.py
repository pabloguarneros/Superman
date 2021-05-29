from django.shortcuts import render
from django.contrib.auth import logout as log_out
from django.conf import settings
from django.http import HttpResponseRedirect
from urllib.parse import urlencode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics

from user_dashboard.models import Manly, Emotion_Schedule, Friend_List
from .serializers import SeeActivitiesSerializer, SeeEmotionsSerializer, SeeFriendsSerializer



def home(request):
    user = request.user
    if user.is_authenticated:
        context = {
            'user':user
        }
        return render(request, 'home/dashboard.html', context)
    else:
        return render(request,'home/dock_master.html')


def logout(request):
    log_out(request)
    return_to = urlencode({'returnTo': request.build_absolute_uri('/')})
    logout_url = 'https://%s/v2/logout?client_id=%s&%s' % \
                 (settings.SOCIAL_AUTH_AUTH0_DOMAIN, settings.SOCIAL_AUTH_AUTH0_KEY, return_to)
    return HttpResponseRedirect(logout_url)

class seeActivities(generics.ListAPIView):

    serializer_class = SeeActivitiesSerializer

    def get_queryset(self):
        user = self.request.user
        return Manly.objects.exclude(users_done=user)

class seeEmotions(generics.ListAPIView):

    serializer_class = SeeEmotionsSerializer

    def get_queryset(self):
        user = self.request.user
        obj, created = Emotion_Schedule.objects.get_or_create(user=user)
        return obj

class seeFriends(generics.ListAPIView):

    serializer_class = SeeFriendsSerializer

    def get_queryset(self):
        user = self.request.user
        obj, created = Friend_List.objects.get_or_create(user=user)
        return obj

