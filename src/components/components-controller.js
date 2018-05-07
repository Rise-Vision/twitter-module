const components = require("./components");
const logger = require("../../src/logger");
const twitter = require("../../src/api/twitter");
const broadcastIPC = require("../../src/messaging/broadcast-ipc");

function formatTweets(tweets) {
  return new Promise(res => {
    let formattedTweets = tweets;

    if (!Array.isArray(tweets)) {
      formattedTweets = [];
      formattedTweets.push(tweets);
    }

    res(formattedTweets);
  });
}

function sendUpdateMessage(updateType, tweets, componentId, data) {
  formatTweets(tweets)
  .then((formattedTweets)=>{
    const messageData = Object.assign({}, {"component_id": componentId}, data, {tweets: JSON.stringify(formattedTweets)});
    broadcastIPC.twitterUpdate({"status": updateType, "data": messageData});
  })
  .catch(error =>{
    logger.file(error.message, `Could not format Twitter-Update - ${updateType} message for component ${componentId}`)
  });
}

function updateComponent(componentId, componentData) {
  const data = componentData || components.getComponentDataById(componentId);

  if (!componentId || !data || !Reflect.has(data, "screen_name")) {
    return logger.error(`Invalid params - component not found for ${componentId}`);
  }
  twitter.init();
  if (!twitter.credentialsExist()) {
    return logger.error("Credentials do not exist - can not update components");
  }

  twitter.getUserTweets(componentId, data.screen_name, (error, tweets)=>{
    if (error) {
      logger.file(`Could get tweets for ${JSON.stringify(data)}`);
    } else {
      sendUpdateMessage("Current", tweets, componentId, data);
    }
  });
}

function updateAllComponents() {
  logger.file(`Updating all components - re-fetching tweets and restarting streams`);
  twitter.init();
  if (!twitter.credentialsExist()) {
    return logger.error("Credentials do not exist - can not update components");
  }

  twitter.finishAllRefreshes();

  const componentsList = components.getComponents();

  for (const componentId in componentsList) {
    updateComponent(componentId, componentsList[componentId]);
  }
}

function finishAllRefreshes() {
  twitter.finishAllRefreshes();
}

function clearComponents() {
  twitter.finishAllRefreshes();
  components.clear();
}

module.exports = {
  updateComponent,
  updateAllComponents,
  finishAllRefreshes,
  clearComponents
}
