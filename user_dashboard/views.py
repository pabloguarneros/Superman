from django.shortcuts import render
from django.http import HttpResponse

from .models import Manly


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