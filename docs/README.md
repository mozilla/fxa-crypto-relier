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


