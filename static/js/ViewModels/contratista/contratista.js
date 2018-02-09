
function ContratistaViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
  

     //Representa un modelo del contratista
    self.contratistaVO={
        id:ko.observable(0),
        rnc:ko.observable('').extend({ required: { message: '(*)Digite el rnc' } }),
        nombre:ko.observable('').extend({ required: { message: '(*)Digite el nombre' } }),
        activo:ko.observable(0),
    };

     //paginacion del contratista
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

    //funcion para abrir modal de registrar contratista
    self.abrir_modal = function () {
        self.limpiar();
        self.titulo('Registrar Contratista');
        $('#modal_acciones').modal('show');
    }


     //limpiar el modelo del contratista
     self.limpiar=function(){     
         
        self.contratistaVO.id(0);
        self.contratistaVO.rnc('');
        self.contratistaVO.nombre(''); 
     }


    //funcion guardar y actualizar los contratista
     self.guardar=function(){

        if (ContratistaViewModel.errores_contratista().length == 0) {//se activa las validaciones

            if(self.contratistaVO.id()==0){

                self.contratistaVO.activo(true);

                var parametros={                     
                     callback:function(datos, estado, mensaje){

                        if (estado=='ok') {
                            self.filtro("");
                            self.limpiar();
                            self.consultar(self.paginacion.pagina_actual());
                            $('#modal_acciones').modal('hide');
                        }                        
                        
                     },//funcion para recibir la respuesta 
                     url:path_principal+'/api/Contratista/',//url api
                     parametros:self.contratistaVO                        
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
                       url:path_principal+'/api/Contratista/'+self.contratistaVO.id()+'/',
                       parametros:self.contratistaVO                        
                  };

                  Request(parametros);

            }

        } else {
             ContratistaViewModel.errores_contratista.showAllMessages();//mostramos las validacion
        } 
     }


    //funcion consultar los contratista
    self.consultar = function (pagina) {
        
        if (pagina > 0) {            

            self.filtro($('#txtBuscar').val());

           path = path_principal+'/api/Contratista?format=json';
            parameter = { dato: self.filtro(), page: pagina, activo:true};
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


    //consultar por id de los contratista
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Contratista/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Contratista');

            self.contratistaVO.id(datos.id);
            self.contratistaVO.rnc(datos.rnc);
            self.contratistaVO.nombre(datos.nombre);
            self.contratistaVO.activo(datos.activo);
        
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar los contratista
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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione los contratistas a eliminar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
        });

        }else{
          var path =path_principal+'/contratista/desactivar_contratista/';
          var parameter = { lista: lista_id };
          RequestAnularOEliminar("Esta seguro que desea eliminar los contratistas seleccionados?", path, parameter, function () {
            self.consultar(1);
            self.checkall(false);
          })

        }     
    
    }


    //exportar excel la tabla del listado de los contratista
    self.exportar_excel=function(){

         location.href=path_principal+"/contratista/exportar_contratista/";
    } 

}

var contratista = new ContratistaViewModel();
ContratistaViewModel.errores_contratista= ko.validation.group(contratista.contratistaVO);
ko.applyBindings(contratista);
