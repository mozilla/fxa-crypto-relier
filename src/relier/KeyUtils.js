/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let jose = require('node-jose');

/**
 * Scoped key utilities
 * @module relier-KeyUtils
 * @private
 */
class KeyUtils {
  constructor() {
    this.keystore = null;
  }

  createApplicationKeyPair() {
    const keystore = jose.JWK.createKeyStore();

    return keystore.generate('EC', 'P-256')
      .then((keyPair) => {
        this.keystore = keystore;

        return {
          jwkPublicKey: keyPair.toJSON()
        };
      });
  }

  decryptBundle(bundle) {
    if (! this.keystore) {
      throw new Error('No Key Store. Use .createApplicationKeyPair() to create it first.');
    }

    return jose.JWE.createDecrypt(this.keystore)
      .decrypt(bundle)
      .then((result) => {
        return JSON.parse(jose.util.utf8.encode(result.plaintext));
      });

  }
}

module.exports = KeyUtils;
