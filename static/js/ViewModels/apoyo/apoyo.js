
function ApoyoViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo del apoyo
    self.apoyoVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        latitud:ko.observable('').extend({ required: { message: '(*)Digite la latitud' } }),
        longitud:ko.observable('').extend({ required: { message: '(*)Digite la longitud' } }),
    };

     //paginacion del apoyo
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

    //funcion para abrir modal de registrar apoyo
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Apoyo');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del apoyo
     self.limpiar=function(){     
         
        self.apoyoVO.id(0);
        self.apoyoVO.nombre('');
        self.apoyoVO.latitud('');
        self.apoyoVO.longitud('');   
     }


    //funcion guardar y actualizar los apoyo
     self.guardar=function(){

        if (ApoyoViewModel.errores_apoyo().length == 0) {//se activa las validaciones

            if(self.apoyoVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Apoyo/',//url api
                     parametros:self.apoyoVO                        
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
                       url:path_principal+'/api/Apoyo/'+self.apoyoVO.id()+'/',
                       parametros:self.apoyoVO                        
                  };

                  Request(parametros);

            }

        } else {
             ApoyoViewModel.errores_apoyo.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los apoyos
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

            self.filtro($('#txtBuscar').val());

           path = path_principal+'/api/Apoyo?format=json';
            parameter = { dato: self.filtro(), page: pagina};
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


    //consultar por id de los apoyos
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Apoyo/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Apoyo');

            self.apoyoVO.id(datos.id);
            self.apoyoVO.nombre(datos.nombre);
            self.apoyoVO.longitud(datos.longitud);
            self.apoyoVO.latitud(datos.latitud);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar los apoyos
    self.eliminar = function () {}


    //exportar excel la tabla del listado de los apoyos
    self.exportar_excel=function(){

         location.href=path_principal+"/apoyo/exportar_apoyo/";
    } 

}

var apoyo = new ApoyoViewModel();
ApoyoViewModel.errores_apoyo= ko.validation.group(apoyo.apoyoVO);
ko.applyBindings(apoyo);
