/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");
const simple = require("simple-mock");
const EventEmitter = require("events");
simple.mock(config, "getTwitterCredentials").returnWith({oauth_token: "xxxxxx", oauth_token_secret: "xxxxxxxxxxx"});
const twitterWrapper = require("../../../src/api/twitter-wrapper");
const clientMock = {
  get: () => {},
  stream: () => {}
}
simple.mock(twitterWrapper, "client", clientMock)
const twitter = require("../../../src/api/twitter");

describe("Twitter - Unit", ()=> {

  let stream = null;
  beforeEach(()=> {
    stream = new EventEmitter();
    simple.mock(clientMock, "stream").callbackWith(stream);
    simple.mock(clientMock, "get").callbackWith(null, [{id: 1234}]);
    simple.mock(logger, "error").returnWith();
  });

  afterEach(()=> {
    simple.restore();
    twitter.closeAllStreams();
  });

  it("should return tweets for screen name", done => {
    twitter.streamTweets("test-component-id", {screen_name: "test"}, (error, tweets)=>{
      assert(tweets);
      assert.deepEqual(clientMock.stream.lastCall.args[1], {follow: 1234})
      assert.equal(clientMock.stream.lastCall.args[0], "statuses/filter")
      assert.equal(clientMock.get.lastCall.args[0], "users/lookup")
      done();
    });
    setTimeout(()=>{
      stream.emit("data", {text: "hey"});
    }, 100);
  });

  it("should return tweets for hashtag", done => {
    twitter.streamTweets("test-component-id", {hashtag: "#test"}, (error, tweets)=>{
      assert(tweets);
      assert(clientMock.stream.lastCall.arg[1], {track: "#test"})
      assert(clientMock.stream.lastCall.arg[0], "statuses/filter")
      done();
    });
    stream.emit("data", {text: "hey"});
  });

  it("should fail if stream returns error", done => {
    twitter.streamTweets("test-component-id", {screen_name: "test"}, (error)=>{
      assert.equal(error.message, "Error on stream");
      assert(logger.error.lastCall.args[1].includes("Could not stream tweets for"));
      done();
    });
    setTimeout(()=>{
      stream.emit("error", new Error("Error on stream"));
    }, 100);
  });

  it("should fail if cannot get user id for stream", done => {
    const expectedError = [{"code": 17, "message": "No user matches for specified terms."}];

    simple.mock(clientMock, "get").callbackWith(expectedError, "");
    twitter.streamTweets("test-component-id", {screen_name: "test"}, (error)=>{
      assert.equal(error, JSON.stringify(expectedError));
      assert(logger.error.lastCall.args[1].includes("Could not retrieve user ID for"));
      done();
    });
  });

  it("should get tweets for a screen name", done => {
    const tweetsExpectation = [{id: 1234, text: "blabla"}, {id: 4568, text: "blabla2"}];
    simple.mock(clientMock, "get").callbackWith(null, tweetsExpectation);
    twitter.getTweets("test", (error, tweets) => {
      assert.deepEqual(tweets, tweetsExpectation);
      done();
    });
  });

  it("should fail if getting tweets returns an error", done => {
    simple.mock(clientMock, "get").callbackWith(new Error("Error on getting Tweets"));
    twitter.getTweets("test", (error) => {
      assert.deepEqual(error.message, "Error on getting Tweets");
      done();
    });
  });
});
