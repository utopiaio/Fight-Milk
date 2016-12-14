/* global document */
/* eslint no-console: 0 */

const http = require('http');

const config = require('./config');
const insa = require('./insa');

const server = http.createServer();
let insaPoll = [];

server.on('request', (request, response) => {
  switch (request.method) {
    case 'LOCK':
      insaPoll.forEach((worker) => {
        clearInterval(worker.insaWait);
        worker.nightmare.end();
      });
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(`Cleared ${insaPoll.length} workers`);
      insaPoll = [];
      return;

    case 'UNLOCK': {
      const worker = insa(config.INSA_URL, { show: false });
      insaPoll.push(worker);
      worker.run();
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(`Created, now running ${insaPoll.length} worker[s]`);
      return;
    }

    // new iPhone [7], who dis
    default:
      response.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
      response.end(`
        This app was made to demonstrate how a simple script can bypass the "captcha" system used by [INSA](http://www.insa.gov.et) website

        This has the intention that the people responsible for ***this***, update the site so the site is secure again

        It's not like the whole site is running on **http** 🙈

        Sadly made by [moe](mailto:moe.heroku@gmail.com)

        Source <soon to be> hosted on [GitHub](https://github.com/github.com/moe-szyslak/insa-captcha)
      `);
  }
});

server.listen(process.env.PORT || config.APP_PORT, config.APP_HOST);
