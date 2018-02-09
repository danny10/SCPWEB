from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from rest_framework import routers
from apoyo.views import ApoyoViewSet
from capitulo.views import CapituloViewSet, CapituloFallaViewSet
from circuito.views import CircuitoViewSet
from contratista.views import ContratistaViewSet
from inspeccion.views import InspeccionViewSet, FallaInspeccionViewSet, CierreFallaInspeccionViewSet, FotoFallaInspeccionViewSet
from lote.views import LoteViewSet,LotePoligonoViewSet,PoligonoViewSet
#from poligono.views import PoligonoViewSet
from provincia.views import ProvinciaViewSet
from sector.views import SectorViewSet
from sucursal.views import SucursalViewSet
from usuario.views import PersonaViewSet, UsuarioViewSet

admin.autodiscover()

router =  routers.DefaultRouter()

router.register(r'Apoyo', ApoyoViewSet)
router.register(r'Circuito', CircuitoViewSet)
router.register(r'Contratista', ContratistaViewSet)

router.register(r'Capitulo', CapituloViewSet)
router.register(r'Capitulo_falla', CapituloFallaViewSet)


router.register(r'Inspeccion', InspeccionViewSet)
router.register(r'Falla_inspeccion', FallaInspeccionViewSet)
router.register(r'Cierre_falla_inspeccion', CierreFallaInspeccionViewSet)
router.register(r'Foto_falla_inspeccion', FotoFallaInspeccionViewSet)

router.register(r'Lote', LoteViewSet)
router.register(r'Poligono', PoligonoViewSet)
router.register(r'Provincia', ProvinciaViewSet)
router.register(r'Sector', SectorViewSet)
router.register(r'Sucursal', SucursalViewSet)
router.register(r'LotePoligono', LotePoligonoViewSet)

router.register(r'Persona', PersonaViewSet)
router.register(r'Usuario', UsuarioViewSet)

urlpatterns = patterns('',
    # url(r'^oauth2/', include('provider.oauth2.urls', namespace = 'oauth2')),
    # url(r'^api-token-auth/', views.obtain_auth_token),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/',include(router.urls)),
    url(r'^apoyo/', include('apoyo.urls')),
    url(r'^capitulo/', include('capitulo.urls')),
    url(r'^circuito/', include('circuito.urls')),
    url(r'^contratista/', include('contratista.urls')),
    url(r'^inspeccion/', include('inspeccion.urls')),
    url(r'^lote/', include('lote.urls')),
    url(r'^poligono/', include('poligono.urls')),
    url(r'^provincia/', include('provincia.urls')),
    url(r'^sector/', include('sector.urls')),
    url(r'^sucursal/', include('sucursal.urls')),
    url(r'^usuario/', include('usuario.urls')),

    
)

urlpatterns += patterns('',url(r'^media/(?P<path>.*)$','django.views.static.serve',{'document_root': settings.MEDIA_ROOT,}),)

urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
]