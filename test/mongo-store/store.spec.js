const mongodb = require('mongodb');
const buildMongoStore = require('../../src/store/build-mongo-store');

const { MongoClient } = mongodb;

const uri = process.env.MONGO_URL || 'mongodb://localhost/oauth2-provider-middleware-test';

const collections = {
  Clients: 'clients',
  Users: 'users'
  // TODO: more
};

beforeAll(async () => {
  const db = await MongoClient.connect(uri, { useNewUrlParser: true }).then(c => c.db());
  /* eslint-disable no-restricted-syntax */
  for (const c of Object.keys(collections)) {
    /* eslint-disable no-await-in-loop */
    await db.collection(collections[c]).remove({});
  }

  await db.collection('clients').insertMany([
    {
      clientId: '123',
      redirectUris: ['bla', 'blu']
    },
    {
      clientId: '125',
      redirectUris: ['bla', 'blu']
    }
  ]);
});

describe('Mongo Store', () => {
  it('fails without params', () => {
    expect(buildMongoStore).toThrow(/uri/);
  });
  it('succeeds with params', () => {
    const store = buildMongoStore({ uri, mongodb });
    expect(store.db).toBeTruthy();
    expect(store.getClientById).toBeTruthy();
  });
  describe('getClientById', () => {
    it('maps properties as expected', async () => {
      const store = buildMongoStore({ uri, mongodb });
      const client = await store.getClientById('123');
      expect(client.client_id).toBe('123');
      expect(client.redirect_uris).toEqual(['bla', 'blu']);
    });
  });
});
