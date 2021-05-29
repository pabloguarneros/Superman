from django.contrib import admin
from .models import User, Emotion, Emotion_Schedule, Friend, Friend_List, Manly

admin.site.register(User)
admin.site.register(Emotion)
admin.site.register(Emotion_Schedule)
admin.site.register(Friend)
admin.site.register(Friend_List)
admin.site.register(Manly)

# Register your models here.
