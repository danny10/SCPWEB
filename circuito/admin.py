from django.contrib import admin
from circuito.models import Circuito
# Register your models here.
class Circuitos(admin.ModelAdmin):
	list_display=('nombre','activo',)
	search_fields=('nombre',)		

admin.site.register(Circuito,Circuitos)
