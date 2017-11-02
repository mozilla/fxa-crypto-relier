/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('KeyUtils', function () {

  describe('createApplicationKeyPair', () => {
    it('should output a JWK public key', () => {
      const keyUtils = new window.fxaCryptoRelier.KeyUtils();

      return keyUtils.createApplicationKeyPair().then((result) => {
        const jwk = result.jwkPublicKey;
        assert.equal(jwk.kty, 'EC');
        assert.equal(jwk.kid.length, 43);
        assert.equal(jwk.crv, 'P-256');
        assert.equal(jwk.x.length, 43);
        assert.equal(jwk.y.length, 43);
      });
    });
  });

  describe('decryptBundle', () => {
    it('fails with no key store', () => {
      const keyUtils = new window.fxaCryptoRelier.KeyUtils();

      return keyUtils.decryptBundle('bundle').catch((err) => {
        assert.equal(err.message, 'No Key Store. Use .createApplicationKeyPair() to create it first.');
      });
    });

    it('can decrypt a bundle', () => {
      const derivedKeys = {
        'https://identity.mozilla.org/apps/notes': {
          'kid': '<opaque key identifier>',
          'k': '<notes encryption key, b64url-encoded>',
          'kty': 'oct'
        }
      };
      const keyUtils = new window.fxaCryptoRelier.KeyUtils();
      const deriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

      return keyUtils.createApplicationKeyPair()
        .then((keys) => {
          return deriverUtils.encryptBundle(keys.jwkPublicKey, JSON.stringify(derivedKeys))
        })
        .then((res) => {
          return keyUtils.decryptBundle(res) // notes
        })
        .then((result) => {
          assert.deepEqual(derivedKeys, result);
        });

    });
  });

});
