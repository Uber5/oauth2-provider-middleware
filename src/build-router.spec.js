const express = require('express');
const puppeteer = require('puppeteer');

const buildRouter = require('./build-router');
const { runSampleServer, runSampleClient } = require('../test/helpers');

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
    const { app, port } = await runSampleServer({ store: {} });
    const client = await runSampleClient({
      provider: `http://localhost:${port}`,
      clientId: 'dummy-client-123'
    });
    console.log('SAMPLE provider and client port', port, client.port);

    const page = await browser.newPage();
    await page.goto(`http://localhost:${client.port}`);
    await Promise.all([page.waitForNavigation(), page.click('button')]);
    await page.screenshot({ path: '/tmp/screenshot.png' });
    // TODO: ...
  });
});
