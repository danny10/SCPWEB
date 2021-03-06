
function SucursalViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo del sucursal
    self.sucursalVO={
        id:ko.observable(0),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        activo:ko.observable(0),
    };

     //paginacion del sucursal
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

    //funcion para abrir modal de registrar sucursal
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Sucursal');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del sucursal
     self.limpiar=function(){     
         
        self.sucursalVO.id(0);
        self.sucursalVO.nombre(''); 
     }


    //funcion guardar y actualizar los sucursal
     self.guardar=function(){

        if (SucursalViewModel.errores_sucursal().length == 0) {//se activa las validaciones

            if(self.sucursalVO.id()==0){

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Sucursal/',//url api
                     parametros:self.sucursalVO                        
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
                       url:path_principal+'/api/Sucursal/'+self.sucursalVO.id()+'/',
                       parametros:self.sucursalVO                        
                  };

                  Request(parametros);

            }

        } else {
             SucursalViewModel.errores_sucursal.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los sucursal
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

            self.filtro($('#txtBuscar').val());

           path = path_principal+'/api/Sucursal?format=json';
            parameter = { dato: self.filtro(), page: pagina, activo:1};
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


    //consultar por id de los sucursal
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Sucursal/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Sucursal');

            self.sucursalVO.id(datos.id);
            self.sucursalVO.nombre(datos.nombre);
            self.sucursalVO.activo(datos.activo);
        
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar los sucursal
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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione las sucursales a desactivar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
        });

        }else{
          var path =path_principal+'/sucursal/desactivar_sucursal/';
          var parameter = { lista: lista_id };
          RequestAnularOEliminar("Esta seguro que desea desactivar las sucursales seleccionadas?", path, parameter, function () {
            self.consultar(1);
            self.checkall(false);
          })

        }     
    
    }


    //exportar excel la tabla del listado de los sucursal
    self.exportar_excel=function(){

         location.href=path_principal+"/sucursal/exportar_sucursal/";
    } 

}

var sucursal = new SucursalViewModel();
SucursalViewModel.errores_sucursal= ko.validation.group(sucursal.sucursalVO);
ko.applyBindings(sucursal);
