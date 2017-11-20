/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('base64url');

const KEY_LENGTH = 48;

/**
 * Scoped key deriver
 * @desc Used by the Firefox Accounts content server
 * @module deriver-ScopedKeys
 * @example
 * ```js
 * const scopedKeys = new fxaCryptoDeriver.ScopedKeys();
 *
 * return scopedKeys.deriveScopedKey({
 *   identifier: 'https://identity.mozilla.com/apps/notes',
 *   inputKey: 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a',
 *   keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
 *   keyRotationTimestamp: 1494446722583,
 *   uid: 'aeaa1725c7a24ff983c6295725d5fc9b'
 * });
 * ```
 */
class ScopedKeys {
  /**
   * Derive a scoped key
   * @method deriveScopedKey
   * @param {object} options - required set of options to derive a scoped key
   * @param {string} options.inputKey - input key hex string that the scoped key is derived from
   * @param {string} options.keyRotationSecret - a 32-byte hex string of additional entropy specific to this scoped key
   * @param {number} options.keyRotationTimestamp
   *   A 13-digit number, the timestamp in milliseconds at which this scoped key most recently changed
   * @param {string} options.identifier - a unique URI string identifying the requested scoped key
   * @param {string} options.uid - a 16-byte Firefox Account UID hex string
   * @returns {Promise}
   */
  deriveScopedKey(options) {
    return new Promise((resolve) => {
      if (! options.inputKey) {
        throw new Error('inputKey required');
      }

      if (! options.keyRotationSecret) {
        throw new Error('keyRotationSecret required');
      }

      if (! options.keyRotationTimestamp) {
        throw new Error('keyRotationTimestamp required');
      }

      if (! options.identifier) {
        throw new Error('identifier required');
      }

      if (! options.uid) {
        throw new Error('uid required');
      }

      if (options.keyRotationTimestamp.toString().length !== 13) {
        throw new Error('keyRotationTimestamp must be a 13-digit number');
      }

      const context = 'identity.mozilla.com/picl/v1/scoped_key\n' +
        options.identifier;
      const contextBuf = Buffer.from(context);
      const inputKeyBuf = Buffer.from(options.inputKey, 'hex');
      const keyRotationSecretBuf = Buffer.from(options.keyRotationSecret, 'hex');
      const saltBuf = Buffer.from(options.uid, 'hex');
      const scopedKey = {
        kty: 'oct',
        scope: options.identifier,
      };

      this._deriveHKDF(saltBuf, Buffer.concat([inputKeyBuf, keyRotationSecretBuf]), contextBuf, KEY_LENGTH)
        .then((key) => {
          const kid = key.slice(0, 16);
          const k = key.slice(16, 48);
          const keyTimestamp = Math.round(options.keyRotationTimestamp / 1000);

          scopedKey.k = base64url(k);
          scopedKey.kid = keyTimestamp + '-' + base64url(kid);

          resolve(scopedKey);
        });
    });
  }
  /**
   * Derive a key using HKDF.
   * Ref: https://tools.ietf.org/html/rfc5869
   * @method _deriveHKDF
   * @private
   * @param {buffer} salt
   * @param {buffer} initialKeyingMaterial
   * @param {buffer} info
   * @param {number} keyLength - Key length
   * @returns {Promise}
   */
  _deriveHKDF(salt, initialKeyingMaterial, info, keyLength) {
    return new Promise((resolve) => {
      const hkdf = new HKDF('sha256', salt, initialKeyingMaterial);

      hkdf.derive(info, keyLength, (key) => {
        return resolve(key);
      });
    });

  }
}

module.exports = ScopedKeys;
