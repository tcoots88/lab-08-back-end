DROP TABLE IF EXISTS locations, weather,  events;


CREATE TABLE
locations(
locationId SERIAL PRIMARY KEY,
search_query VARCHAR(255),
formatted_query VARCHAR(255),
latitude DECIMAL ,
longitude DECIMAL,

);


CREATE TABLE 
weather(
weatherId SERIAL PRIMARY KEY,
forecast VARCHAR(255),
time TEXT,
weatherIndex INTEGER NOT NULL,
FOREIGN KEY(weatherIndex) REFERENCES locations(locationId)


);


CREATE TABLE 
events (
eventId SERIAL PRIMARY KEY,
link VARCHAR(255),
name VARCHAR(255),
event_date TEXT,
summary VARCHAR(255),
eventIndex INTEGER NOT NULL,
FOREIGN KEY(eventIndex) REFERENCES locations(locationId)
);

