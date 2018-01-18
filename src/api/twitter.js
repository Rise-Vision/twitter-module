/* eslint-disable prefer-const */

const logger = require("../../src/logger");
const {client} = require("./twitter-wrapper");

let streams = {};

function credentialsExist() {
  const credentials = client.options;

  if (!credentials || !credentials.consumer_key || !credentials.consumer_secret || !credentials.access_token_key || !credentials.access_token_secret) {return false;}
  return true;
}

function addStream(componentId, stream) {
    streams[componentId] = stream;
}

function closeStream(componentId) {
  let stream = streams[componentId];

  if (streams && componentId && stream && Reflect.has(stream, "destroy")) {
    stream.destroy();
    Reflect.deleteProperty(streams, componentId);
  }
}

function closeAllStreams() {
  for (const componentId in streams) {
    closeStream(componentId);
  }
}

function getTweets(screenName, callback) {
  client.get("statuses/user_timeline", {screen_name: screenName, count: 25}, (error, tweets) => {
    if (error) {return callback(error);}
    callback(null, tweets);
  });
}

function streamTweets(componentId, componentData, callback) {
  if (componentData.screen_name) {
    getUserId(componentData.screen_name)
    .then(userId => {callFilterApi(componentId, {follow: userId}, callback)})
    .catch(error => {
      logger.error(error.message, `Could not retrieve user ID for ${componentData.screen_name}`);
      callback(error);
    })
  } else if (componentData.hashtag) {
    callFilterApi(componentId, {track: componentData.hashtag}, callback);
  }
}

function callFilterApi(componentId, params, callback) {
  client.stream("statuses/filter", params, (stream) => {
    addStream(componentId, stream);

    stream.on("data", (tweet) => {
      callback(null, tweet);
    });

    stream.on("error", (error) => {
      logger.error(error.message, `Could not stream tweets for ${JSON.stringify(params)}`);
      callback(error);
    });
  });
}

function getUserId(screenName) {
  return new Promise((resolve, reject)=>{
    client.get("users/lookup", {screen_name: screenName}, (error, user) => {
      if (error) {reject(error);}
      resolve(user[0].id);
    });
  });
}

module.exports = {
  credentialsExist,
  streamTweets,
  getTweets,
  closeAllStreams,
  closeStream
}
