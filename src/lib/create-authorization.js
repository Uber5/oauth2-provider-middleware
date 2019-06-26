function createAuthorization(store, client, user, scope) {
  return store.newAuthorization({ client, user, scope });
}
module.exports = createAuthorization;
