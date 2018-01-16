/* eslint-env mocha */

const commonConfig = require("common-display-module");
const simple = require("simple-mock");
const mock = simple.mock;
const assert = require("assert");
const messaging = require("../../../src/messaging/messaging");
const components = require("../../../src/components");
const logger = require("../../../src/logger");
const localMessagingModule = require("local-messaging-module");

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

      mock(components, "addComponent");
      mock(logger, "file");

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
      commonConfig.disconnect();
      simple.restore();
      components.clear();
    });

    it("does not add twitter component if neither component_id is invalid", () => {
      testComponentId = {};
      testComponent = Object.assign({}, testComponentId, testComponentData);

      return new Promise(res => {
        commonConfig.receiveMessages("test")
          .then(receiver => receiver.on("message", (message) => {
            if (message.topic === "Twitter-Watch") {
              // should not add component
              assert.equal(components.addComponent.callCount, 0);
              assert.equal(logger.file.lastCall.args, "message recieved error - twitter - Error: component_id is invalid");
              res();
            }
          }));

        commonConfig.broadcastMessage({
          from: "test",
          topic: "Twitter-Watch",
          data: testComponent
        });
      });
    });

    it("does not add twitter component if neither hashtag nor screen_name is valid", () => {
      testComponentData = {};
      testComponent = Object.assign({}, testComponentId, testComponentData);

      return new Promise(res => {
        commonConfig.receiveMessages("test")
          .then(receiver => receiver.on("message", (message) => {
            if (message.topic === "Twitter-Watch") {
              // should not add component
              assert.equal(components.addComponent.callCount, 0);
              assert.equal(logger.file.lastCall.args, "message recieved error - twitter - Error: must include screen_name or hashtag");
              res();
            }
          }));

        commonConfig.broadcastMessage({
          from: "test",
          topic: "Twitter-Watch",
          data: testComponent
        });
      });
    });

    it("waits for twitter component message then adds component to watch", () => {
      return new Promise(res => {
        commonConfig.broadcastMessage({
          from: "test",
          topic: "Twitter-Watch",
          data: testComponent
        });

        commonConfig.receiveMessages("test")
          .then(receiver => receiver.on("message", (message) => {
            if (message.topic === "Twitter-Watch") {
              // should add component
              assert.equal(components.addComponent.callCount, 1);
              assert.equal(JSON.stringify(components.getComponentById(testComponentId.component_id)), JSON.stringify(testComponentData));
              res();
            }
          }));
      });
    });

  });
});
