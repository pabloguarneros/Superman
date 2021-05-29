from django.shortcuts import render
from django.http import HttpResponse

from .models import Manly, Friend, Emotion, Friend_List, Emotion_Schedule


def done_activity(request):
    if request.method == 'POST':
        user = request.user
        activity_pk = request.POST.get('activity')
        activity = Manly.objects.get(pk=activity_pk)
        user.manly_points += activity.manly_points
        user.save()
        activity.users_done.add(user)
        activity.save()
   
        return HttpResponse("success")
    else:
        return HttpResponse("unsuccesful")

def done_friend(request):
    if request.method == 'POST':
        user = request.user
        name = request.POST.get('name')
        social = request.POST.get('social')
        new_friend = Friend(friend_to=user,name=name,social_media_link=social)
        new_friend.save()
        obj, created = Friend_List.objects.get_or_create(user=user)
        obj.friends.add(new_friend)
        obj.save()
        return HttpResponse("success")
    else:
        return HttpResponse("unsuccesful")

def done_emotion(request):
    if request.method == 'POST':
        user = request.user
        emotion_str = request.POST.get('emotion')
        print(emotion_str)
        emotion = Emotion(emotion=int(emotion_str))
        emotion.save()
        obj, created = Emotion_Schedule.objects.get_or_create(user=user)
        obj.emotions.add(emotion)
        obj.save()
        return HttpResponse("success")
    else:
        return HttpResponse("unsuccesful")

