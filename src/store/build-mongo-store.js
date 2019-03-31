function buildMongoStore({ uri, mongodb }) {
  const db = mongodb.MongoClient.connect(uri, { useNewUrlParser: true }).then(c => c.db());
  const Clients = db.then(_db => _db.collection('clients'));

  async function getClientById(id) {
    const client = await (await Clients).findOne({ client_id: id });
    return client;
  }

  return {
    getClientById
  };
}

module.exports = buildMongoStore;
