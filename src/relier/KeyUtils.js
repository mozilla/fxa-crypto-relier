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
  /**
   * @constructor
   */
  constructor() {
    this.keystore = null;
  }
  /**
   * @method createApplicationKeyPair
   * @desc Returns a JWK public key
   * @returns {Promise}
   */
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
  /**
   * @method decryptBundle
   * @desc Decrypts a given bundle using the JWK key store
   * @param {string} bundle
   * @returns {Promise}
   */
  decryptBundle(bundle) {
    return new Promise((resolve) => {
      if (! this.keystore) {
        throw new Error('No Key Store. Use .createApplicationKeyPair() to create it first.');
      }

      return jose.JWE.createDecrypt(this.keystore)
        .decrypt(bundle)
        .then((result) => {
          resolve(JSON.parse(jose.util.utf8.encode(result.plaintext)));
        });
    });

  }
}

module.exports = KeyUtils;
