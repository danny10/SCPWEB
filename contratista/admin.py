from django.contrib import admin
from contratista.models import Contratista
# Register your models here.
class Contratistas(admin.ModelAdmin):
	list_display=('rnc','nombre','activo',)
	search_fields=('rnc','nombre',)		

admin.site.register(Contratista,Contratistas)
