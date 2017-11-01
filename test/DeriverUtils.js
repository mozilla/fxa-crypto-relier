/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('DeriverUtils', function () {
  const deriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

  describe('encryptBundle', () => {
    it('can encrypt the bundle', () => {
      const appPublicKeyJwk = 'eyJrdHkiOiJFQyIsImtpZCI6ImduUGtGWjE2dHNyeTFsajdDUHdXaENxVkxPSGwtMXFETmJIbG5FNTJzOVEiLCJjcnYiOiJQLTI1NiIsIngiOiJFS3lFOWRta3U2aTNhclpOVVBqdkl0bmo2V2pPUzBldzdENkZQaDR2OFFZIiwieSI6IjRhX3VHenM2Rl9uN0ZrNTZIaDlUZGlMZHNjblg4UHdjTnlXZ3lqeG9td0kifQ';
      const key = window.fxaCryptoDeriver.jose.util.base64url.decode(JSON.stringify(appPublicKeyJwk));
      const exampleScope = 'https://identity.mozilla.org/apps/notes';
      const keySample = {
        [exampleScope]: {
          kty: 'oct',
          scope: exampleScope,
          k: 'XQzv2cjJfSMsi3NPn0nVVWprUbhlVvuOBkyEqwvjMdk',
          kid: '20171004201318-jcbS5axUtJCRK3Rc-5rj4fsLhh3LOENEIFGwrau2bjI'
        }
      };

      return deriverUtils.encryptBundle(key, JSON.stringify(keySample)).then((enc) => {
        assert.equal(enc.length, 632);
      });
    });
  });
});
