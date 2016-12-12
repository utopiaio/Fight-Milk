# 🐼🐼🐼

A simple node/phantom app that sends a form to [INSA](http://www.insa.gov.et/registrationapplication) where the idea of a captcha is grossly misunderstood --- sad & funny at the same time

Mind you this organization is responsible for cyber defense of the country

The image you see below is the background of the captcha. You can literally copy-paste the captcha text 😂😔

![captcha](http://www.insa.gov.et/PartnerRegistrationForm-portlet/images/capchaback.png)

## Application Logic

INSA site is powered by Liferay so it's assumed the site is ***protected*** with cookies, csrf, <`insert another venerability here`>, so using [cheerio](https://www.npmjs.com/package/cheerio) and [superagent](visionmedia.github.io/superagent/) won't cut the 🧀 --- a project with a super-cool name enters, [nightmarejs](www.nightmarejs.org) 😱; so essentially my task is writing simple *timer* "function" (`insa.js`) and one CSS selector.

The whole thing took little over an hour (mostly spent on reading Nightmarejs's documentation)
