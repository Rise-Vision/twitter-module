/* eslint-env mocha */
const assert = require("assert");
const simple = require("simple-mock");

const components = require("../../../../src/components/components");
const componentsController = require("../../../../src/components/components-controller");
const config = require("../../../../src/config/config");
const logger = require("../../../../src/logger");
const update = require("../../../../src/messaging/update/update");
const watch = require("../../../../src/messaging/watch/watch");

describe("Messaging -> Update Component - Unit", () => {
  beforeEach(()=>{
    simple.mock(logger, "file").returnWith();
    simple.mock(components, "addComponent").returnWith();
    simple.mock(componentsController, "updateComponent").returnWith();
    simple.mock(watch, "sendWatchMessagesForCredentials").returnWith();
    simple.mock(watch, "isWatchMessagesAlreadySentForCredentials").returnWith(true);
  });

  afterEach(() => simple.restore());

  it("should send watch message for credentials again if twitter.json was deleted or not existent", () => {
    simple.mock(config, "getReadyStatus").returnWith(false);

    update.process({data: {"component_id": "x", "screen_name": "y"}});

    assert(watch.sendWatchMessagesForCredentials.called);
  });

  it("should not send watch message for credentials again if we still don't have status for twitter.json", () => {
    simple.mock(config, "getReadyStatus").returnWith(null);

    update.process({data: {"component_id": "x", "screen_name": "y"}});

    assert(!watch.sendWatchMessagesForCredentials.called);
  });

  it("should not send watch message for credentials again if twitter.json exists", () => {
    simple.mock(config, "getReadyStatus").returnWith(true);

    update.process({data: {"component_id": "x", "screen_name": "y"}});

    assert(!watch.sendWatchMessagesForCredentials.called);
  });
});
