DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS items;

CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );

CREATE TABLE
  items (
    id SERIAL PRIMARY KEY,
    item TEXT NOT NULL,
    user_id INTEGER
  );