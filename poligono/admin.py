from django.contrib import admin
from poligono.models import Poligono
# Register your models here.
class Poligonos(admin.ModelAdmin):
	list_display=('nombre','activo',)
	search_fields=('nombre',)		

admin.site.register(Poligono,Poligonos)
