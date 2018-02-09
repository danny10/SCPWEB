from django.contrib import admin
from apoyo.models import Apoyo
# Register your models here.
class ApoyoGps(admin.ModelAdmin):
	list_display=('nombre','latitud','longitud',)
	search_fields=('nombre',)		

admin.site.register(Apoyo,ApoyoGps)
