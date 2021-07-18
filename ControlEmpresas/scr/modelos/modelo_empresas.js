'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    nombre: String,
    contraseña: String,
    direccion: String,
    telefono: String,
    rol: String,
    empleados: [{
        nombreEmpleado: String,
        puesto: String,
        departamento: String,
        activo: Boolean
    }]
});

module.exports = mongoose.model('empresas', EmpresaSchema);