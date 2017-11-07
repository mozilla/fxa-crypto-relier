/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('ScopedKeys', function () {
  const scopedKeys = new window.fxaCryptoDeriver.ScopedKeys();
  const util = window.fxaCryptoRelier.OAuthUtils.__util;
  const sampleKb = 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
  const identifier = 'https://identity.mozilla.com/apps/notes';
  const timestamp = 1494446722583; // GMT Wednesday, May 10, 2017 8:05:22.583 PM
  const keyMaterial = '0000000000000000000000000000000000000000000000000000000000000000';

  it('should have HKDF work', () => {
    return scopedKeys.deriveScopedKey({
      inputKey: sampleKb,
      keyMaterial: keyMaterial,
      timestamp: timestamp,
      identifier: identifier
    })
      .then((key) => {
        const k = key;
        const importSpec = {
          name: 'AES-CTR',
        };

        assert.equal(k.kty, 'oct');
        assert.equal(k.k.length, 43);
        assert.equal(k.kid, '1494446723-22CKNr50kLef9dfvw5ByuRYlRtfLRzUfgH3Ip8eFj1o');
        assert.equal(k.scope, identifier);
        return window.crypto.subtle.importKey('jwk', k, importSpec, false, ['encrypt']).then(function (rawKey) {
          assert.equal(rawKey.type, 'secret');
          assert.equal(rawKey.usages[0], 'encrypt');
          assert.equal(rawKey.extractable, false);
        }).catch(function (err) {
          console.error(err);
          throw err;
        });
      });
  });

  it('validates timestamp', () => {
    return scopedKeys.deriveScopedKey({
      inputKey: sampleKb,
      keyMaterial: keyMaterial,
      timestamp: 100,
      identifier: identifier
    }).catch((err) => {
      assert.equal(err.message, 'timestamp must be a 13-digit number');
    });
  });

  describe('_deriveHKDF', () => {
    it('vector 1', () => {
      const inputKey = '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b';
      const keyMaterial = '000102030405060708090a0b0c';
      const context = 'f0f1f2f3f4f5f6f7f8f9';
      return scopedKeys._deriveHKDF(keyMaterial, inputKey, context, 42).then((key) => {
        assert.equal(key.toString('hex'), '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865');
      });
    });

    it('vector 2', () => {
      const inputKey = '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b';
      const keyMaterial = '';
      const context = '';
      return scopedKeys._deriveHKDF(keyMaterial, inputKey, context, 42).then((key) => {
        assert.equal(key.toString('hex'), '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8');
      });
    });

    it('vector 3', () => {
      const inputKey = '4a9cbe5ae7190a7bb7cc54d5d84f5e4ba743904f8a764933b72f10260067375a';
      const keyMaterial = '';
      const context = util.Buffer.from('identity.mozilla.com/picl/v1/keyFetchToken').toString('hex');
      return scopedKeys._deriveHKDF(keyMaterial, inputKey, context, 3 * 32).then((key) => {
        assert.equal(key.toString('hex'), 'f4df04ffb79db35e94e4881719a6f145f9206e8efea17fc9f02a5ce09cbfac1e829a935f34111d75e0d16b7aa178e2766759eedb6f623c0babd2abcfea82bc12af75f6aa543a8ba7e0a029f87c785c4af0ad03889f7437f735b5256a88fc73fd');
      });
    });

    it('vector 4', () => {
      const inputKey = 'ba0a107dab60f3b065ff7a642d14fe824fbd71bc5c99087e9e172a1abd1634f1';
      const keyMaterial = '';
      const context = util.Buffer.from('identity.mozilla.com/picl/v1/account/keys').toString('hex');
      return scopedKeys._deriveHKDF(keyMaterial, inputKey, context, 3 * 32).then((key) => {
        assert.equal(key.toString('hex'), '17ab463653a94c9a6419b48781930edefe500395e3b4e7879a2be1599975702285de16c3218a126404668bf9b7acfb6ce2b7e03c8889047ba48b8b854c6d8beb3ae100e145ca6d69cb519a872a83af788771954455716143bc08225ea8644d85');
      });
    });

    it('vector 5', () => {
      const inputKey = 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
      const keyMaterial = '0000000000000000000000000000000000000000000000000000000000000000';
      const context = util.Buffer.from('https://identity.mozilla.com/apps/notes').toString('hex');
      return scopedKeys._deriveHKDF(keyMaterial, inputKey, context, 32).then((key) => {
        assert.equal(key.toString('hex'), '989131d32cd665c26a57cf9ece14d0e5cf015834e9d2916d683a3bb486ceb06f');
      });
    });
  });

});
