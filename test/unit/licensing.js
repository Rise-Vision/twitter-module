/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");
const mock = simple.mock;

const licensingCommon = require("common-display-module/licensing");
const config = require("../../src/config/config");
const licensing = require("../../src/licensing");
const logger = require("../../src/logger");
const componentsController = require("../../src/components/components-controller");
const commonMessaging = require("common-display-module/messaging");
const utils = require("../../src/utils");

let expectedAuthorizedMessage = null;
let expectedUnauthorizedMessage = null;
describe("Licensing - Unit", ()=> {

  beforeEach(() => {
    mock(logger, "all").returnWith();
    mock(componentsController, "updateAllComponents").returnWith();
    mock(componentsController, "finishAllRefreshes").returnWith();
    mock(commonMessaging, "broadcastMessage").returnWith();
    mock(licensingCommon, "requestLicensingData").resolveWith();
    mock(utils, "retryAfterStartup").returnWith();
    expectedAuthorizedMessage = {from: 'twitter',
      topic: 'licensing-update',
      through: 'ws',
      data: {'is_authorized': true, 'user_friendly_status': 'authorized'}
    };

    expectedUnauthorizedMessage = {from: 'twitter',
      topic: 'licensing-update',
      through: 'ws',
      data: {'is_authorized': false, 'user_friendly_status': 'unauthorized'}
    };
  });

  afterEach(()=> {
    simple.restore();
    config.setAuthorized(null);
    licensing.clearInitialRequestSent();
  });


  it("should not send LICENSING-REQUEST message if no module is available", done => {
    licensing.checkIfLicensingIsAvailable({clients: []})
    .then(() => {
      // no clients, so requestLicensingData shouldn't have been sent
      assert(!licensingCommon.requestLicensingData.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });

  it("should not send LICENSING-REQUEST message if licensing modules is not available", done => {
    licensing.checkIfLicensingIsAvailable({
      clients: ["logging", "system-metrics"]
    })
    .then(() => {
      // no clients, so requestLicensingData shouldn't have been sent
      assert(!licensingCommon.requestLicensingData.called);

      done();
    })
    .catch(error => {
      assert.fail(error)

      done()
    });
  });


  it("should send LICENSING-REQUEST message if licensing module is available", done => {
    licensing.checkIfLicensingIsAvailable({
      clients: ["logging", "system-metrics", "licensing"]
    })
    .then(() => {
      // so requestLicensingData should have been called twice because the second time is called with the retry
      assert(licensingCommon.requestLicensingData.called);
      assert.equal(2, licensingCommon.requestLicensingData.callCount);

      done();
    })
    .catch(error => {
      assert.fail(error);
      done();
    });
  });

  it("should call retryAfterStartup after calling for licensing and display info data", done => {
    mock(licensing, "requestLicensingData").resolveWith();
    mock(licensing, "requestDisplayData").resolveWith();

    licensing.checkIfLicensingIsAvailable({
      clients: ["logging", "system-metrics", "licensing"]
    })
    .then(() => {
      const tenMinutesInMilliseconds = 10 * 60 * 1000;
      assert.equal(2, utils.retryAfterStartup.callCount);
      assert.equal(tenMinutesInMilliseconds, utils.retryAfterStartup.calls[0].args[1]);
      assert.equal(tenMinutesInMilliseconds, utils.retryAfterStartup.calls[1].args[1]);
      done();
    })
    .catch(error => {
      assert.fail(error);
      done();
    });
  });

  it("should be authorized if Rise Player Professional is active", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        c4b368be86245bf9501baaa6e0b00df9719869fd: {
          active: true, timestamp: 100
        },
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(config.isAuthorized());
    assert(componentsController.updateAllComponents.called);

    assert.equal(JSON.stringify(commonMessaging.broadcastMessage.lastCall.args[0]), JSON.stringify(expectedAuthorizedMessage));

    assert(logger.all.called);
    assert.equal(logger.all.lastCall.args[0], "authorized");
  });

  it("should not be authorized if Rise Player Professional is not active", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        c4b368be86245bf9501baaa6e0b00df9719869fd: {
          active: false, timestamp: 100
        },
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(!config.isAuthorized());

    assert(componentsController.finishAllRefreshes.called);

    assert.equal(JSON.stringify(commonMessaging.broadcastMessage.lastCall.args[0]), JSON.stringify(expectedUnauthorizedMessage));

    assert(logger.all.called);
    assert.equal(logger.all.lastCall.args[0], "unauthorized");
  });

  it("should not be authorized if Rise Player Professional is not present", () => {
    const message = {
      from: 'licensing',
      topic: 'licensing-update',
      subscriptions: {
        b0cba08a4baa0c62b8cdc621b6f6a124f89a03db: {
          active: true, timestamp: 100
        }
      }
    };

    licensing.updateLicensingData(message);

    assert(!config.isAuthorized());

    assert(logger.all.called);
  });

  it("should log only if there are update changes", () => {
    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: false, timestamp: 100
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(!config.isAuthorized());

      assert.equal(componentsController.updateAllComponents.callCount, 0);
      assert.equal(componentsController.finishAllRefreshes.callCount, 1);

      assert.equal(commonMessaging.broadcastMessage.callCount, 1);
      assert.equal(JSON.stringify(commonMessaging.broadcastMessage.lastCall.args[0]), JSON.stringify(expectedUnauthorizedMessage));

      assert(logger.all.called);
      assert.equal(logger.all.callCount, 2);
      assert.equal(logger.all.lastCall.args[0], "unauthorized");
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: false, timestamp: 200
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(!config.isAuthorized());

      // should not be handled again if same authorization
      // assert.equal(componentsController.updateAllComponents.callCount, 0);
      assert.equal(componentsController.finishAllRefreshes.callCount, 1);

      assert.equal(commonMessaging.broadcastMessage.callCount, 1);

      assert.equal(logger.all.callCount, 3);
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: true, timestamp: 300
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(config.isAuthorized());

      assert.equal(componentsController.updateAllComponents.callCount, 1);
      assert.equal(componentsController.finishAllRefreshes.callCount, 1);

      assert.equal(commonMessaging.broadcastMessage.callCount, 2);
      assert.equal(JSON.stringify(commonMessaging.broadcastMessage.lastCall.args[0]), JSON.stringify(expectedAuthorizedMessage));

      assert.equal(logger.all.callCount, 5);
      assert.equal(logger.all.lastCall.args[0], "authorized");
    }

    {
      const message = {
        from: 'licensing',
        topic: 'licensing-update',
        subscriptions: {
          c4b368be86245bf9501baaa6e0b00df9719869fd: {
            active: true, timestamp: 400
          }
        }
      };

      licensing.updateLicensingData(message);

      assert(config.isAuthorized());

      // should not be handled again if same authorization
      assert.equal(componentsController.updateAllComponents.callCount, 1);
      assert.equal(componentsController.finishAllRefreshes.callCount, 1);

      assert.equal(commonMessaging.broadcastMessage.callCount, 2);

      assert.equal(logger.all.callCount, 6);
    }
  });
});
