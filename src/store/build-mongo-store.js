function buildMongoStore({ uri, mongodb }) {
  const { ObjectId, MongoClient } = mongodb;
  const db = MongoClient.connect(uri, { useNewUrlParser: true }).then(c => c.db());
  const Clients = db.then(_db => _db.collection('clients'));
  const Users = db.then(_db => _db.collection('users'));

  async function getClientById(id) {
    const client = await (await Clients).findOne({ client_id: id });
    return client;
  }

  async function getUserByName(name) {
    // the name could be the actual name, or the email
    const user = await (await Users).findOne({ $or: [{ name }, { email: name }] });
    return user;
  }

  async function getUserById(id) {
    const user = await (await Users).findOne({ _id: ObjectId(id) });
    return user;
  }

  return {
    getClientById,
    getUserByName,
    getUserById
  };
}

module.exports = buildMongoStore;
