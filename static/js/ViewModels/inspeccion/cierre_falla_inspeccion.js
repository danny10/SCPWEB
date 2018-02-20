
function CierreFallaInspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);
    self.tabIndex=ko.observable(1);
    self.tabIndex2=ko.observable(1);
    self.nombreBoton=ko.observable('Seguiente');
    self.obj_falla={};
    self.foto=ko.observable('');

    self.id_inspeccion_consulta=ko.observable('');

     //Representa un modelo de los cierres fallas inspeccion
    self.cierre_falla_inspeccionVO={
        id:ko.observable(0),
        fecha:ko.observable('').extend({ required: { message: '(*)Digite la fecha' } }),
        observaciones:ko.observable('').extend({ required: { message: '(*)Digite la observacion' } }),
        falla_inspeccion_id:ko.observable(0),
        soporte:ko.observable(''),
        capitulos: ko.observableArray([]) 

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


     //limpiar el modelo de las fallas inspecciones
     self.limpiar=function(){     
         
        self.cierre_falla_inspeccionVO.id(0);
        self.cierre_falla_inspeccionVO.fecha('');
        self.cierre_falla_inspeccionVO.observaciones(''); 
        self.cierre_falla_inspeccionVO.soporte('');
        
        $('#archivo').fileinput('reset');
        $('#archivo').val(''); 
     }


    //funcion para el siguiente de las vistas parciales
    self.vistas_parciales = function () {      
           
      if(self.tabIndex()<parseInt($('#hdCantidad').val())){

          //valida la primera vista parcial
          if(self.tabIndex()==0){

              if (CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion().length == 0) {
                  
              } else {
                  CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion.showAllMessages();
                  return false;
              }          

          }


        self.tabIndex(self.tabIndex()+1);
        self.tabIndex2(self.tabIndex2()+1);
        self.nombreBoton('Siguiente');

      }


      if (self.nombreBoton()=='Finalizar') {
        //alert(414554)
        //console.log(ko.toJS(self.inspeccionVO));
        //self.guardar_inspeccion_todo();
      }

      if(self.tabIndex()>=parseInt($('#hdCantidad').val())){

        self.nombreBoton('Finalizar');

      }

    }

    //funcion para el atras de las vistas parciales
    self.atras_vistas_parciales = function () {      
      
        if (self.tabIndex()>0) {
          self.tabIndex(self.tabIndex()-1);
          self.tabIndex2(self.tabIndex2()-1);
        }
        self.nombreBoton('Seguiente');

    } 


    //guarda el cierre de la inspeccion
    self.guardar_cerrar_nc=function(id_falla_inspeccion_id,capitulo_falla){

      var data = new FormData();
      var cont=0;

      var id_falla=$("#id_falla").val();


      data.append('lista',ko.toJSON(self.cierre_falla_inspeccionVO));

        ko.utils.arrayForEach(self.cierre_falla_inspeccionVO.capitulos(), function(item){

          ko.utils.arrayForEach(item.fallas(), function(fall){

              data.append('soporte_', fall.soporte());
              //data.append('soporte_' + fall.capitulo_falla_id(), fall.soporte());

              if(id_falla_inspeccion_id==fall.falla_inspeccion_id()){

                  if (fall.fecha()=='' || fall.observaciones()=='' || fall.soporte()==''){

                    cont=1
                  }


              }

          });

        });


        if (cont==1){

          $.confirm({
            title:'Informativo',
            content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Digite los campos obligatorios.<h4>',
            cancelButton: 'Cerrar',
            confirmButton: false
          });

          return false
        }


      var parametros={                     
        callback:function(datos, estado, mensaje){

          if (estado=='ok') {
              self.consultar_capitulo_falla()
          }                        
                          
        },//funcion para recibir la respuesta 
        url:path_principal+'/inspeccion/guardar_cierreInspeccion/',//url api
        parametros:data                        
      };
      RequestFormData2(parametros);

    }


    //funcion para traer el listado de la vista armada en la vista
    self.consultar_capitulo_falla = function () {
        
        path = path_principal+'/inspeccion/cierre_falla/?format=json';
        parameter = { id_inspeccion:self.id_inspeccion_consulta()};
        RequestGet(function (datos, estado, mensage) {

            if (estado == 'ok') {

              self.cierre_falla_inspeccionVO.id(datos.id);
              self.cierre_falla_inspeccionVO.falla_inspeccion_id(datos.falla_inspeccion_id);
              self.cierre_falla_inspeccionVO.fecha(datos.fecha);
              self.cierre_falla_inspeccionVO.observaciones(datos.observaciones);
              self.cierre_falla_inspeccionVO.capitulos(convertToObservableArray(datos.capitulos));

              cerrarLoading();
              
            } else {
                cerrarLoading();

            }

        }, path, parameter);
    }


}

var cierre_falla_inspeccion = new CierreFallaInspeccionViewModel();
CierreFallaInspeccionViewModel.errores_cierre_falla_inspeccion= ko.validation.group(cierre_falla_inspeccion.cierre_falla_inspeccionVO);
ko.applyBindings(cierre_falla_inspeccion);
