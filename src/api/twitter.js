/* eslint-disable prefer-const */

const twitterWrapper = require("./twitter-wrapper");
const config = require("../../src/config/config");

let client = null;
let refreshTimers = {};

function init() {
  client = twitterWrapper.getClient();
}

function credentialsExist() {
  const credentials = client ? client.options : null;

  if (!credentials || !credentials.consumer_key || !credentials.consumer_secret || !credentials.access_token_key || !credentials.access_token_secret) {return false;}
  return true;
}

function getUserTweets(componentId, screenName, callback) {
  client.get("statuses/user_timeline", {screen_name: screenName, count: 25, tweet_mode: "extended"}, (error, tweets) => {
    if (error) {return callback(error);}
    _startRefresh(componentId, screenName, callback);
    callback(null, tweets);
  });
}

function _startRefresh(componentId, screenName, callback) {
  refreshTimers[componentId] = setTimeout(() => {
    getUserTweets(componentId, screenName, callback);
  }, config.tweetsRefreshTime);
}

function finishAllRefreshes() {
  Object.values(refreshTimers).forEach(timer => clearTimeout(timer));
  refreshTimers = {};
}

function finishRefresh(componentId) {
  Reflect.deleteProperty(refreshTimers, componentId);
}

module.exports = {
  credentialsExist,
  getUserTweets,
  finishAllRefreshes,
  finishRefresh,
  init
}
