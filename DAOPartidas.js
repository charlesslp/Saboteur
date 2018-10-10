"use strict";

var mysql = require("mysql");


var config = require("./config");

var pool = mysql.createPool({
    host:  config.dbHost,
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});



module.exports.crearPartida = function(partida, callback){
	if (callback === undefined) callback = function() {};

	//var conexion = mysql.createConnection(datosBD);
	var idUsuario, idPartida;
    pool.getConnection(function(err, conexion){
	//conexion.connect(function(err){
		if (err) callback(err);
        else {

            conexion.query('INSERT INTO `partidas` (`Nombre`, `UsuarioCreador`, `Fecha`, `Empezada`, `Jugadores`, `Turno`, `ganador`, jugadoresActuales, jugadoresApuntados, turnosrestantes)' +
            	'VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL);',
	            [partida.nombrePartida, partida.usuarioCreador, partida.fecha, 0, partida.jugadores, 1, partida.jugadoresApuntados],
	            function(err, result) {
	            	if (err){conexion.release();
                                    callback(err);
                                }
    				else {

    					idPartida = result.insertId;

						 conexion.query('SELECT id ' + 
                            'FROM usuario WHERE Alias = ?', [partida.usuarioCreador],
				            function(err, result) {
				            	if (err){conexion.release();
                                    callback(err);}
			    				else {

	                        		idUsuario = result[0].id;

			    					conexion.query('INSERT INTO `usuario-partida` (`Partida`, `Usuario`, `rolbuscador`, pico)' +
			    						'VALUES (?, ?, ?, ?);',
			    						[idPartida, idUsuario, 1, 1],
							            function(err, result) {
                                            conexion.release();
							            	if (err) callback(err);
						    				else {
                                                
									            callback(null);
						    				}
						    			});
			    				}
			    			});
    				}
    			});


				              
        }
	});
}



module.exports.buscarPartidasAbiertasUsuario = function(id, alias, callback){
	if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
		
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT * FROM `partidas` INNER JOIN `usuario-partida` UP ON partidas.id = UP.partida where turno is null and usuarioCreador = ? and UP.usuario = ?', [alias, id],
                function(err, result) {
                    conexion.release();
                    if (err) {console.log(err);
                        callback(err);
                    }
                    else {
                    	if(result.length === 0){
                    		callback(null, []);
                    	}
                    	else{
                    		var i = 0;
                    		var res = [];
							result.forEach(function(row){
								var part = { id: row.Id, nombrePartida: row.Nombre, usuarioCreador: row.UsuarioCreador, fecha: row.Fecha, empezada: row.Empezada,
									jugadores: row.Jugadores, turno: row.Turno, ganador: row.ganador, jugadoresActuales: row.jugadoresActuales,
                                    jugadoresApuntados: row.jugadoresApuntados, turnosrestantes: row.turnosrestantes};

								res[i] = part;
								i++;
							});
                            
				            //conexion.end();
				            callback(null, res);
                    	}
                    }
            }); 
        }
  
    });
}


module.exports.buscarPartidasActivas = function(id, callback){
	if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `partidas` INNER JOIN `usuario-partida` UP ON partidas.id = UP.partida where ganador is null and turno is not null and UP.usuario = ?', [id],
                function(err, result) {
                    conexion.release();
                    if (err) {console.log(err);callback(err);}
                    else {
                    	if(result.length === 0){
                    		callback(null, []);
                    	}
                    	else{

                    		var i = 0;
                    		var res = [];
							result.forEach(function(row){
								var part = { id: row.Id, nombrePartida: row.Nombre, usuarioCreador: row.UsuarioCreador, fecha: row.Fecha, empezada: row.Empezada,
									jugadores: row.Jugadores, turno: row.Turno, ganador: row.ganador, jugadoresActuales: row.jugadoresActuales,
                                    jugadoresApuntados: row.jugadoresApuntados, turnosrestantes: row.turnosrestantes};

								res[i] = part;
								i++;
							});
                            
				            callback(null, res);
                    	}
                    }
                });            
        }
    });
}



module.exports.buscarPartidasTerminadas = function(id, callback){
	if (callback === undefined) callback = function() {};

	
    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `partidas` INNER JOIN `usuario-partida` UP ON partidas.id = UP.partida where ganador is not null and UP.usuario = ?', [id],
                function(err, result) {
                conexion.release();
                    if (err) callback(err);
                    else {
                    	if(result.length === 0){
                    		callback(null, []);
                    	}
                    	else{

                    		var i = 0;
                    		var res = [];
							result.forEach(function(row){
								var part = { id: row.Id, nombrePartida: row.Nombre, usuarioCreador: row.UsuarioCreador, fecha: row.Fecha, empezada: row.Empezada,
									jugadores: row.Jugadores, turno: row.Turno, ganador: row.ganador, jugadoresActuales: row.jugadoresActuales,
                                    jugadoresApuntados: row.jugadoresApuntados, turnosrestantes: row.turnosrestantes, esGanador: false};

								res[i] = part;
								i++;
							});
                           
				            callback(null, res);
                    	}
                    }
                });            
        }
    });
}



module.exports.buscarPartidasAbiertas = function(id, callback){
	if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `partidas` INNER JOIN `usuario-partida` UP ON partidas.id = UP.partida where turno is null and UP.usuario <> ?', [id],
                function(err, result) {
                    if (err) {conexion.release();
                                    callback(err);}
                    else {
                    	if(result.length === 0){
                            conexion.release();
                    		callback(null, []);
                    	}
                    	else{

                    		var i = 0;
                    		var res = [];
							result.forEach(function(row){
								var part = { id: row.Id, nombrePartida: row.Nombre, usuarioCreador: row.UsuarioCreador, fecha: row.Fecha, empezada: row.Empezada,
									jugadores: row.Jugadores, turno: row.Turno, ganador: row.ganador, jugadoresActuales: row.jugadoresActuales,
                                    jugadoresApuntados: row.jugadoresApuntados, turnosrestantes: row.turnosrestantes};

								res[i] = part;
								i++;
							});

							conexion.query('SELECT * FROM `usuario-partida` WHERE usuario = ?', [id],
			                function(err, result) {
                                conexion.release();
			                    if (err) callback(err);
			                    else {
			                    	if(result.length === 0){
			                    		callback(null, res, undefined);
			                    	}
			                    	else{
			                    		callback(null, res, result);
		                    		}           	
			                    }
			                });
                    	}
                    }
                });            
        }
    });
}



module.exports.unirse = function(usuario, idPartida, callback){
	if (callback === undefined) callback = function() {};

pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('SELECT * FROM partidas WHERE Id = ?', [idPartida],
                function(err, partida) {
                    if (err) {conexion.release();
                                    callback(err);}
                    else {
                    	if(partida.length === 0){
                            conexion.release();
                    		callback(null);
                    	}
                    	else{

                    		var jugadoresActuales = partida[0].jugadoresActuales + 1;
                    		var jugadoresApuntados = partida[0].jugadoresApuntados + ", " + usuario.alias;

                    		conexion.query('UPDATE `partidas` SET `jugadoresActuales` = ?, `jugadoresApuntados` = ? WHERE `partidas`.`Id` = ?;',
                    		[jugadoresActuales, jugadoresApuntados, idPartida],
			                function(err, result) {
			                    if (err){conexion.release();
                                    callback(err);}
			                    else {

		                    		conexion.query('INSERT INTO `usuario-partida` (`Partida`, `Usuario`, `rolbuscador`, pico) VALUES (?, ?, ?, ?);',
		                    		[idPartida, usuario.id, 1, 1],
					                function(err, result) {
					                    if (err) {conexion.release();
                                    callback(err);}
					                    else {


					                    	conexion.query('SELECT Jugadores FROM partidas WHERE Id = ?',
				                    		[idPartida],
							                function(err, result) {
                                                        conexion.release();
							                    if (err) callback(err);
							                    else {
							                    	if(result.length === 0){
							                    		callback(null);
							                    	}
							                    	else{
								                    	var lleno = jugadoresActuales === result[0].Jugadores;
								                    	
							                    		callback(null, result, lleno, idPartida, jugadoresActuales);
							                    	}			                    	
							                    }
								            		
					                		});				                    	
					                    }
					                });							            
			                    }
			                });    
				            
                    	}
                    }
                });            
        }
    });
}




module.exports.buscarUsuariosPartida = function(idPartida, callback){
	if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        conexion.release();
		if (err) callback(err);
        else {
            conexion.query('SELECT usuario FROM `usuario-partida` WHERE partida = ?', [idPartida],
                function(err, usuarios) {
                    if (err) callback(err);
                    else {
                    	if(usuarios.length === 0){
                    		callback(null);
                    	}
                    	else{
	                		callback(null, usuarios);
                    	}
                    }
                });            
        }
    });
}


module.exports.listaUsuariosPartida = function(idPartida, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        conexion.release();
        if (err) callback(err);
        else {
            conexion.query('SELECT id, alias, pico FROM `usuario` INNER JOIN `usuario-partida` ON id=usuario and partida = ?', [idPartida],
                function(err, usuarios) {
                    if (err) callback(err);
                    else {
                        if(usuarios.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, usuarios);
                        }
                    }
                });            
        }
    });
}





module.exports.saboteador1 = function(idUsuario, idPartida, callback){
	if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('UPDATE `usuario-partida` SET `rolbuscador` = ? WHERE `usuario-partida`.`Partida` = ? AND `usuario-partida`.`Usuario` = ?;', [0, idPartida, idUsuario],
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




module.exports.saboteador2 = function(idUsuario1, idUsuario2, idPartida, callback){
	if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('UPDATE `usuario-partida` SET `rolbuscador` = ? WHERE `usuario-partida`.`Partida` = ? AND `usuario-partida`.`Usuario` = ?;', [0, idPartida, idUsuario1],
                function(err, usuarios) {
                    if (err){conexion.release();
                                    callback(err);}
                    else {
                    	if(usuarios.length === 0){
                            conexion.release();
                    		callback(null);
                    	}
                    	else{

	                		conexion.query('UPDATE `usuario-partida` SET `rolbuscador` = ? WHERE `usuario-partida`.`Partida` = ? AND `usuario-partida`.`Usuario` = ?;', [0, idPartida, idUsuario2],
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
                    }
                });            
        }
    });
}


module.exports.activarPartida = function(idPartida, alias, turnos, callback){
	if (callback === undefined) callback = function() {};

pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {
            conexion.query('UPDATE `partidas` SET `Empezada` = ?, `Turno` = ? , turnosrestantes = ? WHERE `partidas`.`Id` = ?;', [1, alias, turnos, idPartida],
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



module.exports.cambiarTurno = function(idPartida, alias, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            
            conexion.query('SELECT turnosrestantes FROM partidas WHERE Id = ?', [idPartida],
                function(err, turnosrestantes) {
                    if (err) {
                        callback(err);
                        conexion.release();
                    }
                    else {
                        if(turnosrestantes.length === 0){
                            callback(null);
                            conexion.release();
                        }
                        else{

                            var turnos = turnosrestantes[0].turnosrestantes - 1;

                            if(turnos > 0){
                                conexion.query('UPDATE `partidas` SET `Turno` = ?, turnosrestantes = ? WHERE `partidas`.`Id` = ?;', [alias, turnos, idPartida],
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
                            else {
                                conexion.query('UPDATE `partidas` SET turnosrestantes = ?, ganador = ? WHERE `partidas`.`Id` = ?;', [turnos, 0, idPartida],
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
                        }
                    }
                });            
        }
    });
}



module.exports.buscarRol = function(idUsuario, idPartida, callback){
    if (callback === undefined) callback = function() {};

    
    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT rolbuscador ' + 
                            'FROM `usuario-partida` WHERE usuario = ? and partida = ?', [idUsuario, idPartida],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, result[0].rolbuscador);
                        }
                    }
                });            
        }
    });

}


module.exports.ganarPartida = function(idPartida, rolbuscador, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
             conexion.query('UPDATE `partidas` SET ganador = ? WHERE `partidas`.`Id` = ?;', [rolbuscador, idPartida],
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




module.exports.buscarPartidaPorId = function(idPartida, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `partidas` WHERE id = ?', [idPartida],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{

                            var row = result[0];
                            var part = { id: row.Id, nombrePartida: row.Nombre, usuarioCreador: row.UsuarioCreador, fecha: row.Fecha, empezada: row.Empezada,
                                jugadores: row.Jugadores, turno: row.Turno, ganador: row.ganador, jugadoresActuales: row.jugadoresActuales,
                                jugadoresApuntados: row.jugadoresApuntados, turnosrestantes: row.turnosrestantes};

                            callback(null, part);
                        }
                    }
                });            
        }
    });
}


module.exports.escribirComentarios = function(idPartida, idUsuario, descripcion, foto, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT alias, foto FROM usuario WHERE id = ?', [idUsuario],
                function(err, user) {
                    
                    if (err){
                        conexion.release();
                        callback(err);
                    }
                    else {
                        if(user.length === 0){
                            callback(null);
                        }
                        else {
                            console.log(user[0]);
                            conexion.query('INSERT INTO `comentarios` (`idPartida`, `alias`, `descripcion`, `fecha`, `foto`) VALUES (?, ?, ?, ?, ?);', [idPartida, user[0].alias, descripcion, new Date(), user[0].foto],
                                function(err, result) {
                                    conexion.release();
                                    if (err) callback(err);
                                    else {
                                        callback(null);
                                    }
                                });
                        }
                    }
                });            
        }
    });
}


module.exports.buscarComentarios = function(idPartida, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `comentarios` WHERE idPartida = ? ORDER BY fecha', [idPartida],
                function(err, result) {
                    conexion.release();
                    if (err){
                        callback(err);
                    }
                    else {

                        if(result.length === 0){
                            callback(null, []);
                        }
                        else {
                            var res = [];

                            result.forEach(function(row){
                                row.fecha = new Date(row.fecha);
                                res.push(row);
                            });

                            callback(null, res);
                        }
                    }
                });            
        }
    });
}



module.exports.fotoComentario = function(idComentario, callback){
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT foto FROM `comentarios` WHERE id = ?', [idComentario],
                function(err, result) {
                    conexion.release();
                    if (err){
                        callback(err);
                    }
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else {
                            callback(null, result[0].foto);
                        }
                    }
                });            
        }
    });
}



