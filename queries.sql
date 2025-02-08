DROP TABLE IF EXISTS items;

CREATE TABLE items (id SERIAL PRIMARY KEY, task TEXT NOT NULL);

INSERT INTO
  items (task)
VALUES
  ('Learn React'),
  ('Practice authentication');