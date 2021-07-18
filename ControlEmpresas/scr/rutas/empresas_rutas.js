'use strict'

var express = require("express");
var empresasControlador = require("../controladores/empresas_controlador");

var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();
api.get('/pdfEmpleados/:id',md_autorizacion.ensureAuth, empresasControlador.pdfEmpleados);
api.post('/loginEmpresas', empresasControlador.loginEmpresas);
api.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, empresasControlador.editarEmpresa);
api.delete('/elimimarEmpresa/:id', md_autorizacion.ensureAuth, empresasControlador.eliminarEmpresa);
api.put('/agregarEmpleado/:id', md_autorizacion.ensureAuth, empresasControlador.agregarEmpleado);
api.put('/actualizarEmpleado/:/:_id', md_autorizacion.ensureAuth, empresasControlador.actualizarEmpleados);
api.delete('/eliminarEmpleado/:id/:_id', md_autorizacion.ensureAuth, empresasControlador.eliminarEmpleados);


api.get('/obtenerEmpleadoId/:id',md_autorizacion.ensureAuth, empresasControlador.obtenerEmpleadoId);
api.get('/listarEmpleados/:id', md_autorizacion.ensureAuth,  empresasControlador.listarEmpleados);
api.get('/obtenerEmpleadoNombre/:id', md_autorizacion.ensureAuth, empresasControlador.obtenerEmpleadoNombre);
api.get('/obtenerEmpleadoPuesto/:id', md_autorizacion.ensureAuth, empresasControlador.obtenerEmpleadoPuesto);
api.get('/obtenerEmpleadoDepartamento/:id', md_autorizacion.ensureAuth, empresasControlador.obtenerEmpleadoDepartamento);

module.exports = api;