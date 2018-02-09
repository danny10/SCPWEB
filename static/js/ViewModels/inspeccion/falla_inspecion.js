
function FallaInspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo de las fallas inspeccion
    self.falla_inspeccionVO={
        id:ko.observable(0),
        observaciones:ko.observable('').extend({ required: { message: '(*)Digite la observacion' } }),
        calificacion:ko.observable('').extend({ required: { message: '(*)Digite la calificacion' } }),
        inspeccion_id:ko.observable(0),
        capitulo_falla_id:ko.observable('').extend({ required: { message: '(*)Seleccione el capitulo de la falla' } }),

    };

     //paginacion de las fallas inpecciones
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
        self.titulo('Registrar Fallas Inpeccion');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo de las fallas inspecciones
     self.limpiar=function(){     
         
        self.falla_inspeccionVO.id(0);
        self.falla_inspeccionVO.observaciones('');
        self.falla_inspeccionVO.calificacion(''); 
        self.falla_inspeccionVO.capitulo_falla_id('');

        self.inspeccionVO.capitulo_falla_id.isModified(false);   
     }


    //funcion guardar y actualizar las fallas inspeccion
     self.guardar=function(){

        if (FallaInspeccionViewModel.errores_falla_inspeccion().length == 0) {//se activa las validaciones

            if(self.falla_inspeccionVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Falla_inspeccion/',//url api
                     parametros:self.falla_inspeccionVO                        
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
                       url:path_principal+'/api/Falla_inspeccion/'+self.falla_inspeccionVO.id()+'/',
                       parametros:self.falla_inspeccionVO                        
                  };

                  Request(parametros);

            }

        } else {
             FallaInspeccionViewModel.errores_falla_inspeccion.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar las falla inspeccion
    self.consultar = function (pagina) {
        
        if (pagina > 0) {      


           self.filtro($('#txtBuscar').val());
           var inspeccion=self.falla_inspeccionVO.inspeccion_id();
           var capitulo_falla=self.falla_inspeccionVO.capitulo_falla_id();

           path = path_principal+'/api/Falla_inspeccion?format=json';
            parameter = { dato: self.filtro(), page: pagina,id_inspeccion:inspeccion, 
                          id_capitulo_falla:capitulo_falla};
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


    //consultar por id de las falla inpecciones
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Falla_inspeccion/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Fallas Inspecciones');

            self.falla_inspeccionVO.id(datos.id);
            self.falla_inspeccionVO.inspeccion_id(datos.inspeccion.id);
            self.falla_inspeccionVO.capitulo_falla_id(datos.capitulo_falla.id);
            self.falla_inspeccionVO.observaciones(datos.observaciones);
            self.falla_inspeccionVO.calificacion(datos.calificacion);
        
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar las fallas inspeccion
    self.eliminar = function () {}


    //exportar excel la tabla del listado de las fallas inspecciones
   self.exportar_excel=function(){

         location.href=path_principal+"/inspeccion/exportar_fallas_inspecciones/";
     } 

}

var falla_inspeccion = new FallaInspeccionViewModel();
FallaInspeccionViewModel.errores_falla_inspeccion= ko.validation.group(falla_inspeccion.falla_inspeccionVO);
ko.applyBindings(falla_inspeccion);
