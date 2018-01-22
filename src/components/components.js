let components = {};

function getComponents() {
  return components;
}

function getComponentDataById(componentId) {
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
  getComponentDataById,
  addComponent,
  removeComponent,
  clear
}
