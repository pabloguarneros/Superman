from rest_framework import serializers
from user_dashboard.models import Manly, Emotion_Schedule, Emotion, Friend_List, Friend

class SeeActivitiesSerializer(serializers.ModelSerializer):
    #right now it is only seen though!!
    class Meta:
        model = Manly
        fields = ['pk','description','manly_points']

class EmotionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Emotion
        fields = ('emotion','time_felt')

class FriendSerializer(serializers.ModelSerializer):

    class Meta:
        model = Friend
        fields = ('name','phone','social_media_link','face_pic')
