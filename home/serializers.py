from rest_framework import serializers
from user_dashboard.models import Manly, Emotion_Schedule, Emotion, Friend_List, Friend

class SeeActivitiesSerializer(serializers.ModelSerializer):
    #right now it is only seen though!!
    class Meta:
        model = Manly
        fields = ['description','manly_points']

class EmotionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Emotion
        fields = ('emotion','time_felt')

class SeeEmotionsSerializer(serializers.ModelSerializer):
    
    emotions = EmotionSerializer()

    class Meta:
        model = Emotion_Schedule
        fields = ['emotions']

class FriendSerializer(serializers.ModelSerializer):

    class Meta:
        model = Friend
        fields = ('name','phone','social_media_link','face_pic')

class SeeFriendsSerializer(serializers.ModelSerializer):
    
    emotions = FriendSerializer()

    class Meta:
        model = Friend_List
        fields = ['emotions']
