
function LoteViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.listado_circuito=ko.observableArray([]);
    self.listado_sector=ko.observableArray([]);
    self.listado_circuito_temporal=ko.observableArray([]);
    self.listado_sector_temporal=ko.observableArray([]);
    self.listado_poligono_temporal=ko.observableArray([]);

    self.circuitosList=ko.observable('');
    self.sectorList=ko.observable('');

    self.mensaje=ko.observable('');
    self.mensaje_circuito=ko.observable('');
    self.mensaje_sector=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
    self.checkall2=ko.observable(false);
    self.checkall3=ko.observable(false);
    self.checkall4=ko.observable(false);
    self.checkall5=ko.observable(false);
    self.nombre_poligono=ko.observable('');
  
    self.contratistas=ko.observable('');
    self.sectores=ko.observable('');
    self.circuitos=ko.observable('');
    self.tabIndex=ko.observable(0);
    self.nombreBoton=ko.observable('Siguiente');
    self.disable=ko.observable(0);
    self.ano=ko.observable(new Date().getFullYear());
    self.mes=ko.observable('');
    self.numero_inspe=ko.observable('');
    self.lote_exportar=ko.observable('');

    self.inspeccion_word=ko.observable('');

     //Representa un modelo del lote
    self.loteVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre del lote' } }),
        contratista_id:ko.observable('').extend({ required: { message: '(*)Seleccione el contratista del lote' } }),
        provincia_id:ko.observable('').extend({ required: { message: '(*)Seleccione la provincia del lote' } }),
        sucursal_id:ko.observable('').extend({ required: { message: '(*)Seleccione la sucursal del lote' } }),
        activo:ko.observable(0),
    };


    //funcion para filtrar los lotes
    self.filtrar_lote = function () {
        self.titulo('Filtrar lote');
        $('#modal_filtro_lote').modal('show');
    }


    //funcion para generar informe de word
    self.generar_word = function (obj) {
      self.limpiar_modal_word();
      self.consultar_inspeccion_validacion(obj.id);
      self.lote_exportar(obj.id);
      self.titulo('Generar informe');
      $('#generar_informe').modal('show');
    }


     //paginacion del lote
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

        ko.utils.arrayForEach(self.listado_circuito(), function(d) {

            d.eliminado(value);
        }); 
    });


        //funcion para seleccionar los datos a eliminar
    self.checkall2.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_circuito_temporal(), function(d) {

            d.procesado(value);
        }); 
    });



        //funcion para seleccionar los datos a eliminar
    self.checkall3.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_sector(), function(d) {

            d.eliminado(value);
        }); 
    });


        //funcion para seleccionar los datos a eliminar
    self.checkall4.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_sector_temporal(), function(d) {

            d.procesado(value);
        }); 
    });


     //funcion para seleccionar los datos a eliminar
    self.checkall5.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_poligono_temporal(), function(d) {

            d.procesado(value);
        }); 
    });


    //funcion para abrir modal de registrar lote
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Lote');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del lote
     self.limpiar=function(){     
         
        self.loteVO.id(0);
        self.loteVO.nombre('');
        self.loteVO.contratista_id(''); 
        self.loteVO.provincia_id('');
        self.loteVO.sucursal_id('');
        self.loteVO.activo(0);

        self.loteVO.contratista_id.isModified(false);
        self.loteVO.provincia_id.isModified(false);  
        self.loteVO.sucursal_id.isModified(false); 

        self.listado_circuito_temporal([]);
        self.listado_sector_temporal([]); 
        self.listado_poligono_temporal([]);

        self.checkall(false);
        self.checkall2(false);
        self.checkall3(false);
        self.checkall4(false);
        self.checkall5(false);
        self.nombre_poligono('');   
     }


    self.limpiar_modal_word=function(){     
         
        self.mes('');
        self.numero_inspe('');
    }


    //funcion guardar y actualizar los lote
     self.guardar=function(){

        if (LoteViewModel.errores_lote().length == 0) {//se activa las validaciones

            if(self.loteVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Lote/',//url api
                     parametros:self.loteVO                        
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
                       url:path_principal+'/api/Lote/'+self.loteVO.id()+'/',
                       parametros:self.loteVO                        
                  };

                  Request(parametros);

            }

        } else {
             LoteViewModel.errores_lote.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los lote
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

           self.filtro($('#txtBuscar').val());
           var contratista=self.contratistas()
           var provincia=self.loteVO.provincia_id();
           var sucursal=self.loteVO.sucursal_id();
           var circuito=self.circuitos()
           var sector=self.sectores()

           path = path_principal+'/api/Lote?format=json';
            parameter = { dato: self.filtro(), page: pagina,id_contratista:contratista, 
              id_provincia:provincia,id_sucursal:sucursal, activo:true,
              id_circuito:circuito,id_sector:sector};
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


    //consultar por id de los lote
    self.consultar_por_id = function (id_lote) {
       
       path =path_principal+'/api/Lote/'+id_lote+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Lote');

            self.loteVO.id(datos.id);
            self.loteVO.nombre(datos.nombre);
            self.loteVO.contratista_id(datos.contratista.id);
            self.loteVO.provincia_id(datos.provincia.id);
            self.loteVO.sucursal_id(datos.sucursal.id);
            self.loteVO.activo(datos.activo);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar los lote
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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los lotes a desactivar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
        });

        }else{
          var path =path_principal+'/lote/inactivo_lote/';
          var parameter = { lista: lista_id };
          RequestAnularOEliminar("Esta seguro que desea desactivar los lotes seleccionados?", path, parameter, function () {
            self.consultar(1);
            self.checkall(false);
          })

        }     

    }



    //funcion consultar los circuitos
    self.consultar_circuito = function () {
        
        self.filtro($('#txtBuscarC').val());

        path = path_principal+'/api/Circuito?format=json';
        parameter = { dato: self.filtro(), activo:true};
        RequestGet(function (datos, estado, mensage) {

            if (estado == 'ok' && datos.data!=null && datos.data.length > 0) {
                self.mensaje_circuito('');
                self.listado_circuito(agregarOpcionesObservable(datos.data));
                cerrarLoading();  

            } else {
                self.listado_circuito([]);
                self.mensaje_circuito(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                    cerrarLoading();
            }

        }, path, parameter,undefined, false);
    } 



     //asociar circuito
    self.asociar_circuito = function () {
         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_circuito(), function(d) {

                if(d.eliminado()==true){
                    count=1;
                    var existe = 0;
                    ko.utils.arrayForEach(self.listado_circuito_temporal(), function(e) {

                      if (d.id === e.id ){
                        existe++;
                        e.eliminado(false);
                      }

                     }); 


                      if (existe==0) {
                        self.listado_circuito_temporal.push({
                            id:d.id,
                            nombre:d.nombre,
                            eliminado:ko.observable(false),
                            procesado:ko.observable(false)
                       });
                      } 
                       

                   
                }
         });
     
    }

   self.desasociar_circuito = function () { 

         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_circuito_temporal(), function(d, i) {

            if(d!=undefined && d!=null && d.procesado()==true){
              //self.listado_circuito_temporal.remove(d)
              d.eliminado(true);

            }
            
          
        });


     }



    //funcion consultar los sectores
    self.consultar_sector = function () {
        
        self.filtro($('#txtBuscarS').val());

        path = path_principal+'/api/Sector?format=json';
        parameter = { dato: self.filtro(), activo:true};
        RequestGet(function (datos, estado, mensage) {

            if (estado == 'ok' && datos.data!=null && datos.data.length > 0) {
                self.mensaje_sector('');
                self.listado_sector(agregarOpcionesObservable(datos.data));
                cerrarLoading();  

            } else {
                self.listado_sector([]);
                self.mensaje_sector(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                    cerrarLoading();
            }

        }, path, parameter,undefined, false);
    }



         //asociar sector
    self.asociar_sector = function () {
         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_sector(), function(d) {

                if(d.eliminado()==true){
                    count=1;
                    var existe = 0;
                    ko.utils.arrayForEach(self.listado_sector_temporal(), function(e) {

                      if (d.id === e.id ){
                        existe++;
                        e.eliminado(false);
                      }

                     });  

                      if (existe==0) {
                        self.listado_sector_temporal.push({
                            id:d.id,
                            nombre:d.nombre,
                            eliminado:ko.observable(false),
                            procesado:ko.observable(false)
                       });
                      } 
                       

                   
                }
         });
     
    }

   self.desasociar_sector = function () { 

         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_sector_temporal(), function(d, i) {

            if(d!=undefined && d!=null && d.procesado()==true){
              //self.listado_sector_temporal.remove(d)
              d.eliminado(true);

            }         
          
        });

     } 


    //asociar poligono
    self.asociar_poligono = function () {

      self.listado_poligono_temporal.push({
        nombre:self.nombre_poligono(),
        eliminado:ko.observable(false),
        procesado:ko.observable(false)

      });                  

    }


    self.desasociar_poligono = function () { 

         ko.utils.arrayForEach(self.listado_poligono_temporal(), function(d, i) {

            if(d!=undefined && d!=null && d.procesado()==true){
              //self.listado_sector_temporal.remove(d)
              d.eliminado(true);

            }         
          
        });

     } 


     //funcion guardar el lote
     self.guardar_lote=function(){

        if (LoteViewModel.errores_lote().length == 0) {//se activa las validaciones

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                       if (estado=='ok') {
                            self.limpiar();
                            self.nombreBoton('Siguiente');
                            //location.reload(true);
                            self.tabIndex(0);
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/lote/guardar_lote/',//url api
                     parametros:{lista_sector:self.listado_sector_temporal(), lista_circuito:self.listado_circuito_temporal(),
                      lote_poligono:self.listado_poligono_temporal(),nombre_lote:self.loteVO.nombre(), 
                      contratista_id:self.loteVO.contratista_id(), municipio_id:self.loteVO.provincia_id(), 
                      sucursal_id:self.loteVO.sucursal_id(), activo:true}                    
                };
                Request(parametros);

        } else {
             LoteViewModel.errores_lote.showAllMessages();//mostramos las validacion
        } 
     }


    self.vistas_parciales = function () {      
           
      if(self.tabIndex()<3){

       //valida la primera vista parcial
        if(self.tabIndex()==0){

          if (LoteViewModel.errores_lote().length == 0) {
              
          } else {
              LoteViewModel.errores_lote.showAllMessages();
              return false;
          }          

        }

        //valida la segunda vista parcial
        if(self.tabIndex()==1){

          var count=0;

          ko.utils.arrayForEach(lote.listado_circuito_temporal(), function(d) {

            count=1;
          });

          if(count==0){

            $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los circuitos a asociar.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
            });

            return false;
          }      

        }


        //valida la tercera vista parcial
        if(self.tabIndex()==2){

          var count2=0;

          ko.utils.arrayForEach(lote.listado_sector_temporal(), function(d) {

            count2=1;
          });

          if(count2==0){

            $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los sectores a asociar.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
            });

            return false;
          }      

        }


        self.tabIndex(self.tabIndex()+1);
        self.nombreBoton('Siguiente');
        self.disable(1);

      }

      if (self.nombreBoton()=='Finalizar') {
          self.guardar_lote(); // guarda la informacion
      }

      if(self.tabIndex()>=3){

        self.nombreBoton('Finalizar');
        self.disable(1);

      }

    }

    self.atras_vistas_parciales = function () {      
      
        if (self.tabIndex()>0) {
            self.tabIndex(self.tabIndex()-1);
            self.disable(1);

        }
        self.nombreBoton('Siguiente');

    }


     //validacion para cuando genere el archivo word
    self.consultar_inspeccion_validacion=function(id_lote){

      path =path_principal+'/api/Inspeccion?sin_paginacion';
      parameter={id_lote:id_lote,activo:true };
      RequestGet(function (datos, estado, mensaje) {
           
        self.inspeccion_word(datos);

      }, path, parameter,undefined,false,false);

    }



    //exportar excel la tabla del listado de los contratista
    self.exportar_excel=function(){
        var ano=self.ano();
        var mes=self.mes();
        var inspeccion=self.numero_inspe();
        var lote_id =self.lote_exportar()

        if(ano=='' || mes=='' || inspeccion==''){

            $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Debe diligenciar los campos obligatorios.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
            });

            return false;
        }


        if( self.inspeccion_word()==''){

            $.confirm({
              title:'Informativo',
              content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>No se encontraron inspecciones registradas en el lote.<h4>',
              cancelButton: 'Cerrar',
              confirmButton: false
            });

            return false;
        } 


        location.href=path_principal+"/lote/ejemplo_word?ano="+ano+"&mes="+mes+"&inspeccion="+inspeccion+"&lote_id="+lote_id;

    }



}

var lote = new LoteViewModel();
LoteViewModel.errores_lote= ko.validation.group(lote.loteVO);
ko.applyBindings(lote);
