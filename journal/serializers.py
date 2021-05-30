from rest_framework import serializers
from .models import Entry, Word

class WordSerializer(serializers.ModelSerializer):
    #right now it is only seen though!!

    class Meta:
        model = Word
        fields = ('word',)


class EntrySerializer(serializers.ModelSerializer):
    #right now it is only seen though!!

    top_keywords = WordSerializer(many=True)

    class Meta:
        model = Entry
        fields = ('pk','created','text','top_keywords','descriptive_score','sentimentality_score',)