/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const twitterWrapper = require("../../../src/api/twitter-wrapper");
const twitter = require("../../../src/api/twitter");

describe("Twitter - Integration", ()=> {
  before(() => {
    twitterWrapper.createClient();
    twitter.init();
  });

  afterEach(()=> {
    twitter.closeAllStreams();
  });

  it("should get tweets for screen name", done => {
    twitter.getTweets("risevision", (error, tweets)=>{
      assert(tweets);
      assert.equal(Object.keys(tweets).length, 25);
      done();
    });
  });

  it("should stream tweets for hashtag", done => {
    twitter.streamTweets("test-component-id", {hashtag: "#trump"}, (error, tweets)=>{
      assert(tweets);
      done();
    });
  });
});
