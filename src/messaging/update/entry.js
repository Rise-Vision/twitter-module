module.exports = {
  validate({component_id, screen_name} = {}) {
    if (!component_id || !screen_name) {return false;}
    return true;
  }
};
