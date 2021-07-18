'use strict'

var jwt = require('jwt-simple');
var moment = require('moment')
var secret = 'clave_token';

exports.createToken = function(validar){
    var payload = {
        sub: validar._id,
        nombre: validar.nombre,
        contraseña: validar.contraseña,
        rol: validar.rol,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix()
    }

    return jwt.encode(payload,secret);
}
