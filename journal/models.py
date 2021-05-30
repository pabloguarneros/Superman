from django.db import models
from user_dashboard.models import User
from django.utils import timezone
import nltk
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
from nltk import FreqDist
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

class Word(models.Model):
    
    def __str__(self):
        return self.word

    word = models.CharField(max_length=30)

class Entry(models.Model):
    text = models.TextField()
    top_keywords = models.ManyToManyField(Word, blank=True)
    sentimentality_score = models.FloatField(default=0,null=True,blank=True)
    descriptive_score = models.FloatField(default=0, null=True,blank=True)
    created = models.DateField(default=None, null=True, blank=True) #added default as table already existing and had to provide default without using mutually exclusive auto_now

    def save(self, *args, **kwargs):
        '''
        NLP for the journal occuring at save, to reduce time complexity to O(1) for retrieval
        '''
        if not self.pk: #if not created yet with pk value
            self.created = timezone.now()
        super(Entry,self).save(*args, **kwargs)
        ## Adjectives ##
        words_in_text = word_tokenize(self.text)
        tagged_words = nltk.pos_tag(words_in_text)
        count = 0
        for i in range(len(tagged_words)):
            if tagged_words[i][1] == 'JJ':
                count += 1
        self.descriptive_score = round(count/len(tagged_words),2)

        ## Sentimentality ##
        sia = SentimentIntensityAnalyzer()
        sent = sia.polarity_scores(self.text)
        '''
        Analyzing scores:
            x = sent['compound']
            if x < -0.3 ... overall very negative
            if -0.3 >= x < -0.05 ... overall slightly negative
            if -0.05 >= x < 0.05 ... overall neutral
            if 0.05 >= x < 0.3 ... overall slightly positive
            if x >= 0.3 ... overall very positive
        '''
        self.sentimentality_score = sent['compound']
        super(Entry,self).save(*args, **kwargs)

    def add_words(self,*args, **kwargs):
        '''
        Currently, a work around to save many_to_many field, however, the call would take more times to import. Consider save_related?
        '''
        words_in_text = word_tokenize(self.text)
        nltk.download('stopwords') #Download frequent stopwords
        stop_words = set(stopwords.words("english")) #Only take into consideration, english .. will change if we decide to change languages / aaudience
        meaningful_words = [word for word in words_in_text if word.casefold() not in stop_words]
        frequency_distribution = FreqDist(meaningful_words)
        for word_tuple in frequency_distribution.most_common(10):
            if word_tuple[1] > 2 and len(word_tuple[0]) > 2: #check frequency of word and #length to exclude )
                print(word_tuple)
                word_to_add, created = Word.objects.get_or_create(word=word_tuple[0])
                self.top_keywords.add(word_to_add)
                super(Entry,self).save(*args, **kwargs)

class Journal(models.Model):
    writer = models.ForeignKey(User, on_delete=models.CASCADE)
    entries = models.ManyToManyField(Entry, blank=True)