/* global document */
/* eslint no-console: 0 */

const path = require('path');
const faker = require('faker');
const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);

// selectors on the DOM
const SELECTOR = {
  // eslint-disable-next-line
  captcha: `[style="color:white;font-weight:bold;padding-left:25px;font-size:18px;background:url('/PartnerRegistrationForm-portlet/images/capchaback.png') no-repeat;"]`,
  name: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_name]',
  telno: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_telno]',
  email: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_email]',
  fax: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_fax]',
  tinno: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_tinno]',
  attachfile: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_attachfile]',
  exe: '[name=exe]',
  usercode: '[name=_partneractionclass_WAR_PartnerRegistrationFormportlet_usercode]',
  submit: 'button[type=submit]',
};

const insa = (url, options) => {
  let insaWait = null; // this will be used to refill the form

  // creating a nightmare instance that'll do a whole lot of typing
  const nightmare = Nightmare(Object.assign({
    show: true,
    typeInterval: 32,
  }, options));

  // generic error handler --- any error thrown by nightmare will halt the instance
  const errorHandler = (error) => {
    clearInterval(insaWait);
    nightmare.halt();
    console.error(error);
  };

  const run = (subscribe) => {
    // [1]
    nightmare
      // wait until captcha DOM is ready
      .wait(SELECTOR.captcha)
      // promise to check on captcha DOM and makes sure it's there
      // otherwise null will be returned on edge cases(i.e. no innerHTML)
      .evaluate((_selector) => {
        let interval = null;

        return new Promise((resolve) => {
          interval = setInterval(() => {
            if (document.querySelector(_selector.captcha) !== null) {
              clearInterval(interval);
              resolve(document.querySelector(_selector.captcha).innerHTML);
            }
          }, 500);
        });
      }, SELECTOR)
      .then((token) => {
        // check for token, if not 11, restart the process from [1]
        if (!token || token.length !== 11) {
          console.log('> token clear');
          clearInterval(insaWait);
          run(subscribe);
          return;
        }

        // getting data from faker
        const [name, telno, email, fax, tinno] = [
          faker.name.findName(),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
          faker.internet.email(),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
        ];

        // a whole lot of typing
        nightmare
          .type(SELECTOR.name, name)
          .type(SELECTOR.telno, telno)
          .type(SELECTOR.email, email)
          .type(SELECTOR.fax, fax)
          .type(SELECTOR.tinno, tinno)
          .upload(SELECTOR.attachfile, path.resolve('./Fight-Milk.pdf')) // 20MB is the max allowed
          // .type(selector.exe, 'pdf') [filled via js on the page - this is their MIME check]
          .type(SELECTOR.usercode, token)
          .click(SELECTOR.submit)
          .then(() => {
            // if there's an "instance" waiting for `selector.name` to be empty, clear it
            if (insaWait !== null) {
              clearInterval(insaWait);
            }

            // checking every second for `selector.name` to be empty after submit
            // so nightmare can start typing again
            insaWait = setInterval(() => {
              nightmare
                // waiting for name, will be evaluated via a promise
                .wait(SELECTOR.name)
                .evaluate((_selector) => {
                  let interval = null;

                  return new Promise((resolve) => {
                    interval = setInterval(() => {
                      if (document.querySelector(_selector.name) !== null) {
                        clearInterval(interval);
                        resolve(document.querySelector(_selector.name).value);
                      }
                    }, 500);
                  });
                }, SELECTOR)
                .then((nameValue) => {
                  // form has been "successfully" submitted, if there's a subscriber, notify
                  if (typeof nameValue === 'string' && nameValue.length === 0) {
                    if (subscribe) {
                      subscribe({ name, telno, email, fax, tinno });
                    }

                    // reseting...
                    clearInterval(insaWait);
                    run(subscribe);
                  }
                });
            }, 1000);
          })
          .catch(errorHandler);
      })
      .catch(errorHandler);
  };

  try {
    nightmare.goto(url);
  } catch (error) {
    errorHandler(error);
  }

  return {
    run,
    insaWait,
    nightmare,
  };
};

module.exports = insa;
