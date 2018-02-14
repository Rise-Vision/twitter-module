const Twitter = require("twitter");
const config = require("../../src/config/config");
const accessTokenKey = process.env.ACCESS_TOKEN_KEY ? process.env.ACCESS_TOKEN_KEY : "?";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : "?";
const options = Object.assign({}, config.getAppCredentials(), {"access_token_key": accessTokenKey, "access_token_secret": accessTokenSecret});
const client = new Twitter(options);

module.exports = {
  client
}
