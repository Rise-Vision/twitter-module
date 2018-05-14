/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");
const rewire = require("rewire");
const sinon = require("sinon");
const simple = require("simple-mock");
simple.mock(config, "getTwitterCredentials").returnWith({oauth_token: "xxxxxx", oauth_token_secret: "xxxxxxxxxxx"});
const twitterWrapper = require("../../../src/api/twitter-wrapper");
const clientMock = {
  get: () => {}
}
simple.mock(twitterWrapper, "getClient").returnWith(clientMock);
const twitter = require("../../../src/api/twitter");
twitter.init();
const twitterRewire = rewire("../../../src/api/twitter");
const filterTweets = twitterRewire.__get__('_filterTweets');

// sample tweets data
const onlyValidTweets = require("../../../test/data/valid-tweets.json");
const someFilterableTweets = require("../../../test/data/filterable-tweets-1.json");
const onlyFilterableTweets = require("../../../test/data/filterable-tweets-2.json");

describe("Twitter - Unit", ()=> {

  beforeEach(()=> {

    simple.mock(clientMock, "get").callbackWith(null, [{id: 1234}]);
    simple.mock(logger, "error").returnWith();
  });

  afterEach(()=> {
    simple.restore();
    twitter.finishAllRefreshes();
  });

  it("should get tweets for a screen name", done => {
    const tweetsExpectation = [{id: 1234, text: "blabla"}, {id: 4568, text: "blabla2"}];
    simple.mock(clientMock, "get").callbackWith(null, tweetsExpectation);
    twitter.getUserTweets("componentId", "test", (error, tweets) => {
      assert.deepEqual(tweets, tweetsExpectation);
      done();
    });
  });

  it("should fail if getting tweets returns an error", done => {
    simple.mock(clientMock, "get").callbackWith(new Error("Error on getting Tweets"));
    twitter.getUserTweets("componentId", "test", (error) => {
      assert.deepEqual(error.message, "Error on getting Tweets");
      done();
    });
  });

  describe("- Filtering", () => {
    it("should not filter out valid tweets", done => {
      assert.deepEqual(filterTweets(onlyValidTweets).length, 25);
      done();
    });

    it("should filter tweets for ones with text and not only links", done => {
      assert.deepEqual(filterTweets(onlyFilterableTweets).length, 0);
      done();
    });

    it("should only filter out invalid tweets but keep valid tweets", done => {
      assert.deepEqual(filterTweets(someFilterableTweets).length, 24);
      done();
    });
  });

  describe("- Refresh", () => {
    let clock = null;
    beforeEach(()=> {
      clock = sinon.useFakeTimers();
    });

    afterEach(()=> {
      clock.restore();
    });

    it("should refresh tweets after an hour", () => {
      const tweetsExpectation = [{id: 1234, text: "blabla"}, {id: 4568, text: "blabla2"}];
      let count = 0;
      simple.mock(clientMock, "get").callbackWith(null, tweetsExpectation);
      twitter.getUserTweets("componentId", "test", (error, tweets) => {
        assert.deepEqual(tweets, tweetsExpectation);
        count += 1;
      });

      clock.tick(60 * 60 * 1000);
      assert.equal(count, 2);
    });

    it("should finish all refreshes", () => {
      const tweetsExpectation = [{id: 1234, text: "blabla"}, {id: 4568, text: "blabla2"}];
      let count = 0;
      simple.mock(clientMock, "get").callbackWith(null, tweetsExpectation);
      twitter.getUserTweets("componentId", "test", (error, tweets) => {
        assert.deepEqual(tweets, tweetsExpectation);
        count += 1;
      });
      twitter.finishAllRefreshes();
      clock.tick(60 * 60 * 1000);
      assert.equal(count, 1);
    });
  });
});
