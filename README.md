# Fight Milk

![Fight Milk](https://raw.githubusercontent.com/moe-szyslak/Fight-Milk/master/Fight-Milk.png "Fight Milk")

A simple node phantom app that sends a form to [INSA](http://www.insa.gov.et/registrationapplication) where the idea of a captcha is grossly misunderstood --- sad & funny at the same time

Mind you this organization is responsible for cyber defense of the country

The image you see below is the background of the captcha. You can literally copy-paste the captcha text 😂😔

![captcha](http://www.insa.gov.et/PartnerRegistrationForm-portlet/images/capchaback.png)

## Usage
```bash
# cd to project folder
$ yarn # or `$ npm install`
$ node app.js # starts server on `localhost:8000`
# 💡 Using httpie (http://httpie.org) as HTTP client
$ http UNLOCK localhost:8000 # initiates a Phantom instance
$ http LOCK localhost:8000 # stops all instances and shows stats
```

## Application Logic

INSA site is powered by Liferay so it's assumed the site is ***protected*** with cookies, csrf, <`insert another venerability here`>, so using [cheerio](https://www.npmjs.com/package/cheerio) and [superagent](https://visionmedia.github.io/superagent/) won't cut the 🧀 --- a project with a super-cool name enters, [nightmarejs](http://www.nightmarejs.org); so essentially my task is writing simple *timer* "function" (`insa.js`) and one CSS selector.

The whole thing took little over an hour (mostly spent on reading Nightmarejs's documentation)

## ⚠️⚡️ Note ⚡️⚠️
After sending a couple of hundred requests, the site takes ~10 seconds to process a request ⏲
