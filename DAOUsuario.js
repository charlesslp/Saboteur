"use strict";

var mysql = require("mysql");


var config = require("./config");

var pool = mysql.createPool({
    host:  config.dbHost,
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});


module.exports.buscarUsuario = function(alias, contraseña, callback){
	if (callback === undefined) callback = function() {};


	pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT * ' + 
                            'FROM usuario WHERE Alias = ? and Contraseña = ?', [alias, contraseña],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                    	if(result.length === 0){
                    		callback(null);
                    	}
                    	else{
	                        var row = result[0];
				            var res = { id: row.Id, alias: row.Alias, nombre: row.Nombre, Fecha: row.Fecha, contraseña: row.Contraseña, sexo: row.Sexo};
				            
				            callback(null, res);
				        }
                    }
                });            
        }
	});

}


module.exports.crearUsuario = function(usuario, callback){
	if (callback === undefined) callback = function() {};

	
    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT id ' + 
                            'FROM usuario WHERE Alias = ?', [usuario.alias],
                function(err, result) {
                    if (err){conexion.release();
                                    callback(err);}
                    else {
                    	if(result.length !== 0){
                            conexion.release();
                    		callback(null);
                    	}
                    	else{

                    		if(usuario.fecha.length === 0)
                    			usuario.fecha = null;

				            conexion.query('INSERT INTO `usuario` (`Alias`, `Nombre`, `Fecha`, `Contraseña`, `Sexo`, `Foto`)' +
				            	'VALUES (?, ?, ?, ?, ?, ?);',
					            [usuario.alias, usuario.nombre_completo, usuario.fecha, usuario.contraseña, usuario.sex, usuario.foto],
					            function(err, result) {
                                    conexion.release();
					            	if (err) callback(err);
                    				else {
							            callback(null, result.insertId);
                    				}
                    			});


				        }
                    }
                });            
        }
	});
}


module.exports.buscarAlias = function(id, callback){
    if (callback === undefined) callback = function() {};

   
    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT Alias ' + 
                            'FROM usuario WHERE Id = ?', [id],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, result[0].Alias);
                        }
                    }
                });            
        }
    });

}


module.exports.buscarIdPorAlias = function(alias, callback){
    if (callback === undefined) callback = function() {};

    
    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT Id ' + 
                            'FROM usuario WHERE Alias = ?', [alias],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, result[0].Id);
                        }
                    }
                });            
        }
    });

}



module.exports.buscarRoles = function(id, callback){
    if (callback === undefined) callback = function() {};

    
    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT * ' + 
                            'FROM `usuario-partida` WHERE usuario = ?', [id],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, result);
                        }
                    }
                });            
        }
    });

}
