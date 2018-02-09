from django.db import models
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions

class Sector(models.Model):
	
	nombre = models.CharField(max_length=255)
	activo = models.BooleanField(default=False)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.nombre				
