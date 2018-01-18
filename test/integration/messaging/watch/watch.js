/* eslint-env mocha */
/* eslint-disable max-statements, global-require, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const watch = require("../../../../src/messaging/watch/watch");

describe("Watch - Integration", ()=>
{

  beforeEach(()=>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(common, "getClientList").returnWith();
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
          assert.equal(common.getClientList.callCount, 1);
          assert.equal(common.broadcastMessage.callCount, 0);

          // other non-local-storage clients
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics"]
          })
        })
        .then(() =>
        {
          // so WATCH message shouldn't have been sent
          assert.equal(common.broadcastMessage.callCount, 0);

          // now local-storage is present
          return handler({
            topic: "client-list",
            clients: ["logging", "system-metrics", "local-storage"]
          });
        })
        .then(() =>
        {
          // so both WATCH messages should have been sent
          assert.equal(common.broadcastMessage.callCount, 1);

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
        .catch(error =>
        {
          assert.fail(error)

          done()
        });
      }
    }

    simple.mock(common, "receiveMessages").resolveWith(new Receiver());

    // deferred require after mocks are set up
    require("../../../../src/index");
  });

});
