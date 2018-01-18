module.exports = {
  validate({component_id, screen_name, hashtag} = {}) {
    if (!component_id || !screen_name || !hashtag) {return false;}
    return true;
  }
};
