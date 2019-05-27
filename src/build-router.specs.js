/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const buildRouter = require('./build-router');

describe('buildRouter', () => {
  it('can be instantiated', () => {
    expect(() => buildRouter()).toThrow();
    expect(() => buildRouter({ express: null, store: null })).toThrow();
    expect(buildRouter({ express, store: {} })).toBeTruthy();
  });
});
