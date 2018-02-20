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
from lote.models import Lote,LoteCircuito,LoteSector,LotePoligono
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
from datetime import date


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
			'sector_id','apoyo','apoyo_id','usuario','usuario_id','fecha','activo','numero_inspeccion','ano_inspeccion','mes_inspeccion','contador_cierre')


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
			no_inspeccion= self.request.query_params.get('no_inspeccion',None)
			sin_paginacion=self.request.query_params.get('sin_paginacion',None)
			fecha= self.request.query_params.get('fecha',None)
			desde= self.request.query_params.get('desde',None)
			hasta= self.request.query_params.get('hasta',None)
			qset=''
			
			if fecha:
				f= fecha.split('-')

			# print lote
			# print f[0]
			# print f[1]


			if (dato or circuito or lote or poligono or sector or apoyo or activo or id_inspeccion or fecha or no_inspeccion or desde or hasta):

				qset = Q(activo=activo)

				if dato:
					qset = qset &(
						Q(numero_inspeccion__icontains=dato) | Q(apoyo__nombre__icontains=dato)
					)


				if id_inspeccion:
					qset = qset &(
						Q(id=id_inspeccion)
					)


				if no_inspeccion:
					qset = qset &(
						Q(numero_inspeccion=no_inspeccion)
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


				if fecha:
					qset =  qset &(Q(fecha__year=f[0]))


				if fecha:
					qset =  qset &(Q(fecha__month=f[1]))


				if (desde and (hasta is not None)):

					qset = qset & (Q(fecha__gte=desde))

				if(desde and hasta):
					qset = qset &(Q(fecha__gte=desde) and Q(fecha__lte=hasta))
					

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

	falla_inspeccion_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset=BFallaInspeccion.objects.all())
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

				qset = Q(falla_inspeccion__id=falla_inspeccion)

				if dato:
					qset = qset &(
						Q(observaciones__icontains=dato)
					)

				# if falla_inspeccion:
				# 	qset = qset &(
				# 		Q(falla_inspeccion__id=falla_inspeccion)
				# 	)

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
				serializer = FotoFallaInspeccionSerializer(data=request.DATA,context={'request': request})

				if serializer.is_valid():

					serializer.save(soporte=self.request.FILES.get('soporte'),falla_inspeccion_id=request.DATA['falla_inspeccion_id'])

					transaction.savepoint_commit(sid)

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
						'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
					return Response({'message':'datos requeridos no fueron recibidos','success':'fail',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

			except Exception,e:
				print e
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


#guardar las inspecciones
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

					#if falla['observaciones'] and falla['calificacion']:

					if falla['calificacion']:

						calificacion=falla['calificacion']

					else:

						calificacion=None

					falla_inspeccion=BFallaInspeccion(inspeccion_id=inspeccion.id,capitulo_falla_id=falla['capitulo_falla_id'],
							observaciones=falla['observaciones'],calificacion=calificacion)
					falla_inspeccion.save()

					# print '---------'
					# print request.FILES['soporte_{}[]'.format(falla['capitulo_falla_id'])]
					for soporte in request.FILES.getlist('soporte_{}[]'.format(falla['capitulo_falla_id'])):

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




#Traer las inspecciones
@api_view(['GET'])
def ObtnerInspeccion(request):
	if request.method == 'GET':
		try:

			# print request.GET['id_inspeccion']
			# print '---'

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
								'orden':fall.orden,
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
								
			return JsonResponse({'message':'','success':'ok','data':data})			

		except Exception as e:
			return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error','data':''})



#actualizar las inspecciones 
@api_view(['POST'])
@transaction.atomic
def ActualizacionInspeccion(request):

	sid = transaction.savepoint()
	if request.method == 'POST':
		try:
			
			data=json.loads(request.DATA['lista'])

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

					if falla['calificacion'] =='None':
		
						calificacion=None

					else:

						calificacion=falla['calificacion']


					object_falla_inspeccion=BFallaInspeccion.objects.get(inspeccion__id=data['id'],capitulo_falla__id=falla['capitulo_falla_id'])
					object_falla_inspeccion.observaciones=falla['observaciones']
					object_falla_inspeccion.calificacion=calificacion

					object_falla_inspeccion.save()

			return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
					'data':''})
			
		except Exception,e:
			print e
			transaction.savepoint_rollback(sid)
			return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
				'data':''})




#consultar los soportes para editar
@api_view(['GET'])
def consulta_listado_soporte_editar(request):

	if request.method == 'GET':

		try:
			qset=''
			capitulo_falla_id= request.GET['capitulo_falla_id']
			inspeccion_id= request.GET['inspeccion_id']

			qset = Q(inspeccion__id=inspeccion_id)

			if capitulo_falla_id:
					qset =  qset &(Q(capitulo_falla__id=capitulo_falla_id))

			falla = BFallaInspeccion.objects.filter(qset).first()

			#print falla.id

			# lista= FotoFallaInspeccion.objects.filter(falla_inspeccion__id=falla.id)

			# lista_soporte=[]

			# for item in list(lista):

			# 	lista_soporte.append(

			# 		{		
			# 			'id':item.id,
			# 			'soporte':item.soporte
			# 		}

			# 	)

			return JsonResponse({'message':'','success':'ok','data':falla.id})

		except Exception,e:
			print e
			return JsonResponse({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)		

	    #return response


#eliminar las categorias
@transaction.atomic
def eliminar_varios_soportes(request):
	sid = transaction.savepoint()
	try:
		lista=request.POST['_content']
		respuesta= json.loads(lista)
		
		for item in respuesta['lista']:
			FotoFallaInspeccion.objects.filter(id=item['id']).delete()


		transaction.savepoint_commit(sid)
		return JsonResponse({'message':'El registro se ha eliminado correctamente','success':'ok',
				'data':''})

	except ProtectedError:
		return JsonResponse({'message':'No es posible eliminar el registro, se esta utilizando en otra seccion del sistema','success':'error','data':''})
		
	except Exception,e:
		#print e
		transaction.savepoint_rollback(sid)
		return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
			'data':''})



# Guarda los soportes
@transaction.atomic
def Actualizar_detalle_giro_segun_consecutivo(request):

	sid = transaction.savepoint()

	try:

		soporte= request.FILES['archivo']

		lista=request.POST['lista']
		listado=lista.split(',')

		for item in listado:

			#print item
			
			object_detalle=DetalleGiro.objects.get(pk=item)

			object_detalle.estado_id=enumEstados.autorizado
			object_detalle.soporte_consecutivo_desabilitado=soporte
			object_detalle.save()

			logs_model=Logs(usuario_id=request.user.usuario.id,accion=Acciones.accion_actualizar,nombre_modelo='giros.detalle_giros',id_manipulado=item)
			logs_model.save()

			transaction.savepoint_commit(sid)

		return JsonResponse({'message':'Los registros se han actualizado correctamente','success':'ok',
							'data':''})
				
	except Exception,e:
		#print e
		return JsonResponse({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)




#Traer la lista de capitulo y capitulo fallas para la vista cierre inspeccion
@api_view(['GET'])
def CierreFallaInspecciones(request):
	if request.method == 'GET':
		try:

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

						cierrefallaInspeccion = CCierreFallaInspeccion.objects.filter(falla_inspeccion__id=fallaInspeccion.id).first()
						
						if cierrefallaInspeccion is None:
							#print cierrefallaInspeccion.id

							listFallas.append({							
								'capitulo_falla_id':fall.id,
								'descripcion':fall.descripcion,
								'orden':fall.orden,
								'falla_inspeccion_id':fallaInspeccion.id,
								'fecha':'',
								'observaciones':'',
								'soporte':'',
								# 'soportes':soportes,
							})
				
				listCapitulos.append({
					'id' : cap.id,
					'nombre' : cap.nombre,
					'fallas' : listFallas
				})	

			data = {

				'capitulos' : listCapitulos
			}	
								
			return Response({'message':'','success':'ok','data':data})


		except Exception as e:
			print e
			return Response({'message':'Se presentaron errores al procesar la solicitud','success':'error','data':''},status=status.HTTP_404_NOT_FOUND)





#guardar el cierre de las inspecciones
@api_view(['POST'])
@transaction.atomic
def GuardarCierreInspeccion(request):

	sid = transaction.savepoint()
	if request.method == 'POST':
		try:
			
			data=json.loads(request.DATA['lista'])

			for item in data['capitulos']:

				for falla in item['fallas']:

					soporte_cierre= request.FILES['soporte_']

					#print soporte_cierre
					# print'--------------------'
					# print falla['falla_inspeccion_id']
					# print falla['fecha']
					# print falla['observaciones']

					if falla['fecha'] and falla['observaciones'] and soporte_cierre:

						
						cierreFalla=CCierreFallaInspeccion(falla_inspeccion_id=falla['falla_inspeccion_id'],fecha=falla['fecha'],observaciones=falla['observaciones'],soporte=soporte_cierre)
						cierreFalla.save()

			return JsonResponse({'message':'El registro se ha guardado correctamente','success':'ok',
					'data':''})
			
		except Exception,e:
			print e
			transaction.savepoint_rollback(sid)
			return JsonResponse({'message':'Se presentaron errores al procesar la solicitud','success':'error',
				'data':''})




@login_required
def Inspeccion(request,id_lote=None):

	qsCircuito=LoteCircuito.objects.filter(lote__id=id_lote)
	#qsLote=Lote.objects.filter(activo=True)
	qsApoyo=AInspeccion.objects.filter(lote__id=id_lote)
	qsPoligono=LotePoligono.objects.filter(lote__id=id_lote)
	qsSector=LoteSector.objects.filter(lote__id=id_lote)

	qsLoteEncabezado=Lote.objects.filter(id=id_lote).first()
	
	return render_to_response('inspeccion/inspeccion.html',{'encabezado':qsLoteEncabezado,'circuito':qsCircuito,'apoyo':qsApoyo,'poligono':qsPoligono,'sector':qsSector,'app':'inspeccion','model':'AInspeccion','id_lote':id_lote},context_instance=RequestContext(request))



@login_required
def FallaInspeccion(request):
	
	return render_to_response('inspeccion/falla_inspeccion.html',{'app':'inspeccion','model':'BFallaInspeccion'},context_instance=RequestContext(request))



#registrar el la inspeccion
@login_required
def RegistroInspeccion(request,id_lote=None):

	qsCircuitos=LoteCircuito.objects.filter(lote__id=id_lote)
	qsPoligono=LotePoligono.objects.filter(lote__id=id_lote)
	qsSector=LoteSector.objects.filter(lote__id=id_lote)
	#qsApoyo=Apoyo.objects.all()

	listado_capitulo_falla=[]

	qsCapitulo=Capitulo.objects.all()
	qsLoteEncabezado=Lote.objects.filter(id=id_lote).first()
	
	return render_to_response('inspeccion/registro_inspeccion.html',{'lote':qsLoteEncabezado,'lista_d_capitulo':listado_capitulo_falla,'capitulo':qsCapitulo,'circuitos':qsCircuitos,'poligono':qsPoligono,'sector':qsSector,'app':'lote','model':'Lote','id_lote':id_lote},context_instance=RequestContext(request))


#actualizar la inspeccion
@login_required
def ActualizarInspeccion(request,id_inspeccion=None, id_lote=None):

	qsCircuitos=LoteCircuito.objects.filter(lote__id=id_lote)
	qsPoligono=LotePoligono.objects.filter(lote__id=id_lote)
	qsSector=LoteSector.objects.filter(lote__id=id_lote)

	listado_capitulo_falla=[]

	qsCapitulo=Capitulo.objects.all()
	qsLoteEncabezado=Lote.objects.filter(id=id_lote).first()
	
	return render_to_response('inspeccion/editar_inspeccion.html',{'lote':qsLoteEncabezado,'lista_d_capitulo':listado_capitulo_falla,'capitulo':qsCapitulo,'circuitos':qsCircuitos,'poligono':qsPoligono,'sector':qsSector,'app':'lote','model':'Lote','id_inspeccion':id_inspeccion,'id_lote':id_lote},context_instance=RequestContext(request))



#Cerrar la pnc
@login_required
def CerrarPnc(request,id_inspeccion=None, id_lote=None):

	qsCircuito=Circuito.objects.filter(activo=True)
	qsPoligono=Poligono.objects.filter(activo=True)
	qsSector=Sector.objects.filter(activo=True)

	listado_capitulo_falla=[]

	qsCapitulo=Capitulo.objects.all()
	qsLoteEncabezado=Lote.objects.filter(id=id_lote).first()
	
	return render_to_response('inspeccion/cerrar_pnc.html',{'lote':qsLoteEncabezado,'lista_d_capitulo':listado_capitulo_falla,'capitulo':qsCapitulo,'circuito':qsCircuito,'poligono':qsPoligono,'sector':qsSector,'app':'lote','model':'Lote','id_inspeccion':id_inspeccion,'id_lote':id_lote},context_instance=RequestContext(request))


