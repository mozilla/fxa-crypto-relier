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
          keysJwk = util.extractUrlParam(args.url, 'keys_jwk');

          const fxaDeriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

          return fxaDeriverUtils.encryptBundle(keysJwk, JSON.stringify(keySample))
            .then((bundle) => {
              keysJwe = bundle;

              return `https://some.example.com?state=${state}&code=foo`;
            });
        }
      }
    };
  }

  const getBearerTokenRequest = function () {
    return new Promise((resolve) => {
      resolve({
        keys_jwe: keysJwe // eslint-disable-line camelcase
      });
    });
  };

  const oAuthUtils = new window.fxaCryptoRelier.OAuthUtils();

  it('should encrypt and decrypt the bundle', () => {
    return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
      browserApi: getBrowserApi(),
      getBearerTokenRequest: getBearerTokenRequest,
    }).then((result) => {
      const key = result.keys[exampleScope];

      assert.equal(key.k.length, 43, 'key length is correct');
      assert.equal(key.kty, 'oct');
      assert.equal(key.scope, exampleScope);
      assert.equal(key.kid.length, 58);
    });

  });

  it('fails if state does not match', () => {
    return oAuthUtils.launchWebExtensionKeyFlow('clientId', {
      browserApi: getBrowserApi({
        state: 'foo'
      }),
      getBearerTokenRequest: getBearerTokenRequest,
    }).catch((err) => {
      assert.equal(err.message, 'State does not match');
    });

  });

});
