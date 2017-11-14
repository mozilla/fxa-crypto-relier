## Modules

<dl>
<dt><a href="#module_deriver-DeriverUtils">deriver-DeriverUtils</a> ℗</dt>
<dd><p>Scoped key deriver utilities</p>
</dd>
<dt><a href="#module_deriver-ScopedKeys">deriver-ScopedKeys</a></dt>
<dd><p>Used by the Firefox Accounts content server</p>
</dd>
<dt><a href="#module_relier-KeyUtils">relier-KeyUtils</a> ℗</dt>
<dd><p>Scoped key utilities</p>
</dd>
<dt><a href="#module_relier-OAuthUtils">relier-OAuthUtils</a></dt>
<dd><p>OAuth methods to authenticate with Firefox Accounts and get scoped keys</p>
</dd>
<dt><a href="#module_relier-util">relier-util</a> ℗</dt>
<dd><p>Relier utility functions</p>
</dd>
</dl>

<a name="module_deriver-DeriverUtils"></a>

## deriver-DeriverUtils ℗
Scoped key deriver utilities

**Access**: private  
<a name="module_deriver-DeriverUtils..encryptBundle"></a>

### deriver-DeriverUtils~encryptBundle(appPublicKeyJwk, bundle) ⇒ <code>Promise</code>
**Kind**: inner method of [<code>deriver-DeriverUtils</code>](#module_deriver-DeriverUtils)  

| Param | Type | Description |
| --- | --- | --- |
| appPublicKeyJwk | <code>string</code> | base64url encoded string of the public key JWK |
| bundle | <code>string</code> | String bundle to encrypt using the provided key |

<a name="module_deriver-ScopedKeys"></a>

## deriver-ScopedKeys
Used by the Firefox Accounts content server

**Example**  
```js
const scopedKeys = new fxaCryptoDeriver.ScopedKeys();

return scopedKeys.deriveScopedKey({
  identifier: 'https://identity.mozilla.com/apps/notes',
  inputKey: 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a',
  keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
  keyRotationTimestamp: 1494446722583
});
```

* [deriver-ScopedKeys](#module_deriver-ScopedKeys)
    * [~deriveScopedKey(options)](#module_deriver-ScopedKeys..deriveScopedKey) ⇒ <code>Promise</code>
    * [~_deriveHKDF(salt, initialKeyingMaterial, info, keyLength)](#module_deriver-ScopedKeys.._deriveHKDF) ⇒ <code>Promise</code> ℗

<a name="module_deriver-ScopedKeys..deriveScopedKey"></a>

### deriver-ScopedKeys~deriveScopedKey(options) ⇒ <code>Promise</code>
Derive a scoped key

**Kind**: inner method of [<code>deriver-ScopedKeys</code>](#module_deriver-ScopedKeys)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | required set of options to derive a scoped key |
| options.inputKey | <code>string</code> | input key hex string that the scoped key is derived from |
| options.keyRotationSecret | <code>string</code> | a 32-byte hex string of additional entropy specific to this scoped key |
| options.keyRotationTimestamp | <code>number</code> | A 13-digit number, the timestamp in milliseconds at which this scoped key most recently changed |
| options.identifier | <code>string</code> | a unique URI string identifying the requested scoped key |

<a name="module_deriver-ScopedKeys.._deriveHKDF"></a>

### deriver-ScopedKeys~_deriveHKDF(salt, initialKeyingMaterial, info, keyLength) ⇒ <code>Promise</code> ℗
Derive a key using HKDF.
Ref: https://tools.ietf.org/html/rfc5869

**Kind**: inner method of [<code>deriver-ScopedKeys</code>](#module_deriver-ScopedKeys)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| salt | <code>buffer</code> |  |
| initialKeyingMaterial | <code>buffer</code> |  |
| info | <code>buffer</code> |  |
| keyLength | <code>number</code> | Key length |

<a name="module_relier-KeyUtils"></a>

## relier-KeyUtils ℗
Scoped key utilities

**Access**: private  

* [relier-KeyUtils](#module_relier-KeyUtils) ℗
    * [~createApplicationKeyPair()](#module_relier-KeyUtils..createApplicationKeyPair) ⇒ <code>Promise</code>
    * [~decryptBundle(bundle)](#module_relier-KeyUtils..decryptBundle) ⇒ <code>Promise</code>

<a name="module_relier-KeyUtils..createApplicationKeyPair"></a>

### relier-KeyUtils~createApplicationKeyPair() ⇒ <code>Promise</code>
Returns a JWK public key

**Kind**: inner method of [<code>relier-KeyUtils</code>](#module_relier-KeyUtils)  
<a name="module_relier-KeyUtils..decryptBundle"></a>

### relier-KeyUtils~decryptBundle(bundle) ⇒ <code>Promise</code>
Decrypts a given bundle using the JWK key store

**Kind**: inner method of [<code>relier-KeyUtils</code>](#module_relier-KeyUtils)  

| Param | Type |
| --- | --- |
| bundle | <code>string</code> | 

<a name="module_relier-OAuthUtils"></a>

## relier-OAuthUtils
OAuth methods to authenticate with Firefox Accounts and get scoped keys

**Example**  
```js
const fxaKeysUtil = new fxaCryptoRelier.OAuthUtils();

fxaKeysUtil.launchWebExtensionKeyFlow('YOUR_CLIENT_ID', {
  redirectUri: browser.identity.getRedirectURL(),
  scopes: ['profile', 'https://identity.mozilla.org/apps/lockbox'],
}).then((loginDetails) => {
  const key = loginDetails.keys['https://identity.mozilla.org/apps/lockbox'];
  const credentials = {
    access_token: loginDetails.access_token,
    refresh_token: loginDetails.refresh_token,
    key
};
```

* [relier-OAuthUtils](#module_relier-OAuthUtils)
    * [~launchWebExtensionKeyFlow(clientId, [options])](#module_relier-OAuthUtils..launchWebExtensionKeyFlow) ⇒ <code>Promise</code>
    * [~_getBearerTokenRequest(server, code, clientId, codeVerifier, [options])](#module_relier-OAuthUtils.._getBearerTokenRequest) ⇒ <code>Promise</code> ℗

<a name="module_relier-OAuthUtils..launchWebExtensionKeyFlow"></a>

### relier-OAuthUtils~launchWebExtensionKeyFlow(clientId, [options]) ⇒ <code>Promise</code>
Used to launch the Firefox Accounts scope key login flow in WebExtensions

**Kind**: inner method of [<code>relier-OAuthUtils</code>](#module_relier-OAuthUtils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| clientId | <code>string</code> |  | FxA relier client id |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.scopes] | <code>array</code> | <code>[]</code> | Requested OAuth scopes |
| [options.browserApi] | <code>object</code> | <code>browser</code> | Custom browser API override |
| [options.getBearerTokenRequest] | <code>function</code> | <code>getBearerTokenRequest</code> | Custom getBearerTokenRequest function override |

<a name="module_relier-OAuthUtils.._getBearerTokenRequest"></a>

### relier-OAuthUtils~_getBearerTokenRequest(server, code, clientId, codeVerifier, [options]) ⇒ <code>Promise</code> ℗
Used to fetch the bearer token from the Firefox Accounts OAuth server

**Kind**: inner method of [<code>relier-OAuthUtils</code>](#module_relier-OAuthUtils)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | Firefox Accounts server |
| code | <code>string</code> | OAuth redirect code |
| clientId | <code>string</code> | OAuth client id |
| codeVerifier | <code>string</code> | PKCE code verifier |
| [options] | <code>object</code> | custom options |
| [options.fetch] | <code>function</code> | custom `fetch` interface |

<a name="module_relier-util"></a>

## relier-util ℗
Relier utility functions

**Access**: private  

* [relier-util](#module_relier-util) ℗
    * [~extractUrlParam(redirectUri, param)](#module_relier-util..extractUrlParam) ⇒ <code>string</code>
    * [~createRandomString(length)](#module_relier-util..createRandomString) ⇒ <code>string</code>
    * [~sha256base64url(str)](#module_relier-util..sha256base64url) ⇒ <code>Promise</code>
    * [~createQueryParam(key, value)](#module_relier-util..createQueryParam) ⇒ <code>String</code>
    * [~objectToQueryString(obj)](#module_relier-util..objectToQueryString) ⇒ <code>String</code>

<a name="module_relier-util..extractUrlParam"></a>

### relier-util~extractUrlParam(redirectUri, param) ⇒ <code>string</code>
Extracts a parameter from a given URL

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  

| Param | Type | Description |
| --- | --- | --- |
| redirectUri | <code>string</code> | URL |
| param | <code>string</code> | Param we want to extract from the givem URL |

<a name="module_relier-util..createRandomString"></a>

### relier-util~createRandomString(length) ⇒ <code>string</code>
Creates a random base64url string of given length

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  

| Param | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | Length of the random string |

<a name="module_relier-util..sha256base64url"></a>

### relier-util~sha256base64url(str) ⇒ <code>Promise</code>
Encode a given string into SHA-256 base64url of that string

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String to encode |

<a name="module_relier-util..createQueryParam"></a>

### relier-util~createQueryParam(key, value) ⇒ <code>String</code>
Create a query parameter string from a key and value

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  
**Returns**: <code>String</code> - URL safe serialized query parameter  

| Param | Type |
| --- | --- |
| key | <code>String</code> | 
| value | <code>String</code> | 

<a name="module_relier-util..objectToQueryString"></a>

### relier-util~objectToQueryString(obj) ⇒ <code>String</code>
Create a query string out of an object.

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  
**Returns**: <code>String</code> - - URL safe query string  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | Object to create query string from |

