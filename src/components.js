let components = {};

function getComponents() {
  return components;
}

function getComponentById(componentId) {
  if (Reflect.has(components, componentId)) {
    return components[componentId];
  }
  return null;
}

function addComponent(componentId, componentData) {
  components[componentId] = componentData;
}

function removeComponent(componentId) {
  Reflect.deleteProperty(components, componentId);
}

function clear() {
  components = {};
}

module.exports = {
  getComponents,
  getComponentById,
  addComponent,
  removeComponent,
  clear
}
