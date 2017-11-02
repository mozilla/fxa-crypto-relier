/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let jose = require('node-jose');

/**
 * Scoped key deriver utilities
 * @module deriver-DeriverUtils
 * @private
 */
class DeriverUtils {
  /**
   * @method encryptBundle
   * @param {string} appPublicKeyJwk
   * @param {object} bundle
   * @returns {Promise}
   */
  encryptBundle(appPublicKeyJwk, bundle) {
    bundle = jose.util.asBuffer(bundle);

    return jose.JWK.asKey(appPublicKeyJwk)
      .then(function (key) {
        const recipient = {
          key: key,
          header: {
            alg: 'ECDH-ES'
          }
        };

        const jwe = jose.JWE.createEncrypt({
          format: 'compact',
          contentAlg: 'A256GCM'
        }, recipient);

        return jwe.update(bundle)
          .final();
      });

  }
}

module.exports = DeriverUtils;
