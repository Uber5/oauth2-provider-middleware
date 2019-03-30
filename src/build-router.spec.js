const express = require('express');
const puppeteer = require('puppeteer');

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
      /* eslint-disable-line camelcase */
      client_id: createRandomId(),
      client_secret: 'the secret',
      redirect_uris: []
    };
    const store = {
      getClientById: async clientId => {
        if (clientId !== oauthClient.client_id) {
          throw new Error('invalid client_id');
        }
        return Promise.resolve(oauthClient);
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
    await page.screenshot({ path: '/tmp/screenshot.png' });
    // TODO: ...
  });
});
