const Twitter = require("twitter");
const config = require("./config/config");
const twitterCredentials = config.getTwitterCredentials();
const accessTokenKey = process.env.ACCESS_TOKEN_KEY ? process.env.ACCESS_TOKEN_KEY : twitterCredentials.oauth_token;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : twitterCredentials.accessTokenSecret;
const options = Object.assign({}, config.getAppCredentials(), {"access_token_key": accessTokenKey, "access_token_secret": accessTokenSecret});
const client = new Twitter(options);

module.exports = {
  client
}
