module.exports = (client, requestedUri) =>
  client.redirect_uris.reduce((allowed, uri) => allowed || requestedUri.startsWith(uri), false);
