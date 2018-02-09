from django.contrib import admin
from sucursal.models import Sucursal
# Register your models here.
class Sucursales(admin.ModelAdmin):
	list_display=('nombre','activo',)
	search_fields=('nombre',)		

admin.site.register(Sucursal,Sucursales)
