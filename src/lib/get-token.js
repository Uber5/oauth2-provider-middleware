const jwt = require('jsonwebtoken');
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
    refresh_token: refreshToken.token,
    token_type: 'token',
    expires_in: Math.floor(
      (new Date(accessToken.expiresAt).getTime() - new Date(accessToken.updatedAt)) / 1000
    ),
    state,
    scope: getScopeForResponse(client, auth.scope)
  };

  const scopes = auth.scope.split(' ');

  if (scopes.includes('openid')) {
    const provider = process.env.PROVIDER_URL || 'http://localhost:3020/';
    const secret = process.env.SECRET || 'uber5';
    const now = new Date();
    const { identifiers } = await store.getUserById(auth.userId);

    const payload = Object.assign(
      // get the identifiers (if any) into the payload
      (identifiers || {}).reduce((_payload, identifier) => {
        const [key, value] = identifier.split(':');
        // eslint-disable-next-line no-param-reassign
        _payload[key] = value;
        return _payload;
      }, {}),
      // ... and add other props
      {
        iss: provider,
        // make it valid for 1 hour, may have to be configurable for client/customer?
        exp: Math.floor(new Date(new Date().getTime() + 60 /* minutes */ * 60 * 1000) / 1000),
        iat: Math.floor(now.getTime() / 1000),
        sub: auth.userId,
        aud: client.clientId
      }
    );
    const idToken = jwt.sign(payload, secret);
    tokenInfo.id_token = idToken;
  }

  return tokenInfo;
}

module.exports = getToken;
