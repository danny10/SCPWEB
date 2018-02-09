from django.db import models
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions

class Capitulo(models.Model):

	nombre = models.CharField(max_length=255)
	orden = models.IntegerField(null=True,blank=True)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.nombre	

	def fallas(self):
		return 	CapituloFalla.objects.filter(capitulo__id=self.id);			



class CapituloFalla(models.Model):

	descripcion = models.TextField(null=True,blank=True)
	capitulo=models.ForeignKey(Capitulo,related_name="capitulo_falla",on_delete=models.PROTECT)
	orden = models.IntegerField(null=True,blank=True)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.descripcion

