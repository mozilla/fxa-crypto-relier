/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jose = require('node-jose');
/**
 * Relier utility functions
 * @module relier-util
 * @private
 */

/**
 * @method extractUrlParam
 * @desc Extracts a parameter from a given URL
 * @param {string} redirectUri - URL
 * @param {string} param - Param we want to extract from the givem URL
 * @returns {string}
 */
function extractUrlParam(redirectUri, param) {
  const url = new URL(redirectUri);
  const params = new URLSearchParams(url.search);

  return params.get(param);
}

/**
 * @method createRandomString
 * @desc Creates a random base64url string of given length
 * @param {number} length - Length of the random string
 * @returns {string}
 */
function createRandomString(length) {
  let buf = new Uint8Array(length);

  return jose.util.base64url.encode(crypto.getRandomValues(buf)).substr(0, length);
}

/**
 * @method sha256base64url
 * @desc Encode a given string into SHA-256 base64url of that string
 * @param {string} str - String to encode
 * @returns {Promise}
 */
function sha256base64url(str) {
  const buffer = new TextEncoder('utf-8').encode(str);

  return crypto.subtle.digest('SHA-256', buffer)
    .then(digest => {
      return jose.util.base64url.encode(digest);
    });
}

/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {String} value
 * @returns {String} URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}

/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj - Object to create query string from
 * @returns {String} - URL safe query string
 */
function objectToQueryString(obj) {
  const queryParams = [];

  for (const key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

module.exports = {
  createQueryParam,
  createRandomString,
  extractUrlParam,
  objectToQueryString,
  sha256base64url,
  Buffer,
  jose
};
