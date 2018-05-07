CREATE DATABASE IF NOT EXISTS restaurant_recommender_db;
use restaurant_recommender_dbl

CREATE TABLE IF NOT EXISTS users (
    id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
    id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_descriptions (
    id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT(9) UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    working_hours VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    cuisine VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    rating DOUBLE NOT NULL,
    FOREIGN KEY (restaurant_id)
        REFERENCES restaurants (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_menu (
    id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT(9) UNSIGNED NOT NULL,
    FOREIGN KEY (restaurant_id)
            REFERENCES restaurants (id)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food (
    id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    menu_id INT(9) UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DOUBLE NOT NULL,
    FOREIGN KEY (menu_id)
            REFERENCES restaurant_menu (id)
            ON DELETE CASCADE
);
