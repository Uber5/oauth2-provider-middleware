function createAuthorization(store, client, user, scope, codeChallenge) {
  return store.newAuthorization({ client, user, scope, codeChallenge });
}
module.exports = createAuthorization;
