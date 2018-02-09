
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
    self.soporte=ko.observable('');
    self.nombreBoton=ko.observable('Seguiente');
    self.foto=ko.observable('');
    self.soportes_fotos=ko.observableArray([]);
    self.obj_falla={};
  

     //Representa un modelo del inspeccion
    self.inspeccionVO={
        // id:ko.observable(0),
        // numero_inspeccion:ko.observable('').extend({ required: { message: '(*)Digite el numero de la inspeccion' } }),
        // circuito_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el circuito' } }),
        // lote_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el lote' } }),
        // poligono_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el poligono' } }),
        // sector_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el sector' } }),
        // apoyo_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el apoyo' } }),
        // usuario_id:ko.observable(0),
        // fecha:ko.observable('').extend({ required: { message: '(*)Digite la fecha' } }),
        // activo:ko.observable(0),


        id:ko.observable(0),
        numero_inspeccion:ko.observable(''),
        circuito_id:ko.observable(0),
        lote_id:ko.observable(0),
        poligono_id:ko.observable(0),
        sector_id:ko.observable(0),
        apoyo_id:ko.observable(0),
        usuario_id:ko.observable(0),
        fecha:ko.observable(''),
        activo:ko.observable(0),
        capitulos: ko.observableArray([])        

    };


         //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.soportes_fotos(), function(d) {

            d.procesado(value);
        }); 
    });



     //Representa un modelo del apoyo
    self.apoyoVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        latitud:ko.observable('').extend({ required: { message: '(*)Digite la latitud' } }),
        longitud:ko.observable('').extend({ required: { message: '(*)Digite la longitud' } }),
    };


     //paginacion de las inpecciones
     self.paginacion = {
        pagina_actual: ko.observable(1),
        total: ko.observable(0),
        maxPaginas: ko.observable(5),
        directiones: ko.observable(true),
        limite: ko.observable(true),
        cantidad_por_paginas: ko.observable(0),
        text: {
            first: ko.observable('Inicio'),
            last: ko.observable('Fin'),
            back: ko.observable('<'),
            forward: ko.observable('>')
        },
        totalRegistrosBuscados:ko.observable(0)
    }

    //paginacion
    self.paginacion.pagina_actual.subscribe(function (pagina) {
        self.consultar(pagina);
    });


    //Funcion para crear la paginacion 
    self.llenar_paginacion = function (data,pagina) {

        self.paginacion.pagina_actual(pagina);
        self.paginacion.total(data.count);       
        self.paginacion.cantidad_por_paginas(resultadosPorPagina);
        var buscados = (resultadosPorPagina * pagina) > data.count ? data.count : (resultadosPorPagina * pagina);
        self.paginacion.totalRegistrosBuscados(buscados);

    }

  
    //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado(), function(d) {

            d.eliminado(value);
        }); 
    });

    //funcion para abrir modal de registrar inspeccion
    self.abrir_modal_apoyo = function () {
        self.limpiar();
        self.titulo('Nuevo apoyo');
        $('#modal_apoyo').modal('show');
    }


            //funcion para abrir modal para las actas
    self.abrir_modal_foto = function (obj) {

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
     }


    self.limpiar_apoyo=function(){     
         
        self.apoyoVO.id(0);
        self.apoyoVO.nombre('');
        self.apoyoVO.latitud('');
        self.apoyoVO.longitud('');
 
     }


    //funcion guardar y actualizar las inspeccion
     self.guardar=function(){

        if (InspeccionViewModel.errores_inspeccion().length == 0) {//se activa las validaciones

            if(self.inspeccionVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Inspeccion/',//url api
                     parametros:self.inspeccionVO                        
                };
                Request(parametros);
            }else{              

                  var parametros={     
                        metodo:'PUT',                
                       callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                          self.filtro("");
                          self.limpiar();
                          self.consultar(self.paginacion.pagina_actual());
                          $('#modal_acciones').modal('hide');
                        }  

                       },//funcion para recibir la respuesta 
                       url:path_principal+'/api/Inspeccion/'+self.inspeccionVO.id()+'/',
                       parametros:self.inspeccionVO                        
                  };

                  Request(parametros);

            }

        } else {
             InspeccionViewModel.errores_inspeccion.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar las inspeccion
    self.consultar = function (pagina) {
        
        if (pagina > 0) {      


           self.filtro($('#txtBuscar').val());
           var circuito=self.inspeccionVO.circuito_id();
           var lote=self.inspeccionVO.lote_id();
           var poligono=self.inspeccionVO.poligono_id();
           var sector=self.inspeccionVO.sector_id();
           var apoyo=self.inspeccionVO.apoyo_id();
           var usuario=self.inspeccionVO.usuario_id();

           path = path_principal+'/api/Inspeccion?format=json';
            parameter = { dato: self.filtro(), page: pagina,id_circuito:circuito, 
                          id_lote:lote,id_poligono:poligono,id_sector:sector,id_apoyo:apoyo,
                          usuario:usuario,desde:self.desde_filtro(), hasta:self.hasta_filtro(),activo:1};
            RequestGet(function (datos, estado, mensage) {

                if (estado == 'ok' && datos.data!=null && datos.data.length > 0) {
                    self.mensaje('');
                    self.listado(agregarOpcionesObservable(datos.data));
                    cerrarLoading();

                } else {
                    self.listado([]);
                    self.mensaje(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                    cerrarLoading();
                }

                self.llenar_paginacion(datos,pagina);

            }, path, parameter,undefined, false);
        }
    }


    //consultar precionando enter
    self.consulta_enter = function (d,e) {
        if (e.which == 13) {
            self.filtro($('#txtBuscar').val());
            self.consultar(1);
        }
        return true;
    }


    //consultar por id de las inpecciones
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Inspeccion/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Inspecciones');

            self.inspeccionVO.id(datos.id);
            self.inspeccionVO.numero_inspeccion(datos.numero_inspeccion);
            self.inspeccionVO.circuito_id(datos.circuito.id);
            self.inspeccionVO.lote_id(datos.lote.id);
            self.inspeccionVO.poligono_id(datos.poligono.id);
            self.inspeccionVO.sector_id(datos.sector.id);
            self.inspeccionVO.apoyo_id(datos.apoyo.id);
            self.inspeccionVO.usuario_id(datos.usuario.id);
            self.inspeccionVO.fecha(datos.fecha);
            self.inspeccionVO.activo(datos.activo);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar las inspecciones
    self.eliminar = function () {


      var lista_id=[];
      var count=0;
      ko.utils.arrayForEach(self.listado(), function(d) {

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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione las inspecciones a desactivar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
        });

        }else{
          var path =path_principal+'/inspecciones/desactivar_inspecciones/';
          var parameter = { lista: lista_id };
          RequestAnularOEliminar("Esta seguro que desea desactivar las inspecciones seleccionadas?", path, parameter, function () {
            self.consultar(1);
            self.checkall(false);
          })

        }     

    }


    //exportar excel la tabla del listado de las inspecciones
   self.exportar_excel=function(){

         location.href=path_principal+"/inspeccion/exportar_inspecciones/";
     }



       //consultar los macrocontrato
    self.consultar_apoyo=function(){

         path =path_principal+'/api/Apoyo?sin_paginacion';
         parameter={ };
         RequestGet(function (datos, estado, mensaje) {
           
            self.listado_apoyo(datos);

         }, path, parameter,undefined,false,false);

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



      self.localizar_mapa=function(){
        if (navigator.geolocation) {
    
          navigator.geolocation.getCurrentPosition(function(position) {
            self.apoyoVO.latitud(position.coords.latitude);
            self.apoyoVO.longitud(position.coords.longitude);
          }); 
        }
      }



    //funcion consultar las inspecciones
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



    self.vistas_parciales = function () {      
           
      if(self.tabIndex()<parseInt($('#hdCantidad').val())){
        self.tabIndex(self.tabIndex()+1);
        self.nombreBoton('Siguiente');
      }

      if (self.nombreBoton()=='Finalizar') {
        //alert(414554)
        //console.log(ko.toJS(self.inspeccionVO));
        self.guardar_inspeccion_todo();
      }

      if(self.tabIndex()>=parseInt($('#hdCantidad').val())){

        self.nombreBoton('Finalizar');

      }

    }


    self.atras_vistas_parciales = function () {      
      
        if (self.tabIndex()>0) {
          self.tabIndex(self.tabIndex()-1);
        }
        self.nombreBoton('Seguiente');

    }


        //asociar poligono
    self.guardar_soporte_foto = function () {

      self.obj_falla.soportes.push({
        foto:self.foto(),
        eliminado:ko.observable(false),
        procesado:ko.observable(false)
      });
       
      self.soportes_fotos(self.obj_falla.soportes());                

    }



             //funcion guardar 
     self.guardar_inspeccion_todo=function(){
        var data = new FormData();

            data.append('lista',ko.toJSON(self.inspeccionVO));

            ko.utils.arrayForEach(self.inspeccionVO.capitulos(), function(item){

              ko.utils.arrayForEach(item.fallas(), function(fall){

                ko.utils.arrayForEach(fall.soportes(), function(sop){

                  data.append('soporte_' + fall.capitulo_falla_id + '[]', sop.foto);

                });

              });

            });

            // for (var i = 0; i <  $('#archivo2')[0].files.length; i++) {
            //     data.append('archivo[]', $('#archivo2')[0].files[i]); 
            //  };

            var parametros={                     
                callback:function(datos, estado, mensaje){

                    // if (estado=='ok') {
                    //     self.filtro("");
                    //     self.limpiar_soporte();
                    //     self.consultar_soporte(94);
                    //     $('#modal_acciones').modal('hide');
                    // }                        
                        
                },//funcion para recibir la respuesta 
                url:path_principal+'/inspeccion/guardar_inspeccion/',//url api
                parametros:data                        
            };
            RequestFormData2(parametros);
 
    }


}

var inspeccion = new InspeccionViewModel();
InspeccionViewModel.errores_inspeccion= ko.validation.group(inspeccion.inspeccionVO);
InspeccionViewModel.errores_apoyo= ko.validation.group(inspeccion.apoyoVO);
ko.applyBindings(inspeccion);
