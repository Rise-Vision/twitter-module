/* eslint-env mocha */
const assert = require("assert");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");
const status = require("../../../../src/messaging/status/status");
const config = require("../../../../src/config/config");
const twitter = require("../../../../src/api/twitter");

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
      simple.mock(config, "getReadyStatus").returnWith(false);
      simple.mock(twitter, "credentialsExist").returnWith(false);

      status.updateReadyStatus(false);

      assert.equal(config.setReadyStatus.called, false);
      assert.equal(status.sendStatusMessage.called, false);
      done();
    });

    it("should not update status if still READY", done => {
      simple.mock(config, "getReadyStatus").returnWith(true);
      simple.mock(twitter, "credentialsExist").returnWith(true);

      status.updateReadyStatus(true);

      assert.equal(config.setReadyStatus.called, true);
      assert.equal(status.sendStatusMessage.called, true);
      done();
    });
  });

  describe("Send Status Message", ()=> {
    it("should send correct status message if credentials do not exist", done => {
      simple.mock(config, "getReadyStatus").returnWith(null);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "Twitter-Status-Update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, false);
      done();
    });

    it("should send correct status message if valid credentials", done => {
      simple.mock(config, "getReadyStatus").returnWith(true);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "Twitter-Status-Update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, true);
      done();
    });

    it("should send correct status message if invalid credentials", done => {
      simple.mock(config, "getReadyStatus").returnWith(false);

      status.sendStatusMessage();

      assert(commonMessaging.broadcastMessage.called);
      assert(commonMessaging.broadcastMessage.calls[0].args[0]);
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].topic, "Twitter-Status-Update");
      assert.equal(commonMessaging.broadcastMessage.calls[0].args[0].status, false);
      done();
    });
  });
});
