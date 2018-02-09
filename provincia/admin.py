from django.contrib import admin
from provincia.models import Provincia
# Register your models here.
class Provincias(admin.ModelAdmin):
	list_display=('nombre',)
	search_fields=('nombre',)		

admin.site.register(Provincia,Provincias)
