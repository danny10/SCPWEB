from django.db import models
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions

class Contratista(models.Model):
	
	rnc = models.CharField(max_length=255)
	nombre = models.CharField(max_length=255)
	activo = models.BooleanField(default=False)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.rnc + ' ' + self.nombre				
