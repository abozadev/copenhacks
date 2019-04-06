var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var getSearch = function(params) {
  client.get('search/tweets', params, function(error, tweets, response) {
   console.log(tweets);
  });
}

var params = {screen_name: 'nodejs'};

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
