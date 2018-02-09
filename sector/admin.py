from django.contrib import admin
from sector.models import Sector
# Register your models here.
class Sectores(admin.ModelAdmin):
	list_display=('nombre','activo',)
	search_fields=('nombre',)		

admin.site.register(Sector,Sectores)
