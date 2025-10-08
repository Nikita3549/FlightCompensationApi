CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    name TEXT,
    city TEXT,
    country TEXT,
    iata_code TEXT,
    icao_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    altitude INTEGER,
    timezone_offset TEXT,
    dst TEXT,
    tz TEXT,
    type TEXT,
    source TEXT
);

CREATE TABLE airlines (
    id SERIAL PRIMARY KEY,
    name TEXT,
    alias TEXT,
    iata_code TEXT,
    icao_code TEXT,
    callsign TEXT,
    country TEXT,
    active BOOLEAN
);

COPY airlines
FROM '/docker-entrypoint-initdb.d/airlines.csv'
WITH (
    FORMAT csv,
    HEADER true,
    NULL '\N'
);

COPY airports
FROM '/docker-entrypoint-initdb.d/airports.csv'
DELIMITER ','
CSV HEADER;
