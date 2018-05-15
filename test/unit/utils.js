/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");
const sinon = require("sinon");
const mock = simple.mock;

const config = require("../../src/config/config");
const utils = require("../../src/utils");

let fn = null;
let clock = null;

describe("Utils - Unit", ()=> {

  beforeEach(() => {
    fn = simple.mock();
    clock = sinon.useFakeTimers();
  });

  afterEach(()=> {
    simple.restore();
    clock.restore();
  });

  it("should call function if timeLimit has not reached and condition is false", () => {
    mock(config, "isAuthorized").returnWith(false);
    mock(config, "getTimeSinceStartup").returnWith(1000);
    utils.retryAfterStartup(fn, config.retryTimeLimit, config.isAuthorized);

    clock.tick(60 * 1000);
    assert(config.getTimeSinceStartup.called);
    assert(fn.called);
  });

  it("should not call function if timeLimit has  reached", () => {
    mock(config, "isAuthorized").returnWith(false);
    mock(config, "getTimeSinceStartup").returnWith(11 * 60 * 1000);
    utils.retryAfterStartup(fn, config.retryTimeLimit, config.isAuthorized);

    clock.tick(60 * 1000);
    assert(config.getTimeSinceStartup.called);
    assert.equal(0, fn.callCount);

    // interval is cleared
    clock.tick(60 * 1000);
    assert.equal(1, config.getTimeSinceStartup.callCount);
  });

  it("should not call function if condition is true", () => {
    mock(config, "isAuthorized").returnWith(true);
    mock(config, "getTimeSinceStartup").returnWith(1000);
    utils.retryAfterStartup(fn, config.retryTimeLimit, config.isAuthorized);

    clock.tick(60 * 1000);
    assert(config.getTimeSinceStartup.called);
    assert.equal(0, fn.callCount);

    // interval is cleared
    clock.tick(60 * 1000);
    assert.equal(1, config.getTimeSinceStartup.callCount);

  });
});
