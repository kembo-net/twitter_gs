function myFunction() {
  //読み込むツイート数
  var checkLength = 200;
  var rules = [
    {
      //判定するツイートの正規表現「新→古」の順で書く
      patterns: [/^[^@「"]*((起|お)き(まし)?((た(?!ら))|ｔ|t))|(お(早|(はよ))う)/, /^[^@「"]*おやすみ/],
      //↑と対応するツイートがmessagesに格納されてます
      //返信の内容を返す関数を設定してください
      //falseかfalseと解釈出来るもの（nullや0など）を返すとメッセージは送信されません
      reaction: function(messages) {
        var timeList = messages.map(function(tw){return (new Date(tw.created_at)).getTime();});
        var deltaMinutes = Math.round( (timeList[0] - timeList[1]) / 60000 );
        // 1440分 = 24時間
        if (deltaMinutes < 1440) {
          var m = deltaMinutes % 60;
          var h = (deltaMinutes - m) / 60;
          return "今回の睡眠時間は" + h + "時間" + m + "分でした。 #睡眠時間"
        }
        return false;
      }
    }
  ];
  //スプレッドシートを記録用紙代わりに
  var logSheet = SpreadsheetApp.getActive().getSheets()[0];
  var logs = logSheet.getRange(1,1,1,rules.length + 1).getValues()[0];
  
  var tweets = getUserTimeline(checkLength);
  var lastTime = logs[logs.length - 1].getTime();
  rules.forEach(function(rule, rIndex){
    var matched  = [];
    var timeLimit = logs[rIndex].getTime ? logs[rIndex].getTime() : 0;
    //登録したパターンにマッチするツイートを探す
    for(var twCount = 0; twCount < tweets.length; twCount++) {
      var tw = tweets[twCount];
      var date = new Date(tw.created_at).getTime()
      //前回チェックしたツイートまで到達したら解析終わり
      if ((matched.length == 0) && (date <= timeLimit)) { break; }
      if (date <= timeLimit) { break; }
      //このツイートにマッチするパターンを探す
      for(var i = 0; i < rule.patterns.length; i++) {
        //手前のパターンより後のパターンが先に見つかるのは無し
        if (i > matched.length) { break; }
        if (tw.text.match(rule.patterns[i])) {
          //もしインデックスの若いパターンが後から見つかったらそれより後のマッチは一旦忘れる
          matched.splice(i, matched.length - i, tw);
        }
      }
      //全パターン見つかってたら諸々処理して終わり
      if (matched.length == rule.patterns.length) {
        postUpdateStatus(rule.reaction(matched));
        logs[rIndex] = new Date(matched[0].created_at);
        break;
      }
    }
  });
  
  //ログの更新
  logs[logs.length - 1] = new Date(tweets[0].created_at);
  logSheet.getRange(1,1,1,rules.length).setValues([logs]);
  SpreadsheetApp.flush();
}
