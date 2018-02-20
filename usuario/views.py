# -*- coding: utf-8 -*-
from django.shortcuts import render,redirect,render_to_response
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User, Permission, Group
from .models import Usuario, Persona
from rest_framework import viewsets, serializers
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password,make_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.http import HttpResponse,JsonResponse
import json
from django.template import RequestContext
from rest_framework.decorators import api_view, throttle_classes
from django.db import transaction,connection



# Create your views here. comentario
class PersonaSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model= Persona
		fields = ('id','identificacion','nombres','apellidos','correo','telefono')

class UserSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = User
		fields = ('id','username',)

class UsuarioSerializer(serializers.HyperlinkedModelSerializer):    
    user=UserSerializer(read_only=True)
    user_id=serializers.PrimaryKeyRelatedField(write_only=True,queryset = User.objects.all())
    persona = PersonaSerializer(read_only=True)
    persona_id = serializers.PrimaryKeyRelatedField(write_only=True,queryset = Persona.objects.all())

    class Meta:
        model = Usuario
        fields=('id','user_id','user','persona_id','persona')   

class PersonaViewSet(viewsets.ModelViewSet):
	model=Persona
	queryset=model.objects.all()
	serializer_class=PersonaSerializer
	paginate_by = 10

	def create(self,request,*args, **kwargs):
		if request.method == 'POST':
			try:
				persona = Persona.objects.filter(identificacion=request.DATA['identificacion'])

				if persona:
					return Response({'message':'Ya existe una persona registrada con la identificacion ingresada','success':'fail',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

				persona = Persona.objects.filter(correo=request.DATA['correo'])
				if persona:
					return Response({'message':'Ya existe una persona registrada con el correo ingresado','success':'fail',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

				serializer = PersonaSerializer(data=request.DATA,context={'request': request})
				if serializer.is_valid():
					serializer.save()
					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok',
					'data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					return Response({'message':'datos requeridos no fueron recibidos','success':'fail',
					'data':''},status=status.HTTP_400_BAD_REQUEST)

			except:
				return Response({'message':'Se presentaron errores al procesar los datos','success':'error',
				'data':''},status=status.HTTP_400_BAD_REQUEST)

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','success':'ok','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)

	def list(self, request, *args, **kwargs):
		try:
			queryset = super(PersonaViewSet, self).get_queryset()			
			paginacion = self.request.query_params.get('sin_paginacion', None)
			dato = self.request.query_params.get('dato', None)
			qset=''
			if dato:
				qset = (Q(nombres__icontains=dato)|
						Q(apellidos__icontains=dato)|
						Q(identificacion__icontains=dato)
						)
				queryset = self.model.objects.filter(qset)

			if paginacion is None:
				page = self.paginate_queryset(queryset)
				if page is not None:
					serializer = self.get_serializer(page,many=True)	
					return self.get_paginated_response({'message':'','success':'ok',
					'data':serializer.data})

				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})
			else:
				serializer = self.get_serializer(queryset,many=True)
				return Response({'message':'','success':'ok',
					'data':serializer.data})	
		except Exception, e:
			print e
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# api usuario
	
class UsuarioViewSet(viewsets.ModelViewSet):
	model=Usuario
	queryset = model.objects.all()
	serializer_class = UsuarioSerializer
	paginate_by = 10

	def retrieve(self,request,*args, **kwargs):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			return Response({'message':'','success':'ok','data':serializer.data})
		except:
			return Response({'message':'No se encontraron datos','success':'fail','data':''},status=status.HTTP_404_NOT_FOUND)
			
	def list(self, request, *args, **kwargs):
		try:
			queryset = super(UsuarioViewSet, self).get_queryset()
			dato = self.request.query_params.get('dato', None)
			paginacion = self.request.query_params.get('sin_paginacion', None)

			if dato or empresa_id:
				if dato:
					qset=(Q(user__username__icontains=dato) |
						Q(iniciales__icontains=dato) |
						Q(persona__nombres__icontains=dato) |
						Q(persona__apellidos__icontains=dato) |
						Q(persona__identificacion__icontains=dato))	

				queryset = self.model.objects.filter(qset)
						
			if paginacion is None:				
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
			
		except:
			return Response({'message':'Se presentaron errores de comunicacion con el servidor','status':'error','data':''},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	@transaction.atomic
	def create(self, request, *args, **kwargs):
		if request.method == 'POST':
			sid = transaction.savepoint()
			try:
				serializer = UsuarioSerializer(data=request.DATA,context={'request': request})
				
				if serializer.is_valid():
					
					serializer.save(
						user_id=request.DATA['user_id'],
						persona_id=request.DATA['persona_id'])

					return Response({'message':'El registro ha sido guardado exitosamente','success':'ok','data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					return Response({'message':'datos requeridos no fueron recibidos','success':'fail','data':''},status=status.HTTP_400_BAD_REQUEST)
			except:
				transaction.savepoint_rollback(sid)
				return Response({'message':'Se presentaron errores al procesar los datos','success':'error','data':''},status=status.HTTP_400_BAD_REQUEST)
				
	@transaction.atomic			
	def update(self,request,*args,**kwargs):
		if request.method == 'PUT':
			sid = transaction.savepoint()
			try:
				partial = kwargs.pop('partial', False)
				instance = self.get_object()
				serializer = UsuarioSerializer(instance,data=request.DATA,context={'request': request},partial=partial)
				
				if serializer.is_valid():
					
					instance.persona_id=request.DATA['persona_id']
					instance.save()	
					
					persona=Persona.objects.get(pk=request.DATA['persona_id'])
					persona.identificacion=request.DATA['persona.identificacion']
					persona.nombres=request.DATA['persona.nombres']
					persona.apellidos=request.DATA['persona.apellidos']
					persona.correo=request.DATA['persona.correo']
					persona.telefono=request.DATA['persona.telefono']
					persona.save()

					return Response({'message':'El registro ha sido actualizado exitosamente','success':'ok','data':serializer.data},status=status.HTTP_201_CREATED)
				else:
					print serializer.errors
					return Response({'message':'datos requeridos no fueron recibidos','success':'fail','data':''},status=status.HTTP_400_BAD_REQUEST)
			except Exception as e:
				print e
				transaction.savepoint_rollback(sid)
				return Response({'message':'Se presentaron errores al procesar los datos','success':'error','data':''},status=status.HTTP_400_BAD_REQUEST)
				
	@transaction.atomic				
	def destroy(self,request,*args,**kwargs):
		sid = transaction.savepoint()
		try:
			instance = self.get_object()
			return Response({'message':'El registro se ha eliminado correctamente','success':'ok','data':''},status=status.HTTP_204_NO_CONTENT)
		except:
			return Response({'message':'Se presentaron errores al procesar la solicitud','success':'error','data':''},status=status.HTTP_400_BAD_REQUEST)
 

def login_view(request):
    # Si el usuario esta ya logueado, lo redireccionamos a index_view

    if request.user.is_authenticated():
    	return redirect(reverse('usuario.index'))

    mensaje = ''
    if request.method == 'POST':
        username = request.POST.get('usuario')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
            	usuario = Usuario.objects.filter(user=user)
            	if usuario:
                	login(request, user)
                	return redirect(reverse('usuario.index'))
                else:
                	mensaje = 'El nombre de usuario ingresado no se encuentra el sistema'	
            else:
                mensaje = 'Cuenta inactiva'
        else:
            mensaje = 'Nombre de usuario o clave no valido'
    return render(request, 'usuario/login.html', {'mensaje': mensaje})


#Recordar pass
def sendMail(request):
	mensaje=''
	status=''
	res=''
	if request.method=='POST':
		username = request.POST.get('usuario')		
		try:
			usuario= Usuario.objects.get(user__username=username)
			persona = Persona.objects.get(id=usuario.persona.id)
			#inicio del codigo del envio de correo
			contenido='<h3>SCP</h3>'
			contenido = contenido + 'Para reinicio de su clave de acceso a SCP haga click en '
			contenido = contenido + 'el siguiente enlace: <br/><br/>'
			contenido = contenido + '<a href="http://'+settings.SERVER+':'+settings.PORT_SERVER+'/usuario/finishResetPass/'+str(usuario.user.id)+'/">'
			contenido = contenido + '<b>Reiniciar Clave</b></a><br/><br/>'
			contenido = contenido + 'No responder este mensaje, este correo es de uso informativo exclusivamente,<br/><br/>'
			contenido = contenido + 'Soporte SCP<br/>soporte@sinin.co'
			mail = Mensaje(
				remitente=settings.REMITENTE,
				destinatario=persona.correo,
				asunto='Reinicio de clave de acceso a SCP',
				contenido=contenido,
				appLabel='Usuario',
				)			
			mail.save()
			res=sendAsyncMail.delay(mail)
			mensaje='Se ha enviado un correo a ' + persona.correo + ' para iniciar el proceso de recuperacion de clave de acceso al sistema.'
			status='ok'			
			# if mail.simpleSend()==1:
			# 	mensaje='Se ha enviado un correo a ' + persona.correo + ' para iniciar el proceso de recuperacion de clave de acceso al sistema.'
			# 	status='ok'
			# else:
			# 	mensaje = 'Error al enviar el correo'
			# 	status='error'
			#fin del envio de correo

		except Usuario.DoesNotExist:
			mensaje='El usuario ' + str(username) + ' No se encuentra registrado en el sistema'
			status='error'
			return Response({'message':mensaje,'success':status,'data':''},status=status.HTTP_400_BAD_REQUEST)

			
	return render(request,'usuario/resetPass.html',{'mensaje': mensaje, 'status':status})

@login_required
def index_view(request):
	
	return render_to_response('usuario/index.html',{},context_instance=RequestContext(request))      
    
def logout_view(request):
	logout(request)
	return redirect(reverse('usuario.login'))


@login_required
def cambiar_usuario(request):	
	return render(request,'usuario/passChange.html')


def recordar_pass(request):
	return render(request,'usuario/resetPass.html') 	      


@api_view(['POST'])
def passwordChange(request):
	try:  	  
		if request.method == 'POST':		
			#return Response({'message':request.DATA['usuario']})
			mensaje=''
			password = request.DATA['password']
			passwordnew = request.DATA['passwordnew']
			usuario = User.objects.get(pk=request.user.id)
			if check_password(password,usuario.password)==True:
				if password==passwordnew:
					return Response({'message':'La contraseña actual no puede ser la misma que la contraseña nueva.','success':'error','data':None})	
				else:
					usuario.password=make_password(passwordnew, salt=None, hasher='default')
					usuario.save()
					return Response({'message':'Su nueva clave de acceso al sistema ha sido establecida correctamente. Vuelva a ingresar al sistema.','success':'ok','data':None})		
			else:					
				return Response({'message':'Contraseña incorrecta.','success':'error','data':None})		


	except Exception as e:
		print e
		return Response({'message':'Se presentaron errores al procesar la solicitud','success':'error','data':None})


