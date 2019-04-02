const { ok } = require('assert');

function ensureRequestedScopesArePermitted(client, scopeParam = '') {
  const requestedScopes = scopeParam.split(' ').filter(s => s !== '');
  const invalidScopes = requestedScopes.filter(s => !client.scopes.includes(s));
  ok(invalidScopes.length === 0, 'Requesting scope that is not permitted for this client');
}

exports.ensureRequestedScopesArePermitted = ensureRequestedScopesArePermitted;

function getScopeForResponse(client, requestedScopes) {
  if (requestedScopes) {
    return requestedScopes
      .split(' ')
      .filter(s => s !== '')
      .join(' ');
  }
  return client.scopes.join(' ');
}
exports.getScopeForResponse = getScopeForResponse;
