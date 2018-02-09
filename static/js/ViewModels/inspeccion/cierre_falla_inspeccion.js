
function CierreFallaInspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo de los cierres fallas inspeccion
    self.cierre_falla_inspeccionVO={
        id:ko.observable(0),
        fecha:ko.observable('').extend({ required: { message: '(*)Digite la fecha' } }),
        calificacion:ko.observable('').extend({ required: { message: '(*)Digite la observacion' } }),
        falla_inspeccion_id:ko.observable(0),
        soporte:ko.observable(''),

    };

     //paginacion de los cierres fallas inpecciones
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

    //funcion para abrir modal de registrar de las fallas inspeccion
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Cierres Fallas Inpeccion');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo de las fallas inspecciones
     self.limpiar=function(){     
         
        self.cierre_falla_inspeccionVO.id(0);
        self.cierre_falla_inspeccionVO.fecha('');
        self.cierre_falla_inspeccionVO.observaciones(''); 
        self.cierre_falla_inspeccionVO.soporte('');
        
        $('#archivo2').fileinput('reset');
        $('#archivo2').val(''); 
     }


   //funcion guardar y actualizar de los cierres fallas inspeccion
     self.guardar=function(){

        if (CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion().length == 0) {//se activa las validaciones

            if(self.cierre_falla_inspeccionVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Cierre_falla_inspeccion/',//url api
                     parametros:self.cierre_falla_inspeccionVO                        
                };
                RequestFormData(parametros);
            }else{

                 if($('#archivo2')[0].files.length==0){
                    self.cierre_falla_inspeccionVO.soporte('');
                }                 

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
                       url:path_principal+'/api/Cierre_falla_inspeccion/'+self.cierre_falla_inspeccionVO.id()+'/',
                       parametros:self.cierre_falla_inspeccionVO                        
                  };

                  RequestFormData(parametros);

            }

        } else {
             CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion.showAllMessages();//mostramos las validacion
        }
     }


    //funcion consultar los cierres falla inspeccion
    self.consultar = function (pagina) {
        
        if (pagina > 0) {      

           self.filtro($('#txtBuscar').val());
           var falla_inspeccion=self.cierre_falla_inspeccionVO.falla_inspeccion_id();

           path = path_principal+'/api/Cierre_falla_inspeccion?format=json';
            parameter = { dato: self.filtro(), page: pagina,id_falla_inspeccion:falla_inspeccion};
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


    //consultar por id de los cierres falla inpecciones
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Cierre_falla_inspeccion/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Cierres Fallas Inspecciones');

            self.cierre_falla_inspeccionVO.id(datos.id);
            self.cierre_falla_inspeccionVO.fecha(datos.fecha);
            self.cierre_falla_inspeccionVO.observaciones(datos.observaciones);
            self.cierre_falla_inspeccionVO.falla_inspeccion_id(datos.falla_inspeccion.id);
            self.cierre_falla_inspeccionVO.soporte(datos.soporte);
        
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar los cierre fallas inspeccion
    self.eliminar = function () {}


    //exportar excel la tabla del listado de los cierre fallas inspecciones
   self.exportar_excel=function(){

         location.href=path_principal+"/inspeccion/exportar_fallas_inspecciones/";
     } 

}

var cierre_falla_inspeccion = new CierreFallaInspeccionViewModel();
CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion= ko.validation.group(cierre_falla_inspeccion.cierre_falla_inspeccionVO);
ko.applyBindings(cierre_falla_inspeccion);
