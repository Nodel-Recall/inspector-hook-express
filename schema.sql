CREATE TABLE IF NOT EXISTS bin (
  id       serial PRIMARY KEY,
  endpoint varchar(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS payload (
  id             serial PRIMARY KEY,
  http_request  JSON,
  http_timestamp timestamp NOT NULL,
  bin_id         int NOT NULL REFERENCES bin (id) ON DELETE CASCADE
);
