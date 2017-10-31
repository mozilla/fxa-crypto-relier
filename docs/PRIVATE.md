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
**Example**  
```js

```
<a name="module_deriver-DeriverUtils..encryptBundle"></a>

### deriver-DeriverUtils~encryptBundle(appPublicKeyJwk, bundle) ⇒ <code>Promise</code>
**Kind**: inner method of [<code>deriver-DeriverUtils</code>](#module_deriver-DeriverUtils)  

| Param | Type |
| --- | --- |
| appPublicKeyJwk | <code>string</code> | 
| bundle | <code>object</code> | 

<a name="module_deriver-ScopedKeys"></a>

## deriver-ScopedKeys
Used by the Firefox Accounts content server

**Example**  
```js

```

* [deriver-ScopedKeys](#module_deriver-ScopedKeys)
    * [~deriveScopedKeys(options)](#module_deriver-ScopedKeys..deriveScopedKeys) ⇒ <code>Promise</code>
    * [~_deriveHKDF(keyMaterial, inputKey, context)](#module_deriver-ScopedKeys.._deriveHKDF) ⇒ <code>Promise</code> ℗

<a name="module_deriver-ScopedKeys..deriveScopedKeys"></a>

### deriver-ScopedKeys~deriveScopedKeys(options) ⇒ <code>Promise</code>
Derive a scoped key

**Kind**: inner method of [<code>deriver-ScopedKeys</code>](#module_deriver-ScopedKeys)  

| Param |
| --- |
| options | 
| options.inputKey | 
| options.keyMaterial | 
| options.timestamp | 
| options.identifier | 

<a name="module_deriver-ScopedKeys.._deriveHKDF"></a>

### deriver-ScopedKeys~_deriveHKDF(keyMaterial, inputKey, context) ⇒ <code>Promise</code> ℗
Derive a key using HKDF

**Kind**: inner method of [<code>deriver-ScopedKeys</code>](#module_deriver-ScopedKeys)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| keyMaterial | <code>string</code> | Hex string |
| inputKey | <code>string</code> | Hex string |
| context | <code>string</code> | String |

<a name="module_relier-KeyUtils"></a>

## relier-KeyUtils ℗
Scoped key utilities

**Access**: private  
<a name="module_relier-OAuthUtils"></a>

## relier-OAuthUtils
OAuth methods to authenticate with Firefox Accounts and get scoped keys

**Example**  
```js
const clientId = 'YOUR_CLIENT_ID';
const fxaKeysUtil = new fxaCryptoRelier.OAuthUtils();

fxaKeysUtil.launchWebExtensionKeyFlow(clientId, {
  pkce: true,
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
    * [~extractAccessToken(redirectUri)](#module_relier-util..extractAccessToken) ⇒ <code>string</code>
    * [~createRandomString(length)](#module_relier-util..createRandomString) ⇒ <code>string</code>
    * [~sha256base64url(str)](#module_relier-util..sha256base64url) ⇒ <code>Promise</code>
    * [~createQueryParam(key, value)](#module_relier-util..createQueryParam) ⇒ <code>String</code>
    * [~objectToQueryString(obj)](#module_relier-util..objectToQueryString) ⇒ <code>String</code>

<a name="module_relier-util..extractAccessToken"></a>

### relier-util~extractAccessToken(redirectUri) ⇒ <code>string</code>
Extracts the `code` parameter from a given redirectUri

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  

| Param | Type | Description |
| --- | --- | --- |
| redirectUri | <code>string</code> | OAuth redirect URI |

<a name="module_relier-util..createRandomString"></a>

### relier-util~createRandomString(length) ⇒ <code>string</code>
Creates a random base64url string of given length

**Kind**: inner method of [<code>relier-util</code>](#module_relier-util)  

| Param | Type | Description |
| --- | --- | --- |
| length | <code>integer</code> | Length of the random string |

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

