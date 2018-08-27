/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;
const rewire = require("rewire");
const logger = require("../../../src/logger");
const config = require("../../../src/config/config")
const twitterWrapper = require("../../../src/api/twitter-wrapper");
const twitter = require("../../../src/api/twitter");
const components = require("../../../src/components/components");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const componentsController = rewire("../../../src/components/components-controller");
const watch = require("../../../src/messaging/watch/watch");

describe("Components-Controller - Unit", ()=>
{
  beforeEach(()=>{
    mock(twitter, "credentialsExist").returnWith(true);

    mock(twitter, "getUserTweets");
    mock(twitter, "finishAllRefreshes");
    mock(broadcastIPC, "twitterUpdate");
    mock(logger, "error").returnWith();
    mock(logger, "all").returnWith();
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
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"};
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.error.lastCall.args[0].includes("Invalid params"));
    assert(!twitter.getUserTweets.called);
    done();
  });

  it("should not update tweets if invalid component data", done =>
  {
    const testComponentId = "test_component_id";
    const testComponentData = {};
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.error.lastCall.args[0].includes("Invalid params"));
    assert(!twitter.getUserTweets.called);
    done();
  });

  it("should not update tweets if no credentials", done =>
  {
    mock(twitter, "credentialsExist").returnWith(false);
    mock(config, "getReadyStatus").returnWith(false);
    mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(true);
    const testComponentId = "test_component_id";
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"};
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.error.lastCall.args[0].includes("Credentials do not exist"));
    assert(!twitter.getUserTweets.called);
    done();
  });

  it("should not update components if no credentials", done =>
  {
    mock(twitter, "credentialsExist").returnWith(false);
    mock(config, "getReadyStatus").returnWith(false);
    mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(true);
    componentsController.updateAllComponents();
    assert(logger.error.lastCall.args[0].includes("Credentials do not exist"));
    assert(!twitter.finishAllRefreshes.called);
    done();
  });

  it("should not update tweets if no watch message sent for credentials", done =>
  {
    mock(twitter, "credentialsExist").returnWith(false);
    mock(config, "getReadyStatus").returnWith(false);
    mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(false);
    const testComponentId = "test_component_id";
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"};
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(logger.all.lastCall.args[0].includes("info"));
    assert(logger.all.lastCall.args[1].includes("Watch message for credentials was not sent yet"));
    assert(!twitter.getUserTweets.called);
    done();
  });

  it("should not update components if no watch message sent for credentials", done =>
  {
    mock(twitter, "credentialsExist").returnWith(false);
    mock(config, "getReadyStatus").returnWith(false);
    mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(false);
    componentsController.updateAllComponents();
    assert(logger.all.lastCall.args[0].includes("info"));
    assert(logger.all.lastCall.args[1].includes("Watch message for credentials was not sent yet"));
    assert(!twitter.finishAllRefreshes.called);
    done();
  });

  it("should update tweets for component", done =>
  {
    const testComponentId = "test_component_id";
    const testComponentData = {screen_name: "RiseVision", hashtag: "risevision"}
    componentsController.updateComponent(testComponentId, testComponentData);
    assert(twitter.getUserTweets.called);
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
    assert(twitter.finishAllRefreshes.called);
    assert(components.clear.called);
    done();
  });
});
