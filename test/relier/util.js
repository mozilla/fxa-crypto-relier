/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = window.fxaCryptoRelier.OAuthUtils.__util;

describe('relier.util', function () {

  describe('createQueryParam', () => {
    it('can create query param', () => {
      const c = util.createQueryParam;

      assert.equal(c('key', 'value'), 'key=value');
      assert.equal(c('key spaced', 'value spaced'), 'key%20spaced=value%20spaced');
    });
  });

  describe('createRandomString', () => {
    it('can create strings', () => {
      const c = util.createRandomString;

      assert.equal(c(3).length, 3);
      assert.equal(c(0).length, 0);
    });
  });

  describe('extractUrlParam', () => {
    const e = util.extractUrlParam;

    it('extracts the code', () => {
      assert.equal(e('https://some.example.com/?test=1&code=foo', 'code'), 'foo');
      assert.equal(e('https://some.example.com/?code=foo', 'code'), 'foo');
      assert.equal(e('https://some.example.com/?test=1&code=foo&test=5', 'code'), 'foo');
    });

    it('returns null when there is no code', () => {
      assert.equal(e('https://some.example.com/?test=1', 'code'), null);
    });
  });

  describe('objectToQueryString', () => {
    it('creates query strings', () => {
      const o = util.objectToQueryString;

      assert.equal(o({
        key: 'test',
        second: 'bar'
      }), '?key=test&second=bar');
    });
  });

  describe('sha256base64url', () => {
    it('works for normal strings', () => {
      return util.sha256base64url('foo').then((result) => {
        assert.equal(result, 'LCa0a2j_xo_5m0U8HTBBNBNCLXBkg7-g-YpeiGJm564');
      });
    });

    it('works with no strings', () => {
      return util.sha256base64url().then((result) => {
        assert.equal(result, '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU');
      });
    });
  });

});
