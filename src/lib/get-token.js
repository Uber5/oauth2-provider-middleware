const ensureValidAccessToken = require('../validation/ensure-valid-access-token');
const ensureValidRefreshToken = require('../validation/ensure-valid-refresh-token.js');
const { getScopeForResponse } = require('./scopes');

async function getToken(store, client, auth, state) {
  const refreshToken = await store.newRefreshToken({ auth });
  ensureValidRefreshToken(refreshToken, auth, client);
  const accessToken = await store.newAccessToken({ auth });
  ensureValidAccessToken(accessToken);
  const tokenInfo = {
    access_token: accessToken.token,
    refreshToken: refreshToken.token,
    token_type: 'token',
    expires_in: Math.floor(
      (new Date(accessToken.expiresAt).getTime() - new Date(accessToken.updatedAt)) / 1000
    ),
    state,
    scope: getScopeForResponse(client, auth.scope)
  };

  return tokenInfo;
}

module.exports = getToken;
