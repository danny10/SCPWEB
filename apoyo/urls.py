from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'^apoyo/$', views.Apoyo, name='apoyo.apoyo'),

]