const ensureValidAccessToken = require('../validation/ensure-valid-access-token');
const { getScopeForResponse } = require('../lib/scopes');

function uriFragmentSeparator(uri) {
  return uri.match(/#/) ? '&' : '#';
}

const encodeFragmentData = data =>
  Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');

function redirectWithToken(store, res, client, user, auth, state, redirectUri, requestedScope) {
  return store.newAccessToken({ auth, client, user }).then(token => {
    ensureValidAccessToken(token);
    const redirectData = {
      access_token: token.token,
      token_type: 'token',
      expires_in: Math.floor(
        (new Date(token.expiresAt).getTime() - new Date(token.updatedAt)) / 1000
      ),
      state,
      scope: getScopeForResponse(client, requestedScope)
    };
    const url = `${redirectUri}${uriFragmentSeparator(redirectUri)}${encodeFragmentData(
      redirectData
    )}`;
    return res.redirect(url);
  });
}

module.exports = redirectWithToken;
