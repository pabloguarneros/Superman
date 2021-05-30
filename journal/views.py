from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db.models import Count, Q
from .serializers import EntrySerializer, WordSerializer
from .models import Entry, Journal, Word

class seeEntries(generics.ListAPIView):

    serializer_class = EntrySerializer

    def get_queryset(self):
        user = self.request.user
        obj, created = Journal.objects.get_or_create(writer=user)
        return obj.entries.all()

class seeTopWords(generics.ListAPIView):

    serializer_class = WordSerializer

    def get_queryset(self):
        user = self.request.user
        obj, created = Journal.objects.get_or_create(writer=user) #creates a journal in case user has not previous journal, although we can do this at user save too
        words = Word.objects.all().annotate(journal_count=Count('entry',filter=Q(entry__journal__writer=user))).order_by('-journal_count')
        return words[0:10] #return the ten keywords most often used

class EntryByWord(generics.ListAPIView):

    serializer_class = EntrySerializer

    def get_queryset(self):
        word = self.request.query_params.get('word', None)
        journal, created = Journal.objects.get_or_create(writer=self.request.user) #creates a journal in case user has not previous journal, although we can do this at user save too
        return journal.entries.all().filter(top_keywords__word=word)

def addEntry(request):
    if request.method == 'POST':
        user = request.user
        text = request.POST.get('entry_body')
        entry = Entry(text=text)
        entry.save()
        entry.add_words()
        journal = Journal.objects.get(writer=user)
        journal.entries.add(entry)
        journal.save()
        return HttpResponse("success")
    else:
        return HttpResponse("unsuccesful")

