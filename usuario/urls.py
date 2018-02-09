from django.conf.urls import url

from . import views

urlpatterns = [
  
    url(r'^$', views.index_view, name='usuario.index'),
    url(r'^login/$', views.login_view, name='usuario.login'),
    url(r'^logout/$', views.logout_view, name='usuario.logout'),
    url(r'^cambiousuario/$', views.cambiar_usuario, name='usuario.changePass'),
    url(r'^cambiar_clave/$', views.passwordChange, name='usuario.cambioclave'), 
]