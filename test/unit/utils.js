/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");
const sinon = require("sinon");
const mock = simple.mock;

const config = require("../../src/config/config");
const utils = require("../../src/utils");
const logger = require("../../src/logger");

let fn = null;
let clock = null;

describe("Utils - Unit", ()=> {

  beforeEach(() => {
    fn = simple.mock();
    clock = sinon.useFakeTimers();
    mock(logger, "all").returnWith();
    mock(logger, "error").returnWith();
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

    // action is logged
    assert.equal(logger.all.lastCall.args[0], "info");
    assert.equal(logger.all.lastCall.args[1], `retrying to call method ${fn.name}`);

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

    // action is logged
    assert.equal(logger.all.lastCall.args[0], "info");
    assert.equal(logger.all.lastCall.args[1], `failed to reach stopcondition - not calling ${fn.name}`);
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

    // nothing was logged because condition is true
    assert.equal(logger.all.callCount, 0);

  });
});
