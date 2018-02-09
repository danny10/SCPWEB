from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions


class Persona(models.Model):

	identificacion = models.BigIntegerField(unique=True)
	nombres = models.CharField(max_length=255)
	apellidos = models.CharField(max_length=255)
	correo = models.EmailField(max_length=70,blank=True, null=True)
	telefono = models.CharField(max_length=30,blank=True, null=True)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.nombres + ' ' + self.apellidos						


class Usuario(models.Model):
	
	user = models.OneToOneField(settings.AUTH_USER_MODEL)
	persona = models.ForeignKey(Persona,related_name="persona_usuario",on_delete=models.PROTECT)
	history = HistoricalRecords()
	
	def __unicode__(self):
		return self.user.username

	def nombres(self):
		return self.persona.nombres

	def apellidos(self):
		return self.persona.apellidos

	def correo(self):
		return self.persona.correo



