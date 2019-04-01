/* eslint-disable camelcase */
const { ok } = require('assert');
const StoreError = require('../lib/store-error');

module.exports = (token, now = new Date()) => {
  try {
    ok(token.expiresAt && token.expiresAt > now, 'expiresAt missing or invalid on access token');
    ok(
      token.updatedAt && new Date(token.updatedAt).getTime() > 0,
      'missing or invalid "updatedAt" on access token'
    );
    // TODO: incomplete
  } catch (e) {
    throw new StoreError(e.message);
  }
};
