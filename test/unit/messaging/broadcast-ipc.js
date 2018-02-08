/* eslint-env mocha */
/* eslint-disable no-prototype-builtins */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;
const commonMessaging = require("common-display-module/messaging");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");

describe("Messaging -> Broadcast IPC", ()=> {
  beforeEach(()=>{
    mock(commonMessaging, "broadcastMessage").returnWith();
    mock(broadcastIPC, "broadcast");
    mock(broadcastIPC, "twitterUpdate");
    mock(logger, "file").returnWith();
  });

  afterEach(()=>{
    simple.restore();
  });

  it("broadcasts message", ()=>{
    broadcastIPC.broadcast("test-topic", {"test-property": "testValue"});
    assert(broadcastIPC.broadcast.called);
    assert(commonMessaging.broadcastMessage.called);
    assert.deepEqual(commonMessaging.broadcastMessage.lastCall.args[0], {
      from: config.moduleName,
      topic: "test-topic",
      "test-property": "testValue"
    });
  });

  it("throws error if TWITTER-UPDATE with invalid status", ()=>{
    assert.throws(() => {broadcastIPC.twitterUpdate({"status": "", "data": JSON.stringify({"test-property": "testValue"})})}, Error);
  });

  it("broadcasts TWITTER-UPDATE message", ()=>{
    broadcastIPC.twitterUpdate({"status": "CACHED", "data": JSON.stringify({"test-property": "testValue"})});
    assert(broadcastIPC.twitterUpdate.called);
    assert(commonMessaging.broadcastMessage.called);
    assert.deepEqual(commonMessaging.broadcastMessage.lastCall.args[0], {
      from: config.moduleName,
      topic: "twitter-update",
      through: 'ws',
      status: "CACHED",
      data: '{"test-property":"testValue"}'
    });
  });
});
