const Twitter = require('twitter');
const config = require("./config");
const twitterCredentials = config.getTwitterCredentials();
const options = Object.assign({}, config.getAppCredentials(), {"access_token_key": twitterCredentials.oauth_token, "access_token_secret": twitterCredentials.oauth_token_secret});
const client = new Twitter(options);


client.get('statuses/home_timeline', (error, tweets, response) => {
  if (error) {throw error;}
  console.log(tweets);
  // Raw response object.
  console.log(response);
});
