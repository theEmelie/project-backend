DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(50),
    birthdate DATETIME,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,
    UNIQUE(email)
);

DROP TABLE IF EXISTS objects;
CREATE TABLE IF NOT EXISTS objects (
    name VARCHAR(100) NOT NULL,
    current_price INT NOT NULL
);

DROP TABLE IF EXISTS depots;
CREATE TABLE IF NOT EXISTS depots (
    balance INT,
    user_rowid INT
);

DROP TABLE IF EXISTS objects_in_depot;
CREATE TABLE IF NOT EXISTS objects_in_depot (
    object_rowid INT,
    depot_rowid INT,
    number_of_objects INT
);
