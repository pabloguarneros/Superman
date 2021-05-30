from django.urls import path
from . import views

urlpatterns=[
    path('api/entries',views.seeEntries.as_view()),
    path('api/keywords',views.seeTopWords.as_view()),
    path('api/wordentry',views.EntryByWord.as_view()),
    path('add_entry',views.addEntry)
]