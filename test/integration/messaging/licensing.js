/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const licensingCommon = require("common-display-module/licensing");
const commonMessaging = require("common-display-module/messaging");
const watch = require("../../../src/messaging/watch/watch");

const messaging = require("../../../src/messaging/messaging");

describe("Licensing - Integration", ()=>
{

  beforeEach(()=>
  {
    simple.mock(licensingCommon, "requestLicensingData").resolveWith();
    simple.mock(watch, "checkIfLocalStorageIsAvailable").resolveWith();

  });

  after(()=> {
    simple.restore()
  });

  it("should wait for licensing to be available to send LICENSING-REQUEST message", done =>
  {
    function Receiver() {
      this.on = (type, handler) =>
      {
        handler({topic: "client-list", clients: []})
        .then(() =>
        {
          assert.equal(licensingCommon.requestLicensingData.callCount, 0);

          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics"]
          })
        })
        .then(() =>
        {
          assert.equal(licensingCommon.requestLicensingData.callCount, 0);

          // now local-storage is present
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics", "licensing"]
          });
        })
        .then(() =>
        {
          assert.equal(licensingCommon.requestLicensingData.callCount, 1);

          done();
        })
        .catch(error =>
        {
          assert.fail(error)

          done()
        });
      }
    }

    simple.mock(commonMessaging, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    messaging.init();
  });

});
