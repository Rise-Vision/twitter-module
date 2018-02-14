/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const twitter = require("../../../src/api/twitter");

describe("Twitter - Integration", ()=> {

  afterEach(()=> {
    twitter.closeAllStreams();
  });

  xit("should get tweets for screen name", done => {
    twitter.getTweets("risevision", (error, tweets)=>{
      assert(tweets);
      assert.equal(Object.keys(tweets).length, 25);
      done();
    });
  });

  xit("should stream tweets for hashtag", done => {
    twitter.streamTweets("test-component-id", {hashtag: "#trump"}, (error, tweets)=>{
      assert(tweets);
      done();
    });
  });
});
