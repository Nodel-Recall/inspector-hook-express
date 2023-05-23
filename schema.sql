CREATE TABLE IF NOT EXISTS bin (
  id       serial PRIMARY KEY,
  endpoint varchar(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS payload (
  id serial      PRIMARY KEY,
  http_request   json,
  http_timestamp timestamp NOT NULL,
  bin_id         integer NOT NULL REFERENCES bin (id) ON DELETE CASCADE
);
