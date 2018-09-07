/* eslint-env mocha */
const assert = require("assert");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");
const status = require("../../../../src/messaging/status/status");
const config = require("../../../../src/config/config");

describe("Messaging -> Status - Unit", ()=> {

  beforeEach(()=> {
    simple.mock(commonMessaging, "broadcastMessage").returnWith();
    simple.mock(config, "setReadyStatus");
    simple.mock(status, "sendStatusMessage");
  });

  afterEach(()=> {
    simple.restore()
  });

  describe("Update Ready Status", ()=> {
    it("should not update status if still NOT READY", done => {
      config.setReadyStatus(false);

      status.updateReadyStatus(false);

      assert.equal(config.setReadyStatus.called, true);
      assert.equal(status.sendStatusMessage.called, false);
      done();
    });

    it("should not update status if still READY", done => {
      config.setReadyStatus(true);

      status.updateReadyStatus(true);

      assert.equal(config.setReadyStatus.called, true);
      assert.equal(status.sendStatusMessage.called, false);
      done();
    });
  });

  describe("Send Status Message", ()=> {
    it("should send correct status message if credentials do not exist", done => {
      config.setReadyStatus(null);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "twitter-status-update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, false);
      done();
    });

    it("should send correct status message if valid credentials", done => {
      config.setReadyStatus(true);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "twitter-status-update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, true);
      done();
    });

    it("should send correct status message if invalid credentials", done => {
      config.setReadyStatus(false);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "twitter-status-update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, false);
      done();
    });
  });
});
