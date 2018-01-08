const logger = require("./logger");
const {client} = require("./twitter-wrapper");
let stream = null;

function closeStream() {
  return stream.destroy();
}

function getTweets(screenName, callback) {
  client.get("statuses/user_timeline", {screen_name: screenName}, (error, tweets) => {
    if (error) {return callback(error);}
    callback(null, tweets);
  });
}

function streamTweets(component, callback) {

  if (component.screen_name) {
    getUserId(component.screen_name)
    .then(userId => {callFilterApi({follow: userId}, callback)})
    .catch(error => {
      logger.error(error.message, `Could not retrieve user ID for ${component.screen_name}`);
      callback(error);
    })
  } else if (component.hashtag) {
    callFilterApi({track: component.hashtag}, callback);
  }
}

function callFilterApi(params, callback) {
  client.stream("statuses/filter", params, (newStream) => {
    stream = newStream;

    stream.on("data", (tweet) => {
      callback(null, tweet);
    });

    stream.on("error", (error) => {
      console.log(error);
      logger.error(error.message, `Could not stream tweets for ${JSON.stringify(params)}`);
      callback(error);
    });
  });
}

function getUserId(screenName) {
  return new Promise((resolve, reject)=>{
    client.get("users/lookup", {screen_name: screenName}, (error, user) => {
      if (error) {console.log(error); reject(error);}
      resolve(user[0].id);
    });
  });
}

module.exports = {
  streamTweets,
  closeStream,
  getTweets
}
