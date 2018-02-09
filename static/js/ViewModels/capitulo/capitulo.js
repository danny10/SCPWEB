
function CapituloViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo del capitulo
    self.capituloVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        orden:ko.observable('').extend({ required: { message: '(*)Digite el orden' } }),
    };

     //paginacion del capitulo
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

    //funcion para abrir modal de registrar capitulo
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Capitulo');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del capitulo
     self.limpiar=function(){     
         
        self.capituloVO.id(0);
        self.capituloVO.nombre('');
        self.capituloVO.orden(''); 
     }


    //funcion guardar y actualizar los capitulos
     self.guardar=function(){

        if (CapituloViewModel.errores_capitulo().length == 0) {//se activa las validaciones

            if(self.capituloVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Capitulo/',//url api
                     parametros:self.capituloVO                        
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
                       url:path_principal+'/api/Capitulo/'+self.capituloVO.id()+'/',
                       parametros:self.capituloVO                        
                  };

                  Request(parametros);

            }

        } else {
             CapituloViewModel.errores_capitulo.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los capitulos
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

           self.filtro($('#txtBuscar').val());

           path = path_principal+'/api/Capitulo?format=json';
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


    //consultar por id de los capitulo
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Capitulo/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Capitulos');

            self.capituloVO.id(datos.id);
            self.capituloVO.nombre(datos.nombre);
            self.capituloVO.orden(datos.orden);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar las capitulos
    self.eliminar = function () {}


    //exportar excel la tabla del listado de los capitulos
   self.exportar_excel=function(){

         location.href=path_principal+"/capitulo/exportar_capitulo/";
     } 

}

var capitulo = new CapituloViewModel();
ApoyoViewModel.errores_capitulo= ko.validation.group(capitulo.capituloVO);
ko.applyBindings(capitulo);
