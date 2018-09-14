/* eslint-disable max-statements */
const config = require("../../../src/config/config");
const components = require("../../../src/components/components");
const componentsController = require("../../../src/components/components-controller");
const entry = require("./entry");
const logger = require("../../../src/logger");
const watch = require("../watch/watch");

module.exports = {
  process(message) {
    const {component_id, screen_name, hashtag} = message.data;

    try {
      if (!entry.validate({component_id, screen_name})) {
        throw new Error("Invalid TWITTER-WATCH - UPDATE message");
      }
      logger.file(`Received updated version for ${message.data.component_id}`);

      components.addComponent(message.data.component_id, Object.assign({}, {screen_name, hashtag}));
      componentsController.updateComponent(message.data.component_id);

      // The watch was removed because twitter.json was DELETED or NOEXIST;
      // so we create the watch again to see if it's back.
      if (config.getReadyStatus() === false && watch.isWatchMessagesAlreadySentForCredentials()) {
        watch.clearMessagesAlreadySentFlagForCredentials();
        watch.sendWatchMessagesForCredentials();
      }
    } catch (error) {
      logger.file(`TWITTER-WATCH - UPDATE error in ${config.moduleName} module: ${error}`);
    }
  },
  processAll() {
    componentsController.updateAllComponents();
  },
  clear() {
    componentsController.clearComponents();
  }
};
