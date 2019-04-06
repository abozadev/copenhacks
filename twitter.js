var Twitter = require('twitter');

const dotenv = require('dotenv');

dotenv.config();

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var getSearch = function(callback, params)
{
  client.get('search/tweets', params, function(error, tweets, response) {
   callback(tweets);
  });
}

var getUserTweets = function(params)
{
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets);
    }
  });
}

module.exports.getSearch = getSearch;
module.exports.getUserTweets = getUserTweets;
