function createAuthorization(store, client, user, requestedScope) {
  return store.newAuthorization({ client, user, requestedScope });
}
module.exports = createAuthorization;
