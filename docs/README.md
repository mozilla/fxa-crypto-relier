# Firefox Accounts Scoped Key Relier Documentation
> Also see [Deriver and Private method documentation](PRIVATE.md).

  OAuth methods to authenticate with Firefox Accounts and get scoped keys

**Example**  
```js
const fxaKeysUtil = new fxaCryptoRelier.OAuthUtils();

fxaKeysUtil.launchWebExtensionKeyFlow('YOUR_CLIENT_ID', {
  redirectUri: browser.identity.getRedirectURL(),
  scopes: ['profile', 'https://identity.mozilla.com/apps/lockbox'],
}).then((loginDetails) => {
  const key = loginDetails.keys['https://identity.mozilla.com/apps/lockbox'];
  const credentials = {
    access_token: loginDetails.access_token,
    refresh_token: loginDetails.refresh_token,
    key
};
```

* [relier-OAuthUtils](#module_relier-OAuthUtils)
    * [~launchWebExtensionFlow(clientId, [options])](#module_relier-OAuthUtils..launchWebExtensionFlow) ⇒ <code>Promise</code>
    * [~launchWebExtensionKeyFlow(clientId, [options])](#module_relier-OAuthUtils..launchWebExtensionKeyFlow) ⇒ <code>Promise</code>

<a name="module_relier-OAuthUtils..launchWebExtensionFlow"></a>

### relier-OAuthUtils~launchWebExtensionFlow(clientId, [options]) ⇒ <code>Promise</code>
Used to launch the Firefox Accounts login flow in WebExtensions. Does not
fetch scoped keys.

**Kind**: inner method of [<code>relier-OAuthUtils</code>](#module_relier-OAuthUtils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| clientId | <code>string</code> |  | FxA relier client id |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.action] | <code>string</code> | <code>&quot;&#x27;email&#x27;&quot;</code> | Specifies the behavior of users sent to `/`.   Valid values are: `email`, `signin`, `signup` |
| [options.redirectUri] | <code>URI</code> | <code>&#x27;&#x27;</code> | URI to redirect to when flow completes |
| [options.deviceId] | <code>string</code> |  | A valid deviceId for metrics, should be paired with flowId and flowBeginTime |
| [options.flowId] | <code>string</code> |  | A valid flowId for metrics, should be paired with deviceId and flowBeginTime |
| [options.flowBeginTime] | <code>num</code> |  | A valid flowBeginTime for metrics, should be paired with deviceId and flowId |
| [options.scopes] | <code>array</code> | <code>[]</code> | Requested OAuth scopes |
| [options.browserApi] | <code>object</code> | <code>browser</code> | Custom browser API override |
| [options.ensureOpenIDConfiguration] | <code>function</code> | <code>ensureOpenIDConfiguration</code> | Custom ensureOpenIDConfiguration function override |
| [options.getBearerTokenRequest] | <code>function</code> | <code>getBearerTokenRequest</code> | Custom getBearerTokenRequest function override |

<a name="module_relier-OAuthUtils..launchWebExtensionKeyFlow"></a>

### relier-OAuthUtils~launchWebExtensionKeyFlow(clientId, [options]) ⇒ <code>Promise</code>
Used to launch the Firefox Accounts scope key login flow in WebExtensions

**Kind**: inner method of [<code>relier-OAuthUtils</code>](#module_relier-OAuthUtils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| clientId | <code>string</code> |  | FxA relier client id |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.action] | <code>string</code> | <code>&quot;&#x27;email&#x27;&quot;</code> | Specifies the behavior of users sent to `/`.   Valid values are: `email`, `signin`, `signup` |
| [options.redirectUri] | <code>URI</code> | <code>&#x27;&#x27;</code> | URI to redirect to when flow completes |
| [options.scopes] | <code>array</code> | <code>[]</code> | Requested OAuth scopes |
| [options.browserApi] | <code>object</code> | <code>browser</code> | Custom browser API override |
| [options.ensureOpenIDConfiguration] | <code>function</code> | <code>ensureOpenIDConfiguration</code> | Custom ensureOpenIDConfiguration function override |
| [options.getBearerTokenRequest] | <code>function</code> | <code>getBearerTokenRequest</code> | Custom getBearerTokenRequest function override |


