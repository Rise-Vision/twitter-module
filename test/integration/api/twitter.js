/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const twitter = require("../../../src/api/twitter");

describe("Twitter - Integration", ()=> {

  afterEach(()=> {
    twitter.closeAllStreams();
  });

  it("should return tweets for screen name", done => {
    twitter.getTweets("risevision", (error, tweets)=>{
      assert(tweets);
      assert.equal(Object.keys(tweets).length, 25);
      done();
    });
  });

  it("should return tweets for hashtag", done => {
    twitter.streamTweets("test-component-id", {hashtag: "#donaldtrump"}, (error, tweets)=>{
      assert(tweets);
      done();
    });
  });
});
