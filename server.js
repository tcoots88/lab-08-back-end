'use strict';

// Dependencies
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const app = express();
const pg =require ('pg');
const superagent = require('superagent');


// dotenv is configuration
require('dotenv').config();

// cors is middleware, we USE middleware
app.use(cors());
// app.use(pg());

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/events', getEvents);


//database function 

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', (error) => console.error(error));


// function to query the database
function dataBaseQuery(DATABASE, location) {
  const query = client.query(DATABASE, [location]);
  if(query.rowCount) {
    return query.rows;
  }
}

// check the database
function locationDatabaseCheck(request,response){
const DATABASE = 'SELECT * FROM locations WHERE search_query =$1';
let verifyResult = dataBaseQuery(DATABASE,request)
if(verifyResult){
  response.send(verifyResult[0]);
}

};


//store data for locations

function saveNewLocations(location){
  let newDataBaseObject = `INSERT INTO location(
    search_query,
    formatted_query,
    latitude,
    longitude
   ) VALUES(
    $1,
    $2,
    $3,
    $4

)RETURNING  locationId`;
let locationStats =[location.search_query,location.formatted_query,location.latitude,location.longitude];
client.query(newDataBaseObject,locationStats);



}

//  Request the query input and send the data
function getLocation(request, response) {
  console.log(request.query.data);
  superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODING_API_KEY}`).then(result => {
    const location = new Location(request.query.data, result);
    response.send(location);
  })
    .catch(err => handleError(err, response));
}



function getWeather(request, response) {
  superagent.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`).then(result => {
    const weatherArr = result.body.daily.data
    const reply = weatherArr.map(byDay => {
      return new Daily(byDay);
    })
    response.send(reply);
  })
    .catch(err => handleError(err, response));
}

// Constructors for saving the variable
function Location(query, response) {
  this.search_query = query;
  this.formatted_query = response.body.results[0].formatted_address;
  this.latitude = response.body.results[0].geometry.location.lat;
  this.longitude = response.body.results[0].geometry.location.lng;
}

function Daily(dailyForecast) {
  console.log(dailyForecast);
  this.forecast = dailyForecast.summary;
  this.time = new Date(dailyForecast.time * 1000).toDateString();
}



function getEvents(request, response) {
  
  superagent.get(`http://api.eventful.com/json/events/search?where=${request.query.data.latitude},${request.query.data.longitude}&within=25&app_key=${process.env.EVENTBRITE_API_KEY}`).then(data => {
    const allEvents = JSON.parse(data.text).events.event;

    const allData = allEvents.map(event => {
      return {
        'link': event.url,
        'name': event.title,
        'event_date': event.start_time,
        'summary': event.description
      };
    });

    response.send(allData);

  });

}

// Error Handler
function handleError(err, response) {
  console.log(err);
  if (response) response.status(500).send('Sorry something went wrong');
}



// telling to listen for the PORT and display to ensure that the port is running
app.listen(PORT, () => {
  console.log(`app is running on PORT: ${PORT}`);


})

