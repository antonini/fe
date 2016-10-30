// Promise
if (typeof Promise === 'undefined') {
  require('promise/lib/rejection-tracking').enable()
  window.Promise = require('promise/lib/es6-extensions.js')
}

// fetch
require('whatwg-fetch')

// Object.assign
Object.assign = require('object-assign')
