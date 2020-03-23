/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
const { ok } = require('assert');
const StoreError = require('../lib/store-error');

module.exports = (token, auth, client) => {
  try {
    ok(token, 'refresh token not found');
    // eslint-disable-next-line no-underscore-dangle
    ok(
      !auth || auth.clientId.toString() === client.client_id.toString(),
      'refresh token does not belong to client'
    );
    ok(token.status === 'created', 'token is not valid or has been used');
  } catch (e) {
    throw new StoreError(e.message);
  }
};
