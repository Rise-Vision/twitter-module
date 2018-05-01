/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const logger = require("../../../../src/logger");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");
const platform = require("rise-common-electron").platform;

const config = require("../../../../src/config/config");
const watch = require("../../../../src/messaging/watch/watch");

describe("Messaging -> Watch - Unit", ()=> {

  beforeEach(()=> {
    simple.mock(commonMessaging, "broadcastMessage").returnWith();
    simple.mock(logger, "file").returnWith();
    simple.mock(logger, "error").returnWith();
    simple.mock(config, "getCompanyId").returnWith("123456-COMPANY");
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlagForCredentials();
    simple.restore()
  });

  it("should send WATCH messages", done => {
    watch.sendWatchMessagesForCredentials()
    .then(() => {
      // so WATCH messages should have been sent for content.json file
      assert(commonMessaging.broadcastMessage.called);
      assert.equal(1, commonMessaging.broadcastMessage.callCount);

      {
        // this is the request for content.json
        const event = commonMessaging.broadcastMessage.calls[0].args[0];

        assert(event);
        // check we sent it
        assert.equal(event.from, "twitter");
        // check it's a WATCH event
        assert.equal(event.topic, "watch");
        // check the URL of the file.
        assert.equal(event.filePath, "risevision-company-notifications/123456-COMPANY/credentials/twitter.json");
      }

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should receive credentials file", done => {
    simple.mock(platform, "readTextFile").resolveWith('{"oauth_token":"dsadsa","oauth_token_secret":"dashdsa"}');

    watch.receiveCredentialsFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx/twitter.json"
    })
    .then(() => {
      const credentials = config.getTwitterCredentials();

      assert(credentials);
      assert.equal(credentials.oauth_token, "dsadsa");
      assert.equal(credentials.oauth_token_secret, "dashdsa");

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should catch invalid credentials", ()=>{
    simple.mock(platform, "readTextFile").resolveWith('{}');

    watch.receiveCredentialsFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx/twitter.json"
    })
    .then(() => {
      assert(logger.error.lastCall.args[0].includes("Invalid Credentials"));
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });

  it("should clear credentials if local file is not current", done => {
    watch.receiveCredentialsFile({
      topic: "file-update",
      status: "DELETED",
      ospath: "xxxxxxx/twitter.json"
    })
    .then(() => {
      assert(!config.getTwitterCredentials());

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });
});
