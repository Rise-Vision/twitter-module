/* eslint-disable prefer-const, no-magic-numbers, max-statements, no-extra-parens */

const twitterWrapper = require("./twitter-wrapper");
const config = require("../../src/config/config");
const logger = require("../../src/logger");

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
  client.get("statuses/user_timeline", {screen_name: screenName, count: 50, tweet_mode: "extended"}, (error, tweets) => {
    if (error) {return callback(error);}
    _startRefresh(componentId, screenName, callback);

    const filteredTweets = _filterTweets(tweets);
    callback(null, filteredTweets);
  });
}

function _filterTweets(tweets) {
  let numberOfTweets = 0;
  const filteredTweets = [];

  for (const tweetPosition in tweets) {
    try {
      // get number of links in tweet
      const tweet = tweets[tweetPosition];
      const numberOfLinksInTweet = (tweet.entities && tweet.entities.urls ? tweet.entities.urls.length : 0) + ((tweet.extended_entities && tweet.extended_entities.media) ? 1 : 0);
      const numberOfWordsInTweet = tweet.text ? tweet.text.split(" ").length : tweet.full_text.split(" ").length;

      if ((tweet.text || tweet.full_text) && numberOfLinksInTweet !== numberOfWordsInTweet) {
        filteredTweets[numberOfTweets] = tweet;
        numberOfTweets += 1;
      }
    } catch (error) {
      logger.error(error.stack, "Error while filtering tweets");
      continue;
    }

    if (numberOfTweets >= 25) {
      return filteredTweets;
    }
  }

  return filteredTweets;
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
