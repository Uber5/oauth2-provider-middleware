/* eslint-disable no-underscore-dangle */
const newCode = require('../lib/new-code');

function getExpiresAt(now) {
  const ttl = 60 /* minutes */ * 60;
  return new Date(now.getTime() + ttl * 1000);
}

function buildMongoStore({ uri, mongodb }) {
  const { ObjectId, MongoClient } = mongodb;
  const mongoClient = MongoClient.connect(uri, { useNewUrlParser: true });
  const db = mongoClient.then(c => c.db());
  const Clients = db.then(_db => _db.collection('clients'));
  const Users = db.then(_db => _db.collection('users'));
  const Authorizations = db.then(_db => _db.collection('authorizations'));
  const AccessTokens = db.then(_db => _db.collection('accessTokens'));
  const RefreshTokens = db.then(_db => _db.collection('refreshTokens'));

  async function getClientById(id) {
    const clientFromDB = await (await Clients).findOne({ clientId: id });
    const { clientId, redirectUris, ...props } = clientFromDB;
    return {
      client_id: clientId,
      redirect_uris: redirectUris,
      ...props
    };
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

  async function getUserByIndentifier() {
    throw new Error('Implementation to be done on provider');
  }

  async function getAccessToken(token) {
    const accessToken = await (await AccessTokens).findOne({ token });
    return accessToken;
  }

  async function getRefreshToken(token) {
    const refreshToken = await (await RefreshTokens).findOne({ token, status: 'created' });
    return refreshToken;
  }

  async function getAuthById(id) {
    const auth = await (await Authorizations).findOne({ _id: ObjectId(id) });
    return auth;
  }

  async function getAuthByCode(code, client) {
    const now = new Date();
    const { value } = await (await Authorizations).findOneAndUpdate(
      {
        clientId: client.client_id,
        code
      },
      {
        $set: {
          updatedAt: now,
          status: 'consumed'
        }
      },
      { returnOriginal: false }
    );
    return value;
  }

  async function invalidateRefreshToken(token, authId) {
    const { value } = await (await RefreshTokens).findOneAndUpdate(
      {
        token,
        authId
      },
      {
        $set: {
          updatedAt: new Date(),
          status: 'consumed'
        }
      },
      { returnOriginal: false }
    );
    return value;
  }

  async function newAccessToken({ auth }) {
    const now = new Date();
    const expiresAt = getExpiresAt(now);
    const { value } = await (await AccessTokens).findOneAndUpdate(
      { token: newCode(48) },
      {
        $set: {
          authId: auth._id,
          clientId: auth.clientId,
          userId: auth.userId,
          updatedAt: now,
          expiresAt
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, returnOriginal: false }
    );
    return value;
  }
  async function newRefreshToken({ auth }) {
    const now = new Date();
    const { value } = await (await RefreshTokens).findOneAndUpdate(
      { token: newCode(32) },
      {
        $set: {
          authId: auth._id,
          scope: auth.scope,
          status: 'created'
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, returnOriginal: false }
    );
    return value;
  }

  async function newAuthorization({ client, user, scope, codeChallenge }) {
    const now = new Date();
    const { value } = await (await Authorizations).findOneAndUpdate(
      { clientId: client.client_id, userId: user._id },
      {
        $set: {
          updatedAt: now,
          code_challenge: codeChallenge,
          code: newCode(),
          scope: scope || client.scopes.join(' ')
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, returnOriginal: false }
    );
    return value;
  }

  return {
    db,
    mongoClient,
    getClientById,
    getUserByName,
    getUserById,
    getUserByIndentifier,
    getAccessToken,
    getRefreshToken,
    getAuthById,
    getAuthByCode,
    newAuthorization,
    newAccessToken,
    newRefreshToken,
    invalidateRefreshToken
  };
}

module.exports = buildMongoStore;
