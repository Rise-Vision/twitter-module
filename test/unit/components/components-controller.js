/* eslint-env mocha */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;
const rewire = require("rewire");
const logger = require("../../../src/logger");
const twitterWrapper = require("../../../src/api/twitter-wrapper");
const twitter = require("../../../src/api/twitter");
const components = require("../../../src/components/components");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const componentsController = rewire("../../../src/components/components-controller");

describe("Components-Controller - Unit", ()=>
{
  beforeEach(()=>{
    mock(twitter, "credentialsExist").returnWith(true);

    mock(twitter, "getTweets");
    mock(twitter, "closeAllStreams");
    mock(broadcastIPC, "twitterUpdate");
    mock(logger, "file").returnWith();
    mock(twitterWrapper, "getClient").returnWith({
      get: () => {},
      stream: () => {}
    });
    twitter.init();
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

  it("should format tweets when only one returned by API", done =>
  {
    const formatTweets = componentsController.__get__('formatTweets');
    const testTweets = {text: "test-text"};

    formatTweets(testTweets)
    .then((formattedTweets)=>{
      assert.equal(JSON.stringify(formattedTweets), JSON.stringify([testTweets]));
      done();
    })
  });

  it("should not format tweets when multiple returned by API", done =>
  {
    const formatTweets = componentsController.__get__('formatTweets');
    const testTweets = [{text1: "test-text"}, {text2: "test-text"}];

    formatTweets(testTweets)
    .then((formattedTweets)=>{
      assert.equal(JSON.stringify(formattedTweets), JSON.stringify(testTweets));
      done();
    })
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
