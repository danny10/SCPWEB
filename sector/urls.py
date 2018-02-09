from django.conf.urls import url
from . import views

urlpatterns = [
	
	url(r'^sector/$', views.SectorVista, name='sector.sector'),
	url(r'^desactivar_sector/$', views.SectorInactivo, name='contratista.desactivar_contratista'),
	url(r'^exportar_sector/$', views.ExportarSector, name='contratista.exportar_contratista'),

]