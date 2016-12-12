/* global window, document */
/* eslint no-console: 0 */

const faker = require('faker');
const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);

const nightmare = Nightmare({
  show: true,
  typeInterval: 32,
});

const config = require('./config');

let insaWait = null; // this will be used to refill the page

console.log('Initiating INSA 🔨...');

const insa = () => {
  nightmare.goto(config.INSA_URL)
    // eslint-disable-next-line
    .evaluate(() => document.querySelector(`[style="color:white;font-weight:bold;padding-left:25px;font-size:18px;background:url('/PartnerRegistrationForm-portlet/images/capchaback.png') no-repeat;"]`).innerHTML)
    .then((token) => {
      // eslint-disable-next-line
      const [name, tel, email, fax, tinno] = [faker.name.findName(), faker.phone.phoneNumber().replace(/ x.+$/, ''), faker.internet.email(), faker.phone.phoneNumber().replace(/ x.+$/, ''), faker.phone.phoneNumber().replace(/ x.+$/, '')];

      nightmare
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]', name)
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_telno]', tel)
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_email]', email)
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_fax]', fax)
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_tinno]', tinno)
        .upload('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_attachfile]', '/Users/moe/Desktop/insa/🙈.pdf')
        // .type('[name=exe]', 'pdf') [this will be filled via js on the page]
        .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_usercode]', token)
        .click('button[type=submit]')
        .then(() => {
          if (insaWait !== null) {
            clearInterval(insaWait);
          }

          insaWait = setInterval(() => {
            nightmare
              .wait('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]')
              .evaluate(() => document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]').value)
              .then((v) => {
                // form has been submitted
                if (typeof v === 'string' && v.length === 0) {
                  clearInterval(insaWait);
                  console.log(`Done:
                    Name: ${name}
                    Tel: ${tel}
                    Email: ${email}
                    Fax: ${fax}
                    TIN: ${tinno}
                  `);

                  insa();
                }
              });
          }, 1000);
        })
        .catch((error) => {
          console.error(error);
        });
    });
};

module.exports = insa;
