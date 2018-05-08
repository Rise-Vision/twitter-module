/* eslint-env mocha */
/* eslint-disable no-magic-numbers, max-statements */

const commonConfig = require("common-display-module");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");
const mock = simple.mock;
const assert = require("assert");
const messaging = require("../../../src/messaging/messaging");
const watch = require("../../../src/messaging/watch/watch");
const twitter = require("../../../src/api/twitter");
const components = require("../../../src/components/components");
const componentsController = require("../../../src/components/components-controller");
const update = require("../../../src/messaging/update/update");
const logger = require("../../../src/logger");
const localMessagingModule = require("local-messaging-module");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc");

let testComponentId = {};
let testComponentData = {};
let testComponent = {};

describe("Messaging - Integration", function() {
  describe("Connected to Messaging Service through Local Messaging", () => {
    before(() => {
      return localMessagingModule.start("ls-test-did", "ls-test-mid");
    });

    beforeEach(() => {
      messaging.init();

      mock(logger, "error");
      mock(logger, "file");
      mock(update, "processAll");
      mock(update, "clear");
      mock(components, "addComponent");
      mock(components, "removeComponent");
      mock(twitter, "finishRefresh");
      mock(componentsController, "updateComponent");
      mock(broadcastIPC, "twitterUpdate");

      mock(commonConfig, "getDisplaySettingsSync").returnWith({
        displayid: "ls-test-id", displayId: "ls-test-id"
      });

      testComponentId = {component_id: "test_id"}
      testComponentData = {screen_name: "test_screen_name", hashtag: "testtag"};
      testComponent = Object.assign({}, testComponentId, testComponentData);
    });

    after(() => {
      localMessagingModule.stop();
    });

    afterEach(() => {
      twitter.finishAllRefreshes();
      commonMessaging.disconnect();
      simple.restore();
      components.clear();
    });

    it("does not update twitter component if component_id is invalid", () => {
      testComponentId = {};
      testComponent = Object.assign({}, testComponentId, testComponentData);

      return new Promise(res => {
        commonMessaging.receiveMessages("test")
          .then(receiver => receiver.on("message", (message) => {
            if (message.topic.toUpperCase() === "TWITTER-WATCH") {
              // should not add component
              assert.equal(components.addComponent.callCount, 0);
              assert(logger.file.lastCall.args[0].startsWith("TWITTER-WATCH - UPDATE error"));
              res();
            }
          }));

        commonMessaging.broadcastMessage({
          from: "test",
          topic: "twitter-watch",
          status: "CURRENT",
          data: testComponent
        });
      });
    });

    it("does not update twitter component if neither hashtag nor screen_name is valid", () => {
      testComponentData = {};
      testComponent = Object.assign({}, testComponentId, testComponentData);

      return new Promise(res => {
        commonMessaging.receiveMessages("test")
          .then(receiver => receiver.on("message", (message) => {
            if (message.topic.toUpperCase() === "TWITTER-WATCH") {
              // should not add component
              assert.equal(components.addComponent.callCount, 0);
              assert(logger.file.lastCall.args[0].startsWith("TWITTER-WATCH - UPDATE error in"));
              res();
            }
          }));

        commonMessaging.broadcastMessage({
          from: "test",
          topic: "twitter-watch",
          status: "CURRENT",
          data: testComponent
        });
      });
    });

    it("does not update twitter component if credentials do not exist", () => {
      mock(twitter, "credentialsExist").returnWith(false);

      return new Promise(res => {
        commonMessaging.broadcastMessage({
          from: "test",
          topic: "twitter-watch",
          status: "CURRENT",
          data: testComponent
        });

        setTimeout(function() {
          assert.equal(logger.error.lastCall.args[0], "Credentials do not exist - can not update components");
          res();
        }, 200);
      });
    });

    it("waits for twitter component then adds component to watch => sends update message with tweets", () => {
      testComponentData = {screen_name: "risevision", hashtag: "testtag"};
      testComponent = Object.assign({}, testComponentId, testComponentData);

      return new Promise(res => {
        commonMessaging.broadcastMessage({
          from: "test",
          topic: "twitter-watch",
          status: "CURRENT",
          data: testComponent
        });

        setTimeout(()=>{
          assert.equal(components.addComponent.callCount, 1);
          assert.equal(JSON.stringify(components.getComponentDataById(testComponentId.component_id)), JSON.stringify(testComponentData));
          assert.equal(broadcastIPC.twitterUpdate.callCount, 1);
          res();
        }, 3000);
      });
    });

    it("updates all twitter components if credentials JSON file is changed", () => {
      mock(watch, "receiveCredentialsFile").returnWith(Promise.resolve());
      mock(components, "getComponents").returnWith({"risevision": {"screen_name": "risevision", "hashtag": "testtag"}});

      return new Promise(res => {
        commonMessaging.broadcastMessage({
          from: "test",
          topic: "file-update",
          status: "CURRENT",
          filePath: "risevision-company-notifications/testing/twitter.json"
        });

        setTimeout(()=>{
          assert.equal(update.processAll.callCount, 1);
          assert.equal(broadcastIPC.twitterUpdate.callCount, 1);
          res();
        }, 3000);
      });
    });

    it("does not update twitter components if credentials JSON file is deleted or does not exist", () => {
      mock(watch, "receiveCredentialsFile").returnWith(Promise.resolve());
      mock(twitter, "credentialsExist").returnWith(false);
      mock(components, "getComponents").returnWith({"risevision": {"screen_name": "risevision", "hashtag": "testtag"}});

      return new Promise(res => {
        commonMessaging.broadcastMessage({
          from: "test",
          topic: "file-update",
          status: "DELETED",
          filePath: "risevision-company-notifications/testing/twitter.json"
        });

        setTimeout(function() {
          assert.equal(logger.error.lastCall.args[0], "Credentials do not exist - can not update components");
          res();
        }, 1000);
      });
    });

    it("clear all twitter components if ws-client-connected message is received", () => {

      return new Promise(res => {
        commonMessaging.broadcastMessage({
          from: "ws-client",
          topic: "ws-client-connected"
        });

        setTimeout(()=>{
          assert.equal(update.clear.callCount, 1);
          res();
        }, 3000);
      });
    });

  });
});
