/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('DeriverUtils', function () {
  const deriverUtils = new window.fxaCryptoDeriver.DeriverUtils();
  const b64urlencode = window.fxaCryptoDeriver.jose.util.base64url.encode;

  const exampleScope = 'https://identity.mozilla.com/apps/notes';
  const keySample = {
    [exampleScope]: {
      kty: 'oct',
      scope: exampleScope,
      k: 'XQzv2cjJfSMsi3NPn0nVVWprUbhlVvuOBkyEqwvjMdk',
      kid: '20171004201318-jcbS5axUtJCRK3Rc-5rj4fsLhh3LOENEIFGwrau2bjI'
    }
  };

  describe('encryptBundle', () => {
    it('can encrypt the bundle', () => {
      const appPublicKeyJwk = 'eyJrdHkiOiJFQyIsImtpZCI6ImduUGtGWjE2dHNyeTFsajdDUHdXaENxVkxPSGwtMXFETmJIbG5FNTJzOVEiLCJjcnYiOiJQLTI1NiIsIngiOiJFS3lFOWRta3U2aTNhclpOVVBqdkl0bmo2V2pPUzBldzdENkZQaDR2OFFZIiwieSI6IjRhX3VHenM2Rl9uN0ZrNTZIaDlUZGlMZHNjblg4UHdjTnlXZ3lqeG9td0kifQ';

      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then((enc) => {
        assert.equal(enc.length, 632);
      });
    });

    it('rejects keys that include the private key component', () => {
      const appPublicKeyJwk = b64urlencode(JSON.stringify({
        'kty': 'EC',
        'crv': 'P-256',
        'd': 'KXAjjEr4KT9UlYI4BE0BefVdoxP8vqO389U7lQlCigs',
        'x': 'SiBn6uebjigmQqw4TpNzs3AUyCae1_sG2b9Fzhq3Fyo',
        'y': 'q99Xq1RWNTFpk99pdQOSjUvwELss51PkmAGCXhLfMV4'
      }));
      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then(
        () => { assert.fail('appPublicKeyJwk should have been rejected') },
        (err) => { assert.equal(err.message, 'appJwk includes the private key') },
      );
    });

    it('rejects symmetric keys', () => {
      const appPublicKeyJwk = b64urlencode(JSON.stringify({
        'kty':'oct',
        'k': 'U4ObmO4YmLfHLqYgFd9Q2Q'
      }));
      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then(
        () => { assert.fail('appPublicKeyJwk should have been rejected') },
        (err) => { assert.equal(err.message, 'appJwk is not an EC key') },
      );
    });

    it('rejects non-ECDH public keys', () => {
      const appPublicKeyJwk = b64urlencode(JSON.stringify({
        'kty':'RSA',
        'e':'AQAB',
        'n':'nV-WzW3lHd03yEUG88M-r_F0WwCKhlv4O5Yxu5QNiOQnDdDvGwpWTZMeBz9iAtu2S_cia-woK2XcTBOnSorNcC_2YA44aJtBK2TnLR_Ks6Tru2QzO95uDKI7U8mQdUhU_66aCCHTtr5AK178Z29sKoqabivIj3tHnDSLiZSpQgZkJP-jCXat5JyRC2rU6eFX9mORLIkpIyXQxdz_WSSg5DYMhJ20EWoIfMODFIZS4H-w3aYkhv7Ao2dmwozq2iwYsNLmZA26uXdYbqUvpi6kjQZusmPk1OD6E-TnjKh1qI3fi5XesdIf4b-N8fTDwhub6-Vgdh1-8biWmXVFZjc2iQ'
      }));
      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then(
        () => { assert.fail('appPublicKeyJwk should have been rejected') },
        (err) => { assert.equal(err.message, 'appJwk is not an EC key') },
      );
    });

    it('rejects keys on curves other than P-256', () => {
      const appPublicKeyJwk = b64urlencode(JSON.stringify({
        'kty':'EC',
        'crv':'P-384',
        'x':'Txvn927uYdiqgSRtHgX3aTVH1_3bMyDM08yN-SRF7Q-2wouLoI70vawCO8i2UaAv',
        'y':'38oIUqk9a6qtAyq25PAvxwApdPcHg6RaXN3Du70E3sIHKbGtXBX0KBbcFh4yYKUu'
      }));
      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then(
        () => { assert.fail('appPublicKeyJwk should have been rejected') },
        (err) => { assert.equal(err.message, 'appJwk is not on curve P-256') },
      );
    });

    it('rejects public keys whose points are not on the curve', () => {
      const appPublicKeyJwk = b64urlencode(JSON.stringify({
        'kty': 'EC',
        'crv': 'P-256',
        'x': 'SiBn6uebjigmQqw4TpNzs3AUyCae1_sG2b9Fzhq3Fyo',
        'y': 'q99Xq1RWNTFpk99pdQOSjUvwELss51PkmAGCXhLfMV3'
      }));
      return deriverUtils.encryptBundle(appPublicKeyJwk, JSON.stringify(keySample)).then(
        () => { assert.fail('appPublicKeyJwk should have been rejected') },
        (err) => { assert.equal(err.message, 'invalid EC public key') },
      );
    });
  });
});
