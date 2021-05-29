from PIL import Image
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import DateField, DateTimeField

def profile_pic_directory_path(instance, filename): 
    return 'users/{0}/profile_pic/{1}'.format(instance.username, f"{filename}")  

def friend_pic_directory_path(instance, filename): 
    return 'allies/{0}/face_pic/{1}'.format(instance.friend_to.username, f"{filename}")  

class User(AbstractUser):
    email = models.EmailField('email')
    profile_pic = models.ImageField(upload_to=profile_pic_directory_path, blank=True)
    manly_points = models.IntegerField(default=5)

class Emotion(models.Model):

    class Emotion_Emoji(models.IntegerChoices):
        LOVE = 0
        SMILE = 1
        NEUTRAL = 2
        WORRIED = 4
        SAD = 5

    emotion = models.IntegerField(choices=Emotion_Emoji.choices,default=2)
    time_felt = models.DateField(auto_now_add=True)

class Emotion_Schedule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    emotions = models.ManyToManyField(Emotion, blank=True)

class Friend(models.Model):
    name = models.CharField(max_length=60)
    friend_to = models.ForeignKey(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=12, blank=True)
    social_media_link = models.CharField(max_length=60, blank=True)
    face_pic = models.ImageField(upload_to=friend_pic_directory_path, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.face_pic:
            img = Image.open(self.face_pic.path)

            if img.height > 250 or img.width > 250:
                new_img = (250, 250)
                img.thumbnail(new_img)
                img = img.convert('RGB') #convert transparency to new image!
                img.save(self.face_pic.path)  # saving image at the same path

class Friend_List(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    friends = models.ManyToManyField(Friend, blank=True)

# Create your models here.
class Manly(models.Model):
    description = models.CharField(max_length=150)
    manly_points = models.IntegerField(default=20)
    users_done = models.ManyToManyField(User, blank=True)


