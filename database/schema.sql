
DROP DATABASE IF EXISTS `cwars`;
CREATE DATABASE `cwars`;
USE `cwars`;

DROP TABLE IF EXISTS `users` ;
CREATE TABLE `users` (
    `username` VARCHAR(32) PRIMARY KEY,
    `password` VARCHAR(128) NOT NULL,
    `type` ENUM('team', 'judge', 'admin', 'superadmin'),
    `date_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `date_updated` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
    `submission_id` INT(11) AUTO_INCREMENT PRIMARY KEY,
    `team` VARCHAR(32) NOT NULL,
    `problem_id` INT(11) NOT NULL,
    `filename` VARCHAR(512) NOT NULL,
    `status` VARCHAR(512) NOT NULL,
    `date_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `judge` VARCHAR(32) DEFAULT NULL,
    `evaluation` VARCHAR(64) NOT NULL,
    `date_updated` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `problems`;
CREATE TABLE `problems` (
    `problem_id` INT(11) AUTO_INCREMENT PRIMARY KEY,
    `body` TEXT NOT NULL,
    `date_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `date_updated` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

