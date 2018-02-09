from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'^inspeccion/(?P<id_lote>[0-9]+)/$', views.Inspeccion, name='inspeccion.inspeccion'),
	url(r'^falla_inspeccion/$', views.FallaInspeccion, name='inspeccion.falla_inspeccion'),
	url(r'^cierre_falla_inspeccion/$', views.CierreFallaInspeccion, name='inspeccion.cierre_falla_inspeccion'),
	url(r'^foto_falla_inspeccion/$', views.FotoFallaInspeccion, name='inspeccion.foto_falla_inspeccion'),

	url(r'^registro_inspeccion/(?P<id_lote>[0-9]+)/$', views.RegistroInspeccion, name='inspeccion.registro_inspeccion'),
	#url(r'^registro_inspeccion/$', views.RegistroInspeccion, name='inspeccion.registro_inspeccion'),

	url(r'^guardar_inspeccion/$', views.GuardarInspeccion, name='inspeccion.guardar_inspeccion'),
	url(r'^inactivo_inspeccion/$', views.InspeccionInactiva, name='inspeccion.inactivo_inspeccion'),

	url(r'^actualizar_inspeccion/(?P<id_inspeccion>[0-9]+)/$', views.ActualizarInspeccion, name='inspeccion.actualizar_inspeccion'),

	url(r'^obtener_inspeccion/$', views.ObtnerInspeccion, name='inspeccion.obtener_inspeccion'),

	url(r'^actualizacion_inspeccion/$', views.ActualizacionInspeccion, name='inspeccion.actualizacion_inspeccion'),

]