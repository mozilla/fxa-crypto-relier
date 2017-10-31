/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = chai.assert;

describe('OAuthUtils', function () {
  let keysJwk;
  let keysJwe;
  let exampleScope = 'https://identity.mozilla.org/apps/notes';
  let keySample = {
    [exampleScope]: {
      kty: 'oct',
      scope: exampleScope,
      k: 'XQzv2cjJfSMsi3NPn0nVVWprUbhlVvuOBkyEqwvjMdk',
      kid: '20171004201318-jcbS5axUtJCRK3Rc-5rj4fsLhh3LOENEIFGwrau2bjI'
    }
  };

  const browserApi = {
    identity: {
      launchWebAuthFlow: (args) => {
        keysJwk = args.url.split('&').pop().split('=')[1];

        const keysJwk2 = window.fxaCryptoDeriver.jose.util.base64url.decode(JSON.stringify(keysJwk));
        const fxaDeriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

        return fxaDeriverUtils.encryptBundle(keysJwk2, JSON.stringify(keySample))
          .then((bundle) => {
            keysJwe = bundle;

            return 'mock_url';
          });
      }
    }
  };

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
      browserApi: browserApi,
      getBearerTokenRequest: getBearerTokenRequest,
      pkce: true,
    }).then((result) => {
      const key = result.keys[exampleScope];

      assert.equal(key.k.length, 43, 'key length is correct');
      assert.equal(key.kty, 'oct');
      assert.equal(key.scope, exampleScope);
      assert.equal(key.kid.length, 58);
    });

  });

});
