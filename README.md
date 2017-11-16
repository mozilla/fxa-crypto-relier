# fxa-crypto-relier [![npm version](https://badge.fury.io/js/fxa-crypto-relier.svg)](https://www.npmjs.com/package/fxa-crypto-relier) [![CircleCI](https://circleci.com/gh/mozilla/fxa-crypto-relier/tree/master.svg?style=svg)](https://circleci.com/gh/mozilla/fxa-crypto-relier/tree/master)

Scoped Encryption Keys for Firefox Accounts Utility Library

![](http://imgur.com/QH7eDUj.jpg)


## Installation

```sh
npm install fxa-crypto-relier --save
```

## Usage

See the [documentation](docs/README.md).

## Local Development

### Scripts

* `npm run build` - build library
* `npm run dev` - development mode
* `npm test` - run tests

## Dependencies

- [base64url](https://github.com/brianloveswords/base64url): For encoding to/from base64urls
- [node-hkdf](https://github.com/zaach/node-hkdf): HKDF key derivation function
- [node-jose](https://github.com/cisco/node-jose.git): A JavaScript implementation of the JSON Object Signing and Encryption (JOSE) for current web browsers and node.js-based servers

## License

MPL-2.0
