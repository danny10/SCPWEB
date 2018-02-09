from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'^contratista/$', views.ContratistaListado, name='contratista.contratista'),
	url(r'^desactivar_contratista/$', views.ContratistaInactivo, name='contratista.desactivar_contratista'),
	url(r'^exportar_contratista/$', views.ExportarContratista, name='contratista.exportar_contratista'),

]