'use strict';

require('dotenv').config();
let https = require ('https');

let accessKey = process.env.AZURE_ACCESS_KEY;

let endpoints = {
  KEY_PHRASES : 'keyPhrases',
  SENTIMENT   : 'sentiment'
}

let getRequestParams = function(endpoint){
  return {
    'method' : 'POST',
    'hostname' : 'westcentralus.api.cognitive.microsoft.com',
    'path' : '/text/analytics/v2.0/' + endpoint,
    'headers' : {
      'Ocp-Apim-Subscription-Key' : accessKey,
    }
  }
};

let parseSentimentData = function(body, listTweets, callback){
  var idx = 0, sum = 0;
  var bestTweet = { id : 0, score : 0 };
  var worstTweet = { id : 0, score : 1.1 };
  body.documents.forEach(function(sentiment){
    sum += parseFloat(sentiment.score);
    idx++;
    if (sentiment.score > bestTweet.score){
      bestTweet.score = sentiment.score;
      bestTweet.id = sentiment.id;
    }
    if (sentiment.score < worstTweet.score){
      worstTweet.score = sentiment.score;
      worstTweet.id = sentiment.id;
    }
  });
  var ret = {
    averageScore : sum/idx,
    bestTweet  : listTweets.documents[parseInt(bestTweet.id)].text,
    worstTweet : listTweets.documents[parseInt(worstTweet.id)].text
  };
  callback.send(ret);
}

let getSentimentsFromTwitterData = function(twitterData, callback){
  if (twitterData.statuses !== null && twitterData.statuses !== undefined){
    twitterData = twitterData.statuses;
  }
  
  let listTweets = {'documents' : []};
  twitterData.forEach(function(tweet, index){
    listTweets.documents.push({
      'id' : index,
      'text': tweet.text,
      'language' : tweet.lang
    });
  });

  let body = '';
	let req = https.request (getRequestParams(endpoints.SENTIMENT), (res) => {
    res.on ('data', function (d) {
      body += d;
    });
    res.on ('end', function () {
      parseSentimentData(JSON.parse(body), listTweets, callback);
    });
  });
	req.write(JSON.stringify(listTweets));
  req.end(); 
}

module.exports.getSentimentsFromTwitterData = getSentimentsFromTwitterData;