from django.contrib import admin
from inspeccion.models import AInspeccion,BFallaInspeccion,CCierreFallaInspeccion,FotoFallaInspeccion
# Register your models here.
class Inspeccion(admin.ModelAdmin):
	list_display=('circuito','lote','poligono','sector','apoyo','usuario','fecha','activo','numero_inspeccion',)
	list_filter=('circuito','lote','poligono','sector','apoyo','usuario','fecha',)
	search_fields=('numero_inspeccion',)		

admin.site.register(AInspeccion,Inspeccion)


class FallaInspeccion(admin.ModelAdmin):
	list_display=('inspeccion','capitulo_falla','observaciones','calificacion',)
	list_filter=('inspeccion','capitulo_falla',)
	search_fields=('observaciones',)	

admin.site.register(BFallaInspeccion,FallaInspeccion)


class CierreFallaInspeccion(admin.ModelAdmin):
	list_display=('falla_inspeccion','fecha','observaciones','soporte',)
	list_filter=('falla_inspeccion',)
	search_fields=('observaciones',)	

admin.site.register(CCierreFallaInspeccion,CierreFallaInspeccion)


class FotoFalla(admin.ModelAdmin):
	list_display=('falla_inspeccion','soporte',)
	list_filter=('falla_inspeccion',)

admin.site.register(FotoFallaInspeccion,FotoFalla)