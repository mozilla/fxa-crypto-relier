/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('OAuthUtils', function () {
  const util = window.fxaCryptoRelier.OAuthUtils.__util;
  let keysJwk;
  let keysJwe;
  let exampleScope = 'https://identity.mozilla.com/apps/notes';
  let keySample = {
    [exampleScope]: {
      kty: 'oct',
      scope: exampleScope,
      k: 'XQzv2cjJfSMsi3NPn0nVVWprUbhlVvuOBkyEqwvjMdk',
      kid: '20171004201318-jcbS5axUtJCRK3Rc-5rj4fsLhh3LOENEIFGwrau2bjI'
    }
  };

  function getBrowserApi(options = {}) {
    return {
      identity: {
        launchWebAuthFlow: (args) => {
          const state = options.state || util.extractUrlParam(args.url, 'state');

          // eslint-disable-next-line consistent-return
          return Promise.resolve().then(() => {
            keysJwk = util.extractUrlParam(args.url, 'keys_jwk');

            if (keysJwk) {
              const fxaDeriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

              return fxaDeriverUtils.encryptBundle(keysJwk, JSON.stringify(keySample))
                .then(bundle => {
                  keysJwe = bundle;
                });
            }
          }).then(() => {
            return `https://some.example.com?state=${state}&code=foo`;
          });
        }
      }
    };
  }

  const getBearerTokenRequest = function () {
    /* eslint-disable camelcase */
    const result = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
    };

    if (keysJwe) {
      result.keys_jwe = keysJwe;
    }
    /* eslint-enable camelcase */

    return Promise.resolve(result);
  };

  const ensureOpenIDConfiguration = function () {
    return Promise.resolve({
      /* eslint-disable camelcase*/
      authorization_endpoint: 'https://test.fxa.stack/authorize',
      token_endpoint: 'https://oauth.test.fxa.stack/token',
      /* eslint-enable camelcase*/
    });
  };

  const oAuthUtils = new window.fxaCryptoRelier.OAuthUtils();

  describe('launchWebExtensionFlow', () => {
    it('should encrypt and decrypt the bundle', () => {
      return oAuthUtils.launchWebExtensionFlow('clientId', {
        browserApi: getBrowserApi(),
        ensureOpenIDConfiguration,
        getBearerTokenRequest,
      }).then((result) => {
        assert.isUndefined(result.keys);
        assert.isUndefined(result.keys_jwe);
        assert.strictEqual(result.access_token, 'access_token');
        assert.strictEqual(result.refresh_token, 'refresh_token');
      });
    });

    it('fails if state does not match', () => {
      return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
        browserApi: getBrowserApi({
          state: 'foo'
        }),
        ensureOpenIDConfiguration,
        getBearerTokenRequest,
      }).catch((err) => {
        assert.equal(err.message, 'State does not match');
      });
    });
  });

  describe('launchWebExtensionKeyFlow', () => {
    it('should encrypt and decrypt the bundle', () => {
      return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
        browserApi: getBrowserApi(),
        ensureOpenIDConfiguration,
        getBearerTokenRequest,
      }).then((result) => {
        const key = result.keys[exampleScope];

        assert.equal(key.k.length, 43, 'key length is correct');
        assert.equal(key.kty, 'oct');
        assert.equal(key.scope, exampleScope);
        assert.equal(key.kid.length, 58);
      });
    });

    it('should fail if keys_jwe is not returned', () => {
      return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
        browserApi: getBrowserApi(),
        ensureOpenIDConfiguration,
        getBearerTokenRequest: () => Promise.resolve({ token: 'token' }),
      }).then(assert.fail, (err) => {
        assert.strictEqual(err.message, 'Failed to fetch bundle');
      });
    });

    it('fails if state does not match', () => {
      return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
        browserApi: getBrowserApi({
          state: 'foo'
        }),
        ensureOpenIDConfiguration,
        getBearerTokenRequest,
      }).catch((err) => {
        assert.equal(err.message, 'State does not match');
      });
    });
  });
});
