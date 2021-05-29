from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('karla/', admin.site.urls),
    path('',include(('home.urls','home'),namespace='home')),
    path('', include('django.contrib.auth.urls')),
    path('', include('social_django.urls')),
    path('users/',include(('user_dashboard.urls','user_dashboard'),namespace='user_dashboard')),


]

if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    