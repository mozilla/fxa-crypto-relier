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
    this.contentServer = options.contentServer || CONTENT_SERVER_URL;
  }

  /**
   * @method launchWebExtensionFlow
   * @desc Used to launch the Firefox Accounts login flow in WebExtensions. Does not
   * fetch scoped keys.
   * @param {string} clientId - FxA relier client id
   * @param {object} [options={}]
   * @param {string} [options.action='email'] - Specifies the behavior of users sent to `/`.
   *   Valid values are: `email`, `signin`, `signup`
   * @param {URI} [options.redirectUri=''] - URI to redirect to when flow completes
   * @param {string} [options.deviceId] - A valid deviceId for metrics, should be paired with flowId and flowBeginTime
   * @param {string} [options.flowId] - A valid flowId for metrics, should be paired with deviceId and flowBeginTime
   * @param {num} [options.flowBeginTime] - A valid flowBeginTime for metrics, should be paired with deviceId and flowId
   * @param {array} [options.scopes=[]] - Requested OAuth scopes
   * @param {object} [options.browserApi=browser] - Custom browser API override
   * @param {function} [options.ensureOpenIDConfiguration=ensureOpenIDConfiguration] -
   *   Custom ensureOpenIDConfiguration function override
   * @param {function} [options.getBearerTokenRequest=getBearerTokenRequest] -
   *   Custom getBearerTokenRequest function override
   * @returns {Promise}
   */
  launchWebExtensionFlow(clientId, options = {}) {
    if (! clientId) {
      throw new Error('clientId required');
    }

    const browserApi = options.browserApi || browser;
    const ensureOpenIDConfiguration = options.ensureOpenIDConfiguration || this._ensureOpenIDConfiguration.bind(this);
    const getBearerTokenRequest = options.getBearerTokenRequest || this._getBearerTokenRequest;
    const SCOPES = options.scopes || [];

    const state = util.createRandomString(16);
    const codeVerifier = util.createRandomString(43);
    const queryParams = {
      access_type: 'offline', // eslint-disable-line camelcase
      action: options.action || 'email',
      client_id: clientId, // eslint-disable-line camelcase
      redirect_uri: options.redirectUri, // eslint-disable-line camelcase
      scope: SCOPES.join(' '),
      state: state
    };

    // since metrics flows properties require one another, let's make sure we have them all
    if (options.hasOwnProperty('flowId') &&
        options.hasOwnProperty('deviceId') &&
        options.hasOwnProperty('flowBeginTime')) {
      queryParams.device_id = options.deviceId; // eslint-disable-line camelcase
      queryParams.flow_begin_time = options.flowBeginTime; // eslint-disable-line camelcase
      queryParams.flow_id = options.flowId; // eslint-disable-line camelcase
    }

    let openIDConfiguration;

    return util.sha256base64url(codeVerifier).then(codeChallenge => {
      queryParams.response_type = 'code'; // eslint-disable-line camelcase
      queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
      queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase

      if (options.keysJwk) {
        queryParams.keys_jwk = options.keysJwk; // eslint-disable-line camelcase
      }

      return ensureOpenIDConfiguration();
    }).then((_openIDConfiguration) => {
      openIDConfiguration = _openIDConfiguration;
      const authUrl = `${openIDConfiguration.authorization_endpoint}` + util.objectToQueryString(queryParams);

      return browserApi.identity.launchWebAuthFlow({
        interactive: true,
        url: authUrl
      });
    }).then(redirectURL => {
      const redirectState = util.extractUrlParam(redirectURL, 'state');
      const code = util.extractUrlParam(redirectURL, 'code');

      if (state !== redirectState) {
        throw new Error('State does not match');
      }
      return getBearerTokenRequest(openIDConfiguration.token_endpoint, code, clientId, codeVerifier);
    });
  }

  /**
   * @method launchWebExtensionKeyFlow
   * @desc Used to launch the Firefox Accounts scope key login flow in WebExtensions
   * @param {string} clientId - FxA relier client id
   * @param {object} [options={}]
   * @param {string} [options.action='email'] - Specifies the behavior of users sent to `/`.
   *   Valid values are: `email`, `signin`, `signup`
   * @param {URI} [options.redirectUri=''] - URI to redirect to when flow completes
   * @param {array} [options.scopes=[]] - Requested OAuth scopes
   * @param {object} [options.browserApi=browser] - Custom browser API override
   * @param {function} [options.ensureOpenIDConfiguration=ensureOpenIDConfiguration] -
   *   Custom ensureOpenIDConfiguration function override
   * @param {function} [options.getBearerTokenRequest=getBearerTokenRequest] -
   *   Custom getBearerTokenRequest function override
   * @returns {Promise}
   */
  launchWebExtensionKeyFlow(clientId, options = {}) {
    if (! clientId) {
      throw new Error('clientId required');
    }

    return fxaKeyUtils.createApplicationKeyPair()
      .then(keyTypes => {
        const base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');

        options.keysJwk = base64JwkPublicKey; // eslint-disable-line camelcase

        return this.launchWebExtensionFlow(clientId, options);
      }).then(tokenResult => {
        const bundle = tokenResult.keys_jwe; // eslint-disable-line camelcase

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
   * @param {string} tokenEndpoint - The token endpoint
   * @param {string} code - OAuth redirect code
   * @param {string} clientId - OAuth client id
   * @param {string} codeVerifier - PKCE code verifier
   * @param {object} [options] - custom options
   * @param {function} [options.fetch] - custom `fetch` interface
   * @returns {Promise}
   */
  _getBearerTokenRequest(tokenEndpoint, code, clientId, codeVerifier, options = {}) {
    const fetchInterface = options.fetch || fetch;
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');

    const request = new Request(tokenEndpoint, {
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

  _ensureOpenIDConfiguration(options = {}) {
    if (this.openIDConfiguration) {
      return Promise.resolve(this.openIDConfiguration);
    }

    const fetchInterface = options.fetch || fetch;

    return fetchInterface(`${this.contentServer}/.well-known/openid-configuration`, {
      method: 'GET'
    }).then(response => {
      if (response.status === 200) {
        this.openIDConfiguration = response.json();
        return this.openIDConfiguration;
      } else { // eslint-disable-line no-else-return
        throw new Error('Failed to /.well-known/openid-configuration');
      }
    });
  }

}

// Exposed for testing purposes
OAuthUtils.__util = util;

module.exports = OAuthUtils;
