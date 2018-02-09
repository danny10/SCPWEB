from django.contrib import admin
from capitulo.models import Capitulo,CapituloFalla
# Register your models here.
class Capitulos(admin.ModelAdmin):
	list_display=('nombre','orden',)
	search_fields=('nombre',)		

admin.site.register(Capitulo,Capitulos)


class CapitulosFalla(admin.ModelAdmin):
	list_display=('descripcion','capitulo','orden',)
	list_filter=('capitulo',)
	search_fields=('descripcion',)	

admin.site.register(CapituloFalla,CapitulosFalla)
