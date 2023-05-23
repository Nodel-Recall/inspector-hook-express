CREATE TABLE IF NOT EXISTS bin (
  PRIMARY KEY (id),
  id       serial,
  endpoint varchar(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS payload (
  PRIMARY KEY (id),
  id             serial,
  http_request   json,
  http_timestamp timestamp NOT NULL,
  bin_id         integer NOT NULL,
  FOREIGN KEY (bin_id)
  REFERENCES bin (id)
  ON DELETE CASCADE
);
