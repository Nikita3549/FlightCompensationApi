TRUNCATE airlines RESTART IDENTITY;
COPY airlines FROM '/docker-entrypoint-initdb.d/airlines.csv' WITH (FORMAT csv, HEADER true, NULL '\N');

TRUNCATE airports RESTART IDENTITY;
COPY airports FROM '/docker-entrypoint-initdb.d/airports.csv' WITH (FORMAT csv, HEADER true, NULL '\N');
