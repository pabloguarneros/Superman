from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('karla/', admin.site.urls),
    path('',include(('home.urls','home'),namespace='home')),
    path('', include('django.contrib.auth.urls')),
    path('', include('social_django.urls')),

]

if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    