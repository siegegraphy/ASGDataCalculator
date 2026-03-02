from django.db import models

class Replica(models.Model):
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=100)
    weight = models.FloatField()
    drive = models.CharField(max_length=100)
    hopUp = models.BooleanField(default=False)
    energy = models.FloatField()
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Attachment(models.Model):
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=100)
    weight = models.FloatField()
    description = models.CharField(max_length=100)
    compatibility = models.ManyToManyField('Replica', related_name='attachments')

    def __str__(self):
        return self.name

class Ammunition(models.Model):
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    weight = models.FloatField()
    amount = models.IntegerField()
    biodegradable = models.BooleanField(default=False)
    glowing = models.BooleanField(default=False)

    def __str__(self):
        return self.name