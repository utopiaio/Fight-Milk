/* global document */
/* eslint no-console: 0 */

const path = require('path');
const faker = require('faker');
const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);

const selector = {
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

  const nightmare = Nightmare(Object.assign({
    show: true,
    typeInterval: 32,
  }, options));

  const errorHandler = (error) => {
    clearInterval(insaWait);
    nightmare.halt();
    console.error(error);
  };

  const run = (subscribe) => {
    nightmare
      .wait(selector.captcha)
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
      }, selector)
      .then((token) => {
        if (!token || token.length !== 11) {
          console.log('> token clear');
          clearInterval(insaWait);
          run(subscribe);
          return;
        }

        const [name, telno, email, fax, tinno] = [
          faker.name.findName(),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
          faker.internet.email(),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
          faker.phone.phoneNumber().replace(/ x.+$/, ''),
        ];

        nightmare
          .type(selector.name, name)
          .type(selector.telno, telno)
          .type(selector.email, email)
          .type(selector.fax, fax)
          .type(selector.tinno, tinno)
          .upload(selector.attachfile, path.resolve('./🙈.pdf')) // 20MB is the max allowed
          // .type(selector.exe, 'pdf') [filled via js on the page - this is their MIME check]
          .type(selector.usercode, token)
          .click(selector.submit)
          .then(() => {
            if (insaWait !== null) {
              clearInterval(insaWait);
            }

            insaWait = setInterval(() => {
              nightmare
                .wait(selector.name)
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
                }, selector)
                .then((nameValue) => {
                  // form has been submitted and waiting for form reset...
                  if (typeof nameValue === 'string' && nameValue.length === 0) {
                    if (subscribe) {
                      subscribe({ name, telno, email, fax, tinno });
                    }

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
