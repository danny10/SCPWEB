from django.conf.urls import url
from . import views

urlpatterns = [
	
	url(r'^poligono/(?P<id_lote>[0-9]+)/$', views.Poligonos, name='poligono.poligono'),
	url(r'^inactivo_poligono/$', views.PoligonoInactivo, name='circuito.inactivo_poligono'),

]