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
    twitter.finishAllRefreshes();
  });

  it("should get tweets for screen name", done => {
    twitter.getUserTweets("demoComponent", "risevision", (error, tweets)=>{

      assert(tweets);
      done();
    });
  });
});
