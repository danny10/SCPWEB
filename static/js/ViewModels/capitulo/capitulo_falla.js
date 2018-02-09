
function CapituloFallaViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo del capitulo falla
    self.capitulo_fallaVO={
        id:ko.observable(0),
        descripcion:ko.observable('').extend({ required: { message: '(*)Digite la descripcion' } }),
        capitulo_id:ko.observable(0).extend({ required: { message: '(*)Seleccione el capitulo' } }),
        orden:ko.observable('').extend({ required: { message: '(*)Digite el orden' } }),
    };

     //paginacion del capitulo falla
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

    //funcion para abrir modal de registrar capitulo falla
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Capitulo Falla');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del capitulo falla
     self.limpiar=function(){     
         
        self.capitulo_fallaVO.id(0);
        self.capitulo_fallaVO.descripcion('');
        self.capitulo_fallaVO.capitulo_id(0); 
        self.capitulo_fallaVO.orden('');

        self.capitulo_fallaVO.capitulo.isModified(false);  
     }


    //funcion guardar y actualizar los capitulos falla
     self.guardar=function(){

        if (CapituloFallaViewModel.errores_capitulo_falla().length == 0) {//se activa las validaciones

            if(self.capitulo_fallaVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Capitulo_falla/',//url api
                     parametros:self.capitulo_fallaVO                        
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
                       url:path_principal+'/api/Capitulo_falla/'+self.capitulo_fallaVO.id()+'/',
                       parametros:self.capitulo_fallaVO                        
                  };

                  Request(parametros);

            }

        } else {
             CapituloFallaViewModel.errores_capitulo_falla.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los capitulos falla
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

           self.filtro($('#txtBuscar').val());
           var capitulo=self.capitulo_fallaVO.capitulo_id();

           path = path_principal+'/api/Capitulo_falla?format=json';
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


    //consultar por id de los capitulo falla
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Capitulo_falla/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Capitulos Falla');

            self.capitulo_fallaVO.id(datos.id);
            self.capitulo_fallaVO.descripcion(datos.descripcion);
            self.capitulo_fallaVO.capitulo_id(datos.capitulo.id);
            self.capitulo_fallaVO.orden(datos.orden);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar las capitulos falla
    self.eliminar = function () {}


    //exportar excel la tabla del listado de los capitulos falla
   self.exportar_excel=function(){

         location.href=path_principal+"/capitulo/exportar_capitulo_falla/";
     } 

}

var capitulo_falla = new CapituloFallaViewModel();
ApoyoViewModel.errores_capitulo_falla= ko.validation.group(capitulo_falla.capitulo_fallaVO);
ko.applyBindings(capitulo_falla);
