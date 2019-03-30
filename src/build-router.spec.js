const express = require('express');
const buildRouter = require('./build-router');
const { runSampleServer, runSampleClient } = require('../test/helpers');

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
    // TODO:
  });
});
