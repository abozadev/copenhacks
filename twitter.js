var Twitter = require('twitter');
const dotenv = require('dotenv');
var textAnalytics = require('./text-analytics')
dotenv.config();

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var getSearch = function(params, callback)
{
  client.get('search/tweets', params, function(error, tweets, response) {
    if (!error) {
      textAnalytics.getSentimentsFromTwitterData(tweets, callback);
    }
  });
}

var getUserTweets = function(params, callback)
{
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      textAnalytics.getSentimentsFromTwitterData(tweets, callback);
    }
  });
}

module.exports.getSearch = getSearch;
module.exports.getUserTweets = getUserTweets;
