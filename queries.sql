DROP TABLE IF EXISTS items;

CREATE TABLE items (id SERIAL PRIMARY KEY, item TEXT NOT NULL);

INSERT INTO
  items (item)
VALUES
  ('Learn React'),
  ('Practice authentication'),
  (
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eleifend faucibus eros, sit amet ultricies odio sodales quis. Suspendisse eleifend erat urna, a dictum neque porta vitae. Praesent ornare sollicitudin urna sit amet semper. Nam imperdiet magna eget ipsum aliquam vestibulum pretium at nibh. Phasellus quis mi lacinia, congue augue vel, malesuada turpis.'
  );