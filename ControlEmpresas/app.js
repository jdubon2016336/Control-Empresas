'use strict'

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const empresas_rutas = require('./scr/rutas/empresas_rutas');
const usuarios_rutas = require('./scr/rutas/usuarios_rutas');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use('/api', empresas_rutas,usuarios_rutas)

module.exports = app