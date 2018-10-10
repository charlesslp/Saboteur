-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-02-2017 a las 10:56:42
-- Versión del servidor: 10.1.19-MariaDB
-- Versión de PHP: 5.6.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `saboteur`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carta`
--

CREATE TABLE `carta` (
  `id` int(11) NOT NULL,
  `nombreCarta` varchar(60) NOT NULL,
  `arriba` tinyint(4) DEFAULT NULL,
  `der` tinyint(4) DEFAULT NULL,
  `abajo` tinyint(4) DEFAULT NULL,
  `izq` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `carta`
--

INSERT INTO `carta` (`id`, `nombreCarta`, `arriba`, `der`, `abajo`, `izq`) VALUES
(0, 'Start', 1, 1, 1, 1),
(1, 'T1', NULL, NULL, 1, NULL),
(2, 'T2', NULL, 1, NULL, NULL),
(3, 'T3', NULL, 1, 1, NULL),
(4, 'T4', 1, NULL, NULL, NULL),
(5, 'T5', 1, NULL, 1, NULL),
(6, 'T6', 1, 1, NULL, NULL),
(7, 'T7', 1, 1, 1, NULL),
(8, 'T8', NULL, NULL, NULL, 1),
(9, 'T9', NULL, NULL, 1, 1),
(10, 'T10', NULL, 1, NULL, 1),
(11, 'T11', NULL, 1, 1, 1),
(12, 'T12', 1, NULL, NULL, 1),
(13, 'T13', 1, NULL, 1, 1),
(14, 'T14', 1, 1, NULL, 1),
(15, 'T15', 1, 1, 1, 1),
(16, 'DNK', 1, 1, 1, 1),
(17, 'DNK', 1, 1, 1, 1),
(18, 'DNK', 1, 1, 1, 1),
(19, 'NoGold', 1, 1, 1, 1),
(20, 'Gold', 1, 1, 1, 1),
(21, 'Lupa', NULL, NULL, NULL, NULL),
(22, 'Bomba', NULL, NULL, NULL, NULL),
(23, 'PicoArreglado', NULL, NULL, NULL, NULL),
(24, 'PicoRoto', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `celda`
--

CREATE TABLE `celda` (
  `id` int(11) NOT NULL,
  `fila` int(11) NOT NULL,
  `columna` int(11) NOT NULL,
  `nickUsuario` varchar(60) DEFAULT NULL,
  `idCarta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL,
  `idPartida` int(11) NOT NULL,
  `alias` varchar(60) NOT NULL,
  `descripcion` varchar(60) NOT NULL,
  `fecha` date NOT NULL,
  `foto` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partida-celda`
--

CREATE TABLE `partida-celda` (
  `partida` int(11) NOT NULL,
  `celda` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidas`
--

CREATE TABLE `partidas` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(60) NOT NULL,
  `UsuarioCreador` varchar(60) NOT NULL,
  `Fecha` date NOT NULL,
  `Empezada` tinyint(1) NOT NULL DEFAULT '0',
  `Jugadores` int(1) NOT NULL,
  `Turno` varchar(60) DEFAULT NULL,
  `ganador` tinyint(1) DEFAULT NULL,
  `jugadoresActuales` int(11) NOT NULL DEFAULT '1',
  `jugadoresApuntados` varchar(60) NOT NULL,
  `turnosrestantes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id` int(11) NOT NULL,
  `Alias` varchar(60) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Fecha` date DEFAULT NULL,
  `Contraseña` varchar(60) NOT NULL,
  `Sexo` char(1) NOT NULL,
  `Foto` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario-partida`
--

CREATE TABLE `usuario-partida` (
  `Partida` int(11) NOT NULL,
  `Usuario` int(11) NOT NULL,
  `rolbuscador` tinyint(1) NOT NULL DEFAULT '1',
  `pico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario-partida-carta`
--

CREATE TABLE `usuario-partida-carta` (
  `usuario` int(11) NOT NULL,
  `partida` int(11) NOT NULL,
  `carta` int(11) NOT NULL,
  `numeroCartas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carta`
--
ALTER TABLE `carta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `celda`
--
ALTER TABLE `celda`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `partida-celda`
--
ALTER TABLE `partida-celda`
  ADD PRIMARY KEY (`partida`,`celda`),
  ADD KEY `celda` (`celda`);

--
-- Indices de la tabla `partidas`
--
ALTER TABLE `partidas`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Alias` (`Alias`);

--
-- Indices de la tabla `usuario-partida`
--
ALTER TABLE `usuario-partida`
  ADD PRIMARY KEY (`Partida`,`Usuario`),
  ADD KEY `Usuario` (`Usuario`);

--
-- Indices de la tabla `usuario-partida-carta`
--
ALTER TABLE `usuario-partida-carta`
  ADD PRIMARY KEY (`usuario`,`partida`,`carta`),
  ADD KEY `partida` (`partida`),
  ADD KEY `carta` (`carta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `celda`
--
ALTER TABLE `celda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;
--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT de la tabla `partidas`
--
ALTER TABLE `partidas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `partida-celda`
--
ALTER TABLE `partida-celda`
  ADD CONSTRAINT `partida-celda_ibfk_1` FOREIGN KEY (`partida`) REFERENCES `partidas` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `partida-celda_ibfk_2` FOREIGN KEY (`celda`) REFERENCES `celda` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario-partida`
--
ALTER TABLE `usuario-partida`
  ADD CONSTRAINT `usuario-partida_ibfk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario-partida_ibfk_2` FOREIGN KEY (`Partida`) REFERENCES `partidas` (`Id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario-partida-carta`
--
ALTER TABLE `usuario-partida-carta`
  ADD CONSTRAINT `usuario-partida-carta_ibfk_1` FOREIGN KEY (`partida`) REFERENCES `partidas` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario-partida-carta_ibfk_2` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario-partida-carta_ibfk_3` FOREIGN KEY (`carta`) REFERENCES `carta` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
