/* global document */
/* eslint no-console: 0 */

const http = require('http');

const config = require('./config');
const insa = require('./insa');

const server = http.createServer();

insa();

// new iPhone [7], who dis
server.on('request', (_, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end(`This app was made to demonstrate how a simple script can bypass the "captcha" system used by [INSA](http://www.insa.gov.et) website

This has the intention that the people responsible for ***this***, update the site so the site is secure again

It's not like the whole site is running on **http** 🙈

Sadly made by [moe](mailto:moe.heroku@gmail.com)

Source hosted on [GitHub](https://github.com/github.com/moe-szyslak/insa-captcha)`);
});

server.listen(process.env.PORT || config.APP_PORT, config.APP_HOST);
