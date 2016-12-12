/* eslint no-console: 0 */

const http = require('http');
const express = require('express');

const config = require('./config');

const app = express();

app.set('port', process.env.PORT || config.APP_PORT);

const server = http.createServer(app); // creating server which express will piggy back on
server.listen(app.get('port'), config.APP_HOST, () => {
  console.log(`Server running on ${config.APP_HOST}:${config.APP_PORT}...`);
});
