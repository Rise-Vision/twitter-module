/* eslint-env mocha */
const assert = require("assert");
const entry = require("../../../../src/messaging/update/entry");

describe("Messaging -> Update Component - Unit", ()=> {

  describe("- Validation", ()=> {
    it("should validate correct entry value", ()=> {
      assert.equal(entry.validate(), false);
      assert.equal(entry.validate({component_id: "test component"}), false);
      assert.equal(entry.validate({component_id: "test component", screen_name: "test screen name"}), true);
      assert.equal(entry.validate({component_id: "test component", screen_name: ""}), false);
    });
  });
});
