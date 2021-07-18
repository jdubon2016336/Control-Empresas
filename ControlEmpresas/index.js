'use strict'

const mongoose = require("mongoose");
const Usuario = require('./scr/modelos/modelo_usuarios');
const bcrypt = require("bcrypt-nodejs");
const app = require('./app')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ControlEmpresas', {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
    console.log('Esta conectado a la base de datos');

    var nombre = 'Admin';
    var username = 'Admin';
    var contraseña = '123456';
    var rol = 'ROL_ADMIN';
    var usuario = new Usuario();

    usuario.nombre = nombre;
    usuario.contraseña = contraseña;
    usuario.rol = rol;


    Usuario.find({nombreUsuario: usuario.nombreUsuario}).exec((err, usuarioEncontrado)=>{
        if(usuarioEncontrado && usuarioEncontrado.length >=1){
            console.log('Este usuario ya existe'); 
        }else{
            bcrypt.hash(usuario.contraseña, null, null, (err, contraseñaEncriptada)=>{
                usuario.contraseña = contraseñaEncriptada;
                
                usuario.save((err, usuarioGuardado)=>{
                    if(err)  console.log('Error en la solicitud de guardado');
                    
                    if (usuarioGuardado){
                          console.log({usuarioGuardado});
                    }else{
                          console.log('No se ha guardado el usuario');
                        }
                })
                }) 
        }
        
    })
    app.listen(3000,function(){
        console.log('La aplicacion esta corriendo en el puerto 3000');
    })     
}).catch(err => console.log(err))