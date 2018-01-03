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
      // so WATCH messages should have been sent for both screen-control.txt and content.json files
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
    simple.mock(platform, "readTextFile").resolveWith('{"accessToken":"dsadsa","refreshToken":"dashdsa"}');

    watch.receiveCredentialsFile({
      topic: "file-update",
      status: "CURRENT",
      ospath: "xxxxxxx/twitter.txt"
    })
    .then(() => {
      const credentials = config.getTwitterCredentials();

      assert(credentials);
      assert.equal(credentials.accessToken, "dsadsa");
      assert.equal(credentials.refreshToken, "dashdsa");

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should clear credentials if local file is not current", done => {
    watch.receiveCredentialsFile({
      topic: "file-update",
      status: "DELETED",
      ospath: "xxxxxxx/twitter.txt"
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
      assert.equal(event.filePath, "risevision-company-notifications/companyXXXXXX/credentials/twitter.txt");

      done();
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
