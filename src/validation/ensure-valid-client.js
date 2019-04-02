/* eslint-disable camelcase */
const { ok } = require('assert');
const StoreError = require('../lib/store-error');

module.exports = client => {
  try {
    const { client_id, redirect_uris, scopes } = client;
    ok(client_id, 'client_id is required but missing');
    ok(
      redirect_uris && redirect_uris instanceof Array,
      'redirect_uris is required but missing or invalid'
    );
    ok(scopes && scopes instanceof Array, 'scopes is required but missing or invalid');
    // TODO: incomplete
  } catch (e) {
    throw new StoreError(e.message);
  }
};
