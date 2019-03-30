const express = require('express');
const buildRouter = require('./build-router');
const { runSampleServer } = require('../test/helpers');

describe('buildRouter', () => {
  it('can be instantiated', () => {
    expect(() => buildRouter()).toThrow();
    expect(() => buildRouter({ express: null, store: null })).toThrow();
    expect(buildRouter({ express, store: {} })).toBeTruthy();
  });
  it('works via the sample', async () => {
    const { app, port } = await runSampleServer({ store: {} });

    // TODO:
  });
});
