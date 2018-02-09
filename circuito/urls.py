from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'^circuito/$', views.CircuitoVista, name='circuito.circuito'),
	url(r'^inactivo_circuito/$', views.CircuitoInactivo, name='circuito.inactivo_circuito'),
	url(r'^exportar_circuito/$', views.ExportarCircuito, name='circuito.exportar_circuito'),

]