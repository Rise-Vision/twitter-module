/* eslint-env mocha */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;
const logger = require("../../../src/logger");
const twitter = require("../../../src/api/twitter");
const components = require("../../../src/components/components");
const componentsController = require("../../../src/components/components-controller");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");

describe("Components-Controller - Unit", ()=>
{
  beforeEach(()=>{
    mock(twitter, "credentialsExist").returnWith(true);

    mock(twitter, "getTweets");
    mock(twitter, "closeAllStreams");
    mock(broadcastIPC, "twitterUpdate");
    mock(logger, "file").returnWith();
  });

  afterEach(()=> {
    simple.restore()
  });

  after(() => {
    components.clear();
  });

  it("should not update tweets if invalid componentId", done =>
  {
    const testComponentId = "";
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"}
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.file.lastCall.args[0].includes("Invalid params"));
    assert(!twitter.getTweets.called);
    done();
  });

  it("should not update tweets if invalid component data", done =>
  {
    const testComponentId = "test_component_id";
    const testComponentData = {};
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.file.lastCall.args[0].includes("Invalid params"));
    assert(!twitter.getTweets.called);
    done();
  });

  it("should update tweets for component", done =>
  {
    const testComponentId = "test_component_id";
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"}
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(twitter.getTweets.called);
    done();
  });

  it("should clear components", done =>
  {
    mock(components, "clear");
    componentsController.clearComponents();
    assert(twitter.closeAllStreams.called);
    assert(components.clear.called);
    done();
  });
});
