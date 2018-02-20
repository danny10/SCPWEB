from django.db import models
from circuito.models import Circuito
from sector.models import Sector
from poligono.models import Poligono
from lote.models import Lote
from apoyo.models import Apoyo
from usuario.models import Usuario
from capitulo.models import CapituloFalla
from simple_history.models import HistoricalRecords
from SCPWEB.functions import functions,RandomFileName

class AInspeccion(models.Model):
	
	circuito=models.ForeignKey(Circuito,related_name="circuito_inspeccion",on_delete=models.PROTECT)
	lote=models.ForeignKey(Lote,related_name="lote_inspeccion",on_delete=models.PROTECT)
	poligono=models.ForeignKey(Poligono,related_name="poligono_inspeccion",on_delete=models.PROTECT)
	sector=models.ForeignKey(Sector,related_name="sector_inspeccion",on_delete=models.PROTECT)
	apoyo=models.ForeignKey(Apoyo,related_name="apoyo_inspeccion",on_delete=models.PROTECT)
	usuario=models.ForeignKey(Usuario,related_name="usuario_inspeccion",on_delete=models.PROTECT)
	fecha = models.DateField(null=True,blank=True)
	activo = models.BooleanField(default=False)
	numero_inspeccion = models.IntegerField(null=True,blank=True)
	history = HistoricalRecords()


	def ano_inspeccion(self):
		ano=self.fecha.year
		return ano

	def mes_inspeccion(self):
		meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
		mes=meses[int(self.fecha.month)-1]
		return mes

	def contador_cierre(self):
		count=0
		# print 'id-falla>>>'
		# print self.id
		falla=BFallaInspeccion.objects.filter(inspeccion__id=self.id)

		for item in list(falla):
			cierre=CCierreFallaInspeccion.objects.filter(falla_inspeccion__id=item.id).count()
			count =count + cierre
		
		valor=len(falla)-count
		# print 'valor>>>>'
		# print valor
		return valor

	class Meta:
		db_table = "inspeccion_inspeccion"

	def __unicode__(self):
		return str(self.numero_inspeccion)	

class BFallaInspeccion(models.Model):
	
	inspeccion=models.ForeignKey(AInspeccion,related_name="inspeccion_falla",on_delete=models.PROTECT)
	capitulo_falla=models.ForeignKey(CapituloFalla,related_name="capitulo_falla",on_delete=models.PROTECT)
	observaciones = models.TextField(null=True,blank=True)
	calificacion = models.IntegerField(null=True,blank=True)
	history = HistoricalRecords()

	class Meta:
		db_table = "inspeccion_falla_inspeccion"

	def __unicode__(self):
		return self.observaciones

	def soportes(self):
		return FotoFallaInspeccion.objects.filter(falla_inspeccion__id=self.id)


class CCierreFallaInspeccion(models.Model):
	
	fecha = models.DateField(null=True,blank=True)
	observaciones = models.TextField(null=True,blank=True)
	falla_inspeccion=models.ForeignKey(BFallaInspeccion,related_name="cierre_falla_inspeccion",on_delete=models.PROTECT)
	#soporte=models.FileField(upload_to='cierre_falla_inspeccion/soporte',blank=True, null=True)
	soporte=models.FileField(upload_to=RandomFileName('cierre_falla_inspeccion/soporte'),blank=True, null=True)
	history = HistoricalRecords()
	#soporte=models.FileField(upload_to=functions.path_and_rename('cierre_falla_inspeccion/soporte','plz'),blank=True, null=True)

	class Meta:
		db_table = "inspeccion__cierre_falla_inspeccion"


	def __unicode__(self):
		return self.observaciones 


class FotoFallaInspeccion(models.Model):
	
	falla_inspeccion=models.ForeignKey(BFallaInspeccion,related_name="foto_falla_inspeccion",on_delete=models.PROTECT)
	#soporte=models.FileField(upload_to='foto_falla_inspeccion/soporte',blank=True, null=True)
	#soporte= models.FileField(upload_to = 'foto_falla_inspeccion/soporte', blank=True, null=True)
	history = HistoricalRecords()
	soporte=models.FileField(upload_to=RandomFileName('cierre_falla_inspeccion/soporte'),blank=True, null=True)

	class Meta:
		db_table = "inspeccion__foto_falla_inspeccion" 


	def __unicode__(self):
		return self.falla_inspeccion.observaciones 

