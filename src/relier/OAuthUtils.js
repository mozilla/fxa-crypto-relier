/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 global browser
 */

const jose = require('node-jose');

const KeyUtils = require('./KeyUtils');
const util = require('./util');
const fxaKeyUtils = new KeyUtils();

const OAUTH_SERVER_URL = 'https://oauth.accounts.firefox.com/v1';
const CONTENT_SERVER_URL = 'https://accounts.firefox.com';

/**
 * OAuth methods to authenticate with Firefox Accounts and get scoped keys
 * @module relier-OAuthUtils
 * @example
 * ```js
 * const fxaKeysUtil = new fxaCryptoRelier.OAuthUtils();
 *
 * fxaKeysUtil.launchWebExtensionKeyFlow('YOUR_CLIENT_ID', {
 *   redirectUri: browser.identity.getRedirectURL(),
 *   scopes: ['profile', 'https://identity.mozilla.com/apps/lockbox'],
 * }).then((loginDetails) => {
 *   const key = loginDetails.keys['https://identity.mozilla.com/apps/lockbox'];
 *   const credentials = {
 *     access_token: loginDetails.access_token,
 *     refresh_token: loginDetails.refresh_token,
 *     key
 * };
 * ```
 */
class OAuthUtils {
  /**
   * @constructor
   * @param {object} [options]
   * @param {string} [options.oauthServer] - Custom Firefox Accounts OAuth server
   * @param {string} [options.contentServer] - Custom Firefox Accounts Content server
   */
  constructor(options = {}) {
    this.oauthServer = options.oauthServer || OAUTH_SERVER_URL;
    this.contentServer = options.contentServer || CONTENT_SERVER_URL;
  }
  /**
   * @method launchWebExtensionKeyFlow
   * @desc Used to launch the Firefox Accounts scope key login flow in WebExtensions
   * @param {string} clientId - FxA relier client id
   * @param {object} [options={}]
   * @param {array} [options.scopes=[]] - Requested OAuth scopes
   * @param {object} [options.browserApi=browser] - Custom browser API override
   * @param {function} [options.getBearerTokenRequest=getBearerTokenRequest] -
   *   Custom getBearerTokenRequest function override
   * @returns {Promise}
   */
  launchWebExtensionKeyFlow(clientId, options = {}) {
    if (! clientId) {
      throw new Error('clientId required');
    }

    const browserApi = options.browserApi || browser;
    const getBearerTokenRequest = options.getBearerTokenRequest || this._getBearerTokenRequest;
    const SCOPES = options.scopes || [];

    const state = util.createRandomString(16);
    const codeVerifier = util.createRandomString(43);
    const queryParams = {
      access_type: 'offline', // eslint-disable-line camelcase
      client_id: clientId, // eslint-disable-line camelcase
      redirect_uri: options.redirectUri, // eslint-disable-line camelcase
      scope: SCOPES.join(' '),
      state: state
    };

    return util.sha256base64url(codeVerifier).then(codeChallenge => {
      queryParams.response_type = 'code'; // eslint-disable-line camelcase
      queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
      queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase

      return fxaKeyUtils.createApplicationKeyPair();
    }).then((keyTypes) => {
      const base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');

      queryParams.keys_jwk = base64JwkPublicKey; // eslint-disable-line camelcase

      const authUrl = `${this.contentServer}/authorization` + util.objectToQueryString(queryParams);

      return browserApi.identity.launchWebAuthFlow({
        interactive: true,
        url: authUrl
      });
    }).then((redirectURL) => {
      const redirectState = util.extractUrlParam(redirectURL, 'state');
      const code = util.extractUrlParam(redirectURL, 'code');

      if (state !== redirectState) {
        throw new Error('State does not match');
      }

      return getBearerTokenRequest(this.oauthServer, code, clientId, codeVerifier);
    }).then((tokenResult) => {
      const bundle = tokenResult.keys_jwe;

      if (! bundle) {
        throw new Error('Failed to fetch bundle');
      }

      return fxaKeyUtils.decryptBundle(bundle)
        .then(function (keys) {
          delete tokenResult.keys_jwe;

          tokenResult.keys = keys;
          return tokenResult;
        });
    });
  }
  /**
   * @method _getBearerTokenRequest
   * @desc Used to fetch the bearer token from the Firefox Accounts OAuth server
   * @private
   * @param {string} server - Firefox Accounts server
   * @param {string} code - OAuth redirect code
   * @param {string} clientId - OAuth client id
   * @param {string} codeVerifier - PKCE code verifier
   * @param {object} [options] - custom options
   * @param {function} [options.fetch] - custom `fetch` interface
   * @returns {Promise}
   */
  _getBearerTokenRequest(server, code, clientId, codeVerifier, options = {}) {
    const fetchInterface = options.fetch || fetch;
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');

    const request = new Request(`${server}/token`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        code: code,
        client_id: clientId, // eslint-disable-line camelcase
        code_verifier: codeVerifier // eslint-disable-line camelcase
      })
    });

    return fetchInterface(request).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else { // eslint-disable-line no-else-return
        throw new Error('Failed to fetch token');
      }
    });
  }

}

// Exposed for testing purposes
OAuthUtils.__util = util;

module.exports = OAuthUtils;
