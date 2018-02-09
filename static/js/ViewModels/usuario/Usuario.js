function UsuarioViewModel() {

    var self=this;
    self.url=path_principal+'/api/Usuario/'; 
    self.oldpassword=ko.observable('');
    self.newpassword=ko.observable('');
    self.newpasswordconfirmation=ko.observable('');

    self.usuarioVO={
        id:ko.observable(''),
        user_id:ko.observable(''),
        persona_id:ko.observable(''),

        persona:{
            id:ko.observable(0),            
            identificacion:ko.observable('').extend({ required: { message: '(*)Ingrese la identificacion de la persona' } }),
            nombres:ko.observable('').extend({ required: { message: '(*)Ingrese el nombre de la persona' } }),
            apellidos:ko.observable('').extend({ required: { message: '(*)Ingrese el apellidos de la persona' } }),
            telefono:ko.observable(''),//.extend({ required: { message: '(*)Ingrese la dirección de la persona' } }),
            correo:ko.observable('').extend({required: { message: '(*)Ingrese el correo de la persona' }}).extend({ email: { message: '(*)Ingrese un correo valido' } })
        },

    };

    self.consultar_por_id=function(id){

        path =self.url+id+'/?format=json';
        RequestGet(function (datos, estado, mensage) {
                       
                self.usuarioVO.id(datos.id);
                self.usuarioVO.user_id(datos.user.id);
                self.usuarioVO.persona_id(datos.persona.id);                
                self.usuarioVO.persona.id(datos.persona.id);
                self.usuarioVO.persona.identificacion(datos.persona.identificacion);
                self.usuarioVO.persona.nombres(datos.persona.nombres);
                self.usuarioVO.persona.apellidos(datos.persona.apellidos);
                self.usuarioVO.persona.telefono(datos.persona.telefono);
                self.usuarioVO.persona.correo(datos.persona.correo);    
           
        }, path, {}, function(){
                    cerrarLoading();
                   });

    }

    self.guardar=function(){
        if (UsuarioViewModel.errores().length==0) {

            var formData= new FormData();

            formData.append('id',self.usuarioVO.id());
            formData.append('user_id',self.usuarioVO.user_id());
            formData.append('persona_id',self.usuarioVO.persona_id());

            formData.append('persona.id',self.usuarioVO.persona.id());
            formData.append('persona.identificacion',self.usuarioVO.persona.identificacion());
            formData.append('persona.nombres',self.usuarioVO.persona.nombres());
            formData.append('persona.apellidos',self.usuarioVO.persona.apellidos());
            formData.append('persona.telefono',self.usuarioVO.persona.telefono());
            formData.append('persona.correo',self.usuarioVO.persona.correo());

            var parametros={   
                  metodo:'PUT',                
                  callback:function(datos, estado, mensaje){
                     if (estado=='ok') {
                        self.consultar_por_id(self.usuarioVO.id());
                     }
                  },//funcion para recibir la respuesta 
                  url:self.url+ self.usuarioVO.id() + '/',
                  parametros:formData,
                   completado:function(){
                    cerrarLoading();
                   }
            };
                   
            RequestFormData2(parametros);
        }else {
            UsuarioViewModel.errores.showAllMessages();//mostramos las validacion
        }
    }

    self.cambiarContraseña=function(){
        if (UsuarioViewModel.errores().length==0) {

            if (self.newpasswordconfirmation()!=self.newpassword()) {
                $.confirm({
                    title:'Informativo',
                    content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Las contraseñas no coinciden.<h4>',
                    cancelButton: 'Cerrar',
                    confirmButton: false
                });

            }else {

                
                var parametros={   
                      metodo:'POST',     
                      alerta:false,           
                      callback:function(datos, estado, mensaje){
                         if (estado=='ok') {
                            // self.consultar_por_id(self.usuarioVO.id());
                            $.confirm({
                                title: 'Confirmación',
                                content: '<h4><i class="text-success fa fa-check-circle-o fa-2x"></i> ' + mensaje + '<h4>',
                                cancelButton: 'Cerrar',
                                confirmButton: false,
                                cancel: function() {
                                    window.location.href='/usuario/login/';
                                }
                            });
                         }else{
                            mensajeError(mensaje)
                         }
                      },//funcion para recibir la respuesta 
                      // url:self.url+ self.usuarioVO.id() + '/',
                      url:'/usuario/cambiar_clave/',
                      parametros:{'password':self.oldpassword(), 'passwordnew':self.newpassword()},
                       completado:function(){
                        cerrarLoading();
                       }
                };
                       
                Request(parametros);

            }

        }else {
            UsuarioViewModel.errores.showAllMessages();//mostramos las validacion
        }
    }    

 }   


var usuario = new UsuarioViewModel();
UsuarioViewModel.errores = ko.validation.group(usuario.usuarioVO);
ko.applyBindings(usuario);