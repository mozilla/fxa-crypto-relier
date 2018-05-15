/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('b64u').default;
const jose = require('node-jose');

const KEY_LENGTH = 48;
const LEGACY_SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const REGEX_HEX32 = /^[0-9a-f]{32}$/i;
const REGEX_HEX64 = /^[0-9a-f]{64}$/i;
const REGEX_TIMESTAMP = /^[0-9]{13}$/;

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
   * Derive a scoped key.
   * This method derives the key material for a particular scope from the user's master key material.
   * For most scopes it will produce a JWK containing a 32-byte symmetric key.
   * There is also special-case support for a legacy key-derivation algorithm used by Firefox Sync,
   * which generates a 64-byte key when `options.identifier` is 'https://identity.mozilla.com/apps/oldsync'.
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
      if (! REGEX_HEX64.test(options.inputKey)) {
        throw new Error('inputKey must be a 64-character hex string');
      }

      if (! REGEX_HEX64.test(options.keyRotationSecret)) {
        throw new Error('keyRotationSecret must be a 64-character hex string');
      }

      if (typeof options.keyRotationTimestamp !== 'number') {
        throw new Error('keyRotationTimestamp must be a 13-digit integer');
      }

      if (! REGEX_TIMESTAMP.test(options.keyRotationTimestamp)) {
        throw new Error('keyRotationTimestamp must be a 13-digit integer');
      }

      if (typeof options.identifier !== 'string' || options.identifier.length < 10) {
        throw new Error('identifier must be a string of length >= 10');
      }

      if (! REGEX_HEX32.test(options.uid)) {
        throw new Error('uid must be a 32-character hex string');
      }

      if (options.identifier === LEGACY_SYNC_SCOPE) {
        return resolve(this._deriveLegacySyncKey(options));
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

      return resolve(
        this._deriveHKDF(saltBuf, Buffer.concat([inputKeyBuf, keyRotationSecretBuf]), contextBuf, KEY_LENGTH)
          .then((key) => {
            const kid = key.slice(0, 16);
            const k = key.slice(16, 48);
            const keyTimestamp = Math.round(options.keyRotationTimestamp / 1000);

            scopedKey.k = base64url(k);
            scopedKey.kid = keyTimestamp + '-' + base64url(kid);

            return scopedKey;
          })
      );
    });
  }

  /**
   * Derive a scoped key using the special legacy algorithm from Firefox Sync.
   * To access data in Firefox Sync, clients need to know:
   *   * 64 bytes of key material derived from kB using HKDF
   *   * The first 16 bytes of the SHA-256 hash of kB
   *   * The full millisecond precision timestamp of when kB was last changed.
   * This method encodes that information as a JWK by using the first as the
   * key material `k`, and combining the other two to form the `kid`.
   * @method _deriveLegacySyncKey
   * @private
   * @param {object} options - required set of options to derive the scoped key
   * @param {string} options.inputKey - input key hex string that the scoped key is derived from
   * @param {number} options.keyRotationTimestamp
   *   A 13-digit number, the timestamp in milliseconds at which this scoped key most recently changed
   * @returns {Promise}
   */
  _deriveLegacySyncKey(options) {
    return new Promise((resolve) => {
      const context = 'identity.mozilla.com/picl/v1/oldsync';
      const contextBuf = Buffer.from(context);
      const inputKeyBuf = Buffer.from(options.inputKey, 'hex');
      const scopedKey = {
        kty: 'oct',
        scope: LEGACY_SYNC_SCOPE
      };

      return resolve(this._deriveHKDF(null, inputKeyBuf, contextBuf, 64)
        .then((key) => {
          scopedKey.k = base64url(key);
          return jose.JWA.digest('SHA-256', inputKeyBuf)
            .then((kHash) => {
              scopedKey.kid = options.keyRotationTimestamp + '-' + base64url(kHash.slice(0, 16));
              return scopedKey;
            });
        })
      );
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
