"use strict";

var mysql = require("mysql");


var config = require("./config");

var pool = mysql.createPool({
    host:  config.dbHost,
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});


/*

CARTAS:

0 = start
1 = T1
2 = T2
.
.
.
15 = T15
16 = DNK
17 = NoGold - DNK
18 = Gold - DNK
19 = NoGold
20 = Gold


*/

module.exports.crearTablero = function(idPartida, callback){
	if (callback === undefined) callback = function() {};


	pool.getConnection(function(err, conexion){
		if (err) callback(err);
        else {

            var pepita = Math.floor((Math.random() * 3) + 1);
            var pepita1 = 17, pepita2 = 17, pepita3 = 17; // 17 = noGold

            switch(pepita){
                case 1: pepita1 = 18; break; // 18 = Gold
                case 2: pepita2 = 18; break;
                case 3: pepita3 = 18; break;
            }

            conexion.query('INSERT INTO `celda` (`fila`, `columna`, `idCarta`) ' +
                                'VALUES (3, 0, 0);',
                function(err, id0) {
                    if (err){
                        conexion.release();
                        callback(err);
                    }
                    else {

    		            conexion.query('INSERT INTO `partida-celda` (`partida`, `celda`) ' +
                            'VALUES (?, ?);',
                            [idPartida, id0.insertId],
                            function(err, result) {
                                if (err){
                                    conexion.release();
                                    callback(err);
                                }
                                else {
                                    conexion.query('INSERT INTO `celda` (`fila`, `columna`, `idCarta`) ' +
                                        'VALUES (1, 6, ?);',
                                        [pepita1],
                                        function(err, id1) {
                                            if (err){
                                                conexion.release();
                                                callback(err);
                                            }
                                            else {

                                                conexion.query('INSERT INTO `partida-celda` (`partida`, `celda`) ' +
                                                    'VALUES (?, ?);',
                                                    [idPartida, id1.insertId],
                                                    function(err, result) {
                                                        if (err){
                                                            conexion.release();
                                                            callback(err);
                                                        }
                                                        else {
                                                            conexion.query('INSERT INTO `celda` (`fila`, `columna`, `idCarta`) ' +
                                                                'VALUES (3, 6, ?);',
                                                                [pepita2],
                                                                function(err, id2) {
                                                                    if (err){
                                                                        conexion.release();
                                                                        callback(err);
                                                                    }
                                                                    else {

                                                                        conexion.query('INSERT INTO `partida-celda` (`partida`, `celda`) ' +
                                                                            'VALUES (?, ?);',
                                                                            [idPartida, id2.insertId],
                                                                            function(err, result) {
                                                                                if (err){
                                                                                    conexion.release();
                                                                                    callback(err);
                                                                                }
                                                                                else {
                                                                                    conexion.query('INSERT INTO `celda` (`fila`, `columna`, `idCarta`) ' +
                                                                                        'VALUES (5, 6, ?);',
                                                                                        [pepita3],
                                                                                        function(err, id3) {
                                                                                            if (err){
                                                                                                conexion.release();
                                                                                                callback(err);
                                                                                            }
                                                                                            else {

                                                                                                conexion.query('INSERT INTO `partida-celda` (`partida`, `celda`) ' +
                                                                                                    'VALUES (?, ?);',
                                                                                                    [idPartida, id3.insertId],
                                                                                                    function(err, result) {
                                                                                                        if (err){
                                                                                                            conexion.release();
                                                                                                            callback(err);
                                                                                                        }
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
                                                    });
                                            }
                                        });
                                }
                            });
                    }
                });
        }
	});

}




module.exports.buscarTablero = function(idPartida, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT * FROM `celda` INNER JOIN `partida-celda` PC ON celda.id = PC.celda INNER JOIN carta C ON C.id = celda.idCarta where PC.partida = ?', [idPartida],
                function(err, result) {
                    conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null, []);
                        }
                        else{
                            var res = [];
                            for (var i = 6; i >= 0; i--) {
                                res[i] = [];
                            }

                            result.forEach(function(row){
                                var celda = {idCarta: row.idCarta, nickUsuario: row.nickUsuario, nombreCarta: row.nombreCarta, arriba: row.arriba, der: row.der, abajo: row.abajo, izq: row.izq};

                                res[row.fila][row.columna] = celda;
                            });
                            
                            callback(null, res);
                        }
                    }
            }); 
        }
  
    });
}




module.exports.repartirCartas = function(idPartida, idUsuario, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {

            var cartaAleatoria = Math.floor((Math.random() * 19) + 1);
            if (cartaAleatoria >= 16)
                cartaAleatoria = cartaAleatoria + 5;

            conexion.query('INSERT INTO `usuario-partida-carta` (`usuario`, `partida`, `carta`, `numeroCartas`) VALUES(?, ?, ?, ?)', [idUsuario, idPartida, cartaAleatoria, 1],
                function(err, result) {
                    if (err) {
                        if(err.code === "ER_DUP_ENTRY"){

                            conexion.query('SELECT numeroCartas FROM `usuario-partida-carta` WHERE usuario = ? and partida = ? and carta = ?;', [idUsuario, idPartida, cartaAleatoria],
                                function(err, numeroCartas) {
                                    if (err){
                                        conexion.release();
                                        callback(err);
                                    }
                                    else {
                                        if(numeroCartas.length === 0){
                                            conexion.release();
                                            callback(null);
                                        }
                                        else{
                                            conexion.query('UPDATE `usuario-partida-carta` SET `numeroCartas` = ? WHERE usuario = ? and partida = ? and carta = ?;', [(numeroCartas[0].numeroCartas+1), idUsuario, idPartida, cartaAleatoria],
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
                        else {
                            conexion.release();
                            callback(err);
                        }
                    }
                    else {
                        conexion.release();
                        callback(null);                         
                    }
            }); 
        }
  
    });
}



module.exports.buscarCartas = function(idUsuario, idPartida, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT * FROM `carta` INNER JOIN `usuario-partida-carta` UPC ON carta.id = UPC.carta where UPC.partida = ? and UPC.usuario = ?', [idPartida, idUsuario],
                function(err, result) {
                    conexion.release();
                    if (err){
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

                                var carta = {id: row.id, nombreCarta: row.nombreCarta, numCartas: row.numeroCartas};

                                res[i] = carta;
                                i++;
                            });
                            
                            callback(null, res);
                        }
                    }
            }); 
        }
  
    });
}


module.exports.buscarCartaPorId = function(idCarta, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT * FROM `carta` where id = ?', [idCarta],
                function(err, result) {
                    conexion.release();
                    if (err){
                        callback(err);
                    }
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            
                            callback(null, result[0]);
                        }
                    }
            }); 
        }
  
    });
}


module.exports.ponerCarta = function(idPartida, f, c, nick, idCarta, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
           conexion.query('INSERT INTO `celda` (`fila`, `columna`, `nickUsuario`, `idCarta`) ' +
            'VALUES (?, ?, ?, ?);',
            [f, c, nick, idCarta],
            function(err, id) {
                if (err){
                    conexion.release();
                    callback(err);
                }
                else {

                    conexion.query('INSERT INTO `partida-celda` (`partida`, `celda`) ' +
                        'VALUES (?, ?);',
                        [idPartida, id.insertId],
                        function(err, result) {
                            conexion.release();
                            if (err){
                                callback(err);
                            }
                            else {
                                callback(null);
                            }
                        });
                }
            });
        }
  
    });
}


module.exports.descartarCarta = function(idUsuario, idPartida, idCarta, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT numeroCartas FROM `usuario-partida-carta` ' +
                'WHERE usuario = ? and partida = ? and carta = ?;',
                [idUsuario, idPartida, idCarta],
                function(err, numero) {
                    if (err){
                        conexion.release();
                        callback(err);
                    }
                    else {
                        if(numero[0].numeroCartas > 1){
                            conexion.query('UPDATE `usuario-partida-carta` SET numeroCartas = ? ' +
                                'WHERE usuario = ? and partida = ? and carta = ?;',
                                [numero[0].numeroCartas-1, idUsuario, idPartida, idCarta],
                                function(err, result) {
                                    if (err){
                                        conexion.release();
                                        callback(err);
                                    }
                                    else {
                                        conexion.release();
                                        callback(null);
                                    }
                                });
                        }
                        else {
                            conexion.query('DELETE FROM `usuario-partida-carta` ' +
                                'WHERE usuario = ? and partida = ? and carta = ?;',
                                [idUsuario, idPartida, idCarta],
                                function(err, result) {
                                    conexion.release();
                                    if (err){
                                        callback(err);
                                    }
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




module.exports.cambiarCelda = function(idPartida, f, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
            conexion.query('SELECT * FROM celda inner join `partida-celda` on partida = ? and id = celda and fila = ? and columna = 6', [idPartida, f],
                function(err, result) {
                    if (err){
                        conexion.release();
                        callback(err);
                    }
                    else {

                        var idCarta;

                        if(result[0].idCarta === 17)
                            idCarta = 19;
                        else if(result[0].idCarta === 18)
                            idCarta = 20;

                        console.log("actualizando el id " + result[0].id);
                        console.log("con el nuevo id " + idCarta);

                        if(idCarta === undefined){
                            callback(null);
                        }
                        else {

                            conexion.query('UPDATE celda SET idCarta = ? WHERE id = ?', [idCarta, result[0].id],
                                function(err, result) {
                                    conexion.release();
                                    if (err){
                                        callback(err);
                                    }
                                    else {
                                        if(result.length === 0){
                                            callback(null);
                                        }
                                        else{
                                            
                                            callback(null);
                                        }
                                    }
                            });
                        }
                    }
            }); 
        }
  
    });
}


module.exports.borrarCelda = function(idPartida, f, c, callback){
    if (callback === undefined) callback = function() {};
    
    pool.getConnection(function(err, conexion){
        
        if (err){
            callback(err);
        }
        else {
           conexion.query('SELECT id FROM `celda` INNER JOIN `partida-celda` ON celda = id and partida = ? and fila = ? and columna = ?',
            [idPartida, f, c],
            function(err, id) {
                if (err){
                    conexion.release();
                    callback(err);
                }
                else {

                    if(id.length === 0){
                        conexion.release();
                        callback("La consulta ha devuelto 0 resultados");
                    }
                    else {
                        conexion.query('DELETE FROM `celda` WHERE id = ?',
                            [id[0].id],
                            function(err, result) {
                                conexion.release();
                                if (err){
                                    callback(err);
                                }
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



module.exports.actualizarPico = function(idUsuario, idPartida, pico, callback){ //roto: pico = 0, arreglado: pico = 1
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('UPDATE `usuario-partida` SET `pico` = ? WHERE `usuario-partida`.`Partida` = ? AND `usuario-partida`.`Usuario` = ?;', [pico, idPartida, idUsuario],
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


module.exports.buscarPico = function(idUsuario, idPartida, callback){ //roto: pico = 0, arreglado: pico = 1
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `usuario-partida` WHERE `usuario-partida`.`Partida` = ? AND `usuario-partida`.`Usuario` = ?;', [idPartida, idUsuario],
                function(err, result) {
                conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            callback(null, result[0].pico);
                        }
                    }
                });            
        }
    });
}


module.exports.buscarTodasLasCartas = function(callback){ //roto: pico = 0, arreglado: pico = 1
    if (callback === undefined) callback = function() {};

    pool.getConnection(function(err, conexion){
        if (err) callback(err);
        else {
            conexion.query('SELECT * FROM `carta` ORDER BY id',
                function(err, result) {
                conexion.release();
                    if (err) callback(err);
                    else {
                        if(result.length === 0){
                            callback(null);
                        }
                        else{
                            var res = [];

                            result.forEach(function(row){
                                res.push(row);
                            });

                            callback(null, res);
                        }
                    }
                });            
        }
    });
}

