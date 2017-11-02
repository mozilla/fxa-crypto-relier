/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('base64url');

const KEY_LENGTH = 32;

/**
 * Scoped key deriver
 * @desc Used by the Firefox Accounts content server
 * @module deriver-ScopedKeys
 * @example
 * ```js
 * const scopedKeys = new fxaCryptoDeriver.ScopedKeys();
 *
 * return scopedKeys.deriveScopedKeys({
 *   identifier: 'https://identity.mozilla.com/apps/notes',
 *   inputKey: 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a',
 *   keyMaterial: '0000000000000000000000000000000000000000000000000000000000000000',
 *   timestamp: 1494446722583
 * });
 * ```
 */
class ScopedKeys {
  /**
   * Derive a scoped key
   * @method deriveScopedKeys
   * @param {object} options - required set of options to derive a scoped key
   * @param {string} options.inputKey - input key hex string that the scoped key is derived from
   * @param {string} options.keyMaterial - a 32-byte hex string of additional entropy specific to this scoped key
   * @param {number} options.timestamp
   *   A 13-digit number, the timestamp in milliseconds at which this scoped key most recently changed
   * @param {string} options.identifier - a unique URI string identifying the requested scoped key
   * @returns {Promise}
   */
  deriveScopedKeys(options) {
    return new Promise((resolve) => {
      if (! options.inputKey) {
        throw new Error('inputKey required');
      }

      if (! options.keyMaterial) {
        throw new Error('keyMaterial required');
      }

      if (! options.timestamp) {
        throw new Error('timestamp required');
      }

      if (! options.identifier) {
        throw new Error('identifier required');
      }

      if (options.timestamp.toString().length !== 13) {
        throw new Error('timestamp must be a 13-digit number');
      }

      const context = 'identity.mozilla.com/picl/v1/scoped_key\n' +
        options.identifier;
      const contextKid = 'identity.mozilla.com/picl/v1/scoped_kid\n' +
        options.identifier;
      const contextHex = Buffer.from(context).toString('hex');
      const contextKidHex = Buffer.from(contextKid).toString('hex');
      const scopedKey = {
        kty: 'oct',
        scope: options.identifier,
      };

      this._deriveHKDF(options.keyMaterial, options.inputKey, contextHex, KEY_LENGTH)
        .then((key) => {
          scopedKey.k = base64url(key);

          return this._deriveHKDF(options.keyMaterial, options.inputKey, contextKidHex, KEY_LENGTH);
        })
        .then((kidKey) => {
          const keyTimestamp = Math.round(options.timestamp / 1000);

          scopedKey.kid = keyTimestamp + '-' + base64url(kidKey);

          resolve({
            [options.identifier]: scopedKey
          });
        });
    });
  }
  /**
   * Derive a key using HKDF
   * @method _deriveHKDF
   * @private
   * @param {string} keyMaterial - Hex string
   * @param {string} inputKey - Hex string
   * @param {string} context - Hex string
   * @param {number} keyLength - Key length
   * @returns {Promise}
   */
  _deriveHKDF(keyMaterial, inputKey, context, keyLength) {
    return new Promise((resolve) => {
      const keyMaterialBuf = Buffer.from(keyMaterial, 'hex');
      const inputKeyBuf = Buffer.from(inputKey, 'hex');
      const contextBuf = Buffer.from(context, 'hex');
      const hkdf = new HKDF('sha256', keyMaterialBuf, inputKeyBuf);

      hkdf.derive(contextBuf, keyLength, (key) => {
        return resolve(key);
      });
    });

  }
}

module.exports = ScopedKeys;
