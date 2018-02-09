from django.conf.urls import url
from . import views

urlpatterns = [
	
	url(r'^lote/$', views.Lotes, name='lote.lote'),
	url(r'^registro_lote/$', views.RegistroLote, name='lote.registro_lote'),
	url(r'^guardar_lote/$', views.guardar_lote, name='lote.guardar_lote'),
	url(r'^inactivo_lote/$', views.LoteInactivo, name='lote.inactivo_lote'),
	url(r'^actualizar_lote/(?P<id_lote>[0-9]+)/$', views.ActualizarLote, name='lote.actualizar_lote'),

	#url de la pagina editar
	url(r'^listado_circuito/$', views.consulta_listado_circuito, name='p_p_construccion.listado_circuito'),
	url(r'^listado_circuito_asociado/$', views.consulta_listado_circuito_asociados, name='lote.listado_circuito_asociado'),
	url(r'^asociar_circuito_lote/$', views.AsociarCircuitoLoteEditar, name='lote.asociar_circuito_lote'),
	url(r'^eliminar_circuito_lote/$', views.eliminarAsociacionCircuitoLote, name='lote.eliminar_circuito_lote'),

	url(r'^listado_sector/$', views.consulta_listado_sector, name='p_p_construccion.listado_sector'),
	url(r'^listado_sector_asociado/$', views.consulta_listado_sector_asociados, name='lote.listado_sector_asociado'),
	url(r'^asociar_sector_lote/$', views.AsociarSectorLoteEditar, name='lote.asociar_sector_lote'),
	url(r'^eliminar_sector_lote/$', views.eliminarAsociacionSectorLote, name='lote.eliminar_sector_lote'),
	url(r'^listado_poligono_asociado/$', views.consulta_listado_poligono_asociados, name='lote.listado_poligono_asociado'),
	url(r'^asociar_poligono_lote/$', views.AsociarPoligonoLoteEditar, name='lote.asociar_poligono_lote'),
	url(r'^eliminar_poligono_lote/$', views.eliminarAsociacionPoligonoLote, name='lote.eliminar_poligono_lote'),

]