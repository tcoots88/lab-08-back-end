'use strict';

// Dependencies
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');


// dotenv is configuration
require('dotenv').config();

// cors is middleware, we USE middleware
app.use(cors());

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/events', getEvents);

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


// functions to pull data from JSON
// function geoCoord(query) {
//   const geoData = require('./data/geo.json');
//   const location = new Location(geoData.results[0]);
//   return location;
// }

// function searchWeather(query) {
//   {
//     let darkSkyData = require('./data/darksky.json');
//     console.log(darkSkyData);
//     let weatherArray = darkSkyData.daily.data.map(forecast => (new Daily(forecast)));
//     console.log(weatherArray);
//     return weatherArray;
//   }
// }

function getEvents(request, response) {
  // console.log(request.query);
  // console.log(response);
  // go to eventful, get data and get it to look like this
  superagent.get(`http://api.eventful.com/json/events/search?where=${request.query.data.latitude},${request.query.data.longitude}&within=25&app_key=${process.env.EVENTBRITE_API_KEY}`).then(data => {
    // console.log(JSON.parse(data.text).events.event[0]);
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
