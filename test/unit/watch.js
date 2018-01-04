/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const logger = require("../../src/logger");
const common = require("common-display-module");
const simple = require("simple-mock");
const platform = require("rise-common-electron").platform;

const config = require("../../src/config");
const watch = require("../../src/watch");

describe("Watch - Unit", ()=> {

  beforeEach(()=> {
    const settings = {displayid: "DIS123"};

    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(logger, "error").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlagForContent();
    watch.clearMessagesAlreadySentFlagForCredentials();
    simple.restore()
  });

  it("should not send WATCH messages if no module is available", done => {
    watch.checkIfLocalStorageIsAvailable({clients: []})
    .then(() => {
      // no clients, so WATCH messages shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should not send WATCH messages if local-storage module is not available", done => {
    watch.checkIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics"]
    })
    .then(() => {
      // so WATCH messages shouldn't have been sent
      assert(!common.broadcastMessage.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should send WATCH messages if local-storage module is available", done => {
    watch.checkIfLocalStorageIsAvailable({
      clients: ["logging", "system-metrics", "local-storage"]
    })
    .then(() => {
      // so WATCH messages should have been sent for content.json file
      assert(common.broadcastMessage.called);
      assert.equal(1, common.broadcastMessage.callCount);

      {
        // this is the request for content.json
        const event = common.broadcastMessage.calls[0].args[0];

        assert(event);
        // check we sent it
        assert.equal(event.from, "twitter");
        // check it's a WATCH event
        assert.equal(event.topic, "watch");
        // check the URL of the file.
        assert.equal(event.filePath, "risevision-display-notifications/DIS123/content.json");
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

  it("should receive content file", done =>{
    const mockScheduleText = '{"content": {"schedule": {"companyId": "companyXXXXXX"}}}';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert.equal(config.getCompanyId(), "companyXXXXXX");

      assert(common.broadcastMessage.called);
      assert.equal(1, common.broadcastMessage.callCount);

      // this is the request for content.json
      const event = common.broadcastMessage.calls[0].args[0];

      assert(event);
      // check we sent it
      assert.equal(event.from, "twitter");
      // check it's a WATCH event
      assert.equal(event.topic, "watch");
      // check the URL of the file.
      assert.equal(event.filePath, "risevision-company-notifications/companyXXXXXX/credentials/twitter.json");

      done();
    });
  });

  it("should catch invalid company id", ()=>{
    const mockScheduleText = '{"content": {"schedule": {}}}';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert(logger.error.lastCall.args[0].includes("Invalid CompanyId"));
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });

  it("should catch invalid content file", ()=>{
    const mockScheduleText = '{"content": invalid}';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });

  it("should catch invalid content file", ()=>{
    const mockScheduleText = '{{';
    simple.mock(platform, "readTextFile").resolveWith(mockScheduleText);

    return watch.receiveContentFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx"
    })
    .then(() => {
      assert(logger.error.lastCall.args[1].startsWith("Could not parse"));
    });
  });
});