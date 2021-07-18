'use strict'

const bcrypt = require("bcrypt-nodejs");
const Empresa = require("../modelos/modelo_empresas");
const Usuario = require("../modelos/modelo_usuarios");
const jwt = require("../servicios/jwt");

function login(req, res) {
    var params = req.body;
    Usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (usuarioEncontrado) {
            bcrypt.compare(params.contraseña, usuarioEncontrado.contraseña, (err, contraVerificada) => {
                if (contraVerificada) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        })
                    } else {
                        usuarioEncontrado.contraseña= undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'El usuario no se a podido identificar' });
                }
            })
        } else {
            return res.status(500).send({ mensaje: 'Error al buscar el usuario' });
        }
    })
}

function registrarEmpresa(req,res){
    if (req.user.rol === "ROL_ADMIN"){
        var empresa = new Empresa();
    var params = req.body;

    if(params.nombre && params.contraseña){
        empresa.nombre = params.nombre;
        empresa.contraseña = params.contraseña;
        empresa.direccion = params.direccion;
        empresa.telefono = params.telefono;
        empresa.rol = "ROL_EMPRESA"
        empresa.empleados = [];

        Empresa.find({nombreEmpresa:empresa.nombreEmpresa}).exec((err, empresaEncontrada)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la solicitud de empresa'});

            if(empresaEncontrada && empresaEncontrada.length >=1){
                return res.status(200).send({mensaje:'Esta empresa ya existe'});
            }else{
                bcrypt.hash(params.contraseña, null, null, (err, claveEncriptada)=>{
                    empresa.contraseña = claveEncriptada;

                    empresa.save((err, empresaGuardada)=>{
                        if(err) return res.status(500).send({mensaje: 'Error al guardar la Empresa'});

                        if (empresaGuardada){
                           return res.status(200).send(empresaGuardada);
                        }else{
                           return res.status(404).send({ mensaje: 'No se ha podido registrar la Empresa'});
                        }
                    })
                })
            }
        })
    }
    }else{
        return res.status(404).send({ mensaje: 'No tiene permiso para realizar esta acción'});
    }
    
}

function editarEmpresa(req, res) {
    if (req.user.rol === "ROL_ADMIN"){
    var idEmpresa = req.params.id;
    var params = req.body;

    delete params.contraseña;
    
    Empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err, empresaActualizada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empresaActualizada) return res.status(500).send({ mensaje: 'No se a podido editar la Empresa' });

        return res.status(200).send({ empresaActualizada })
    })
}
  
}

function eliminarEmpresa(req, res){
    if (req.user.rol === "ROL_ADMIN"){
    var idEmpresa = req.params.id;

    Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada) =>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
        if(!empresaEliminada) return res.status(500).send({mensaje:"No se ha eliminado la empresa"});

        return res.status(200).send({mensaje: "empresa Eliminada"});
    })
    }
}


module.exports = {
    login,
    registrarEmpresa,
    editarEmpresa,
    eliminarEmpresa
}