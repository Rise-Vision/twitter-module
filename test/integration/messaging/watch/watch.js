/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
const assert = require("assert");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");

const watch = require("../../../../src/messaging/watch/watch");

describe("Watch - Integration", ()=>
{

  beforeEach(()=>
  {
    simple.mock(commonMessaging, "broadcastMessage").returnWith();
    simple.mock(commonMessaging, "getClientList").returnWith();
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlagForCredentials();

    simple.restore()
  });

  it("should wait for display data message to send Twitter WATCH message", done =>
  {
    function Receiver() {
      this.on = (type, handler) =>
      {
        handler({topic: "display-data-update", displayData: {companyId: "123456-COMPANY"}})
        .then(() =>
        {
          // so both WATCH messages should have been sent
          assert.equal(commonMessaging.broadcastMessage.callCount, 1);

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
        .catch(error =>
        {
          assert.fail(error)

          done()
        });
      }
    }

    simple.mock(commonMessaging, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    require("../../../../src/index");
  });

});
