
function InspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.listado_apoyo=ko.observableArray([]);
    self.listado_inspecciones=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
    self.tabIndex=ko.observable(0);
    self.tabIndex2=ko.observable(1);
    self.soporte=ko.observable('');
    self.nombreBoton=ko.observable('Siguiente');
    self.foto=ko.observable('');
    self.soportes_fotos=ko.observableArray([]);
    self.obj_falla={};
    self.valida_quitar_foto=ko.observable(0);

    self.valida_inspec=ko.observable(0);
  

     //Representa un modelo del inspeccion
    self.inspeccionVO={
        id:ko.observable(0),
        numero_inspeccion:ko.observable('').extend({ required: { message: '(*)Digite el numero de la inspeccion' } }),
        circuito_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el circuito' } }),
        lote_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el lote' } }),
        poligono_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el poligono' } }),
        sector_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el sector' } }),
        apoyo_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el apoyo' } }),
        usuario_id:ko.observable(0),
        fecha:ko.observable('').extend({ required: { message: '(*)Digite la fecha' } }),
        activo:ko.observable(0),
        capitulos: ko.observableArray([]) 

    };


     //Representa un modelo del apoyo
    self.apoyoVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        latitud:ko.observable(0),
        longitud:ko.observable(0),

        // latitud:ko.observable(0).extend({ required: { message: '(*)Digite la latitud' } }),
        // longitud:ko.observable(0).extend({ required: { message: '(*)Digite la longitud' } }),
    };

  
    //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.soportes_fotos(), function(d) {

            d.procesado(value);
        }); 
    });


    //funcion para abrir modal de registrar los apoyos
    self.abrir_modal_apoyo = function () {
        self.limpiar_apoyo();
        self.titulo('Nuevo apoyo');
        $('#modal_apoyo').modal('show');
    }


    //funcion para abrir modal para las fotos
    self.abrir_modal_foto = function (obj) {

        self.limpiar_foto();
        self.obj_falla=obj;
        self.soportes_fotos(self.obj_falla.soportes());
        self.titulo('Cargar fotos');
        $('#modal_abrir_foto').modal('show');
    }


     //limpiar el modelo de las inspecciones
     self.limpiar=function(){     
         
        self.inspeccionVO.id(0);
        self.inspeccionVO.numero_inspeccion('');
        self.inspeccionVO.circuito_id(0); 
        self.inspeccionVO.lote_id(0);
        self.inspeccionVO.poligono_id(0);
        self.inspeccionVO.sector_id(0);
        self.inspeccionVO.apoyo_id(0);
        self.inspeccionVO.usuario_id(0);
        self.inspeccionVO.fecha('');
        self.inspeccionVO.activo(0);

        self.inspeccionVO.circuito_id.isModified(false);
        self.inspeccionVO.lote_id.isModified(false);  
        self.inspeccionVO.poligono_id.isModified(false);
        self.inspeccionVO.sector_id.isModified(false);
        self.inspeccionVO.apoyo_id.isModified(false);  
        self.inspeccionVO.usuario_id.isModified(false);
        self.inspeccionVO.numero_inspeccion.isModified(false);    
     }


    self.limpiar_apoyo=function(){     
         
        self.apoyoVO.id(0);
        self.apoyoVO.nombre('');
        self.apoyoVO.latitud(0);
        self.apoyoVO.longitud(0);
 
     }

     self.limpiar_foto=function(){  
        $('#archivo').fileinput('reset');
        $('#archivo').val('');
     }  



    //consultar los apoyos
    self.consultar_apoyo=function(){

      path =path_principal+'/api/Apoyo?sin_paginacion';
      parameter={ };
      RequestGet(function (datos, estado, mensaje) {
           
        self.listado_apoyo(datos);

      }, path, parameter,undefined,false,false);

    }


      //funcion guardar el apoyo
     self.guardar_apoyo=function(){

        if (InspeccionViewModel.errores_apoyo().length == 0) {//se activa las validaciones

          var parametros={                     
            callback:function(datos, estado, mensaje){

              if (estado=='ok') {
                  self.limpiar_apoyo();
                  self.consultar_apoyo();
                  $('#modal_apoyo').modal('hide');
              }                        
                        
            },//funcion para recibir la respuesta 
            url:path_principal+'/api/Apoyo/',//url api
            parametros:self.apoyoVO                        
          };

          Request(parametros);

        } else {
             InspeccionViewModel.errores_apoyo.showAllMessages();//mostramos las validacion
        } 
     } 

     //Localiza la latitud y longitud de la ubicacion
    self.localizar_mapa=function(){
      if (navigator.geolocation) {
    
        navigator.geolocation.getCurrentPosition(function(position) {
          self.apoyoVO.latitud(position.coords.latitude);
          self.apoyoVO.longitud(position.coords.longitude);
        }); 
      }
    }



    //funcion consultar los capitulos
    self.consultar_capitulo = function (id_capitulo) {
        
      path = path_principal+'/api/Capitulo_falla?format=json';
      parameter = { id_capitulo:id_capitulo};
      RequestGet(function (datos, estado, mensage) {

        if (estado == 'ok' && datos.data!=null && datos.data.length > 0) {
            self.listado_inspecciones(agregarOpcionesObservable(datos.data));
            cerrarLoading();

        } else {
            self.listado_inspecciones([]);
            cerrarLoading();

        }

      }, path, parameter,undefined, false);
    }


    //Funcion que realiza los siguientes de las vistas parciales
    self.vistas_parciales = function () {      
           
      if(self.tabIndex()<parseInt($('#hdCantidad').val())){

          //valida la primera vista parcial
          if(self.tabIndex()==0){

              self.validacion_inspeccion(); 

              if (InspeccionViewModel.errores_inspeccion().length == 0) { 
                  
              } else {
                  InspeccionViewModel.errores_inspeccion.showAllMessages();
                  return false;
              }          

          }


        self.tabIndex(self.tabIndex()+1);
        self.tabIndex2(self.tabIndex2()+1);
        self.nombreBoton('Siguiente');

      }


      if (self.nombreBoton()=='Finalizar') {
        if (self.valida_inspec()>0){

            $.confirm({
                title:'Informativo',
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>El numero de la inspeccion ya se encuentra registrado en el mes de la fecha seleccionada.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });
            return false
        }

        self.guardar_inspeccion_todo(); // funcion para guardar la inspeccion
      }



      if(self.tabIndex()>=parseInt($('#hdCantidad').val())){

        self.nombreBoton('Finalizar');

      }

    }



    //Funcion para el atras de las vistas parciales
    self.atras_vistas_parciales = function () {      
      
        if (self.tabIndex()>0) {
          self.tabIndex(self.tabIndex()-1);
          self.tabIndex2(self.tabIndex2()-1);
        }
        self.nombreBoton('Siguiente');

    }


    //guardar los soportes en una lista temporal
    self.guardar_soporte_foto = function () {

      if(self.foto()==''){

        $.confirm({
          title:'Informativo',
          content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los soporte.<h4>',
          cancelButton: 'Cerrar',
          confirmButton: false
        });
        return false
      }


      //valida que solo puedo agregar 2 fotos
      if(self.obj_falla.soportes().length > 1){

        $.confirm({
          title:'Informativo',
          content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Solo puede cargar 2 fotos.<h4>',
          cancelButton: 'Cerrar',
          confirmButton: false
        });
        return false

      }else{


        // alert(self.obj_falla.soportes().length)

        self.obj_falla.soportes.push({
          foto:self.foto(),
          eliminado:ko.observable(false),
          procesado:ko.observable(false)
        });

       
        self.soportes_fotos(self.obj_falla.soportes());
        self.limpiar_foto();  

      }              

    }


    //quitar los soportes de la lista temporal
    self.desasociar_soporte_foto = function () { 

      ko.utils.arrayForEach(self.soportes_fotos(), function(d, i) {

        if(d!=undefined && d!=null && d.procesado()==true){
          //self.listado_sector_temporal.remove(d)
          d.eliminado(true);

        }         
          
      });

    } 


     //funcion guardar la inspeccion en general
     self.guardar_inspeccion_todo=function(){
        var data = new FormData();

            data.append('lista',ko.toJSON(self.inspeccionVO));

            ko.utils.arrayForEach(self.inspeccionVO.capitulos(), function(item){

              ko.utils.arrayForEach(item.fallas(), function(fall){

                ko.utils.arrayForEach(fall.soportes(), function(sop){

                  if (sop.eliminado()==false){

                    data.append('soporte_' + fall.capitulo_falla_id + '[]', sop.foto);
                  }

                });

              });

            });

            var parametros={                     
                callback:function(datos, estado, mensaje){

                  if (estado=='ok') {
                     $.confirm({
                        title:'Confirmación',
                        content: '<h4><i class="text-success fa fa-check-circle-o fa-2x"></i> ' + mensaje + '<h4>',
                        cancelButton: 'Cerrar',
                        confirmButton: false,
                        cancel:function(){
                            self.limpiar();
                            // self.tabIndex=ko.observable(0);
                            // self.tabIndex2=ko.observable(1);
                            location.reload(true);
                        }
                        
                    });
                  
                 }else{
                    mensajeError(mensaje);
                 }                     
                        
                },//funcion para recibir la respuesta 
                url:path_principal+'/inspeccion/guardar_inspeccion/',//url api
                parametros:data,
                alerta:false                       
            };
            RequestFormData2(parametros);
 
    }


        //funcion consultar los capitulos
    self.validacion_inspeccion = function () {
      
      path = path_principal+'/api/Inspeccion?sin_paginacion';
      parameter = { id_lote:self.inspeccionVO.lote_id(), fecha:self.inspeccionVO.fecha(), 
        activo:true, no_inspeccion:self.inspeccionVO.numero_inspeccion()};
      RequestGet(function (datos, estado, mensage) {

        if (datos!=''){
          self.valida_inspec(datos[0].id);

        }else{
           self.valida_inspec(0)

        }
        cerrarLoading();

      }, path, parameter,undefined, false);
    }


}

var inspeccion = new InspeccionViewModel();
InspeccionViewModel.errores_inspeccion= ko.validation.group(inspeccion.inspeccionVO);
InspeccionViewModel.errores_apoyo= ko.validation.group(inspeccion.apoyoVO);
ko.applyBindings(inspeccion);
