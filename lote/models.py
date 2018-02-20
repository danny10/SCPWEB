from django.db import models
from contratista.models import Contratista
from provincia.models import Provincia
from sucursal.models import Sucursal
from circuito.models import Circuito
from sector.models import Sector
from poligono.models import Poligono
from simple_history.models import HistoricalRecords
#from SCPWEB.functions import functions

class Lote(models.Model):
	
	nombre = models.CharField(max_length=255)
	contratista=models.ForeignKey(Contratista,related_name="contratista_lote",on_delete=models.PROTECT)
	provincia=models.ForeignKey(Provincia,related_name="provincia_lote",on_delete=models.PROTECT)
	sucursal=models.ForeignKey(Sucursal,related_name="sucursal_lote",on_delete=models.PROTECT)
	activo = models.BooleanField(default=False)
	history = HistoricalRecords()

	def __unicode__(self):
		return self.nombre				


class LoteCircuito(models.Model):
	
	lote=models.ForeignKey(Lote,related_name="lote_circuito",on_delete=models.PROTECT)
	circuito=models.ForeignKey(Circuito,related_name="circuito_lote_circuito",on_delete=models.PROTECT)


class LoteSector(models.Model):
	
	lote=models.ForeignKey(Lote,related_name="lote_sector",on_delete=models.PROTECT)
	sector=models.ForeignKey(Sector,related_name="sector_lote",on_delete=models.PROTECT)


class LotePoligono(models.Model):
	
	lote=models.ForeignKey(Lote,related_name="lote_poligono",on_delete=models.PROTECT)
	poligono=models.ForeignKey(Poligono,related_name="poligono_lote",on_delete=models.PROTECT)


class Mes(models.Model):
	
	nombre = models.CharField(max_length=255)
