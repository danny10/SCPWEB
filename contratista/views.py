from django.shortcuts import render,redirect,render_to_response
from django.core.urlresolvers import reverse
from rest_framework import viewsets, serializers
from django.db.models import Q
from django.template import RequestContext
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
import xlsxwriter
import json
from .models import Contratista
from django.http import HttpResponse,JsonResponse
from django.db import transaction,connection
from django.db.models.deletion import ProtectedError
from django.contrib.auth.decorators import login_required
from SCPWEB.functions import functions


#Api para los contratistas
class ContratistaSerializer(serializers.HyperlinkedModelSerializer):

	class Meta:
		model = Contratista
		fields=('id','rnc','nombre','activo')


class ContratistaViewSet(viewsets.ModelViewSet):
	""" Retorna una lista de contratistas. """
	model=Contratista
	queryset = model.objects.all()
	serializer_class = ContratistaSerializer

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','status':'success','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)


	def list(self, request, *args, **kwargs):
		try:

			queryset = super(ContratistaViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			sin_paginacion = self.request.query_params.get('sin_paginacion', None)
			activo = self.request.query_params.get('activo', None)
			qset=''

			qset = Q(activo=activo)

			if dato:

				qset = qset &(
						Q(nombre__icontains=dato) | Q(rnc__icontains=dato)
				)
					
			#print qset
			if qset != '':
				queryset = self.model.objects.filter(qset)

			if sin_paginacion is None:	
	
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})
				
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok','data':serializer.data})
			
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok','data':serializer.data})
											
		except Exception,e:
			#print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()

			try:
				serializer = ContratistaSerializer(data=request.DATA,context={'request': request})

				contratista = Contratista.objects.filter(rnc=request.DATA['rnc'])

				if contratista:
					return Response({'message':'Ya existe un contratista registrado con el rnc digitado','success':'fail',
						'data':''},status=status.HTTP_400_BAD_REQUEST)


				if serializer.is_valid():
					serializer.save()

					transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					#print serializer.errors
					return Response({'message':'datos requeridos no fueron recibidos','success':'fail',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

			except Exception,e:
				#print e
				transaction.savepoint_rollback(sid)
				return Response({'message':'Se presentaron errores al procesar los datos','success':'error',
					'data':''},status=status.HTTP_400_BAD_REQUEST)	


	@transaction.atomic
	def update(self,request,*args,**kwargs):
		if request.method == 'PUT':
			sid = transaction.savepoint()

			try:
				partial = kwargs.pop('partial', False)
				instance = self.get_object()
				serializer = ContratistaSerializer(instance,data=request.DATA,context={'request': request},partial=partial)

				if serializer.is_valid():
					serializer.save()

					transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido actualizado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
				 	return Response({'message':'datos requeridos no fueron recibidos','success':'fail',
			 		'data':''},status=status.HTTP_400_BAD_REQUEST)
			except:

				transaction.savepoint_rollback(sid)
			 	return Response({'message':'Se presentaron errores al procesar los datos','success':'error',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

	def destroy(self,request,*args,**kwargs):
		try:
			instance = self.get_object()
			self.perform_destroy(instance)
			return Response({'message':'El registro se ha eliminado correctamente','success':'ok',
				'data':''},status=status.HTTP_204_NO_CONTENT)
		except:
			return Response({'message':'Se presentaron errores al procesar la solicitud','success':'error',
			'data':''},status=status.HTTP_400_BAD_REQUEST)	


#Fin de api para contratistas


#Actualiza a inactivo el contratista
@transaction.atomic
def ContratistaInactivo(request):

	sid = transaction.savepoint()

	try:
		lista=request.POST['_content']
		respuesta= json.loads(lista)

		for item in respuesta['lista']:
			object_contratista=Contratista.objects.get(pk=int(item['id']))
			object_contratista.activo=False

			object_contratista.save()

			transaction.savepoint_commit(sid)

		return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
				'data':''})
		
	except Exception,e:
		print e
		transaction.savepoint_rollback(sid)
		return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
			'data':''})




#exportar los datos de los contratistas
def ExportarContratista(request):
	
	response = HttpResponse(content_type='application/vnd.ms-excel;charset=utf-8')
	response['Content-Disposition'] = 'attachment; filename="contratistas.xls"'
	
	workbook = xlsxwriter.Workbook(response, {'in_memory': True})
	worksheet = workbook.add_worksheet('Contratista')
	format1=workbook.add_format({'border':1,'font_size':15,'bold':True})
	format2=workbook.add_format({'border':1})

	row=1
	col=0
	qset='';

	qset = (Q(activo=True))
						
	contratista = Contratista.objects.filter(qset)

	worksheet.write('A1', 'Rnc', format1)
	worksheet.write('B1', 'Nombre', format1)

	for listado in contratista:
		worksheet.write(row, col,listado.rnc,format2)
		worksheet.write(row, col+1,listado.nombre,format2)

		row +=1

	workbook.close()

	return response
    #return response

@login_required
def ContratistaListado(request):
	
	return render_to_response('contratista/contratista.html',{'app':'contratista','model':'Contratista'},context_instance=RequestContext(request))		
