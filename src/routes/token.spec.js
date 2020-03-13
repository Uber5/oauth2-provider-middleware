const { getClientOnTokenRequest } = require('./token');

describe('getClientOnTokenRequest', () => {
  it('succeeds for valid client', async () => {
    const id = '234';
    const secret = '345';
    const authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
    const store = {
      getClientById: async clientId => {
        if (clientId !== '234') throw new Error('oops');
        return {
          secret: '345'
        };
      }
    };
    const result = await getClientOnTokenRequest(authorization, store);
    expect(result.secret).toBeTruthy();
  });
});
