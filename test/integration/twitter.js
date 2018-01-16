/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const twitter = require("../../src/api/twitter");

describe("Twitter - Integration", ()=> {

  it("should return tweets for screen name", done => {
    twitter.getTweets("risevision", (error, tweets)=>{
      assert(tweets);
      done();
    });
  });

  it("should return tweets for hashtag", done => {
    twitter.streamTweets({hashtag: "#donaldtrump"}, (error, tweets)=>{
      assert(tweets);
      twitter.closeStream();
      done();
    });
  });
});
