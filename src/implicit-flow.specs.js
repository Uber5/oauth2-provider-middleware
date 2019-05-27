const encryptPassword = require('./lib/encrypt-password');
const { runSampleServer, runSampleClient, createRandomId, getBrowser } = require('../test/helpers');
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

describe('implicit flow', () => {
  it('logs me in', async () => {
    const oauthClient = {
      client_id: createRandomId(),
      client_secret: 'the secret',
      implicitFlow: true,
      redirect_uris: [],
      scopes: ['scope1', 'scope2', 'scope3']
    };
    const plainPassword = 'secret';
    const user = {
      _id: Math.random(),
      name: `${Math.random()}`,
      password: encryptPassword(plainPassword)
    };
    const token = newCode();
    const store = {
      getClientById: async clientId => {
        if (clientId !== oauthClient.client_id) {
          throw new Error('invalid client_id');
        }
        return Promise.resolve(oauthClient);
      },
      getUserByName: async name => {
        return user;
      },
      getUserById: async id => {
        return user;
      },
      newAuthorization: async () => {
        return {};
      },
      newAccessToken: async () => {
        return {
          token,
          updatedAt: new Date(),
          expiresAt: new Date(new Date().getTime() + 10000)
        };
      }
    };
    const provider = await runSampleServer({ store });
    const client = await runSampleClient({
      provider: `http://localhost:${provider.port}`,
      clientId: oauthClient.client_id,
      scope: 'scope1 scope3'
    });
    oauthClient.redirect_uris.push(`http://localhost:${client.port}/`);

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${client.port}`);
    expect(await isLoggedInOnPage(page)).toBe(false);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/login.png' });
    await page.type("input[name='username']", user.name);
    await page.type("input[name='password']", plainPassword);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/logged-in.png' });

    expect(await isLoggedInOnPage(page)).toBe(true);
    const loginDetails = await getLoginDetails(page);
    expect(loginDetails.access_token).toBeTruthy();
    expect(loginDetails.token_type).toBe('token');
    expect(loginDetails.expires_in > 0).toBe(true);
    expect(loginDetails.scope).toMatch(/scope1/);
  });
});
