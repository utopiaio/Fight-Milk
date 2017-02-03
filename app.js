/* global document */
/* eslint no-console: 0 */

const http = require('http');

const config = require('./config');
const insa = require('./insa');

const server = http.createServer();
let INSA_POLL = [];
let COMPANIES_CREATED = [];

server.on('request', (request, response) => {
  switch (request.method) {
    case 'LOCK':
      INSA_POLL.forEach((worker) => {
        clearInterval(worker.insaWait);
        worker.nightmare.end();
      });
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(`
> cleared ${INSA_POLL.length} worker${INSA_POLL.length > 1 ? 's' : ''}
> ${COMPANIES_CREATED.length} compan${COMPANIES_CREATED.length > 1 ? 'ies' : 'y'} created
> ${COMPANIES_CREATED.map(company => company.email).join(', ')}`);
      INSA_POLL = [];
      COMPANIES_CREATED = [];
      return;

    case 'UNLOCK': {
      const worker = insa(config.INSA_URL, { show: true, typeInterval: 8 });
      INSA_POLL.push(worker);
      worker.run((company) => {
        COMPANIES_CREATED.push(company);
      });
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(`
> now running ${INSA_POLL.length} worker${INSA_POLL.length > 1 ? 's' : ''}`);
      return;
    }

    // new iPhone [7], who dis
    default:
      response.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
      response.end(`
        This app was made to demonstrate how a simple script can bypass the "captcha" system used by [INSA](http://www.insa.gov.et) website

        This has the intention that the people responsible for ***this***, update the site so the site is secure again

        It's not like the whole site is running on **http** 🙈

        Sadly made by [moe](mailto:moe.duffdude@gmail.com)
      `);
  }
});

server.listen(process.env.PORT || config.APP_PORT, config.APP_HOST);
