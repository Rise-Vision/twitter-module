/* eslint-env mocha */
const assert = require("assert");
const simple = require("simple-mock");
const components = require("../../src/components");

describe("Components - Unit", ()=>
{
  afterEach(()=> {
    simple.restore()
  });

  after(() => {
    components.clear();
  });

  it("should add component to components", done =>
  {
    const testComponentId = "test_component_id";
    const testComponentData = {screen_name: "test_screen_name", hashtag: "test"}
    components.addComponent(testComponentId, testComponentData);
    assert.equal(JSON.stringify(components.getComponentById(testComponentId)), JSON.stringify(testComponentData));
    done();
  });

  it("should remove component from components", done =>
  {
    const testComponentId = "test_component_id";
    components.removeComponent(testComponentId);
    assert.equal(components.getComponentById(testComponentId), null);
    done();
  });

});
