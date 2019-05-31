/* eslint-disable no-console */
const encryptPassword = require('./lib/encrypt-password');
const {
  runSampleServer,
  runCodeSampleClient,
  createRandomId,
  getBrowser
} = require('../test/helpers');
const newCode = require('./lib/new-code');

const getLoggedInElemText = async page => page.$eval('#logged-in', el => el.innerHTML);

/** Check on the page if we are logged in. Assuming an element
 * with id 'logged-in' is present.
 */
const isLoggedInOnPage = async page => {
  try {
    const loggedInElemText = await getLoggedInElemText(page);
    console.log('loggedInElem loggedInElemText', loggedInElemText);
    return true;
  } catch (e) {
    return false;
  }
};

const getLoginDetails = async page => {
  const text = (await getLoggedInElemText(page)).replace(/&amp;/g, '&');
  const result = decodeURIComponent(text)
    .split('&')
    .reduce((details, line) => {
      const [name, value] = line.split('=');
      return Object.assign({}, details, { [name]: value });
    }, {});
  console.log('getLoginDetails', result);
  return result;
};

describe('code flow', () => {
  it('logs me in', async () => {
    const oauthClient = {
      client_id: createRandomId(),
      client_secret: 'the secret',
      redirect_uris: [],
      scopes: ['scope1', 'scope2', 'scope3']
    };
    const plainPassword = 'secret';
    const userInfo = {
      _id: Math.random(),
      name: `${Math.random()}`,
      password: encryptPassword(plainPassword)
    };

    const { _id } = userInfo;
    const code = newCode();
    const token = newCode();
    const store = {
      getClientById: async clientId => {
        if (clientId !== oauthClient.client_id) {
          throw new Error('invalid client_id');
        }
        return Promise.resolve(oauthClient);
      },
      getUserByName: async username => {
        if (username !== userInfo.name) {
          throw new Error('Invalid username/email');
        }
        return userInfo;
      },
      getUserById: async userId => {
        // eslint-disable-next-line no-underscore-dangle
        if (userId !== userInfo._id) {
          throw new Error('Invalid user Id');
        }
        return userInfo;
      },
      newAuthorization: async ({ client, user, requestedScope }) => {
        if (
          client.client_id !== oauthClient.client_id ||
          client.client_secret !== oauthClient.client_secret
        ) {
          throw new Error('Invalid client');
        }
        if (
          // eslint-disable-next-line no-underscore-dangle
          user._id !== userInfo._id ||
          user.name !== userInfo.name ||
          user.password !== userInfo.password
        ) {
          throw new Error('Invalid user');
        }
        // TODO : requestedScope check
        return {
          clientId: oauthClient.client_id,
          userId: _id,
          code,
          status: 'created',
          updatedAt: new Date(),
          createdAt: new Date()
        };
      },
      getAuthByCode: async (_code, client) => {
        if (client.client_id !== oauthClient.client_id) {
          throw new Error('invalid client_id');
        }
        if (code !== _code) {
          throw new Error('invalid code');
        }
        return {
          clientId: oauthClient.client_id,
          userId: _id,
          code,
          status: 'created',
          updatedAt: new Date(),
          createdAt: new Date()
        };
      },
      newAccessToken: async ({ auth, client, user }) => {
        return {
          token,
          updatedAt: new Date(),
          expiresAt: new Date(new Date().getTime() + 10000)
        };
      }
    };
    const provider = await runSampleServer({ store });
    oauthClient.redirect_uris.push(`http://localhost:3001/logged-in`);
    const client = await runCodeSampleClient({
      provider: `http://localhost:${provider.port}`,
      client: oauthClient
    });

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${client.port}`);
    expect(await isLoggedInOnPage(page)).toBe(false);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/code-login.png' });
    await page.type("input[name='username']", userInfo.name);
    await page.type("input[name='password']", plainPassword);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/code-logged-in.png' });

    expect(await isLoggedInOnPage(page)).toBe(true);
    // const loginDetails = await getLoginDetails(page);
    // expect(loginDetails.access_token).toBeTruthy();
    // expect(loginDetails.token_type).toBe('token');
    // expect(loginDetails.expires_in > 0).toBe(true);
    // expect(loginDetails.scope).toMatch(/scope1/);
    await browser.close();
  }, 60000);
});
