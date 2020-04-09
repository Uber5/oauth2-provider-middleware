const jwt = require('jsonwebtoken');
const axios = require('axios');
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
    // eslint-disable-next-line one-var
    let email, phone;
    identifiers.forEach(identifer => {
      if (identifer.startsWith('email')) {
        const splitted = identifer.split(':');
        [, email] = splitted;
      }
      if (identifer.startsWith('phone')) {
        const splitted = identifer.split(':');
        [, phone] = splitted;
      }
    });

    const payload = {
      iss: provider,
      exp: (new Date(accessToken.expiresAt).getTime() - new Date(accessToken.updatedAt)) / 1000,
      iat: now.getSeconds(),
      sub: auth.userId,
      aud: client.clientId
    };
    if (email) {
      payload.email = email;
    }
    if (phone) {
      payload.phone = phone;
    }
    const idToken = jwt.sign(payload, secret);
    tokenInfo.id_token = idToken;
  }

  return tokenInfo;
}

module.exports = getToken;
