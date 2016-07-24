'use strict';

// OAuth1認証用インスタンス
var twitter = TwitterWebService.getInstance(
  '***CONSUMER_KEY***',
  '***CONSUMER_SECRET***'
);

// 認証を行う（必須）
function authorize() {
  twitter.authorize();
}

// 認証をリセット
function reset() {
  twitter.reset();
}

// 認証後のコールバック（必須）
function authCallback(request) {
  return twitter.authCallback(request);
}

// タイムラインを取得
function getUserTimeline(count) {
  var service  = twitter.getService();
  var response = service.fetch('https://api.twitter.com/1.1/statuses/user_timeline.json' + (count ? ('?count=' + count) : ''));
  response = JSON.parse(response);
  Logger.log(response.length);
  return response;
}

// ツイートを投稿
function postUpdateStatus(message) {
  var service  = twitter.getService();
  var response = service.fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: 'post',
    payload: { status: message }
  });
  response = JSON.parse(response);
  Logger.log(response);
  return response;
}

