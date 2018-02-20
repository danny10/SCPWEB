
function LoteViewModel() {
    
    var self = this;

    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
    self.checkall2=ko.observable(false);
    self.checkall3=ko.observable(false);
    self.checkall4=ko.observable(false);
    self.checkall5=ko.observable(false);
    self.idLote=ko.observable(0);
    self.mensaje_circuito=ko.observable('');
    self.mensaje_sector=ko.observable('');
    self.mensaje_circuito_asociado=ko.observable('');
    self.mensaje_sector_asociado=ko.observable('');
    self.mensaje_poligono_asociado=ko.observable('');
     

    self.listado_circuito=ko.observableArray([]);
    self.listado_circuito_asociado=ko.observableArray([]);
    self.listado_sector=ko.observableArray([]);
    self.listado_sector_asociado=ko.observableArray([]);
    self.listado_poligono=ko.observableArray([]);
    self.listado_poligono_asociado=ko.observableArray([]);


    self.nombre_poligono=ko.observable('');

    self.tabIndex=ko.observable(0);
    self.nombreBoton=ko.observable('Siguiente');
    self.disable=ko.observable(0);
  


     //Representa un modelo del lote
    self.loteVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre del lote' } }),
        contratista_id:ko.observable('').extend({ required: { message: '(*)Seleccione el contratista del lote' } }),
        provincia_id:ko.observable('').extend({ required: { message: '(*)Seleccione la provincia del lote' } }),
        sucursal_id:ko.observable('').extend({ required: { message: '(*)Seleccione la sucursal del lote' } }),
        activo:ko.observable(0),

    };

  
    //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_circuito(), function(d) {

            d.eliminado(value);
        }); 
    });


        //funcion para seleccionar los datos a eliminar
    self.checkall2.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_circuito_asociado(), function(d) {

            d.eliminado(value);
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

        ko.utils.arrayForEach(self.listado_sector_asociado(), function(d) {

            d.eliminado(value);
        }); 
    });


     //funcion para seleccionar los datos a eliminar
    self.checkall5.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado_poligono_asociado(), function(d) {

            d.eliminado(value);
        }); 
    });



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


        self.checkall(false);
        self.checkall2(false);
        self.checkall3(false);
        self.checkall4(false);
        self.checkall5(false);
        self.nombre_poligono('');   
     }


    //consultar precionando enter
    self.consulta_enter = function (d,e) {
        if (e.which == 13) {
            self.filtro($('#txtBuscar').val());
            self.consultar_por_id();
        }
        return true;
    }


    //consultar por id de los lote
    self.consultar_por_id = function () {
       
       path =path_principal+'/api/Lote/'+self.idLote()+'/?format=json';
       parameter='';
         RequestGet(function (datos, estado, mensaje) {
           
            self.loteVO.id(datos.id);
            self.loteVO.nombre(datos.nombre);
            self.loteVO.contratista_id(datos.contratista.id);
            self.loteVO.provincia_id(datos.provincia.id);
            self.loteVO.sucursal_id(datos.sucursal.id);
            self.loteVO.activo(datos.activo);

         }, path, parameter);

     }


     //funcion guardar el lote
     self.guardar_lote=function(){

        if (LoteViewModel.errores_lote().length == 0) {//se activa las validaciones

            var parametros={     
                        metodo:'PUT',                
                       callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                          self.limpiar();
                          self.consultar_por_id();
                          self.tabIndex(0);
                          self.nombreBoton('Siguiente');
                        }  

                       },//funcion para recibir la respuesta 
                       url:path_principal+'/api/Lote/'+self.loteVO.id()+'/',
                       parametros:self.loteVO                        
               };

                  Request(parametros);

        } else {
             LoteViewModel.errores_lote.showAllMessages();//mostramos las validacion
        } 
     }



    //funcion consultar los circuito editar
    self.consultar_circuito_editar = function () {
        //alert($('#txtBuscarC').val())
        //self.filtro($('#txtBuscarC').val());

        if ($('#txtBuscarC').val()==undefined){

            var busqueda='';
        }else{

             var busqueda=$('#txtBuscarC').val()
        }

        path = path_principal+'/lote/listado_circuito?format=json';
        parameter = { dato: self.filtro(),id_lote: self.idLote()};
        RequestGet(function (datos, estado, mensage) {

            if (estado == 'ok' && datos!=null && datos.length > 0) {
                self.mensaje_circuito('');
                self.listado_circuito(agregarOpcionesObservable(datos));
                cerrarLoading();  

            } else {
                self.listado_circuito([]);
                self.mensaje_circuito(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                    cerrarLoading();
            }

        }, path, parameter,undefined, false);
    }



      //funcion consultar los circuito asociados editar
    self.consultar_circuito_asociado_editar = function () {
        
        path = path_principal+'/lote/listado_circuito_asociado?format=json';
        parameter = { id_lote: self.idLote()};
        RequestGet(function (datos, estado, mensage) {
          

            if (estado == 'ok' && datos!=null && datos.length > 0) {
                self.mensaje_circuito('');
                self.listado_circuito_asociado(agregarOpcionesObservable(datos));


            } else {
                self.listado_circuito_asociado([]);
                self.mensaje_circuito(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
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
                   lista_id.push({
                        id:d.id
                   })
                }
         });

         if(count==0){

              $.confirm({
                title:'Informativo',
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los circuitos a asociar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/asociar_circuito_lote/';
             var parameter = { lista: lista_id, lote_id:self.idLote() };

              $.confirm({
                    title: 'Confirmar!',
                    content: "<h4>Esta seguro que desea asociar los circuitos seleccionados?</h4>",
                    confirmButton: 'Si',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    cancelButton: 'No',
                    confirm: function() {

                        var parametros = {
                            callback: function () {
                                        self.consultar_circuito_asociado_editar();
                                        self.consultar_circuito_editar();
                                         self.checkall(false);
                                         self.checkall2(false);
                                     },
                            url: path,
                            parametros: parameter,
                            completado: function(){},
                            metodo:'POST',
                            alerta:true

                        };
                        Request(parametros);
                    }
                });
            
         }     
         
    }



    //desasociar circuito
    self.desasociar_circuito = function () {

         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_circuito_asociado(), function(d) {

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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los circuitos a desasociar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/eliminar_circuito_lote/';
             var parameter = { lista: lista_id };
             RequestAnularOEliminar("Esta seguro que desea desasociar los circuitos seleccionados?", path, parameter, function () {
                self.consultar_circuito_asociado_editar();
                self.consultar_circuito_editar();
                self.checkall(false);
                self.checkall2(false);

             })

         }           
    }



    //funcion consultar los sectores editar
    self.consultar_sector_editar = function () {

        if ($('#txtBuscarS').val()==undefined){

            var busqueda='';
        }else{

             var busqueda=$('#txtBuscarS').val()
        }
        
        //self.filtro($('#txtBuscarS').val());

        path = path_principal+'/lote/listado_sector?format=json';
        parameter = { dato: busqueda,id_lote: self.idLote()};
        RequestGet(function (datos, estado, mensage) {

            if (estado == 'ok' && datos!=null && datos.length > 0) {
                self.mensaje_sector('');
                self.listado_sector(agregarOpcionesObservable(datos));
                cerrarLoading();  

            } else {
                self.listado_sector([]);
                self.mensaje_sector(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
                    cerrarLoading();
            }

        }, path, parameter,undefined, false);
    }



      //funcion consultar los sector asociados editar
    self.consultar_sector_asociado_editar = function () {
        
        path = path_principal+'/lote/listado_sector_asociado?format=json';
        parameter = { id_lote: self.idLote()};
        RequestGet(function (datos, estado, mensage) {
          

            if (estado == 'ok' && datos!=null && datos.length > 0) {
                self.mensaje_sector_asociado('');
                self.listado_sector_asociado(agregarOpcionesObservable(datos));


            } else {
                self.listado_sector_asociado([]);
                self.mensaje_sector_asociado(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
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
                   lista_id.push({
                        id:d.id
                   })
                }
         });

         if(count==0){

              $.confirm({
                title:'Informativo',
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los sectores a asociar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/asociar_sector_lote/';
             var parameter = { lista: lista_id, lote_id:self.idLote() };

              $.confirm({
                    title: 'Confirmar!',
                    content: "<h4>Esta seguro que desea asociar los sectores seleccionados?</h4>",
                    confirmButton: 'Si',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    cancelButton: 'No',
                    confirm: function() {

                        var parametros = {
                            callback: function () {
                                        self.consultar_sector_editar();
                                        self.consultar_sector_asociado_editar();
                                        self.checkall3(false);
                                        self.checkall4(false);
                                     },
                            url: path,
                            parametros: parameter,
                            completado: function(){},
                            metodo:'POST',
                            alerta:true

                        };
                        Request(parametros);
                    }
                });
            
         }     
         
    }



    //desasociar sector
    self.desasociar_sector = function () {

         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_sector_asociado(), function(d) {

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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los sectores a desasociar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/eliminar_sector_lote/';
             var parameter = { lista: lista_id };
             RequestAnularOEliminar("Esta seguro que desea desasociar los sectores seleccionados?", path, parameter, function () {
                self.consultar_sector_editar();
                self.consultar_sector_asociado_editar();
                self.checkall3(false);
                self.checkall4(false);

             })

         }           
    }



     //asociar poligono
    self.asociar_poligono = function () {
         var lista_id=[];
         var count=0;

            lista_id.push({
              nombre:self.nombre_poligono()

            })


         if(self.nombre_poligono()==''){

              $.confirm({
                title:'Informativo',
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Digite el nombre del poligono.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/asociar_poligono_lote/';
             var parameter = { lista: lista_id, lote_id:self.idLote() };

             var parametros = {
                 callback: function () {
                     self.consultar_poligono_asociado_editar();
                     self.checkall5(false);
                  },
                url: path,
                parametros: parameter,
                completado: function(){},
                metodo:'POST',
                alerta:true

              };
              Request(parametros);
                    
               
            
         }     
         
    }



    //funcion consultar los poligonos asociados editar
    self.consultar_poligono_asociado_editar = function () {
        
        path = path_principal+'/lote/listado_poligono_asociado?format=json';
        parameter = { id_lote: self.idLote()};
        RequestGet(function (datos, estado, mensage) {
          

            if (estado == 'ok' && datos!=null && datos.length > 0) {
                self.mensaje_poligono_asociado('');
                self.listado_poligono_asociado(agregarOpcionesObservable(datos));


            } else {
                self.listado_poligono_asociado([]);
                self.mensaje_poligono_asociado(mensajeNoFound);//mensaje not found se encuentra el el archivo call-back.js
            }

        }, path, parameter,undefined, false);
    }




        //desasociar poligono
    self.desasociar_poligono = function () {

         var lista_id=[];
         var count=0;
         ko.utils.arrayForEach(self.listado_poligono_asociado(), function(d) {

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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los poligonos a desasociar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
            });

         }else{
             var path =path_principal+'/lote/eliminar_poligono_lote/';
             var parameter = { lista: lista_id };
             RequestAnularOEliminar("Esta seguro que desea desasociar los poligonos seleccionados?", path, parameter, function () {
                self.consultar_poligono_asociado_editar();
                self.checkall5(false);

             })

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

          ko.utils.arrayForEach(lote.listado_circuito_asociado(), function(d) {

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

          ko.utils.arrayForEach(lote.listado_sector_asociado(), function(d) {

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

}

var lote = new LoteViewModel();
LoteViewModel.errores_lote= ko.validation.group(lote.loteVO);
ko.applyBindings(lote);
