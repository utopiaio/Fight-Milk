/* global document */
/* eslint no-console: 0 */

const path = require('path');
const faker = require('faker');
const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);

const insa = (url, options) => {
  let insaWait = null; // this will be used to refill the form
  let cleanSweep = null; // if site freezes, restarts form processing
  const nightmare = Nightmare(Object.assign({
    show: true,
    typeInterval: 32,
  }, options));

  const run = (subscribe) => {
    nightmare
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
          .upload('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_attachfile]', path.resolve('./🙈.pdf')) // 20MB is the max allowed
          // .type('[name=exe]', 'pdf') [filled via js on the page - this is their MIME check]
          .type('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_usercode]', token)
          .click('button[type=submit]')
          .then(() => {
            if (insaWait !== null) {
              clearInterval(insaWait);
              clearTimeout(cleanSweep);
            }

            insaWait = setInterval(() => {
              nightmare
                .wait('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]')
                .evaluate(() => document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]').value)
                .then((nameValue) => {
                  // form has been submitted and waiting for form reset...
                  if (typeof nameValue === 'string' && nameValue.length === 0) {
                    if (subscribe) {
                      subscribe({ name, tel, email, fax, tinno });
                    }
                    clearInterval(insaWait);
                    clearTimeout(cleanSweep);
                    run(subscribe);
                  }
                });
            }, 1000);

            // after 5 seconds if form isn't reset --- we'll reset it ourselves
            cleanSweep = setTimeout(() => {
              nightmare
                .evaluate(() => {
                  console.log('resetting form...');
                  document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]').value = '';
                  document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_telno]').value = '';
                  document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_email]').value = '';
                  document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_fax]').value = '';
                  document.querySelector('[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_tinno]').value = '';
                  return 'cleared';
                })
                .then(() => {
                  clearInterval(insaWait);
                  run(subscribe);
                });
            }, 5000);
          })
          .catch((error) => {
            nightmare.end();
            console.error(error);
          });
      })
      .catch((err) => {
        nightmare.end();
        console.error(err);
      });
  };

  try {
    nightmare.goto(url);
  } catch (err) {
    nightmare.end();
    console.error(err);
  }

  return {
    run,
    insaWait,
    nightmare,
  };
};

module.exports = insa;
