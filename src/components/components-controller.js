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

  if (!componentId || !data || !Reflect.has(data, "screen_name")) {return logger.file(`Invalid params - component not found for ${componentId}`);}

  if (!twitter.credentialsExist()) {return logger.file("Credentials do not exist - can not update components");}

  twitter.getTweets(data.screen_name, (error, tweets)=>{
    if (error) {
      logger.file(`Could get tweets for ${JSON.stringify(data)}`);
    } else {
      sendUpdateMessage("Current", tweets, componentId, data);
    }
  });

  twitter.streamTweets(componentId, data, (error, tweets)=>{
    if (error) {
      logger.file(`Could not stream tweets for ${JSON.stringify(data)}`);
    } else {
      sendUpdateMessage("Stream", tweets, componentId, data);
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

function closeAllStreams() {
  twitter.closeAllStreams();
}

function clearComponents() {
  twitter.closeAllStreams();
  components.clear();
}

module.exports = {
  updateComponent,
  updateAllComponents,
  closeAllStreams,
  clearComponents
}
