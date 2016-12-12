/* global document */
/* eslint no-console: 0 */

const http = require('http');
const express = require('express');

const config = require('./config');
const insa = require('./insa');

const app = express();

insa();

// new iPhone [7], who dis
app.all('*', (_, response) => {
  response
    .set('Content-Type', 'text/plain;charset=UTF-8')
    .status(200)
    .send(`This app was made to demonstrate how a simple script can bypass the "captcha" system used by [INSA](http://www.insa.gov.et) website

This has the intention that the people responsible for ***this***, update the site so the site is secure again

It's not like the whole site is running on **http** 🙈

Sadly made by [moe](mailto:moe.heroku@gmail.com)

Source hosted on [GitHub](https://github.com/github.com/moe-szyslak/insa-captcha)`)
    .end();
});

app.set('port', process.env.PORT || config.APP_PORT);

const server = http.createServer(app); // creating server which express will piggy back on
server.listen(app.get('port'), config.APP_HOST, () => {
  console.log(`Server running on ${config.APP_HOST}:${config.APP_PORT}...`);
});
