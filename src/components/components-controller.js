const components = require("./components");
const logger = require("../../src/logger");
const twitter = require("../../src/api/twitter");
const broadcastIPC = require("../../src/messaging/broadcast-ipc");

function updateComponent(componentId, componentData) {
  const data = componentData || components.getComponentDataById(componentId);

  if (!componentId || !data || !Reflect.has(data, "screen_name")) {return logger.file(`Invalid params - component not found for ${componentId}`);}

  if (!twitter.credentialsExist()) {return logger.file("Credentials do not exist - can not update components");}

  twitter.getTweets(data.screen_name, (error, tweets)=>{
    if (error) {
      logger.file(`Could get tweets for ${JSON.stringify(data)}`);
    } else {
      const messageData = Object.assign({}, {"component_id": componentId}, data, {tweets: JSON.stringify(tweets)});
      broadcastIPC.twitterUpdate({"status": "Current", "data": messageData});
    }
  });

  twitter.streamTweets(componentId, data, (error, tweet)=>{
    if (error) {
      logger.file(`Could not stream tweets for ${JSON.stringify(data)}`);
    } else {
      const messageData = Object.assign({}, {"component_id": componentId}, data, {tweets: JSON.stringify(tweet)});
      broadcastIPC.twitterUpdate({"status": "Stream", "data": messageData});
    }
  });
}

function updateAllComponents() {
  logger.file(`Updating all components - re-fetching tweets and restarting streams`);

  if (!twitter.credentialsExist()) {return logger.file("Credentials do not exist - can not update components");}

  twitter.closeAllStreams();

  const componentsList = components.getComponents();

  for (const componentId in componentsList) {
    updateComponent(componentId, componentsList[componentId]);
  }
}

function clearComponents() {
  twitter.closeAllStreams();
  components.clear();
}

module.exports = {
  updateComponent,
  updateAllComponents,
  clearComponents
}
