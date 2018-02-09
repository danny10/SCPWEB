
function InspeccionViewModel() {
    
    var self = this;
    self.listado=ko.observableArray([]);
    self.mensaje=ko.observable('');
    self.titulo=ko.observable('');
    self.filtro=ko.observable('');
    self.checkall=ko.observable(false);

    self.nombre_circuito=ko.observable('');
    self.nombre_lote=ko.observable('');
    self.nombre_poligono=ko.observable('');
    self.nombre_sector=ko.observable('');
    self.nombre_apoyo=ko.observable('');
    self.fecha_inspeccion=ko.observable('');
    self.inspeccion_numero=ko.observable('');

    self.circuito_filtro=ko.observable('');
    self.lote_filtro=ko.observable('');
    self.poligono_filtro=ko.observable('');
    self.sector_filtro=ko.observable('');
    self.apoyo_filtro=ko.observable('');

  

         //funcion para seleccionar los datos a eliminar
    self.checkall.subscribe(function(value ){

        ko.utils.arrayForEach(self.listado(), function(d) {

            d.procesado(value);
        }); 
    });


     //paginacion de las inpecciones
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


    //funcion para ver mas detalle d la inspeccion
    self.ver_mas_detalle = function (obj) {
        self.titulo('Detalle de la inspeccion');
        self.ver_mas_inspeccion(obj);
        $('#vermas_inspeccion').modal('show');
    }


        //funcion para filtrar las inspecciones
    self.filtrar_inspeccion = function () {
        self.titulo('Filtrar inspeccion');
        $('#modal_filtro_inspeccion').modal('show');
    }


    //funcion consultar las inspeccion
    self.consultar = function (pagina) {
        
        if (pagina > 0) {      

           self.filtro($('#txtBuscar').val());
           var circuito=self.circuito_filtro()
           var lote=self.lote_filtro();
           var poligono=self.poligono_filtro();
           var sector=self.sector_filtro();
           var apoyo=self.apoyo_filtro();

           path = path_principal+'/api/Inspeccion?format=json';
            parameter = { dato: self.filtro(), page: pagina,activo:true,
              id_circuito:circuito,id_lote:lote,id_poligono:poligono,id_sector:sector,id_apoyo:apoyo};
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


    //consultar por id de las inpecciones
    self.consultar_por_id = function (obj) {
       
       path =path_principal+'/api/Inspeccion/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
           
            self.titulo('Actualizar Inspecciones');

            self.inspeccionVO.id(datos.id);
            self.inspeccionVO.numero_inspeccion(datos.numero_inspeccion);
            self.inspeccionVO.circuito_id(datos.circuito.id);
            self.inspeccionVO.lote_id(datos.lote.id);
            self.inspeccionVO.poligono_id(datos.poligono.id);
            self.inspeccionVO.sector_id(datos.sector.id);
            self.inspeccionVO.apoyo_id(datos.apoyo.id);
            self.inspeccionVO.usuario_id(datos.usuario.id);
            self.inspeccionVO.fecha(datos.fecha);
            self.inspeccionVO.activo(datos.activo);
           
            $('#modal_acciones').modal('show');

         }, path, parameter);

     }

   
    //eliminar las inspecciones
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
                content: '<h4><i class="text-info fa fa-info-circle fa-2x"></i>Seleccione las inspecciones a desactivar.<h4>',
                cancelButton: 'Cerrar',
                confirmButton: false
        });

        }else{
          var path =path_principal+'/inspeccion/inactivo_inspeccion/';
          var parameter = { lista: lista_id };
          RequestAnularOEliminar("Esta seguro que desea desactivar las inspecciones seleccionadas?", path, parameter, function () {
            self.consultar(1);
            self.checkall(false);
          })

        }     

    }


    //exportar excel la tabla del listado de las inspecciones
   self.exportar_excel=function(){ }



    //trae los datos para la opcion ver mas de la inpeccion
    self.ver_mas_inspeccion=function(obj){
        
         path =path_principal+'/api/Inspeccion/'+obj.id+'/?format=json';
         RequestGet(function (datos, estado, mensaje) {
            
            self.nombre_circuito(datos.circuito.nombre);
            self.nombre_lote(datos.lote.nombre);
            self.nombre_poligono(datos.poligono.nombre);
            self.nombre_sector(datos.sector.nombre);
            self.nombre_apoyo(datos.apoyo.nombre);
            self.fecha_inspeccion(datos.fecha);
            self.inspeccion_numero(datos.numero_inspeccion);

         }, path, parameter);

    }


}

var inspeccion = new InspeccionViewModel();
ko.applyBindings(inspeccion);
