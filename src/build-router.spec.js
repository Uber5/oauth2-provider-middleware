const express = require('express');
const puppeteer = require('puppeteer');

const encryptPassword = require('./lib/encrypt-password');
const buildRouter = require('./build-router');
const { runSampleServer, runSampleClient, createRandomId } = require('../test/helpers');

let browser;
beforeAll(async () => {
  browser = await puppeteer.launch();
});
afterAll(async () => {
  await browser.close();
});

describe('buildRouter', () => {
  it('can be instantiated', () => {
    expect(() => buildRouter()).toThrow();
    expect(() => buildRouter({ express: null, store: null })).toThrow();
    expect(buildRouter({ express, store: {} })).toBeTruthy();
  });
  it('works via the sample', async () => {
    const oauthClient = {
      client_id: createRandomId(),
      client_secret: 'the secret',
      implicitFlow: true,
      redirect_uris: []
    };
    const plainPassword = 'secret';
    const user = {
      _id: Math.random(),
      name: `${Math.random()}`,
      password: encryptPassword(plainPassword)
    };
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
        return {};
      }
    };
    const provider = await runSampleServer({ store });
    const client = await runSampleClient({
      provider: `http://localhost:${provider.port}`,
      clientId: oauthClient.client_id
    });
    oauthClient.redirect_uris.push(`http://localhost:${client.port}/`);

    const page = await browser.newPage();
    await page.goto(`http://localhost:${client.port}`);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/login.png' });
    await page.type("input[name='username']", user.name);
    await page.type("input[name='password']", plainPassword);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/logged-in.png' });
    // TODO: ...
  });
});
