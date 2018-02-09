from django.db import models
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions

class Apoyo(models.Model):
	
	nombre = models.CharField(max_length=255)
	latitud = models.CharField(max_length=50)
	longitud = models.CharField(max_length=50)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.nombre		
