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
import json
from .models import AInspeccion,CCierreFallaInspeccion,BFallaInspeccion,FotoFallaInspeccion
from circuito.models import Circuito
from circuito.views import CircuitoSerializer
from lote.models import Lote
from lote.views import LoteSerializer
from poligono.models import Poligono
from lote.views import PoligonoSerializer
from sector.models import Sector
from sector.views import SectorSerializer
from apoyo.models import Apoyo
from apoyo.views import ApoyoSerializer
from usuario.models import Usuario
from usuario.views import UsuarioSerializer
from capitulo.models import Capitulo,CapituloFalla
from capitulo.views import CapituloFallaSerializer
from django.http import HttpResponse,JsonResponse
from django.db import transaction,connection
from django.db.models.deletion import ProtectedError
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, throttle_classes


#Api para las inspecciones
class InspeccionSerializer(serializers.HyperlinkedModelSerializer):

	circuito_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Circuito.objects.all())
	circuito=CircuitoSerializer(read_only=True)

	lote_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Lote.objects.all())
	lote=LoteSerializer(read_only=True)

	poligono_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Poligono.objects.all())
	poligono=PoligonoSerializer(read_only=True)

	sector_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Sector.objects.all())
	sector=SectorSerializer(read_only=True)

	apoyo_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Apoyo.objects.all())
	apoyo=ApoyoSerializer(read_only=True)

	usuario_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=Usuario.objects.all())
	usuario=UsuarioSerializer(read_only=True)

	class Meta:
		model = AInspeccion
		fields=('id','circuito','circuito_id','lote','lote_id','poligono','poligono_id','sector',
			'sector_id','apoyo','apoyo_id','usuario','usuario_id','fecha','activo','numero_inspeccion','ano_inspeccion','mes_inspeccion')


class InspeccionViewSet(viewsets.ModelViewSet):
	""" Retorna una lista de inspecciones. """
	model=AInspeccion
	queryset = model.objects.all()
	serializer_class = InspeccionSerializer

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','status':'success','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)


	def list(self, request, *args, **kwargs):
		try:

			queryset = super(InspeccionViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			circuito= self.request.query_params.get('id_circuito',None)
			lote= self.request.query_params.get('id_lote',None)
			poligono= self.request.query_params.get('id_poligono',None)
			sector= self.request.query_params.get('id_sector',None)
			apoyo= self.request.query_params.get('id_apoyo',None)
			activo= self.request.query_params.get('activo',None)
			id_inspeccion= self.request.query_params.get('id_inspeccion',None)
			sin_paginacion=self.request.query_params.get('sin_paginacion',None)
			qset=''

			if (dato or circuito or lote or poligono or sector or apoyo or activo):

				qset = Q(activo=activo)

				if dato:
					qset = qset &(
						Q(numero_inspeccion__icontains=dato) | Q(apoyo__nombre__icontains=dato)
					)



				if id_inspeccion:
					qset = qset &(
						Q(id=id_inspeccion)
					)


				if circuito:
					qset = qset &(
						Q(circuito__id=circuito)
					)


				if lote:
					qset = qset &(
						Q(lote__id=lote)
					)


				if poligono:
					qset = qset &(
						Q(poligono__id=poligono)
					)

				if sector:
					qset = qset &(
						Q(sector__id=sector)
					)


				if apoyo:
					qset = qset &(
						Q(apoyo__id=apoyo)
					)

			#print qset
			if qset != '':
				queryset = self.model.objects.filter(qset)

			if sin_paginacion is None:	
	
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					#print serializer
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})
				
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
						'data':serializer.data})
			
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})
											
		except Exception,e:
			#print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()

			try:
				serializer = InspeccionSerializer(data=request.DATA,context={'request': request})

				if serializer.is_valid():
					serializer.save(circuito_id=request.DATA['circuito_id'],lote_id=request.DATA['lote_id'],poligono_id=request.DATA['poligono_id'],sector_id=request.DATA['sector_id'],apoyo_id=request.DATA['apoyo_id'],usuario_id=request.DATA['usuario_id'])

					transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
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
				serializer = InspeccionSerializer(instance,data=request.DATA,context={'request': request},partial=partial)

				if serializer.is_valid():
					serializer.save(circuito_id=request.DATA['circuito_id'],lote_id=request.DATA['lote_id'],poligono_id=request.DATA['poligono_id'],sector_id=request.DATA['sector_id'],apoyo_id=request.DATA['apoyo_id'],usuario_id=request.DATA['usuario_id'])

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


#Fin api  para las inspecciones.



#Api para las fallas inspecciones
class FallaInspeccionSerializer(serializers.HyperlinkedModelSerializer):

	inspeccion_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=AInspeccion.objects.all())
	inspeccion=InspeccionSerializer(read_only=True)

	capitulo_falla_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=CapituloFalla.objects.all())
	capitulo_falla=CapituloFallaSerializer(read_only=True)

	class Meta:
		model = BFallaInspeccion
		fields=('id','inspeccion','inspeccion_id','capitulo_falla','capitulo_falla_id','observaciones','calificacion')


class FallaInspeccionViewSet(viewsets.ModelViewSet):
	""" Retorna una lista de las fallas inspecciones. """
	model=BFallaInspeccion
	queryset = model.objects.all()
	serializer_class = FallaInspeccionSerializer

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','status':'success','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)


	def list(self, request, *args, **kwargs):
		try:

			queryset = super(FallaInspeccionViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			inspeccion= self.request.query_params.get('id_inspeccion',None)
			capitulo_falla= self.request.query_params.get('id_capitulo_falla',None)
			sin_paginacion=self.request.query_params.get('sin_paginacion',None)
			qset=''

			if (dato or inspeccion or capitulo_falla):

				#qset = Q(capitulo=capitulo)

				if dato:
					qset = qset &(
						Q(observaciones__icontains=dato)
					)

				if inspeccion:
					qset = qset &(
						Q(inspeccion__id=inspeccion)
					)


				if capitulo_falla:
					qset = qset &(
						Q(capitulo_falla__id=capitulo_falla)
					)

			#print qset
			if qset != '':
				queryset = self.model.objects.filter(qset)

			if sin_paginacion is None:	
	
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					#print serializer
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})
				
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
						'data':serializer.data})
			
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})
											
		except Exception,e:
			#print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()

			try:
				serializer = FallaInspeccionSerializer(data=request.DATA,context={'request': request})

				if serializer.is_valid():
					serializer.save(inspeccion_id=request.DATA['inspeccion_id'],capitulo_falla_id=request.DATA['capitulo_falla_id'])

					transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
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
				serializer = FallaInspeccionSerializer(instance,data=request.DATA,context={'request': request},partial=partial)

				if serializer.is_valid():
					serializer.save(inspeccion_id=request.DATA['inspeccion_id'],capitulo_falla_id=request.DATA['capitulo_falla_id'])

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


#Fin api  para las fallas inspecciones.



#Api para los cierres fallas inspecciones
class CierreFallaInspeccionSerializer(serializers.HyperlinkedModelSerializer):

	falla_inspeccion_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=BFallaInspeccion.objects.all())
	falla_inspeccion=FallaInspeccionSerializer(read_only=True)

	class Meta:
		model = CCierreFallaInspeccion
		fields=('id','falla_inspeccion','falla_inspeccion_id','fecha','observaciones','soporte')


class CierreFallaInspeccionViewSet(viewsets.ModelViewSet):
	""" Retorna una lista de las fallas inspecciones. """
	model=CCierreFallaInspeccion
	queryset = model.objects.all()
	serializer_class = CierreFallaInspeccionSerializer

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','status':'success','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)


	def list(self, request, *args, **kwargs):
		try:

			queryset = super(CierreFallaInspeccionViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			falla_inspeccion= self.request.query_params.get('id_falla_inspeccion',None)
			sin_paginacion=self.request.query_params.get('sin_paginacion',None)
			qset=''

			if (dato or falla_inspeccion):

				#qset = Q(capitulo=capitulo)

				if dato:
					qset = qset &(
						Q(observaciones__icontains=dato)
					)

				if falla_inspeccion:
					qset = qset &(
						Q(falla_inspeccion__id=falla_inspeccion)
					)

			#print qset
			if qset != '':
				queryset = self.model.objects.filter(qset)

			if sin_paginacion is None:	
	
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					#print serializer
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})
				
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
						'data':serializer.data})
			
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})
											
		except Exception,e:
			#print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()

			try:
				serializer = CierreFallaInspeccionSerializer(data=request.DATA,context={'request': request})

				if serializer.is_valid():

					if self.request.FILES.get('soporte') is not None:

						serializer.save(soporte=self.request.FILES.get('soporte'),falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					else:
						serializer.save(soporte='',falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
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
				serializer = CierreFallaInspeccionSerializer(instance,data=request.DATA,context={'request': request},partial=partial)

				if serializer.is_valid():

					if self.request.FILES.get('soporte') is not None:

						serializer.save(soporte=self.request.FILES.get('soporte'),falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					else:
						serializer.save(soporte='',falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

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


#Fin api  para los cierres fallas inspecciones.


#Api para las fotos fallas inspecciones
class FotoFallaInspeccionSerializer(serializers.HyperlinkedModelSerializer):

	falla_inspeccion_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=CCierreFallaInspeccion.objects.all())
	falla_inspeccion=FallaInspeccionSerializer(read_only=True)

	class Meta:
		model = FotoFallaInspeccion
		fields=('id','falla_inspeccion','falla_inspeccion_id','soporte')


class FotoFallaInspeccionViewSet(viewsets.ModelViewSet):
	""" Retorna una lista de las fotos fallas inspecciones. """
	model=FotoFallaInspeccion
	queryset = model.objects.all()
	serializer_class = FotoFallaInspeccionSerializer

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','status':'success','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)


	def list(self, request, *args, **kwargs):
		try:

			queryset = super(FotoFallaInspeccionViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			falla_inspeccion= self.request.query_params.get('id_falla_inspeccion',None)
			sin_paginacion=self.request.query_params.get('sin_paginacion',None)
			qset=''

			if (dato or falla_inspeccion):

				#qset = Q(capitulo=capitulo)

				if dato:
					qset = qset &(
						Q(observaciones__icontains=dato)
					)

				if falla_inspeccion:
					qset = qset &(
						Q(falla_inspeccion__id=falla_inspeccion)
					)

			#print qset
			if qset != '':
				queryset = self.model.objects.filter(qset)

			if sin_paginacion is None:	
	
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					#print serializer
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})
				
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
						'data':serializer.data})
			
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})
											
		except Exception,e:
			#print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()

			try:
				serializer = CierreFallaInspeccionSerializer(data=request.DATA,context={'request': request})

				if serializer.is_valid():

					if self.request.FILES.get('soporte') is not None:

						serializer.save(soporte=self.request.FILES.get('soporte'),falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					else:
						serializer.save(soporte='',falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
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
				serializer = CierreFallaInspeccionSerializer(instance,data=request.DATA,context={'request': request},partial=partial)

				if serializer.is_valid():

					if self.request.FILES.get('soporte') is not None:

						serializer.save(soporte=self.request.FILES.get('soporte'),falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

						transaction.savepoint_commit(sid)

					else:
						serializer.save(soporte='',falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

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


#Fin api  para las fotos fallas inspecciones.


#guardar 
@api_view(['POST'])
@transaction.atomic
def GuardarInspeccion(request):

	sid = transaction.savepoint()
	if request.method == 'POST':
		try:
			
			data=json.loads(request.DATA['lista'])

			# print data['circuito_id']
			# print data['poligono_id']
			# print data['lote_id']
			# print data['fecha']
			# print data['apoyo_id']
			# print data['sector_id']
			# print data['numero_inspeccion']
			# print request.user.usuario.id

			inspeccion=AInspeccion(circuito_id=data['circuito_id'],lote_id=data['lote_id'],poligono_id=data['poligono_id'],
				apoyo_id=data['apoyo_id'],sector_id=data['sector_id'],numero_inspeccion=data['numero_inspeccion'],
				usuario_id=request.user.usuario.id,fecha=data['fecha'],activo=True)
			inspeccion.save()


			for item in data['capitulos']:

				for falla in item['fallas']:

					# print'--------------------'
					# print inspeccion.id
					# print falla['capitulo_falla_id']
					# print falla['observaciones']
					# print falla['calificacion']

					falla_inspeccion=BFallaInspeccion(inspeccion_id=inspeccion.id,capitulo_falla_id=falla['capitulo_falla_id'],
						observaciones=falla['observaciones'],calificacion=falla['calificacion'])
					falla_inspeccion.save()

					print '---------'
					print request.FILES['soporte_{}[]'.format(falla['capitulo_falla_id'])]
					for soporte in request.FILES.getlist('soporte_{}[]'.format(falla['capitulo_falla_id'])):
						print soporte
						foto=FotoFallaInspeccion(
								soporte=soporte, 
								falla_inspeccion_id=falla_inspeccion.id)
						foto.save()




			return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
					'data':''})
			
		except Exception,e:
			print e
			transaction.savepoint_rollback(sid)
			return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
				'data':''})





#Inspeccion inactiva
@transaction.atomic
def InspeccionInactiva(request):

	sid = transaction.savepoint()

	try:
		lista=request.POST['_content']
		respuesta= json.loads(lista)

		for item in respuesta['lista']:
			object_inspeccion=AInspeccion.objects.get(pk=int(item['id']))
			object_inspeccion.activo=False

			object_inspeccion.save()

			transaction.savepoint_commit(sid)

		return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
				'data':''})
		
	except Exception,e:
		print e
		transaction.savepoint_rollback(sid)
		return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
			'data':''})


@login_required
def Inspeccion(request,id_lote=None):

	qsCircuito=Circuito.objects.filter(activo=True)
	qsLote=Lote.objects.filter(activo=True)
	qsApoyo=Apoyo.objects.all()
	qsPoligono=Poligono.objects.filter(activo=True)
	qsSector=Sector.objects.filter(activo=True)
	
	return render_to_response('inspeccion/inspeccion.html',{'circuito':qsCircuito,'lote':qsLote,'apoyo':qsApoyo,'poligono':qsPoligono,'sector':qsSector,'app':'inspeccion','model':'AInspeccion','id_lote':id_lote},context_instance=RequestContext(request))


@login_required
def FallaInspeccion(request):
	
	return render_to_response('inspeccion/falla_inspeccion.html',{'app':'inspeccion','model':'BFallaInspeccion'},context_instance=RequestContext(request))


@login_required
def CierreFallaInspeccion(request):
	
	return render_to_response('inspeccion/cierre_falla_inspeccion.html',{'app':'inspeccion','model':'CCierreFallaInspeccion'},context_instance=RequestContext(request))


@login_required
def FotoFallaInspeccion2(request):
	
	return render_to_response('inspeccion/foto_falla_inspeccion.html',{'app':'inspeccion','model':'FotoFallaInspeccion'},context_instance=RequestContext(request))



#registrar el lote
@login_required
def RegistroInspeccion(request,id_lote=None):

	qsCircuito=Circuito.objects.filter(activo=True)
	qsPoligono=Poligono.objects.filter(activo=True)
	qsSector=Sector.objects.filter(activo=True)
	#qsApoyo=Apoyo.objects.all()

	listado_capitulo_falla=[]

	qsCapitulo=Capitulo.objects.all()
	# qsCapituloFalla=CapituloFalla.objects.all()


	# for item in list(qsCapitulo):

	# 	capitulo_falla = CapituloFalla.objects.filter(capitulo__id=item.id)

	# 	for item2 in list(capitulo_falla):

	# 		listado_capitulo_falla.append(
	# 			{
	# 				'id_capitulo':item2.capitulo.id,
	# 				'nombre_capitulo':item2.capitulo.nombre,
	# 				'id_capitulo_falla':item2.id,
	# 				'descripcion_capitulo_falla':item2.descripcion
	# 			}
	# 		)


	
	return render_to_response('inspeccion/registro_inspeccion.html',{'lista_d_capitulo':listado_capitulo_falla,'capitulo':qsCapitulo,'circuito':qsCircuito,'poligono':qsPoligono,'sector':qsSector,'app':'lote','model':'Lote','id_lote':id_lote},context_instance=RequestContext(request))


@login_required
def ActualizarInspeccion(request,id_inspeccion=None):

	qsCircuito=Circuito.objects.filter(activo=True)
	qsPoligono=Poligono.objects.filter(activo=True)
	qsSector=Sector.objects.filter(activo=True)

	listado_capitulo_falla=[]

	qsCapitulo=Capitulo.objects.all()
	
	return render_to_response('inspeccion/editar_inspeccion.html',{'lista_d_capitulo':listado_capitulo_falla,'capitulo':qsCapitulo,'circuito':qsCircuito,'poligono':qsPoligono,'sector':qsSector,'app':'lote','model':'Lote','id_inspeccion':id_inspeccion},context_instance=RequestContext(request))


@api_view(['GET'])
def ObtnerInspeccion(request):
	if request.method == 'GET':
		try:

			print request.GET['id_inspeccion']
			print '---'

			id_inspeccion= request.GET['id_inspeccion']

			inspeccion = AInspeccion.objects.get(id=id_inspeccion)
			# fallas = BFallaInspeccion.objects.filter(inspeccion__id=id_inspeccion)
			
			listCapitulos = []
			capitulos = Capitulo.objects.all()

			for cap in list(capitulos):
				
				listFallas=[]
				for fall in list(cap.fallas()):
					fallaInspeccion = BFallaInspeccion.objects.filter(capitulo_falla__id=fall.id, inspeccion__id=id_inspeccion).first()
					if fallaInspeccion:						
						listFallas.append({							
								'capitulo_falla_id':fall.id,
								'descripcion':fall.descripcion,
								'calificacion':str(fallaInspeccion.calificacion),
								'observaciones':fallaInspeccion.observaciones,
								# 'soportes':soportes,
								})
				
				listCapitulos.append({
					'id' : cap.id,
					'nombre' : cap.nombre,
					'fallas' : listFallas
				})	

			data = {
				'id':inspeccion.id,
				'circuito_id':inspeccion.circuito.id,
				'lote_id':inspeccion.lote.id,
				'poligono_id':inspeccion.poligono.id,
				'sector_id':inspeccion.sector_id,
				'apoyo_id':inspeccion.apoyo.id,
				'usuario_id':inspeccion.usuario.id,
				'fecha':inspeccion.fecha,
				'activo':inspeccion.activo,
				'numero_inspeccion':inspeccion.numero_inspeccion,
				'capitulos' : listCapitulos
			}	
				
			# for item in list(fallas):				
			# 	soportes = FotoFallaInspeccion.objects.filter(falla_inspeccion__id=item.id)
			# 	listSoportes = []
			# 	for sop in list(soportes):					
			# 		listSoportes.append({
			# 			'id': sop.id,
			# 			'falla_inspeccion_id': sop.falla_inspeccion.id,
			# 			'soporte': sop.soporte,
			# 			})

				

			# 	for cap in list(capitulos):
			# 		listFallas = []
			# 		fallas = CapituloFalla.objects.filter(capitulo__id=cap.id)

			# 		for f in list(fallas):
			# 			listFallas.append({
			# 			'id':item.id,
			# 			'inspeccion_id':item.inspeccion.id,
			# 			'capitulo_falla_id':item.capitulo_falla.id,
			# 			'observaciones':item.observaciones,
			# 			'calificacion':item.calificacion,
			# 			'soportes':listSoportes
			# 		})

			# 		listCapitulos.append({
			# 			'id' : cap.id,
			# 			'nombre' : cap.nombre,
			# 			'fallas' : listFallas
			# 		})	
					
				
			return JsonResponse({'message':'','success':'ok','data':data})			

		except Exception as e:
			print e
			raise e



#guardar 
@api_view(['POST'])
@transaction.atomic
def ActualizacionInspeccion(request):

	sid = transaction.savepoint()
	if request.method == 'POST':
		try:
			
			data=json.loads(request.DATA['lista'])

			#print data['id']
			# print data['circuito_id']
			# print data['poligono_id']
			# print data['lote_id']
			# print data['fecha']
			# print data['apoyo_id']
			# print data['sector_id']
			# print data['numero_inspeccion']
			# print request.user.usuario.id

			object_inspeccion=AInspeccion.objects.get(pk=data['id'])
			object_inspeccion.circuito_id=data['circuito_id']
			object_inspeccion.poligono_id=data['poligono_id']
			object_inspeccion.lote_id=data['lote_id']
			object_inspeccion.fecha=data['fecha']
			object_inspeccion.apoyo_id=data['apoyo_id']
			object_inspeccion.sector_id=data['sector_id']
			object_inspeccion.numero_inspeccion=data['numero_inspeccion']

			object_inspeccion.save()

			for item in data['capitulos']:

				for falla in item['fallas']:

					print'--------------------'
					#print inspeccion.id
					print falla['capitulo_falla_id']
					print falla['observaciones']
					print falla['calificacion']

					# falla_inspeccion=BFallaInspeccion(inspeccion_id=inspeccion.id,capitulo_falla_id=falla['capitulo_falla_id'],
					# 	observaciones=falla['observaciones'],calificacion=falla['calificacion'])
					# falla_inspeccion.save()



			return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
					'data':''})
			
		except Exception,e:
			print e
			transaction.savepoint_rollback(sid)
			return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
				'data':''})