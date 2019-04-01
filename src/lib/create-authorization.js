function createAuthorization(store, client, user) {
  return store.newAuthorization({ client, user });
}
module.exports = createAuthorization;
