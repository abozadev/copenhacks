'use strict';

require('dotenv').config();
let https = require ('https');

let accessKey = process.env.AZURE_ACCESS_KEY;

let endpoints = {
  KEY_PHRASES : 'keyPhrases',
  LANGUAGE    : 'languages',
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



/* let TEST_DATA = { 'documents': [
	{ 'id': '1', 'language': 'en', 'text': 'Fornite is like drugs.' },
	{ 'id': '2', 'language': 'en', 'text': 'I love the dark.' },
	{ 'id': '3', 'language': 'en', 'text': 'The Grand Hotel is a new hotel in the center of Seattle. It earned 5 stars in my review, and has the classiest decor I\'ve ever seen.' }
]};

getSentiments(TEST_DATA);
getKeyPhrases(TEST_DATA);
getLanguage(TEST_DATA);
*/

let callbackGetStatsFromTwitterData = function(body, listTweetsForGetSentiment){
  body = JSON.parse (body);
  body.documents.forEach(function(ret){
    listTweetsForGetSentiment.documents[ret.id].language = ret.detectedLanguages[0].iso6391Name;
  })
  return listTweetsForGetSentiment;
}

let getLangsFromTwitterData = function(twitterData, callback){
  let listTweetsForGetLang = {'documents' : []};
  twitterData.statuses.forEach(function(tweet, index){
    listTweetsForGetLang.documents.push({
      'id' : index,
      'text': tweet.text
    });
  });

  let body = '';
	let req = https.request (getRequestParams(endpoints.LANGUAGE), (res) => {
    res.on ('data', function (d) {
      body += d;
    });
    res.on ('end', function () {
      callback.send(callbackGetStatsFromTwitterData(JSON.parse(body), listTweetsForGetLang));
      
    });
  });
	req.write(JSON.stringify(listTweetsForGetLang));
  req.end(); 
}

let parseSentimentData = function(body, listTweets, callback){
  var idx = 0, sum = 0;

  var bestTweet = {
    id : 0,
    score : 0
  }

  var worstTweet = {
    id : 0, 
    score : 1.1
  }
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
  })


  var ret = {
    averageScore : sum/idx,
    bestTweet  : listTweets.documents[parseInt(bestTweet.id)].text,
    worstTweet : listTweets.documents[parseInt(worstTweet.id)].text
  }
  console.log(ret); 
  //callback.send({ averageSentiments : sum/idx });
}

let getSentimentsFromTwitterData = function(twitterData, callback){
  let listTweets = {'documents' : []};
  twitterData.statuses.forEach(function(tweet, index){
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




let TWITTER_DATA = {
  "statuses": [
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533469269266432,
          "id_str": "1114533469269266432",
          "text": "RT @QMTB9: DEVIALET250 新オーナーさん緩募\n3台あるうちの1台を放出\n\nホワイト(D-PremierからのV-UP品)\n付属品写真の通り(一通り有り)\nファームウェア10.1.0(無印の最新版)\n後部カバー取付部にキズあり、他若干使用感\n当時定価218万(…",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "QMTB9",
                      "name": "MTB",
                      "id": 787256076743774208,
                      "id_str": "787256076743774208",
                      "indices": [
                          3,
                          9
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "ja",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 1105632187,
              "id_str": "1105632187",
              "name": "NASA@シロ組",
              "screen_name": "username_NASA",
              "location": "神奈川県 横浜市",
              "description": "Twitterオーディオ筋トレ部．　　　　　据え置きもポタオデもやりますん．　　「いいね」は記録用．　　　　　　　　　　　　　　　　　　　　　　　　　　Vtuberいいよね！",
              "url": "https://t.co/Af3TF5rkgF",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "https://t.co/Af3TF5rkgF",
                              "expanded_url": "http://twpf.jp/username_NASA",
                              "display_url": "twpf.jp/username_NASA",
                              "indices": [
                                  0,
                                  23
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 430,
              "friends_count": 440,
              "listed_count": 13,
              "created_at": "Sun Jan 20 07:28:24 +0000 2013",
              "favourites_count": 787,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 10950,
              "lang": "ja",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "BF0413",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/857575497181442048/W9snkz4L_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/857575497181442048/W9snkz4L_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/1105632187/1458125048",
              "profile_link_color": "BD0009",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": false,
              "has_extended_profile": false,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Sat Apr 06 13:31:19 +0000 2019",
              "id": 1114520966019731456,
              "id_str": "1114520966019731456",
              "text": "DEVIALET250 新オーナーさん緩募\n3台あるうちの1台を放出\n\nホワイト(D-PremierからのV-UP品)\n付属品写真の通り(一通り有り)\nファームウェア10.1.0(無印の最新版)\n後部カバー取付部にキズあり、他若干… https://t.co/rjL3OTdDle",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/rjL3OTdDle",
                          "expanded_url": "https://twitter.com/i/web/status/1114520966019731456",
                          "display_url": "twitter.com/i/web/status/1…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "ja",
                  "result_type": "recent"
              },
              "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 787256076743774208,
                  "id_str": "787256076743774208",
                  "name": "MTB",
                  "screen_name": "QMTB9",
                  "location": "ベージュ色の世界",
                  "description": "最近だらしねぇ(ヽ´ω`)",
                  "url": null,
                  "entities": {
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 84,
                  "friends_count": 64,
                  "listed_count": 3,
                  "created_at": "Sat Oct 15 11:37:30 +0000 2016",
                  "favourites_count": 50,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": false,
                  "verified": false,
                  "statuses_count": 9944,
                  "lang": "ja",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "F5F8FA",
                  "profile_background_image_url": null,
                  "profile_background_image_url_https": null,
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/833271997199060993/Q54k4GEx_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/833271997199060993/Q54k4GEx_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/787256076743774208/1527689591",
                  "profile_link_color": "1DA1F2",
                  "profile_sidebar_border_color": "C0DEED",
                  "profile_sidebar_fill_color": "DDEEF6",
                  "profile_text_color": "333333",
                  "profile_use_background_image": true,
                  "has_extended_profile": false,
                  "default_profile": true,
                  "default_profile_image": false,
                  "following": false,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 5,
              "favorite_count": 6,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "ja"
          },
          "is_quote_status": false,
          "retweet_count": 5,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "ja"
      },
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533469223378946,
          "id_str": "1114533469223378946",
          "text": "RT @NASA: This week:\n🚀A Russian cargo ship lifted off w/ 3 tons of food &amp; supplies for the @Space_Station\n👩\u200d🚀@AstroAnnimal &amp; @Astro_DavidS…",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "NASA",
                      "name": "NASA",
                      "id": 11348282,
                      "id_str": "11348282",
                      "indices": [
                          3,
                          8
                      ]
                  },
                  {
                      "screen_name": "Space_Station",
                      "name": "Intl. Space Station",
                      "id": 1451773004,
                      "id_str": "1451773004",
                      "indices": [
                          95,
                          109
                      ]
                  },
                  {
                      "screen_name": "AstroAnnimal",
                      "name": "Anne McClain",
                      "id": 1533844754,
                      "id_str": "1533844754",
                      "indices": [
                          113,
                          126
                      ]
                  },
                  {
                      "screen_name": "Astro_DavidS",
                      "name": "David Saint-Jacques",
                      "id": 351621695,
                      "id_str": "351621695",
                      "indices": [
                          133,
                          146
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 833236821068873728,
              "id_str": "833236821068873728",
              "name": "Maxi🐧 [-133]",
              "screen_name": "luceromaxi15",
              "location": "",
              "description": "16%⏳ | Ultraderechista | Políticamente Incorrecto",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 51,
              "friends_count": 223,
              "listed_count": 0,
              "created_at": "Sun Feb 19 08:48:33 +0000 2017",
              "favourites_count": 1827,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 1947,
              "lang": "es",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "F5F8FA",
              "profile_background_image_url": null,
              "profile_background_image_url_https": null,
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1112413040706760706/J7NpLMwd_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1112413040706760706/J7NpLMwd_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/833236821068873728/1554161457",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": true,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Fri Apr 05 15:39:28 +0000 2019",
              "id": 1114190826391986176,
              "id_str": "1114190826391986176",
              "text": "This week:\n🚀A Russian cargo ship lifted off w/ 3 tons of food &amp; supplies for the @Space_Station\n👩\u200d🚀@AstroAnnimal &amp;… https://t.co/NZF35rQPI0",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [
                      {
                          "screen_name": "Space_Station",
                          "name": "Intl. Space Station",
                          "id": 1451773004,
                          "id_str": "1451773004",
                          "indices": [
                              85,
                              99
                          ]
                      },
                      {
                          "screen_name": "AstroAnnimal",
                          "name": "Anne McClain",
                          "id": 1533844754,
                          "id_str": "1533844754",
                          "indices": [
                              103,
                              116
                          ]
                      }
                  ],
                  "urls": [
                      {
                          "url": "https://t.co/NZF35rQPI0",
                          "expanded_url": "https://twitter.com/i/web/status/1114190826391986176",
                          "display_url": "twitter.com/i/web/status/1…",
                          "indices": [
                              124,
                              147
                          ]
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "en",
                  "result_type": "recent"
              },
              "source": "<a href=\"https://www.sprinklr.com\" rel=\"nofollow\">Sprinklr</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 11348282,
                  "id_str": "11348282",
                  "name": "NASA",
                  "screen_name": "NASA",
                  "location": "",
                  "description": "Explore the universe and discover our home planet with @NASA. We usually post in EDT (UTC-4)",
                  "url": "https://t.co/TcEE6NS8nD",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/TcEE6NS8nD",
                                  "expanded_url": "http://www.nasa.gov",
                                  "display_url": "nasa.gov",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 30700340,
                  "friends_count": 298,
                  "listed_count": 93767,
                  "created_at": "Wed Dec 19 20:20:32 +0000 2007",
                  "favourites_count": 5348,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 55418,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "000000",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/1091070803184177153/TI2qItoi_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/1091070803184177153/TI2qItoi_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/11348282/1553362993",
                  "profile_link_color": "205BA7",
                  "profile_sidebar_border_color": "000000",
                  "profile_sidebar_fill_color": "F3F2F2",
                  "profile_text_color": "000000",
                  "profile_use_background_image": true,
                  "has_extended_profile": true,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": true,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "regular"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 292,
              "favorite_count": 1745,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          "is_quote_status": false,
          "retweet_count": 292,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533467851608064,
          "id_str": "1114533467851608064",
          "text": "@nasa_jn_kn サドルしっかり固定できてないんですか？",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "nasa_jn_kn",
                      "name": "キュアストロベリー🍌",
                      "id": 1060239133,
                      "id_str": "1060239133",
                      "indices": [
                          0,
                          11
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "ja",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
          "in_reply_to_status_id": 1114524734639595522,
          "in_reply_to_status_id_str": "1114524734639595522",
          "in_reply_to_user_id": 1060239133,
          "in_reply_to_user_id_str": "1060239133",
          "in_reply_to_screen_name": "nasa_jn_kn",
          "user": {
              "id": 149494091,
              "id_str": "149494091",
              "name": "あるびの",
              "screen_name": "bigboss0930",
              "location": "",
              "description": "春からじてんしゃ凶戯はじめます",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 2539,
              "friends_count": 943,
              "listed_count": 68,
              "created_at": "Sat May 29 12:39:41 +0000 2010",
              "favourites_count": 28411,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": true,
              "verified": false,
              "statuses_count": 70407,
              "lang": "ja",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "000000",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme9/bg.gif",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme9/bg.gif",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1111399382845280268/VvNjpJ27_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1111399382845280268/VvNjpJ27_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/149494091/1552393708",
              "profile_link_color": "91D2FA",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": false,
              "has_extended_profile": true,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "ja"
      },
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533467436531713,
          "id_str": "1114533467436531713",
          "text": "@Marc_Perrone NASA is an amazing program, but how much money has been spent on outer space while our infrastructure… https://t.co/HdHEqdKpWF",
          "truncated": true,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "Marc_Perrone",
                      "name": "Marc Perrone",
                      "id": 302881437,
                      "id_str": "302881437",
                      "indices": [
                          0,
                          13
                      ]
                  }
              ],
              "urls": [
                  {
                      "url": "https://t.co/HdHEqdKpWF",
                      "expanded_url": "https://twitter.com/i/web/status/1114533467436531713",
                      "display_url": "twitter.com/i/web/status/1…",
                      "indices": [
                          117,
                          140
                      ]
                  }
              ]
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": 1114518772159619076,
          "in_reply_to_status_id_str": "1114518772159619076",
          "in_reply_to_user_id": 302881437,
          "in_reply_to_user_id_str": "302881437",
          "in_reply_to_screen_name": "Marc_Perrone",
          "user": {
              "id": 515938488,
              "id_str": "515938488",
              "name": "KP_477",
              "screen_name": "KPercic",
              "location": "Beaver Falls, PA",
              "description": "If you like Untappd Badges and Sports, I'm your man",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 68,
              "friends_count": 294,
              "listed_count": 2,
              "created_at": "Mon Mar 05 22:38:22 +0000 2012",
              "favourites_count": 1264,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 1884,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "C0DEED",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/908810038936031232/nVWOy1ra_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/908810038936031232/nVWOy1ra_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/515938488/1416894275",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": false,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533467159547905,
          "id_str": "1114533467159547905",
          "text": "@floyd_espiritu nasa laguna din ako",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "floyd_espiritu",
                      "name": "😜",
                      "id": 1113058355449290752,
                      "id_str": "1113058355449290752",
                      "indices": [
                          0,
                          15
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "tl",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": 1114533236888047618,
          "in_reply_to_status_id_str": "1114533236888047618",
          "in_reply_to_user_id": 1113058355449290752,
          "in_reply_to_user_id_str": "1113058355449290752",
          "in_reply_to_screen_name": "floyd_espiritu",
          "user": {
              "id": 980011032499204097,
              "id_str": "980011032499204097",
              "name": "°shiharu",
              "screen_name": "elaysocorro",
              "location": "kill this love",
              "description": "Live by FAITH, not by SIGHT.",
              "url": "https://t.co/uYIgV2WRxP",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "https://t.co/uYIgV2WRxP",
                              "expanded_url": "https://curiouscat.me/shiharu",
                              "display_url": "curiouscat.me/shiharu",
                              "indices": [
                                  0,
                                  23
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 122,
              "friends_count": 140,
              "listed_count": 0,
              "created_at": "Sat Mar 31 09:16:52 +0000 2018",
              "favourites_count": 5264,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": true,
              "verified": false,
              "statuses_count": 2962,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "F5F8FA",
              "profile_background_image_url": null,
              "profile_background_image_url_https": null,
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1112373603780055040/vgdu9n3__normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1112373603780055040/vgdu9n3__normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/980011032499204097/1554393807",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": true,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": {
              "id": "01312d7b1cbc88fd",
              "url": "https://api.twitter.com/1.1/geo/id/01312d7b1cbc88fd.json",
              "place_type": "city",
              "name": "Cavinti",
              "full_name": "Cavinti, Calabarzon",
              "country_code": "PH",
              "country": "Republic of the Philippines",
              "contained_within": [],
              "bounding_box": {
                  "type": "Polygon",
                  "coordinates": [
                      [
                          [
                              121.4718473,
                              14.2071441
                          ],
                          [
                              121.5991219,
                              14.2071441
                          ],
                          [
                              121.5991219,
                              14.2811409
                          ],
                          [
                              121.4718473,
                              14.2811409
                          ]
                      ]
                  ]
              },
              "attributes": {}
          },
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "tl"
      },
      {
          "created_at": "Sat Apr 06 14:21:00 +0000 2019",
          "id": 1114533466346020865,
          "id_str": "1114533466346020865",
          "text": "RT @o_abuga: It's an act of desperation for Ruto to purport to take credit in Ugenya and Embakasi South constituencies.... If is a man enou…",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "o_abuga",
                      "name": "Abuga Makori CBS MBE",
                      "id": 1291576616,
                      "id_str": "1291576616",
                      "indices": [
                          3,
                          11
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 773680640,
              "id_str": "773680640",
              "name": "Jakatweng'a",
              "screen_name": "pasival07",
              "location": "Planet Earth",
              "description": "I stand for freedom of speech and freedom after speech.",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 708,
              "friends_count": 1171,
              "listed_count": 13,
              "created_at": "Wed Aug 22 13:30:09 +0000 2012",
              "favourites_count": 918,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 387,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "C0DEED",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1053541162366263296/of7HOM_t_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1053541162366263296/of7HOM_t_normal.jpg",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": false,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Sat Apr 06 08:12:42 +0000 2019",
              "id": 1114440782902169600,
              "id_str": "1114440782902169600",
              "text": "It's an act of desperation for Ruto to purport to take credit in Ugenya and Embakasi South constituencies.... If is… https://t.co/XKpazVpPMZ",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/XKpazVpPMZ",
                          "expanded_url": "https://twitter.com/i/web/status/1114440782902169600",
                          "display_url": "twitter.com/i/web/status/1…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "en",
                  "result_type": "recent"
              },
              "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 1291576616,
                  "id_str": "1291576616",
                  "name": "Abuga Makori CBS MBE",
                  "screen_name": "o_abuga",
                  "location": "Nairobi, Kenya",
                  "description": "Contributing Editor- Sunday Mirror/ Political theorist, Revolutionary Socialist, Philosopher and Economist",
                  "url": "https://t.co/qxkCVLkJP4",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/qxkCVLkJP4",
                                  "expanded_url": "http://www.dailymirror.co.uk",
                                  "display_url": "dailymirror.co.uk",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 2615,
                  "friends_count": 4087,
                  "listed_count": 12,
                  "created_at": "Sat Mar 23 14:22:27 +0000 2013",
                  "favourites_count": 761,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": true,
                  "verified": false,
                  "statuses_count": 4983,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "C0DEED",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/1020336652940644353/ok9_qs-v_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/1020336652940644353/ok9_qs-v_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/1291576616/1501096800",
                  "profile_link_color": "1DA1F2",
                  "profile_sidebar_border_color": "C0DEED",
                  "profile_sidebar_fill_color": "DDEEF6",
                  "profile_text_color": "333333",
                  "profile_use_background_image": true,
                  "has_extended_profile": true,
                  "default_profile": true,
                  "default_profile_image": false,
                  "following": false,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 6,
              "favorite_count": 22,
              "favorited": false,
              "retweeted": false,
              "lang": "en"
          },
          "is_quote_status": false,
          "retweet_count": 6,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:20:58 +0000 2019",
          "id": 1114533461824425986,
          "id_str": "1114533461824425986",
          "text": "Pa cupsleeve event nga ako sa pamp/bataan/gapo sa birthday ni han HAHAHAHA kaso baka nasa Baguio na ako that time :((((",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "tl",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 3175776679,
              "id_str": "3175776679",
              "name": "GYU DAY ¦ au📌",
              "screen_name": "hanniieeeshua",
              "location": "180929 | jihan — yjh csc hjs",
              "description": "˗ˏˋ @pledis_17 our pride —[♡] ˎˊ˗ #윤정한 + #최성철",
              "url": "https://t.co/4RVmYwuTXJ",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "https://t.co/4RVmYwuTXJ",
                              "expanded_url": "http://curiouscat.me/hanniieeeshua",
                              "display_url": "curiouscat.me/hanniieeeshua",
                              "indices": [
                                  0,
                                  23
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 895,
              "friends_count": 496,
              "listed_count": 9,
              "created_at": "Sun Apr 26 09:07:38 +0000 2015",
              "favourites_count": 20968,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 22490,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "000000",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1113836487278088192/FEbxbAQS_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1113836487278088192/FEbxbAQS_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/3175776679/1554394251",
              "profile_link_color": "A9A9F5",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": false,
              "has_extended_profile": false,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "tl"
      },
      {
          "created_at": "Sat Apr 06 14:20:55 +0000 2019",
          "id": 1114533447387598848,
          "id_str": "1114533447387598848",
          "text": "@Doncic777 Airpodsに少し足せば防水防塵になって電池持ちとカナル型になるって考えれば安いかもね",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "Doncic777",
                      "name": "Raiki",
                      "id": 1041131187484258304,
                      "id_str": "1041131187484258304",
                      "indices": [
                          0,
                          10
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "ja",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": 1114402248853938177,
          "in_reply_to_status_id_str": "1114402248853938177",
          "in_reply_to_user_id": 1041131187484258304,
          "in_reply_to_user_id_str": "1041131187484258304",
          "in_reply_to_screen_name": "Doncic777",
          "user": {
              "id": 1075420333195186176,
              "id_str": "1075420333195186176",
              "name": "K",
              "screen_name": "NASA_USG",
              "location": "",
              "description": "滝の沢 15HR→22HR→37HR\n@USGInfo/@hachi_08/@kinkyunoyuyuta",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 64,
              "friends_count": 91,
              "listed_count": 0,
              "created_at": "Wed Dec 19 15:59:22 +0000 2018",
              "favourites_count": 514,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 601,
              "lang": "ja",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "F5F8FA",
              "profile_background_image_url": null,
              "profile_background_image_url_https": null,
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1075420997073813510/y8tAuxve_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1075420997073813510/y8tAuxve_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/1075420333195186176/1552407218",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": false,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "ja"
      },
      {
          "created_at": "Sat Apr 06 14:20:54 +0000 2019",
          "id": 1114533445051412480,
          "id_str": "1114533445051412480",
          "text": "@elishiadaniella Huyu hello sayo gurl. You are pretty. Kaso di rin kita nakaclose nung nasa esma ka eh. good luck s… https://t.co/IaPJ3H6MjM",
          "truncated": true,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "elishiadaniella",
                      "name": "Dana",
                      "id": 1097272753290264576,
                      "id_str": "1097272753290264576",
                      "indices": [
                          0,
                          16
                      ]
                  }
              ],
              "urls": [
                  {
                      "url": "https://t.co/IaPJ3H6MjM",
                      "expanded_url": "https://twitter.com/i/web/status/1114533445051412480",
                      "display_url": "twitter.com/i/web/status/1…",
                      "indices": [
                          117,
                          140
                      ]
                  }
              ]
          },
          "metadata": {
              "iso_language_code": "tl",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": 1114496656295116801,
          "in_reply_to_status_id_str": "1114496656295116801",
          "in_reply_to_user_id": 2373330036,
          "in_reply_to_user_id_str": "2373330036",
          "in_reply_to_screen_name": "knina_zuniga",
          "user": {
              "id": 2373330036,
              "id_str": "2373330036",
              "name": "aubrey",
              "screen_name": "knina_zuniga",
              "location": "",
              "description": "forgotten",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 549,
              "friends_count": 416,
              "listed_count": 2,
              "created_at": "Wed Mar 05 07:23:53 +0000 2014",
              "favourites_count": 8927,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": true,
              "verified": false,
              "statuses_count": 12839,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": true,
              "profile_background_color": "C262F9",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme19/bg.gif",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme19/bg.gif",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1113049692340797441/id6CJnOb_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1113049692340797441/id6CJnOb_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/2373330036/1553585096",
              "profile_link_color": "000000",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": true,
              "has_extended_profile": true,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "tl"
      },
      {
          "created_at": "Sat Apr 06 14:20:53 +0000 2019",
          "id": 1114533440773349376,
          "id_str": "1114533440773349376",
          "text": "RT @YahooFinance: Space programs offer $18,500 for 2 months of bed rest: https://t.co/a0TUPDuPZu https://t.co/jxwxDhtn7n",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "YahooFinance",
                      "name": "Yahoo Finance",
                      "id": 19546277,
                      "id_str": "19546277",
                      "indices": [
                          3,
                          16
                      ]
                  }
              ],
              "urls": [
                  {
                      "url": "https://t.co/a0TUPDuPZu",
                      "expanded_url": "https://yhoo.it/2FIppJE",
                      "display_url": "yhoo.it/2FIppJE",
                      "indices": [
                          73,
                          96
                      ]
                  }
              ],
              "media": [
                  {
                      "id": 1111713378320502785,
                      "id_str": "1111713378320502785",
                      "indices": [
                          97,
                          120
                      ],
                      "media_url": "http://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                      "media_url_https": "https://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                      "url": "https://t.co/jxwxDhtn7n",
                      "display_url": "pic.twitter.com/jxwxDhtn7n",
                      "expanded_url": "https://twitter.com/YahooFinance/status/1114533215774101504/video/1",
                      "type": "photo",
                      "sizes": {
                          "thumb": {
                              "w": 150,
                              "h": 150,
                              "resize": "crop"
                          },
                          "small": {
                              "w": 680,
                              "h": 680,
                              "resize": "fit"
                          },
                          "large": {
                              "w": 1080,
                              "h": 1080,
                              "resize": "fit"
                          },
                          "medium": {
                              "w": 1080,
                              "h": 1080,
                              "resize": "fit"
                          }
                      },
                      "source_status_id": 1114533215774101504,
                      "source_status_id_str": "1114533215774101504",
                      "source_user_id": 19546277,
                      "source_user_id_str": "19546277"
                  }
              ]
          },
          "extended_entities": {
              "media": [
                  {
                      "id": 1111713378320502785,
                      "id_str": "1111713378320502785",
                      "indices": [
                          97,
                          120
                      ],
                      "media_url": "http://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                      "media_url_https": "https://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                      "url": "https://t.co/jxwxDhtn7n",
                      "display_url": "pic.twitter.com/jxwxDhtn7n",
                      "expanded_url": "https://twitter.com/YahooFinance/status/1114533215774101504/video/1",
                      "type": "video",
                      "sizes": {
                          "thumb": {
                              "w": 150,
                              "h": 150,
                              "resize": "crop"
                          },
                          "small": {
                              "w": 680,
                              "h": 680,
                              "resize": "fit"
                          },
                          "large": {
                              "w": 1080,
                              "h": 1080,
                              "resize": "fit"
                          },
                          "medium": {
                              "w": 1080,
                              "h": 1080,
                              "resize": "fit"
                          }
                      },
                      "source_status_id": 1114533215774101504,
                      "source_status_id_str": "1114533215774101504",
                      "source_user_id": 19546277,
                      "source_user_id_str": "19546277",
                      "video_info": {
                          "aspect_ratio": [
                              1,
                              1
                          ],
                          "duration_millis": 59927,
                          "variants": [
                              {
                                  "bitrate": 1280000,
                                  "content_type": "video/mp4",
                                  "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/720x720/fI6mITFxPisxHg4Q.mp4?tag=11"
                              },
                              {
                                  "content_type": "application/x-mpegURL",
                                  "url": "https://video.twimg.com/amplify_video/1111713378320502785/pl/_ZdpfSyPDdzYnblc.m3u8?tag=11"
                              },
                              {
                                  "bitrate": 832000,
                                  "content_type": "video/mp4",
                                  "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/480x480/CQu-HbIy9yqanRu6.mp4?tag=11"
                              },
                              {
                                  "bitrate": 432000,
                                  "content_type": "video/mp4",
                                  "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/320x320/NmPRmQLsgDQcDzwF.mp4?tag=11"
                              }
                          ]
                      },
                      "additional_media_info": {
                          "title": "NASA is looking for volunteers to stay in bed for 2 months",
                          "description": "Starting May 24, 2019 you can apply to be one of 24 volunteers to join the study.",
                          "call_to_actions": {
                              "visit_site": {
                                  "url": "https://finance.yahoo.com/news/nasa-pay-19-000-stay-173658462.html?acid=twitter_yfsocialtw_l1gbd0noiom"
                              }
                          },
                          "embeddable": true,
                          "monetizable": false,
                          "source_user": {
                              "id": 19546277,
                              "id_str": "19546277",
                              "name": "Yahoo Finance",
                              "screen_name": "YahooFinance",
                              "location": "New York, NY",
                              "description": "The planet’s biggest business news platform. Tweeting business news you need, plus live shows every weekday. Get the free Yahoo Finance app ⬇️",
                              "url": "https://t.co/3na8DjYVs3",
                              "entities": {
                                  "url": {
                                      "urls": [
                                          {
                                              "url": "https://t.co/3na8DjYVs3",
                                              "expanded_url": "http://bit.ly/2CvQXU1",
                                              "display_url": "bit.ly/2CvQXU1",
                                              "indices": [
                                                  0,
                                                  23
                                              ]
                                          }
                                      ]
                                  },
                                  "description": {
                                      "urls": []
                                  }
                              },
                              "protected": false,
                              "followers_count": 845537,
                              "friends_count": 829,
                              "listed_count": 10758,
                              "created_at": "Mon Jan 26 17:44:44 +0000 2009",
                              "favourites_count": 2816,
                              "utc_offset": null,
                              "time_zone": null,
                              "geo_enabled": true,
                              "verified": true,
                              "statuses_count": 207970,
                              "lang": "en",
                              "contributors_enabled": false,
                              "is_translator": false,
                              "is_translation_enabled": false,
                              "profile_background_color": "C0DEED",
                              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                              "profile_background_tile": false,
                              "profile_image_url": "http://pbs.twimg.com/profile_images/710978975376388096/1U2djlFO_normal.jpg",
                              "profile_image_url_https": "https://pbs.twimg.com/profile_images/710978975376388096/1U2djlFO_normal.jpg",
                              "profile_banner_url": "https://pbs.twimg.com/profile_banners/19546277/1546886205",
                              "profile_link_color": "9266CC",
                              "profile_sidebar_border_color": "FFFFFF",
                              "profile_sidebar_fill_color": "FFFFFF",
                              "profile_text_color": "3F3F3F",
                              "profile_use_background_image": true,
                              "has_extended_profile": false,
                              "default_profile": false,
                              "default_profile_image": false,
                              "following": false,
                              "follow_request_sent": false,
                              "notifications": false,
                              "translator_type": "none"
                          }
                      }
                  }
              ]
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 1285940694,
              "id_str": "1285940694",
              "name": "Spence",
              "screen_name": "JSpenceTheKing",
              "location": "United States",
              "description": "#00921 #BuffaloHoosier #BillsMafiaBihhhh #BuffaloBisons #UBhornsUP #LakeShow #YankeeDoodleDooBihhhhh",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 294,
              "friends_count": 418,
              "listed_count": 3,
              "created_at": "Thu Mar 21 13:17:13 +0000 2013",
              "favourites_count": 25626,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": true,
              "verified": false,
              "statuses_count": 9106,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "000000",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1114271469964599300/zJOm3p1z_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1114271469964599300/zJOm3p1z_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/1285940694/1554081586",
              "profile_link_color": "1B95E0",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": false,
              "has_extended_profile": true,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Sat Apr 06 14:20:00 +0000 2019",
              "id": 1114533215774101504,
              "id_str": "1114533215774101504",
              "text": "Space programs offer $18,500 for 2 months of bed rest: https://t.co/a0TUPDuPZu https://t.co/jxwxDhtn7n",
              "truncated": false,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/a0TUPDuPZu",
                          "expanded_url": "https://yhoo.it/2FIppJE",
                          "display_url": "yhoo.it/2FIppJE",
                          "indices": [
                              55,
                              78
                          ]
                      }
                  ],
                  "media": [
                      {
                          "id": 1111713378320502785,
                          "id_str": "1111713378320502785",
                          "indices": [
                              79,
                              102
                          ],
                          "media_url": "http://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                          "media_url_https": "https://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                          "url": "https://t.co/jxwxDhtn7n",
                          "display_url": "pic.twitter.com/jxwxDhtn7n",
                          "expanded_url": "https://twitter.com/YahooFinance/status/1114533215774101504/video/1",
                          "type": "photo",
                          "sizes": {
                              "thumb": {
                                  "w": 150,
                                  "h": 150,
                                  "resize": "crop"
                              },
                              "small": {
                                  "w": 680,
                                  "h": 680,
                                  "resize": "fit"
                              },
                              "large": {
                                  "w": 1080,
                                  "h": 1080,
                                  "resize": "fit"
                              },
                              "medium": {
                                  "w": 1080,
                                  "h": 1080,
                                  "resize": "fit"
                              }
                          }
                      }
                  ]
              },
              "extended_entities": {
                  "media": [
                      {
                          "id": 1111713378320502785,
                          "id_str": "1111713378320502785",
                          "indices": [
                              79,
                              102
                          ],
                          "media_url": "http://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                          "media_url_https": "https://pbs.twimg.com/media/D22ayl-W0AU994j.jpg",
                          "url": "https://t.co/jxwxDhtn7n",
                          "display_url": "pic.twitter.com/jxwxDhtn7n",
                          "expanded_url": "https://twitter.com/YahooFinance/status/1114533215774101504/video/1",
                          "type": "video",
                          "sizes": {
                              "thumb": {
                                  "w": 150,
                                  "h": 150,
                                  "resize": "crop"
                              },
                              "small": {
                                  "w": 680,
                                  "h": 680,
                                  "resize": "fit"
                              },
                              "large": {
                                  "w": 1080,
                                  "h": 1080,
                                  "resize": "fit"
                              },
                              "medium": {
                                  "w": 1080,
                                  "h": 1080,
                                  "resize": "fit"
                              }
                          },
                          "video_info": {
                              "aspect_ratio": [
                                  1,
                                  1
                              ],
                              "duration_millis": 59927,
                              "variants": [
                                  {
                                      "bitrate": 1280000,
                                      "content_type": "video/mp4",
                                      "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/720x720/fI6mITFxPisxHg4Q.mp4?tag=11"
                                  },
                                  {
                                      "content_type": "application/x-mpegURL",
                                      "url": "https://video.twimg.com/amplify_video/1111713378320502785/pl/_ZdpfSyPDdzYnblc.m3u8?tag=11"
                                  },
                                  {
                                      "bitrate": 832000,
                                      "content_type": "video/mp4",
                                      "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/480x480/CQu-HbIy9yqanRu6.mp4?tag=11"
                                  },
                                  {
                                      "bitrate": 432000,
                                      "content_type": "video/mp4",
                                      "url": "https://video.twimg.com/amplify_video/1111713378320502785/vid/320x320/NmPRmQLsgDQcDzwF.mp4?tag=11"
                                  }
                              ]
                          },
                          "additional_media_info": {
                              "title": "NASA is looking for volunteers to stay in bed for 2 months",
                              "description": "Starting May 24, 2019 you can apply to be one of 24 volunteers to join the study.",
                              "call_to_actions": {
                                  "visit_site": {
                                      "url": "https://finance.yahoo.com/news/nasa-pay-19-000-stay-173658462.html?acid=twitter_yfsocialtw_l1gbd0noiom"
                                  }
                              },
                              "embeddable": true,
                              "monetizable": false
                          }
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "en",
                  "result_type": "recent"
              },
              "source": "<a href=\"https://studio.twitter.com\" rel=\"nofollow\">Twitter Media Studio</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 19546277,
                  "id_str": "19546277",
                  "name": "Yahoo Finance",
                  "screen_name": "YahooFinance",
                  "location": "New York, NY",
                  "description": "The planet’s biggest business news platform. Tweeting business news you need, plus live shows every weekday. Get the free Yahoo Finance app ⬇️",
                  "url": "https://t.co/3na8DjYVs3",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/3na8DjYVs3",
                                  "expanded_url": "http://bit.ly/2CvQXU1",
                                  "display_url": "bit.ly/2CvQXU1",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 845537,
                  "friends_count": 829,
                  "listed_count": 10758,
                  "created_at": "Mon Jan 26 17:44:44 +0000 2009",
                  "favourites_count": 2816,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": true,
                  "verified": true,
                  "statuses_count": 207970,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "C0DEED",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/710978975376388096/1U2djlFO_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/710978975376388096/1U2djlFO_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/19546277/1546886205",
                  "profile_link_color": "9266CC",
                  "profile_sidebar_border_color": "FFFFFF",
                  "profile_sidebar_fill_color": "FFFFFF",
                  "profile_text_color": "3F3F3F",
                  "profile_use_background_image": true,
                  "has_extended_profile": false,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": false,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 1,
              "favorite_count": 1,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          "is_quote_status": false,
          "retweet_count": 1,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "possibly_sensitive": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:20:53 +0000 2019",
          "id": 1114533437853982720,
          "id_str": "1114533437853982720",
          "text": "@SteveSGoddard @JSegor @ScottAdamsSays @GeraldKehl @AtomsksSanakan @scientificid @Geopilot @Prudro01 @Over400ppm… https://t.co/GWy2eXmx8k",
          "truncated": true,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "SteveSGoddard",
                      "name": "Steve Goddard",
                      "id": 435704007,
                      "id_str": "435704007",
                      "indices": [
                          0,
                          14
                      ]
                  },
                  {
                      "screen_name": "JSegor",
                      "name": "Jeff Segor",
                      "id": 561699040,
                      "id_str": "561699040",
                      "indices": [
                          15,
                          22
                      ]
                  },
                  {
                      "screen_name": "ScottAdamsSays",
                      "name": "Scott Adams",
                      "id": 2853461537,
                      "id_str": "2853461537",
                      "indices": [
                          23,
                          38
                      ]
                  },
                  {
                      "screen_name": "GeraldKehl",
                      "name": "Jerry Kehl",
                      "id": 4731142896,
                      "id_str": "4731142896",
                      "indices": [
                          39,
                          50
                      ]
                  },
                  {
                      "screen_name": "AtomsksSanakan",
                      "name": "Atomsk's Sanakan",
                      "id": 874191251087572992,
                      "id_str": "874191251087572992",
                      "indices": [
                          51,
                          66
                      ]
                  },
                  {
                      "screen_name": "scientificid",
                      "name": "The Id of a Scientist",
                      "id": 1113207426331725824,
                      "id_str": "1113207426331725824",
                      "indices": [
                          67,
                          80
                      ]
                  },
                  {
                      "screen_name": "Geopilot",
                      "name": "GeorgeFWatson",
                      "id": 14410744,
                      "id_str": "14410744",
                      "indices": [
                          81,
                          90
                      ]
                  },
                  {
                      "screen_name": "Prudro01",
                      "name": "P_R_PRO",
                      "id": 2211250442,
                      "id_str": "2211250442",
                      "indices": [
                          91,
                          100
                      ]
                  },
                  {
                      "screen_name": "Over400ppm",
                      "name": "Al Savani",
                      "id": 2433154158,
                      "id_str": "2433154158",
                      "indices": [
                          101,
                          112
                      ]
                  }
              ],
              "urls": [
                  {
                      "url": "https://t.co/GWy2eXmx8k",
                      "expanded_url": "https://twitter.com/i/web/status/1114533437853982720",
                      "display_url": "twitter.com/i/web/status/1…",
                      "indices": [
                          114,
                          137
                      ]
                  }
              ]
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
          "in_reply_to_status_id": 1114532159337811968,
          "in_reply_to_status_id_str": "1114532159337811968",
          "in_reply_to_user_id": 435704007,
          "in_reply_to_user_id_str": "435704007",
          "in_reply_to_screen_name": "SteveSGoddard",
          "user": {
              "id": 1090888416214929408,
              "id_str": "1090888416214929408",
              "name": "Dave S",
              "screen_name": "amish1922",
              "location": "",
              "description": "Definitely not an account evading suspension - Vanderbilt U 🇺🇸🇸🇪🇳🇴",
              "url": null,
              "entities": {
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 135,
              "friends_count": 562,
              "listed_count": 1,
              "created_at": "Thu Jan 31 08:24:00 +0000 2019",
              "favourites_count": 2860,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 3482,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "F5F8FA",
              "profile_background_image_url": null,
              "profile_background_image_url_https": null,
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1096832170658648064/q1lsAHp__normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1096832170658648064/q1lsAHp__normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/1090888416214929408/1552593812",
              "profile_link_color": "1DA1F2",
              "profile_sidebar_border_color": "C0DEED",
              "profile_sidebar_fill_color": "DDEEF6",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": false,
              "default_profile": true,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:20:50 +0000 2019",
          "id": 1114533426357358593,
          "id_str": "1114533426357358593",
          "text": "RT @weathernetwork: A meteor blazed across the sky over South Carolina just as the sun was rising Thursday morning ☄ NASA confirmed the met…",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "weathernetwork",
                      "name": "The Weather Network",
                      "id": 18638090,
                      "id_str": "18638090",
                      "indices": [
                          3,
                          18
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 300388340,
              "id_str": "300388340",
              "name": "CZ",
              "screen_name": "ChoiceZnewZ",
              "location": "Fraser Valley, BC",
              "description": "LUV: Sharing the NewZ; #Graphics & #WebDesign; Technology; Astrology (Libra); Classic Rock; #Canucks; Ppl with positive energy. DETEST: Negative Energy Vampires",
              "url": "http://t.co/G5N2g0e5Yu",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "http://t.co/G5N2g0e5Yu",
                              "expanded_url": "http://www.choicez.biz/",
                              "display_url": "choicez.biz",
                              "indices": [
                                  0,
                                  22
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 4849,
              "friends_count": 4436,
              "listed_count": 318,
              "created_at": "Tue May 17 17:45:23 +0000 2011",
              "favourites_count": 5538,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 134836,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "131516",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme14/bg.gif",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme14/bg.gif",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1062214213110624256/XHkzE_L2_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1062214213110624256/XHkzE_L2_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/300388340/1523666865",
              "profile_link_color": "8206C4",
              "profile_sidebar_border_color": "FFFFFF",
              "profile_sidebar_fill_color": "EFEFEF",
              "profile_text_color": "333333",
              "profile_use_background_image": true,
              "has_extended_profile": false,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Sat Apr 06 12:00:00 +0000 2019",
              "id": 1114497983888936960,
              "id_str": "1114497983888936960",
              "text": "A meteor blazed across the sky over South Carolina just as the sun was rising Thursday morning ☄ NASA confirmed the… https://t.co/bsd6AVa6VQ",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/bsd6AVa6VQ",
                          "expanded_url": "https://twitter.com/i/web/status/1114497983888936960",
                          "display_url": "twitter.com/i/web/status/1…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "en",
                  "result_type": "recent"
              },
              "source": "<a href=\"https://studio.twitter.com\" rel=\"nofollow\">Twitter Media Studio</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 18638090,
                  "id_str": "18638090",
                  "name": "The Weather Network",
                  "screen_name": "weathernetwork",
                  "location": "Canada",
                  "description": "Canada's #1 source for weather forecasts, news and information ☀☔⚡❄  #ShareYourWeather videos and photos with us: https://t.co/9mAXK6LWCw",
                  "url": "https://t.co/WjwerxxaYT",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/WjwerxxaYT",
                                  "expanded_url": "http://www.theweathernetwork.com",
                                  "display_url": "theweathernetwork.com",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": [
                              {
                                  "url": "https://t.co/9mAXK6LWCw",
                                  "expanded_url": "http://ow.ly/IAtr30j9JhI",
                                  "display_url": "ow.ly/IAtr30j9JhI",
                                  "indices": [
                                      114,
                                      137
                                  ]
                              }
                          ]
                      }
                  },
                  "protected": false,
                  "followers_count": 1563695,
                  "friends_count": 1400,
                  "listed_count": 3604,
                  "created_at": "Mon Jan 05 17:35:35 +0000 2009",
                  "favourites_count": 16504,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": true,
                  "verified": true,
                  "statuses_count": 109285,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "B2DFDA",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme13/bg.gif",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme13/bg.gif",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/664513103888064512/azbV6y0a_normal.png",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/664513103888064512/azbV6y0a_normal.png",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/18638090/1554124130",
                  "profile_link_color": "1B95E0",
                  "profile_sidebar_border_color": "FFFFFF",
                  "profile_sidebar_fill_color": "FFFFFF",
                  "profile_text_color": "333333",
                  "profile_use_background_image": true,
                  "has_extended_profile": false,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": false,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 15,
              "favorite_count": 55,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          "is_quote_status": false,
          "retweet_count": 15,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      },
      {
          "created_at": "Sat Apr 06 14:20:49 +0000 2019",
          "id": 1114533420670050304,
          "id_str": "1114533420670050304",
          "text": "Sino imo bestfriend ug nasa siya? — Actually damoe ako mga bff pero ang ako pinaka main bestfriend kay si madam(Ish… https://t.co/Pq5YqXUj3M",
          "truncated": true,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [],
              "urls": [
                  {
                      "url": "https://t.co/Pq5YqXUj3M",
                      "expanded_url": "https://twitter.com/i/web/status/1114533420670050304",
                      "display_url": "twitter.com/i/web/status/1…",
                      "indices": [
                          117,
                          140
                      ]
                  }
              ]
          },
          "metadata": {
              "iso_language_code": "tl",
              "result_type": "recent"
          },
          "source": "<a href=\"https://curiouscat.me\" rel=\"nofollow\">Curious Cat</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 3301077994,
              "id_str": "3301077994",
              "name": "angelique",
              "screen_name": "incinadaleanj",
              "location": "Region XIII - CARAGA ",
              "description": "simple but significant👑💎 | Philippians 4:13💙",
              "url": "https://t.co/ISffDdWFA3",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "https://t.co/ISffDdWFA3",
                              "expanded_url": "http://instagram.com/incinadaleanj",
                              "display_url": "instagram.com/incinadaleanj",
                              "indices": [
                                  0,
                                  23
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 128,
              "friends_count": 184,
              "listed_count": 0,
              "created_at": "Wed May 27 23:16:56 +0000 2015",
              "favourites_count": 3967,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": true,
              "verified": false,
              "statuses_count": 6147,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "DD2E44",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": true,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1110511664686723072/1s_v9-X3_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1110511664686723072/1s_v9-X3_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/3301077994/1553233832",
              "profile_link_color": "1133FF",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": true,
              "has_extended_profile": true,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "is_quote_status": false,
          "retweet_count": 0,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "possibly_sensitive": false,
          "lang": "tl"
      },
      {
          "created_at": "Sat Apr 06 14:20:48 +0000 2019",
          "id": 1114533418409152512,
          "id_str": "1114533418409152512",
          "text": "RT @HiRISE: HiPOD 6 Apr 2019: Channels in Baldet Crater\n\nThe objective of this observation is to examine a group of parallel channels that…",
          "truncated": false,
          "entities": {
              "hashtags": [],
              "symbols": [],
              "user_mentions": [
                  {
                      "screen_name": "HiRISE",
                      "name": "HiRISE (NASA)",
                      "id": 17877850,
                      "id_str": "17877850",
                      "indices": [
                          3,
                          10
                      ]
                  }
              ],
              "urls": []
          },
          "metadata": {
              "iso_language_code": "en",
              "result_type": "recent"
          },
          "source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
          "in_reply_to_status_id": null,
          "in_reply_to_status_id_str": null,
          "in_reply_to_user_id": null,
          "in_reply_to_user_id_str": null,
          "in_reply_to_screen_name": null,
          "user": {
              "id": 4039714994,
              "id_str": "4039714994",
              "name": "🌙",
              "screen_name": "ZugarPlume",
              "location": "channel",
              "description": "ıŋ Ɩơ۷ɛ ῳıɬɧ Ɩơ۷ɛ🕊 💫☄. I predict things. \n\n.    .    .    .     .     .     .    .    .    .    .   .     .   . .     . . ,",
              "url": "https://t.co/a9WpVcrbCz",
              "entities": {
                  "url": {
                      "urls": [
                          {
                              "url": "https://t.co/a9WpVcrbCz",
                              "expanded_url": "http://twitr.buzz/Zugarplume",
                              "display_url": "twitr.buzz/Zugarplume",
                              "indices": [
                                  0,
                                  23
                              ]
                          }
                      ]
                  },
                  "description": {
                      "urls": []
                  }
              },
              "protected": false,
              "followers_count": 436,
              "friends_count": 684,
              "listed_count": 138,
              "created_at": "Tue Oct 27 21:52:49 +0000 2015",
              "favourites_count": 3894,
              "utc_offset": null,
              "time_zone": null,
              "geo_enabled": false,
              "verified": false,
              "statuses_count": 38124,
              "lang": "en",
              "contributors_enabled": false,
              "is_translator": false,
              "is_translation_enabled": false,
              "profile_background_color": "000000",
              "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
              "profile_background_tile": false,
              "profile_image_url": "http://pbs.twimg.com/profile_images/1112016599584653312/jcoBXqKZ_normal.jpg",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/1112016599584653312/jcoBXqKZ_normal.jpg",
              "profile_banner_url": "https://pbs.twimg.com/profile_banners/4039714994/1552469643",
              "profile_link_color": "FF691F",
              "profile_sidebar_border_color": "000000",
              "profile_sidebar_fill_color": "000000",
              "profile_text_color": "000000",
              "profile_use_background_image": false,
              "has_extended_profile": true,
              "default_profile": false,
              "default_profile_image": false,
              "following": false,
              "follow_request_sent": false,
              "notifications": false,
              "translator_type": "none"
          },
          "geo": null,
          "coordinates": null,
          "place": null,
          "contributors": null,
          "retweeted_status": {
              "created_at": "Sat Apr 06 14:00:24 +0000 2019",
              "id": 1114528283746390018,
              "id_str": "1114528283746390018",
              "text": "HiPOD 6 Apr 2019: Channels in Baldet Crater\n\nThe objective of this observation is to examine a group of parallel ch… https://t.co/JxNNu6KOG9",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/JxNNu6KOG9",
                          "expanded_url": "https://twitter.com/i/web/status/1114528283746390018",
                          "display_url": "twitter.com/i/web/status/1…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "iso_language_code": "en",
                  "result_type": "recent"
              },
              "source": "<a href=\"https://twitterrific.com/ios\" rel=\"nofollow\">Twitterrific for iOS</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 17877850,
                  "id_str": "17877850",
                  "name": "HiRISE (NASA)",
                  "screen_name": "HiRISE",
                  "location": "Mars",
                  "description": "High Resolution Imaging Science Experiment (Mars Reconnaissance Orbiter, NASA). We are based out of the University of Arizona in Tucson, AZ.",
                  "url": "https://t.co/V1krPAgawe",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/V1krPAgawe",
                                  "expanded_url": "http://uahirise.org",
                                  "display_url": "uahirise.org",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 47122,
                  "friends_count": 121,
                  "listed_count": 1967,
                  "created_at": "Thu Dec 04 20:32:52 +0000 2008",
                  "favourites_count": 1196,
                  "utc_offset": null,
                  "time_zone": null,
                  "geo_enabled": true,
                  "verified": true,
                  "statuses_count": 16532,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "43679C",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme9/bg.gif",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme9/bg.gif",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/925431418900979712/23OSyup__normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/925431418900979712/23OSyup__normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/17877850/1483395777",
                  "profile_link_color": "B85C6E",
                  "profile_sidebar_border_color": "FFFFFF",
                  "profile_sidebar_fill_color": "131725",
                  "profile_text_color": "AB923B",
                  "profile_use_background_image": true,
                  "has_extended_profile": false,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": false,
                  "follow_request_sent": false,
                  "notifications": false,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 3,
              "favorite_count": 6,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          "is_quote_status": false,
          "retweet_count": 3,
          "favorite_count": 0,
          "favorited": false,
          "retweeted": false,
          "lang": "en"
      }
  ],
  "search_metadata": {
      "completed_in": 0.055,
      "max_id": 1114533469269266432,
      "max_id_str": "1114533469269266432",
      "next_results": "?max_id=1114533418409152511&q=nasa&include_entities=1",
      "query": "nasa",
      "refresh_url": "?since_id=1114533469269266432&q=nasa&include_entities=1",
      "count": 15,
      "since_id": 0,
      "since_id_str": "0"
  }
};

//getSentimentsFromTwitterData(TWITTER_DATA);

module.exports.getSentimentsFromTwitterData = getSentimentsFromTwitterData;