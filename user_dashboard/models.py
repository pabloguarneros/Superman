from PIL import Image
from django.db import models
from django.contrib.auth.models import AbstractUser

def profile_pic_directory_path(instance, filename): 
    return 'users/{0}/profile_pic/{1}'.format(instance.username, f"{filename}")  

class User(AbstractUser):
    email = models.EmailField('email', unique=True)
    profile_pic = models.ImageField(upload_to=profile_pic_directory_path, blank=True)