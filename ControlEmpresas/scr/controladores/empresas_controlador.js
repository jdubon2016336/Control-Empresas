'use strict'

const bcrypt = require("bcrypt-nodejs");
const Empresa = require("../modelos/modelo_empresas");
const Usuario = require("../modelos/modelo_usuarios");
const jwt = require("../servicios/jwt");

const pdf = require("pdfkit");
const fs  = require("fs");
var datos;

function pdfEmpleados(req, res) {
    var params = req.body;

    if (req.user.rol === "ROL_ADMIN") return res.status(500).send({mensaje:"solo las empresas pueden generar PDF"});

    if(params.nombre === req.user.nombre){
        var idEmpresa = req.params.id;
        
        Empresa.find({_id: idEmpresa } ,{"empleados":1},(err, empleadosEncontrados)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de empleados'});
            if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener de empleados' });
    
    
           datos = empleadosEncontrados;
            var doc = new pdf();
            doc.pipe(fs.createWriteStream(`./scr/pdf/empleados ${req.user.nombre}.pdf`));

            doc.text(`Nuestros empleados son:`,{
                align: 'center',
            })

            doc.text(datos,{
                align: 'left'
            });

            doc.end();
            return res.status(200).send({mensaje: "PDF generado"});
        })
        
    }
}


function loginEmpresas(req, res) {
    var params = req.body;
    Empresa.findOne({ nombre: params.nombre }, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (empresaEncontrada) {
            bcrypt.compare(params.contraseña, empresaEncontrada.contraseña, (err, contraVerificada) => {
                if (contraVerificada) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(empresaEncontrada)
                        })
                    } else {
                        empresaEncontrada.claveEmpresa= undefined;
                        return res.status(200).send({ empresaEncontrada });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'La empresa no se ha podido identificar' });
                }
            })
        } else {
            return res.status(500).send({ mensaje: 'Error al buscar el usuario' });
        }
    })
}

function editarEmpresa(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;

    delete params.contraseña;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }
    
    Empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err, empresaActualizada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empresaActualizada) return res.status(500).send({ mensaje: 'No se a podido editar la empresa' });

        return res.status(200).send({ empresaActualizada })
    })
  
}

function eliminarEmpresa(req, res){
    var idEmpresa = req.params.id;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para eliminar esa Empresa' });
    }

    Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada) =>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
        if(!empresaEliminada) return res.status(500).send({mensaje:"No se ha eliminado la empresa"});

        return res.status(200).send({mensaje: "empresa Eliminada"});
    })

}

function agregarEmpleado(req, res){
    var idEmpresa = req.params.id;
    var params = req.body;

    delete params.contraseña;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar empleados a esa Empresa' });
    }
    
    Empresa.findByIdAndUpdate(idEmpresa, 
       {$push: {
        empleados: {
            nombreEmpleado: params.nombreEmpleado,
            puesto: params.puesto,
            departamento: params.departamento,
            activo: params.activo,
        }
    }}, { new: true }, (err, empleadoAgregado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empleadoAgregado) return res.status(500).send({ mensaje: 'No se a podido agregar el empleado' });

        return res.status(200).send({ empleadoAgregado })
    })
}


function actualizarEmpleados(req, res) {
    var idEmpresa = req.params.id;
    var idEmpleado = req.params._id ;
    var params = req.body;

    delete params.contraseña;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

     var datosPorActualizar = {}; 
  
    if(params.nombreEmpleado) datosPorActualizar['empleados.$.nombreEmpleado'] = params.nombreEmpleado;
    if(params.puesto) datosPorActualizar['empleados.$.puesto'] = params.puesto;
    if(params.departmento) datosPorActualizar['empleados.$.departmento'] = params.departmento;
    if(params.activo) datosPorActualizar['empleados.$.activo'] = params.activo;

    Empresa.findOneAndUpdate({_id: idEmpresa, "empleados._id": idEmpleado}, datosPorActualizar,{new: true},

    (err, empleadoActualizado) => {
    
        if(err) return  res.status(500).send({ message: 'Error en la peticion' })
        if(!empleadoActualizado)  return res.status(500).send({ message: 'Error al guardar empleado' })
    
        return res.status(200).send({ empleadoActualizado })
    })

}

function eliminarEmpleados(req, res) {
    var idEmpresa = req.params.id;
    var idEmpleado = req.params._id ;
    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

    Empresa.findOneAndUpdate({
        _id: idEmpresa,
        "empleados._id": idEmpleado
    }, {
        $pull: { empleados: {  _id: idEmpleado}
        }
    }, (err, empleadoEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empleadoEliminado) return res.status(500).send({ mensaje: 'No se a podido agregar el empleado' });
    
        return res.status(200).send({ mensaje: "Empleado eliminado" })
    
    })

}


function obtenerEmpleadoId(req, res) {
    var idEmpleado = req.params.id;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

    Empresa.findOne({ "empleados._id": idEmpleado }, { "empleados.$": 1} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de Empleados'});
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleados' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

function listarEmpleados(req, res) {
    var idEmpresa = req.params.id;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

    Empresa.find({_id: idEmpresa } ,{"empleados":1},(err, empleadosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de empleados'});
        if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener de empleados' });

        return res.status(200).send({ empleadosEncontrados });
    })

}

function cantidadEmpleados(req, res) {
    var idEmpresa = req.params.id;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

    Empresa.find({_id: idEmpresa } ,{"empleados":1},(err, empleadosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de empleados'});
        if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener de empleados' });

        return res.status(200).send({ empleadosEncontrados });
    })

}

function obtenerEmpresas(req, res){
    Usuario.find().exec((err, empresas)=>{
        if(err) return res.status(500).send({ mensaje:"Error al realizar la solicitud de obtener empresas" });
        if(!empresas) return res.status(500).send({ mensaje:"No se encontraron empresas" });

        return res.status(200).send({ empresas });
    })
}

function obtenerEmpleadoNombre(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.findOne({ "empleados.nombreEmpleado": params.nombreEmpleado }, { "empleados.$": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ empleadoEncontrado });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

function obtenerEmpleadoPuesto(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id;

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.find({ "empleados.$.puesto": params.puesto} , { "empleados": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })
}

function obtenerEmpleadoDepartamento(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.findOne({ "empleados.departamento": params.departamento }, { "empleados.$": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ empleadoEncontrado });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

module.exports = {
    pdfEmpleados,
    loginEmpresas,
    editarEmpresa,
    eliminarEmpresa,
    agregarEmpleado,
    listarEmpleados,
    actualizarEmpleados,
    obtenerEmpresas,
    eliminarEmpleados,
    obtenerEmpleadoId,
    cantidadEmpleados,
    obtenerEmpleadoPuesto,
    obtenerEmpleadoDepartamento,
    obtenerEmpleadoNombre
}