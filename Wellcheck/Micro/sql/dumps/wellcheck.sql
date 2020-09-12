-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Hôte : db
-- Généré le : mer. 01 juil. 2020 à 18:56
-- Version du serveur :  5.7.29
-- Version de PHP : 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `country` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL,
  `address` varchar(100) NOT NULL,
  `complement` varchar(100),
  `postal_code` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `order_status` (
  `id` varchar(12) NOT NULL UNIQUE,
  `name` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL,
  `color` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `orderdetails` (
  `id` int(11) NOT NULL,
  `order_id` varchar(12) NOT NULL,
  `json` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_id` varchar(64) NOT NULL,
  `status_id` int(11) NOT NULL,
  `date` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `paymentstripe`
--

CREATE TABLE `paymentstripe` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chr_token` varchar(64) NOT NULL,
  `amount` float NOT NULL,
  `date` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `point`
--

CREATE TABLE `point` (
  `id` varchar(8) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_sigfox` varchar(50) NOT NULL,
  `ukey` varchar(4) NOT NULL,
  `name` varchar(60) NOT NULL,
  `surname` varchar(60) NOT NULL,
  `date` varchar(30) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `point_shared`
--

CREATE TABLE `point_shared` (
  `id` varchar(36) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_point` int(11) NOT NULL,
  `date` varchar(30) NOT NULL,
  `surname` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `role` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(512) NOT NULL,
  `date` varchar(64) NOT NULL,
  `valid` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `userdetails`
--

CREATE TABLE `userdetails` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `userstripes`
--

CREATE TABLE `userstripes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_id` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Index pour les tables déchargées
--

ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `order_status`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `orderdetails`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `paymentstripe`
--
ALTER TABLE `paymentstripe`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `point`
--
ALTER TABLE `point`
  ADD UNIQUE KEY `id` (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `userdetails`
--
ALTER TABLE `userdetails`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `userstripes`
--
ALTER TABLE `userstripes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orderdetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paymentstripe`
--
ALTER TABLE `paymentstripe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `userdetails`
--
ALTER TABLE `userdetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `userstripes`
--
ALTER TABLE `userstripes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

INSERT INTO `order_status` (`name`, `label`, `color`) VALUES
("toValidate", "Waiting for validation", "warning"),
("processing", "Being processed", "info"),
("sent", "Package sent", "primary"),
("processed", "Finalized", "success"),
("rejected", "Rejected", "danger");

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
