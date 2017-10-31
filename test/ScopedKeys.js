/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('ScopedKeys', function () {
  const scopedKeys = new window.fxaCryptoDeriver.ScopedKeys();
  const sampleKb = 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
  const identifier = 'https://identity.mozilla.com/apps/notes';
  const timestamp = 1494446722583; // GMT Wednesday, May 10, 2017 8:05:22.583 PM
  const keyMaterial = '0000000000000000000000000000000000000000000000000000000000000000';

  it('should have HKDF work', () => {
    return scopedKeys.deriveScopedKeys({
      inputKey: sampleKb,
      keyMaterial: keyMaterial,
      timestamp: timestamp,
      identifier: identifier
    })
      .then((key) => {
        const k = key[identifier];
        const importSpec = {
          name: 'AES-CTR',
        };

        assert.equal(k.kty, 'oct');
        assert.equal(k.k.length, 43);
        assert.equal(k.kid, '1494446723-22CKNr50kLef9dfvw5ByuRYlRtfLRzUfgH3Ip8eFj1o');
        assert.equal(k.scope, identifier);
        window.crypto.subtle.importKey('jwk', k, importSpec, false, ['encrypt']).then(function (rawKey) {
          assert.equal(rawKey.type, 'secret');
          assert.equal(rawKey.usages[0], 'encrypt');
          assert.equal(rawKey.extractable, false);
        }).catch(function (err) {
          console.error(err);
          throw err;
        });
      });

  });
});
