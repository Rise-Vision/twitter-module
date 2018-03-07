/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const commonMessaging = require("common-display-module/messaging");
const simple = require("simple-mock");

const watch = require("../../../../src/messaging/watch/watch");

describe("Watch - Integration", ()=>
{

  beforeEach(()=>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(commonMessaging, "broadcastMessage").returnWith();
    simple.mock(commonMessaging, "getClientList").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
  });

  afterEach(()=> {
    watch.clearMessagesAlreadySentFlagForContent();
    watch.clearMessagesAlreadySentFlagForCredentials();

    simple.restore()
  });

  it("should wait for local-storage to be available to send WATCH messages", done =>
  {
    function Receiver() {
      this.on = (type, handler) =>
      {
        handler({topic: "client-list", clients: []})
        .then(() =>
        {
          // no clients, getClientList() should have been called, but no WATCH
          assert.equal(commonMessaging.getClientList.callCount, 1);
          assert.equal(commonMessaging.broadcastMessage.callCount, 1);

          // other non-local-storage clients
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics"]
          })
        })
        .then(() =>
        {
          // so WATCH message shouldn't have been sent
          assert.equal(commonMessaging.broadcastMessage.callCount, 1);

          // now local-storage is present
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics", "local-storage"]
          });
        })
        .then(() =>
        {
          // so both WATCH messages should have been sent
          assert.equal(commonMessaging.broadcastMessage.callCount, 4);

          {
            // this is the request for content.json
            const event = commonMessaging.broadcastMessage.calls[1].args[0];

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
