/* eslint-env mocha */
/* eslint-disable no-prototype-builtins */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;
const commonConfig = require("common-display-module");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");

describe("Messaging -> Broadcast IPC", ()=> {
  beforeEach(()=>{
    mock(commonConfig, "broadcastMessage").returnWith();
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
    assert(commonConfig.broadcastMessage.called);
    assert.deepEqual(commonConfig.broadcastMessage.lastCall.args[0], {
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
    assert(commonConfig.broadcastMessage.called);
    assert.deepEqual(commonConfig.broadcastMessage.lastCall.args[0], {
      from: config.moduleName,
      topic: "twitter-update",
      status: "CACHED",
      data: '{"test-property":"testValue"}'
    });
  });
});
