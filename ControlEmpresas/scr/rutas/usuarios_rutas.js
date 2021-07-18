'use strict'

var express = require("express");
var empresasControlador = require("../controladores/admin_controlador");

var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();
api.post('/login', empresasControlador.login);
api.post('/registrarEmpresa',md_autorizacion.ensureAuth, empresasControlador.registrarEmpresa);
api.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, empresasControlador.editarEmpresa);
api.delete('/eliminarEmpresa/:id', md_autorizacion.ensureAuth, empresasControlador.eliminarEmpresa);

module.exports = api;