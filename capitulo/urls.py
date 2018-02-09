from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'^capitulo/$', views.Capitulo, name='capitulo.capitulo'),
	url(r'^capitulo_falla/(?P<id_proyecto>[0-9]+)/$', views.CapituloFalla, name='capitulo.capitulo_falla'),

]