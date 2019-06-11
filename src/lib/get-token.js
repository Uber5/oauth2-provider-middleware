const ensureValidAccessToken = require('../validation/ensure-valid-access-token');
const { getScopeForResponse } = require('./scopes');

function getToken(store, client, auth, state) {
  const { accessTokenTtlSecs } = client;
  return store.newAccessToken({ auth, accessTokenTtlSecs }).then(token => {
    ensureValidAccessToken(token);
    const tokenInfo = {
      access_token: token.token,
      token_type: 'token',
      expires_in: Math.floor(
        (new Date(token.expiresAt).getTime() - new Date(token.updatedAt)) / 1000
      ),
      state,
      scope: getScopeForResponse(client, auth.scope)
    };

    return tokenInfo;
  });
}

module.exports = getToken;
