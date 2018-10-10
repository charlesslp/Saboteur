"use strict";


var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var multer = require("multer");
var DAOUser = require("./DAOUsuario.js");
var DAOPartidas = require("./DAOPartidas.js");
var DAOTablero = require("./DAOTablero.js");
var cookieParser = require("cookie-parser");
var config = require("./config");

var https = require("https");
var fs = require("fs");



//var upload = multer({dest: "uploads/"});
var upload = multer({storage: multer.memoryStorage()});

var app = express();



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());



var caBundle = fs.readFileSync("../../carlosmp_com.ca-bundle");
var clavePrivada = fs.readFileSync("../../clave_carlosmp_com.key");
var certificado = fs.readFileSync("../../carlosmp_com.crt");

var servidor = https.createServer({ ca: caBundle, key: clavePrivada, cert: certificado }, app);




app.get("/", function(request, response) {

	response.redirect("index.html");
});


app.get("/index.html", function(request, response) {

	response.render("index");
});


app.get("/login.html", function(request, response) {

	response.render("login", {error: []});


});

app.get("/registro.html", function(request, response) {

	response.render("registro", {error: []});
});


app.get("/crear.html", function(request, response) {

	response.render("crear", {usuario: request.cookies.usuario.alias, error: []});
});

app.get("/desconectar.html", function(request, response) {

	response.clearCookie("usuario");
	response.clearCookie("errores");
	response.redirect("index.html");
});



//---------------------------------------------------------------------------------------------------------------------
// DAO USUARIOS
//---------------------------------------------------------------------------------------------------------------------




app.post("/buscarUsuario.html", function(request, response){

	request.checkBody("alias", "Error, Nombre de usuario sin rellenar").notEmpty();
	request.checkBody("contraseña", "Error, Contraseña sin rellenar").notEmpty();
	
	request.getValidationResult().then(function(result){

        if(result.isEmpty()){
            
			DAOUser.buscarUsuario(request.body.alias, request.body.contraseña, function(err, user){

				if(err){
					console.log(err);
					console.log(err);
            		response.render("login", {error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{
					if (user === undefined){
            			response.render("login", {error: [{msg: "Error, Usuario o contraseña incorrecto"}]})
					}
					else{
						response.cookie("usuario", user);
						response.redirect("principal.html");
					}
				}
			})
        }
        else {
            response.render("login", {error: result.array()})
        }

    })
});







app.post("/crearUsuario.html", upload.single("foto"), function(request, response){

	request.checkBody("alias", "Error, Nombre de usuario sin rellenar").notEmpty();
	request.checkBody("contraseña", "Error, Contraseña sin rellenar").notEmpty();
	request.checkBody("nombre_completo", "Error, Nombre sin rellenar").notEmpty();
	request.checkBody("sex", "Error, Sexo sin seleccionar").notEmpty();

	request.getValidationResult().then(function(result){
		if(result.isEmpty()){

			var usuario = {
				alias: request.body.alias,
				nombre_completo: request.body.nombre_completo,
				fecha: request.body.fecha,
				contraseña: request.body.contraseña,
				sex: request.body.sex,
				foto: null
			};

		    if (request.file) {
		        usuario.foto = request.file.buffer;
		    }

			DAOUser.crearUsuario(usuario, function(err, id){

			if(err){
					console.log(err);
					if(err.code === "ER_DATA_TOO_LONG")
            			response.render("registro", {error: [{msg: "La foto es demasiado grande, prueba con una de menor tamaño"}]})
            		else
            			response.render("registro", {error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{
					if (id === undefined){
            			response.render("registro", {error: [{msg: "Error, el Alias que has puesto está en uso"}]})
					}
					else{
						
						usuario.id = id;
						response.cookie("usuario", usuario);
						response.redirect("principal.html");
					}
				}
			})
        }
        else{
            response.render("registro", {error: result.array()})

        }
	})
});


//---------------------------------------------------------------------------------------------------------------------
// DAO PARTIDAS
//---------------------------------------------------------------------------------------------------------------------






app.post("/crearPartida.html", function(request, response){

	request.checkBody("nombrePartida", "Error, Nombre de partida sin rellenar").notEmpty();

	request.getValidationResult().then(function(result){
		if(result.isEmpty()){


			var partida = {
				nombrePartida: request.body.nombrePartida,
				usuarioCreador: request.cookies.usuario.alias,
				fecha: new Date(),
				jugadores: request.body.jugadores,
				jugadoresApuntados: request.cookies.usuario.alias
			};

			DAOPartidas.crearPartida(partida, function(err, correct){

			if(err){
					console.log(err);	
            		response.render("crear", {usuario: request.cookies.usuario.alias, error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{
					response.redirect("principal.html");				
				}
			})

 		}
        else{
            response.render("crear", {usuario: request.cookies.usuario.alias, error: result.array()})
        }  
	})
});






app.get("/principal.html", function(request, response) {


	DAOPartidas.buscarPartidasAbiertasUsuario(request.cookies.usuario.id, request.cookies.usuario.alias, function(err, partAbiertas){

		if(err){
					console.log(err);
			console.log(err.message)
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar las Partidas Abiertas!!"}]})
		}else{
			DAOPartidas.buscarPartidasActivas(request.cookies.usuario.id, function(err, partActivas){
				if(err){
					console.log(err);
					console.log(err.message)
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar las Partidas Activas!!"}]})
				}else{

					DAOPartidas.buscarPartidasTerminadas(request.cookies.usuario.id, function(err, partTerminadas){

						if(err){
					console.log(err);	
							console.log(err.message)
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, partidasActivas: partActivas, partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar las Partidas Terminadas!!"}]})
						}else{

							DAOUser.buscarRoles(request.cookies.usuario.id, function(err, UP){

								if(err){
					console.log(err);	
									console.log(err.message)
									response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, partidasActivas: partActivas, partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar las Partidas Terminadas!!"}]})
								}else{
									if(request.cookies.errores !== undefined){
										var errores = request.cookies.errores;
										response.clearCookie("errores");
										console.log(request.cookies.errores);
										response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, partidasActivas: partActivas, partidasTerminadas: partTerminadas, error: [{msg: errores}]});
															
									}
									else {
										if(UP !== undefined){
											partTerminadas.forEach(function(part){

												var i = 0;
												while(UP[i].Partida !== part.id)
													i++;

												if(UP[i].rolbuscador === part.ganador)
													part.esGanador = true;
											});
										}
										//TODO CORRECTO
										response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, partidasActivas: partActivas, partidasTerminadas: partTerminadas, error: []});
									}
								}
							});
						}
					});
				}
			});
		}
	});
});




app.get("/unirse.html", function(request, response) {


		DAOPartidas.buscarPartidasAbiertas(request.cookies.usuario.id, function(err, partAbiertas, UP){

			if(err){
					console.log(err);	
				response.render("unirse", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, error: [{msg: "¡¡Hubo un error inesperado al cargar las Partidas Abiertas!!"}]});
			}else{

				var partidasAbiertas = [];
				var encontrado, yaEstaba;
				var i = 0;

				partAbiertas.forEach(function(part){
					encontrado = false;

					if(UP !== undefined){

						UP.forEach(function(u_p){
							if(!encontrado){
								if(u_p.Partida === part.id)
									encontrado = true;
							}
						});

					}

					if(!encontrado){

						yaEstaba = false;

						partidasAbiertas.forEach(function(p){
							if(!yaEstaba){
								if(p.id === part.id)
									yaEstaba = true;
							}
						});

						if(!yaEstaba){
							partidasAbiertas[i] = part;
							i++;
						}

					}
				});

				//TODO CORRECTO
				response.render("unirse", {usuario: request.cookies.usuario.alias, partidasAbiertas: partidasAbiertas, error: []});
			}
		});

});




app.post("/unirseAPartida.html", function(request, response) {


	DAOPartidas.unirse(request.cookies.usuario, request.body.idPart, function(err, partAbiertas, lleno, idPartida, jugAct){

		if(err){
					console.log(err);	
			response.render("unirse", {usuario: request.cookies.usuario.alias, partidasAbiertas: partAbiertas, error: [{msg: "¡¡Hubo un error inesperado al unirse a la partida!!"}]});
		}else{

			if(partAbiertas !== undefined){

				if(lleno){
					response.redirect("empezarPartida.html?idPart=" + idPartida + "&jugadoresActuales=" + jugAct);
				}
				else{
					//TODO CORRECTO
					response.redirect("principal.html");
				}
			}
		}
	});


});



app.get("/empezarPartida.html", function(request, response) {


	if (request.query.jugadoresActuales < 3){
		response.cookie("errores", "¡¡Imposible comenzar la partida, jugadores insuficientes!!");
		response.redirect("principal.html");
	}
	else{
		DAOPartidas.buscarUsuariosPartida(request.query.idPart, function(err, usuarios){

			if(err){
					console.log(err);
				console.log(err.message);
				response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
			}else{

				if(usuarios !== undefined){

					var turnos = 0;

					switch(request.query.jugadoresActuales){
						case '3': turnos = 50; break;
						case '4': turnos = 45; break;
						case '5': turnos = 40; break;
						case '6': turnos = 40; break;
						case '7': turnos = 35; break;
					}

					if(request.query.jugadoresActuales <= 4){

						var rand = Math.floor((Math.random() * (request.query.jugadoresActuales - 1)));

						DAOPartidas.saboteador1(usuarios[rand].usuario, request.query.idPart, function(err, result){

							if(err){
					console.log(err);	
								console.log(err.message);
								response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
							}else{
								if(result !== undefined){

									var rand = Math.floor((Math.random() * (request.query.jugadoresActuales - 1)));

									DAOUser.buscarAlias(usuarios[rand].usuario, function(err, alias){

										if(err){
					console.log(err);	
											console.log(err.message);
											response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
										}else{
											if(alias !== undefined){

												//TODO CORRECTO				
												DAOPartidas.activarPartida(request.query.idPart, alias, turnos, function(err, result){

													if(err){
					console.log(err);
														console.log(err.message);
														response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
													}else {
														DAOTablero.crearTablero(request.query.idPart, function(err, resultado){

															if(err){
					console.log(err);
																console.log(err.message);
																response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
															}else{
																repartirCartas(request, response, request.query.idPart, usuarios, 6, 0, 0); //hay que repartir 6 cartas a cada jugador
															}

														});
															
													}
												});
											}
										}
									});

								}
							}
						});
					}
					else {

						var random1 = Math.floor((Math.random() * (request.query.jugadoresActuales - 1)));
						do{
							var random2 = Math.floor((Math.random() * (request.query.jugadoresActuales - 1)));
						}while(random1 === random2);

						DAOPartidas.saboteador2(usuarios[random1].usuario, usuarios[random2].usuario, request.query.idPart, function(err, result){

							if(err){
					console.log(err);	
								console.log(err.message);
								response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
							}else{
								if(result !== undefined){

									var rand = Math.floor((Math.random() * (request.query.jugadoresActuales - 1)));

									
									DAOUser.buscarAlias(usuarios[rand].usuario, function(err, alias){

										if(err){
					console.log(err);	
											console.log(err.message);
											response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
										}else{
											if(alias !== undefined){

												//TODO CORRECTO				
												DAOPartidas.activarPartida(request.query.idPart, alias, turnos, function(err, result){

													if(err){
					console.log(err);	
														console.log(err.message);
														response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
													}else{
														if(result !== undefined){
															DAOTablero.crearTablero(request.query.idPart, function(err, resultado){

																if(err){
					console.log(err);
																	console.log(err.message);
																	response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
																}else{
																	if(usuarios.length > 5)
																		repartirCartas(request, response, request.query.idPart, usuarios, 5, 0, 0);
																	else
																		repartirCartas(request, response, request.query.idPart, usuarios, 6, 0, 0);
																}

															});
														}
													}
												});
											}
										}
									});
								}
							}
						});
					}

				}
			}
		});
	}

});

																						//k representa el usuario dentro del array "usuarios"
function repartirCartas(request, response, idPartida, usuarios, cuantasCartas, i, k){ 	//i representa cuantas cartas hemos repartido al usuario k
																						//cuantasCartas representa el numero de cartas que hay que repartir (5 o 6)

	if(k < usuarios.length){

		DAOTablero.repartirCartas(idPartida, usuarios[k].usuario, function(err, resultado){

			if(err){
					console.log(err);
				console.log(err.message);
				response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
			}else{
				if(cuantasCartas-1 > i)
					i++;
				else{
					i = 0;
					k++;
				}

				repartirCartas(request, response, idPartida, usuarios, cuantasCartas, i, k);
				
			}

		});
	}
	else
		response.redirect("principal.html");

}



app.get("/partida.html", function(request, response) {


	DAOPartidas.buscarPartidaPorId(request.query.idPartida, function(err, partida){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar la partida!!"}]})
		}else{

			DAOPartidas.buscarRol(request.cookies.usuario.id, request.query.idPartida, function(err, rolbuscador){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar la partida!!"}]})
				}else{

					var rol;
					if(rolbuscador)
						rol = "buscador";
					else
						rol = "saboteador";

					if(partida !== undefined){
						DAOTablero.buscarTablero(request.query.idPartida, function(err, tablero){

							if(err){
					console.log(err);
								console.log(err.message);
								response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar la partida!!"}]})
							}else{

								DAOTablero.buscarCartas(request.cookies.usuario.id, request.query.idPartida, function(err, cartas){

									if(err){
					console.log(err);
										console.log(err.message);
										response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar la partida!!"}]})
									}else{
										var cartasJugador = [];

										for (var i = 0; i < 7; i++) {
											if(cartas[i] !== undefined){
												for (var j = 0; j < cartas[i].numCartas; j++) {
													cartasJugador.push({id: cartas[i].id, nombreCarta: cartas[i].nombreCarta});
												}
											}
										}

										DAOPartidas.buscarComentarios(request.query.idPartida, function(err, comentarios){

											if(err){
					console.log(err);
												console.log(err.message);
												response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: "¡¡Hubo un error inesperado al cargar la partida!!"}]})
											}else{
												
												//TODO CORRECTO
												response.render("partida", {usuario: request.cookies.usuario.alias, partida: partida, rol: rol, error: [], tablero: tablero, cartas: cartasJugador, comentarios: comentarios});
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

});

app.get("/cambiarTurno.html", function(request, response) {


	DAOPartidas.buscarUsuariosPartida(request.query.idPart, function(err, usuarios){

		if(err){
					console.log(err);	
				console.log(err.message);
				response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{

			DAOUser.buscarIdPorAlias(request.query.turno, function(err, idUsuario){


				if(err){
					console.log(err);	
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{

					//buscamos de quien era el turno
					var i = 0;
					while(usuarios[i].usuario !== idUsuario){
						i++;
					}

					//pasamos al siguiente turno (si ha llegado al final, empieza de nuevo)
					if((usuarios.length-1) === i){
						i = 0;
					}
					else{
						i++;
					}


					DAOUser.buscarAlias(usuarios[i].usuario, function(err, alias){

						if(err){
					console.log(err);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
						}else{
							if(alias !== undefined){
								DAOPartidas.cambiarTurno(request.query.idPart, alias, function(err, result){

									if(err){
					console.log(err);
										console.log(err.message);
										response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
									}else{
										if(result !== undefined){
											//TODO CORRECTO
											response.redirect("principal.html");
										}
									}
								});
							}
						}
					});
					
				}
			});
		}
	});

});

app.get("/ganar.html", function(request, response) {

	
	DAOPartidas.ganarPartida(request.query.idPart, 1, function(err, result){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			if(result !== undefined){
				//TODO CORRECTO
				response.redirect("principal.html");
			}
		}
	});

});



//---------------------------------------------------------------------------------------------------------------------
// TABLERO
//---------------------------------------------------------------------------------------------------------------------


app.get("/carta.html", function(request, response) {

	DAOTablero.buscarTablero(request.query.idPart, function(err, tablero){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			var carta = {idCarta: request.query.idCarta, nombreCarta: request.query.nombreCarta};
			if(carta.idCarta < 20)
				response.render("ponerCarta", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [], tablero: tablero, carta: carta});
			else{

				if(carta.idCarta === "21" || carta.idCarta === "22")
					response.render("CartaEspecial", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [], tablero: tablero, carta: carta, mostrarLlegada: false, lista: null});
				else{
					DAOPartidas.listaUsuariosPartida(request.query.idPart, function(err, lista){

						if(err){
					console.log(err);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
						}else{
							if(lista !== undefined){
								response.render("CartaEspecial", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [], tablero: tablero, carta: carta, mostrarLlegada: false, lista: lista});
							}
							else {
								console.log("Resultado vacio");
								response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
							}
						}
					});

				}
			}
		}
	});
	
});


app.get("/ponerCarta.html", function(request, response) {


	DAOTablero.buscarTablero(request.query.idPart, function(err, tablero){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{

			DAOTablero.buscarCartaPorId(request.query.idCarta, function(err, cartaJugador){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{


					DAOTablero.buscarPico(request.cookies.usuario.id, request.query.idPart, function(err, pico){


						if(err){
					console.log(err);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]});
						} else {

							if(pico === 0){
								var carta = {idCarta: cartaJugador.id, nombreCarta: cartaJugador.nombreCarta};
								response.render("ponerCarta", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [{msg: "¡¡TU PICO ESTÁ ROTO!! Deberás arreglarlo antes de poder poner una carta"}], tablero: tablero, carta: carta});
							}
							else {

								var f = Number(request.query.f);
								var c = Number(request.query.c);
								var alLado = false; //indica si la carta que estamos poniendo no tiene ninguna carta al lado, en cuyo caso no se podrá poner
								var todoOk = true;
								var hayGanador = false;
								var pepita = false


								//COMPRUEBA SI ES UNA POSICION DESDE LA CUAL SE ALCANZA META
								if((f === 0 && c === 6) || (f === 1 && c === 5) || (f === 2 && c === 6) || (f === 3 && c === 5) || (f === 4 && c === 6) || (f === 5 && c === 5) || (f === 6 && c === 6)){
									pepita = comprobarPepita(f, c, tablero);//Posible ganador

									if(pepita)
										hayGanador = comprobarGanador(f, c, tablero);
									else
										todoOk = false;
								}

								//COMPRUEBA QUE HAY UNA CARTA AL LADO
								if((f !== 0 && tablero[f-1][c] !== undefined) || (c !== 6 && tablero[f][c+1] !== undefined) || (f !== 6 && tablero[f+1][c] !== undefined) || (c !== 0 && tablero[f][c-1] !== undefined))
									alLado = true;


								//SI TODO ESTA BIEN, COMPRUEBA QUE LAS CARTAS CONECTAN ENTRE SI
								if(alLado && todoOk){

									if(f !== 0 && tablero[f-1][c] !== undefined){
										if(cartaJugador.arriba === null && tablero[f-1][c].abajo !== null || cartaJugador.arriba !== null && tablero[f-1][c].abajo === null)
											todoOk = false;
									}

									if(todoOk && c !== 6 && tablero[f][c+1] !== undefined){
										if(cartaJugador.der === null && tablero[f][c+1].izq !== null || cartaJugador.der !== null && tablero[f][c+1].izq === null)
											todoOk = false;
									}

									if(todoOk && f !== 6 && tablero[f+1][c] !== undefined){
										if(cartaJugador.abajo === null && tablero[f+1][c].arriba !== null || cartaJugador.abajo !== null && tablero[f+1][c].arriba === null)
											todoOk = false;
									}

									if(todoOk && c !== 0 && tablero[f][c-1] !== undefined){
										if(cartaJugador.izq === null && tablero[f][c-1].der !== null || cartaJugador.izq !== null && tablero[f][c-1].der === null)
											todoOk = false;
									}


								}

								if(!alLado || !todoOk){
									var carta = {idCarta: cartaJugador.id, nombreCarta: cartaJugador.nombreCarta};
									response.render("ponerCarta", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [{msg: "¡¡No puedes colocar la ficha en esa posición!!"}], tablero: tablero, carta: carta});
								}
								else {

									DAOTablero.buscarTodasLasCartas(function(err, infoCartas){

										if(err){
					console.log(err);
											console.log(err.message);
											response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
										}else{

											var cartita = {idCarta: cartaJugador.id, nombreCarta: cartaJugador.nombreCarta};
											var marcaje = [];

											for (var i = 0; i < 7; i++) {
												marcaje[i] = [];
												for (var j = 0; j < 7; j++) {
													marcaje[i][j] = false;
												}
											}

											tablero[f][c] = cartita;
											todoOk = caminoAlStar(infoCartas, marcaje, tablero, f, c);
											console.log("FIN: " + todoOk);

											if(!todoOk){
												tablero[f][c] = undefined;
												response.render("ponerCarta", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [{msg: "¡¡No puedes colocar la ficha en esa posición!!"}], tablero: tablero, carta: cartita});
											} else {
												//Se puede poner la carta
												DAOTablero.ponerCarta(request.query.idPart, f, c, request.cookies.usuario.alias, request.query.idCarta, function(err, resultado){

													if(err){
					console.log(err);
														console.log(err.message);
														response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
													}else{


														if(hayGanador){

															ganar(request, response, 1);

														}
														else{
															DAOTablero.descartarCarta(request.cookies.usuario.id, request.query.idPart, request.query.idCarta, function(err){

																if(err){
					console.log(err);
																	console.log(err.message);
																	response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
																}else{
																	DAOTablero.repartirCartas(request.query.idPart, request.cookies.usuario.id, function(err, resultado){

																		if(err){
					console.log(err);
																			console.log(err.message);
																			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
																		}else{

																			if(pepita){
																				var fBusq = f;

																				if(f === 0 || f === 2 || f === 4)
																					fBusq = Number(f)+1;
																				else if(f === 6)
																					fBusq = Number(f)-1;

																				ponerNoGold(request, response, f, fBusq);
																			}

																			response.redirect("cambiarTurno.html?idPart="+request.query.idPart+"&turno="+request.cookies.usuario.alias);

																		}

																	});
																}

															});
														}
													}

												});
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
	});

});

function comprobarPepita(f, c, tablero){ //casos especiales donde el jugador puede colocar en una de las casillas de meta


	if((f === 0 || f === 2 || f === 4 || f === 6) && c === 6 && tablero[f][c-1] !== undefined && tablero[f][c-1].der !== null){
		return true;
	}
	
	if((f === 1 || f === 3 || f === 5) && c === 5 && ((tablero[f-1][c] !== undefined && tablero[f-1][c].der !== null)
		|| (tablero[f][c-1] !== undefined && tablero[f][c-1].der !== null) || (tablero[f+1][c] !== undefined && tablero[f+1][c].der !== null))){
		return true;
	}



	if(f === 0 && c === 6 && tablero[f+1][c].idCarta === 19)
		return true;
	if(f === 6 && c === 6 && tablero[f-1][c].idCarta === 19)
		return true;
	if((f === 2 || f === 4) && c === 6 && (tablero[f+1][c].idCarta === 19 || tablero[f-1][c].idCarta === 19))
		return true;
	if((f === 1 || f === 3 || f === 5) && c === 5 && tablero[f][c+1].idCarta){
		return true;
	}

	return false;
}

function comprobarGanador(f, c, tablero){

	if(f === 0 && c === 6 && tablero[f+1][c].idCarta === 18)
		return true;
	if(f === 6 && c === 6 && tablero[f-1][c].idCarta === 18)
		return true;
	if((f === 2 || f === 4) && c === 6 && (tablero[f+1][c].idCarta === 18 || tablero[f-1][c].idCarta === 18))
		return true;
	if((f === 1 || f === 3 || f === 5) && c === 5 && tablero[f][c+1].idCarta === 18){
		return true;
	}

}

function ganar(request, response, f){


	if(f < 6){
		DAOTablero.cambiarCelda(request.query.idPart, f, function(err, resultado){

			if(err){
					console.log(err);
				console.log(err.message);
				response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
			}else{
				ganar(request, response, f+2);
			}

		});
	}
	else
		response.redirect("ganar.html?idPart="+request.query.idPart);

}

function ponerNoGold(request, response, f, fBusq){

	DAOTablero.cambiarCelda(request.query.idPart, fBusq, function(err, resultado){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			if((f === 2 || f === 4) && fBusq !== (Number(f)-1)){
				fBusq = Number(f)-1;

				ponerNoGold(request, response, f, fBusq);
			}
		}

	});
}





function caminoAlStar(infoCartas, marcaje, tablero, f, c){

	var ok;
	console.log("entro con f: " + f + " y c: "+c);

	if(f === 3 && c === 0)
		return true;
	else if(f === -1 || c === -1 || f === 7 || c === 7 || tablero[f][c] === undefined){
		console.log("me salgo");
		return false;
	}
	else{
		console.log(tablero[f][c].idCarta + "  "+marcaje[f][c]);
		if(!marcaje[f][c]){

			marcaje[f][c] = true;

			var carta = infoCartas[tablero[f][c].idCarta];

			console.log(carta);
			if(carta.izq !== null)
				ok = caminoAlStar(infoCartas, marcaje, tablero, f, c-1);
			if(!ok && carta.arriba !== null)
				ok = caminoAlStar(infoCartas, marcaje, tablero, f-1, c);
			if(!ok && carta.der !== null)
				ok = caminoAlStar(infoCartas, marcaje, tablero, f, c+1);
			if(!ok && carta.abajo !== null)
				ok = caminoAlStar(infoCartas, marcaje, tablero, f+1, c);
		}
	}

	return ok;

}




app.get("/descartarCarta.html", function(request, response) {

	DAOTablero.descartarCarta(request.cookies.usuario.id, request.query.idPart, request.query.carta, function(err){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			DAOTablero.repartirCartas(request.query.idPart, request.cookies.usuario.id, function(err, resultado){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{
					response.redirect("cambiarTurno.html?idPart="+request.query.idPart+"&turno="+request.cookies.usuario.alias);
				}

			});
		}
	});
	
});









//---------------------------------------------------------------------------------------------------------------------
// CARTA ESPECIAL
//---------------------------------------------------------------------------------------------------------------------


app.get("/lupa.html", function(request, response) {


	DAOTablero.buscarTablero(request.query.idPart, function(err, tablero){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{

			DAOTablero.descartarCarta(request.cookies.usuario.id, request.query.idPart, request.query.idCarta, function(err){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{
					DAOTablero.repartirCartas(request.query.idPart, request.cookies.usuario.id, function(err, resultado){

						if(err){
					console.log(err);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
						}else{

							if(request.query.pepita === "17")
								tablero[request.query.f][request.query.c].nombreCarta = "NoGold";
							else
								tablero[request.query.f][request.query.c].nombreCarta = "Gold";

							response.render("CartaEspecial", {usuario: request.cookies.usuario.alias, partida: request.query.idPart, error: [], tablero: tablero, carta: null, mostrarLlegada: true, lista: null});

						}

					});
				}

			});

			
		}
	});
	
});


app.get("/bomba.html", function(request, response) {

	DAOTablero.descartarCarta(request.cookies.usuario.id, request.query.idPart, request.query.idCarta, function(err){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			DAOTablero.repartirCartas(request.query.idPart, request.cookies.usuario.id, function(err, resultado){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{

					DAOTablero.borrarCelda(request.query.idPart, request.query.f, request.query.c, function(err, resultado){

						if(err){
					console.log(err);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
						}else{

							response.redirect("cambiarTurno.html?idPart="+request.query.idPart+"&turno="+request.cookies.usuario.alias);

						}

					});
				}

			});
		}

	});

});



app.get("/actualizarPico.html", function(request, response) {

	DAOTablero.descartarCarta(request.cookies.usuario.id, request.query.idPart, request.query.idCarta, function(err){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			DAOTablero.repartirCartas(request.query.idPart, request.cookies.usuario.id, function(err, resultado){

				if(err){
					console.log(err);
					console.log(err.message);
					response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
				}else{

					DAOTablero.actualizarPico(request.query.idUsuario, request.query.idPart, request.query.pico, function(err, resultado){

						if(err){
					console.log(err);
							console.log("es aqui:   "+request.query.pico);
							console.log(err.message);
							response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
						}else{
							response.redirect("cambiarTurno.html?idPart="+request.query.idPart+"&turno="+request.cookies.usuario.alias);
						}

					});
				}

			});
		}

	});

});




//---------------------------------------------------------------------------------------------------------------------
// COMENTARIOS
//---------------------------------------------------------------------------------------------------------------------


app.post("/comentar.html", function(request, response) {

	DAOPartidas.escribirComentarios(request.body.idPart, request.cookies.usuario.id, request.body.texto, request.cookies.usuario.foto, function(err){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			response.redirect("partida.html?idPartida="+request.body.idPart);
		}

	});

});


app.get("/imagen/:idComentario", function(request, response) {

	DAOPartidas.fotoComentario(request.params.idComentario, function(err, imagen){

		if(err){
					console.log(err);
			console.log(err.message);
			response.render("principal", {usuario: request.cookies.usuario.alias, partidasAbiertas: [], partidasActivas: [], partidasTerminadas: [], error: [{msg: err + "¡¡Hubo un error inesperado!!"}]})
		}else{
			if(imagen){
				response.end(imagen);
			} else {
				response.status(404);
				response.end("Not found");
			}
		}

	});

});






//---------------------------------------------------------------------------------------------------------------------
// SERVIDOR
//---------------------------------------------------------------------------------------------------------------------






servidor.listen(config.port, function() {
    console.log("Servidor arrancado en el puerto " + config.port);
});