from django.contrib import admin
from lote.models import Lote,LoteCircuito,LoteSector,LotePoligono
# Register your models here.
class Lotes(admin.ModelAdmin):
	list_display=('nombre','contratista','provincia','sucursal','activo',)
	list_filter=('contratista','provincia','sucursal',)
	search_fields=('nombre',)		

admin.site.register(Lote,Lotes)


class LotesCircuito(admin.ModelAdmin):
	list_display=('lote','circuito',)
	list_filter=('lote','circuito',)

admin.site.register(LoteCircuito,LotesCircuito)


class LotesSector(admin.ModelAdmin):
	list_display=('lote','sector',)
	list_filter=('lote','sector',)

admin.site.register(LoteSector,LotesSector)


class LotesPoligono(admin.ModelAdmin):
	list_display=('lote','poligono',)
	list_filter=('lote','poligono',)

admin.site.register(LotePoligono,LotesPoligono)