const Twitter = require("twitter");
const config = require("../../src/config/config");
const commonConfig = require("common-display-module");
let client = null;

function createClient() {
  const twitterCredentials = config.getTwitterCredentials();
  const oauthToken = twitterCredentials ? twitterCredentials.oauth_token : "";
  const oauthTokenSecret = twitterCredentials ? twitterCredentials.oauth_token_secret : "";
  const accessTokenKey = process.env.ACCESS_TOKEN_KEY ? process.env.ACCESS_TOKEN_KEY : oauthToken;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : oauthTokenSecret;
  const options = Object.assign({}, config.getAppCredentials(), {"access_token_key": accessTokenKey, "access_token_secret": accessTokenSecret, request_options: {proxy: commonConfig.getProxyUri()}});
  client = new Twitter(options);
}

function getClient() {
  return client;
}

module.exports = {
  getClient,
  createClient
}
