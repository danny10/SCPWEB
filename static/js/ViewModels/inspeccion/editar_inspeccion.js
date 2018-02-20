
function InspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.listado_apoyo=ko.observableArray([]);
    self.listado_inspecciones=ko.observableArray([]);
    self.listado_soportes_editar=ko.observableArray([]);
    self.mensaje_soporte_editar=ko.observable('');
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
    self.apoyo_id=ko.observable('');
    self.inspeccion_id_soporte=ko.observable('');
    self.falla_soporte_editar=ko.observable('');

    self.listado_inspecciones_editar=ko.observableArray([]);
  

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


         //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_soportes_editar(), function(d) {

            d.eliminado(value);
        }); 
    });



     //Representa un modelo del apoyo
    self.apoyoVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        latitud:ko.observable(0),
        longitud:ko.observable(0),
        // latitud:ko.observable('').extend({ required: { message: '(*)Digite la latitud' } }),
        // longitud:ko.observable('').extend({ required: { message: '(*)Digite la longitud' } }),
    };


    //funcion para abrir modal de registrar apoyo
    self.abrir_modal_apoyo = function () {
        self.limpiar_apoyo();
        self.titulo('Nuevo apoyo');
        $('#modal_apoyo').modal('show');
    }


    //funcion para abrir modal para las fotos
    self.abrir_modal_foto = function (obj) {

        self.limpiar_archivo();
        self.consultar_id_falla_inspeccion(obj.capitulo_falla_id(),self.inspeccion_id_soporte());
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
     }

    //limpiar los apoyos
    self.limpiar_apoyo=function(){     
         
        self.apoyoVO.id(0);
        self.apoyoVO.nombre('');
        self.apoyoVO.latitud(0);
        self.apoyoVO.longitud(0);
 
     }

     //limpiar los archivos
    self.limpiar_archivo=function(){     
         
      $('#archivo').fileinput('reset');
      $('#archivo').val('');    
 
     }


       //consultar los apoyo
    self.consultar_apoyo=function(){

       path =path_principal+'/api/Apoyo?sin_paginacion';
       parameter={ };
       RequestGet(function (datos, estado, mensaje) {
         
          self.listado_apoyo(datos);

       }, path, parameter,function(){
           self.inspeccionVO.apoyo_id(self.apoyo_id());
       },false,false);

    }



      //funcion guardar y apoyo
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


     //localiza la latitud y logintud del a ubicacion actual
    self.localizar_mapa=function(){
      if (navigator.geolocation) {
  
        navigator.geolocation.getCurrentPosition(function(position) {
          self.apoyoVO.latitud(position.coords.latitude);
          self.apoyoVO.longitud(position.coords.longitude);
        }); 
      }
    }



    //funcion consultar las capitulos 
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


    //funcion para el siguiente de las vistas parciales
    self.vistas_parciales = function () {      
           
      if(self.tabIndex()<parseInt($('#hdCantidad').val())){

                  //valida la primera vista parcial
          if(self.tabIndex()==0){

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

        self.guardar_inspeccion_todo();
      }

      if(self.tabIndex()>=parseInt($('#hdCantidad').val())){

        self.nombreBoton('Finalizar');

      }

    }

    //funcion para el atras de las vistas parciales
    self.atras_vistas_parciales = function () {      
      
      if (self.tabIndex()>0) {
        self.tabIndex(self.tabIndex()-1);
        self.tabIndex2(self.tabIndex2()-1);
      }
      self.nombreBoton('Siguiente');

    }


     //funcion guardar toda la inspeccion
     self.guardar_inspeccion_todo=function(){
      var data = new FormData();

        data.append('lista',ko.toJSON(self.inspeccionVO));

        var parametros={                     
            callback:function(datos, estado, mensaje){

                // if (estado=='ok') {
                //     self.limpiar_soporte();
                //     self.consultar_soporte(94);
                // }                        
                    
            },//funcion para recibir la respuesta 
            url:path_principal+'/inspeccion/actualizacion_inspeccion/',//url api
            parametros:data                        
        };
        RequestFormData2(parametros);
 
    }


        //funcion consultar las inspecciones
    self.consultar_capitulo_falla = function (id_inspeccion) {
        
      path = path_principal+'/inspeccion/obtener_inspeccion?format=json';
      parameter = { id_inspeccion:id_inspeccion};
      RequestGet(function (datos, estado, mensage) {

          if (estado == 'ok') {        

            self.inspeccionVO.id(datos.id);
            self.inspeccionVO.numero_inspeccion(datos.numero_inspeccion);
            self.inspeccionVO.circuito_id(datos.circuito_id);
            self.inspeccionVO.lote_id(datos.lote_id);
            self.inspeccionVO.poligono_id(datos.poligono_id);
            self.inspeccionVO.sector_id(datos.sector_id);
            self.inspeccionVO.apoyo_id(datos.apoyo_id);
            self.inspeccionVO.usuario_id(datos.usuario_id);
            self.inspeccionVO.fecha(datos.fecha);
            self.inspeccionVO.activo(datos.activo);
            self.inspeccionVO.capitulos(convertToObservableArray(datos.capitulos));
            cerrarLoading();
            
          } else {
              cerrarLoading();

          }

      }, path, parameter);
    }



    //funcion la id_falla_inspeccion
    self.consultar_id_falla_inspeccion = function (capitulo_falla_id,inspeccion_id) {
        
      path = path_principal+'/inspeccion/listado_soporte_editar?format=json';
      parameter = { capitulo_falla_id:capitulo_falla_id, inspeccion_id:inspeccion_id};
      RequestGet(function (datos, estado, mensage) {

        self.falla_soporte_editar(datos);
        cerrarLoading(); 

        self.consultar_soportes_editar(self.falla_soporte_editar()); 

      }, path, parameter,undefined, false);
    }


    //funcion consultar los soportes asociados a la inspeccion
    self.consultar_soportes_editar = function (id) {
        
      path = path_principal+'/api/Foto_falla_inspeccion?format=json';
      parameter = { id_falla_inspeccion: id};
      RequestGet(function (datos, estado, mensage) {

          if (estado == 'ok' && datos.data!=null && datos.data.length > 0) {
              self.mensaje_soporte_editar('');
              self.listado_soportes_editar(agregarOpcionesObservable(datos.data));
              cerrarLoading();  

          } else {
              self.listado_soportes_editar([]);
              self.mensaje_soporte_editar(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                  cerrarLoading();
          }

      }, path, parameter,undefined, false);
    } 



    //eliminar los soportes de la inspeccion
    self.eliminar_soporte = function () {

       var lista_id=[];
       var count=0;
       ko.utils.arrayForEach(self.listado_soportes_editar(), function(d) {

              if(d.eliminado()==true){
                  count=1;
                 lista_id.push({
                      id:d.id
                 })
              }
       });

       if(count==0){

            $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los soporte para la eliminación.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
          });

       }else{
           var path =path_principal+'/inspeccion/eliminar_soporte/';
           var parameter = { lista: lista_id };
           RequestAnularOEliminar("Esta seguro que desea eliminar las soportes seleccionados?", path, parameter, function () {
               self.consultar_soportes_editar(self.falla_soporte_editar()); 
               self.checkall(false);
           })

       } 

    }


     //funcion guardar los soportes asociados a la inspeccion
    self.guardar_soporte_foto=function(){
      var data = new FormData();


      if ($('#archivo').val()=='') {

          $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Debe cargar el soporte.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
          });
          return false
      }

      if (self.listado_soportes_editar().length > 1) {

          $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Solo puede cargar dos soportes.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
          });
          return false
      }


      var falla=self.falla_soporte_editar();

      data.append('falla_inspeccion_id',falla);

      data.append('soporte', $('#archivo')[0].files[0]);

      var parametros={                     
          callback:function(datos, estado, mensaje){

              if (estado=='ok') {
                  self.limpiar_archivo();
                  self.consultar_soportes_editar(self.falla_soporte_editar()); 

              }                        
                  
          },//funcion para recibir la respuesta 
          url:path_principal+'/api/Foto_falla_inspeccion/',//url api
          parametros:data                        
      };
      RequestFormData2(parametros);

    }


}

var inspeccion = new InspeccionViewModel();
InspeccionViewModel.errores_inspeccion= ko.validation.group(inspeccion.inspeccionVO);
InspeccionViewModel.errores_apoyo= ko.validation.group(inspeccion.apoyoVO);
ko.applyBindings(inspeccion);
