/* eslint-env mocha */
const assert = require("assert");
const simple = require("simple-mock");

const commonMessaging = require("common-display-module/messaging");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");
const messaging = require("../../../src/messaging/messaging");
const status = require("../../../src/messaging/status/status");
const watch = require("../../../src/messaging/watch/watch");

describe("Messaging -> Messaging", () => {
  beforeEach(() => {
    simple.mock(logger, "file").returnWith();
    simple.mock(status, "sendStatusMessage").returnWith();
    simple.mock(watch, "sendWatchMessagesForCredentials").returnWith();
    simple.mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(true);

    simple.mock(commonMessaging, "receiveMessages").resolveWith({
      on: (type, handler) => {
        assert.equal(type, "message");

        handler({topic: 'TWITTER-STATUS-REQUEST'});
      }
    });
  });

  afterEach(() => simple.restore());

  it("should send watch message for credentials again if twitter.json was deleted or not existent", () => {
    simple.mock(config, "getReadyStatus").returnWith(false);

    return messaging.init()
    .then(() => {
      assert(status.sendStatusMessage.called);
      assert(watch.sendWatchMessagesForCredentials.called);
    });
  });

  it("should not send watch message for credentials again if we still don't have status for twitter.json", () => {
    simple.mock(config, "getReadyStatus").returnWith(null);

    return messaging.init()
    .then(() => {
      assert(status.sendStatusMessage.called);
      assert(!watch.sendWatchMessagesForCredentials.called);
    });
  });

  it("should not send watch message for credentials again if twitter.json exists", () => {
    simple.mock(config, "getReadyStatus").returnWith(true);

    return messaging.init()
    .then(() => {
      assert(status.sendStatusMessage.called);
      assert(!watch.sendWatchMessagesForCredentials.called);
    });
  });

});
