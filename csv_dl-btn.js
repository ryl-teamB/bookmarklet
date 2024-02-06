void((function(f){
  var script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
  script.onload = function(){
    var $ = jQuery.noConflict(true);
    f($);
  };
  document.body.appendChild(script);
})(
function($, undefined){
  var style = {
    "max-height": "calc(100% - 100px)",
    "padding": "20px 20px 10px",
    "background": "#ffffff",
    "position": "fixed",
    "top": "250px",
    "left": "1250px",
    "border": "2px solid #cccccc",
    "display": "flex",
    "flex-flow": "row wrap",
    "overflow": "auto",
    "z-index": "9999999999"
  };
  var style_btn = {
    "width": "100%",
    "padding": "15px 0 13px",
    "margin": "0 0 10px",
    "background": "#dddddd"
  };

  // infoある場合削除
  if($('#info').length) {
    $("#info").remove();
  };

  // ボタンを追加
  var info = '<button id="baihen" class="btn">売変用</button><button id="skuChange" class="btn">SKU書き換え用</button><button id="reset" class="btn">リセット</button>';
  $('body').prepend('<div id="info">' + info + '</div>');
  $('#info').css(style);
  $('.btn').css(style_btn);

  // チェックを入れたいチェックボックスのname属性の値の配列
  var namesToCheckForBaihen  = ["商品番号", "システム連携用SKU番号", "販売価格", "表示価格", "二重価格文言管理番号", "送料", "送料区分1", "配送方法セット管理番号", "ポイント変倍率", "ポイント変倍率適用期間", "販売期間指定日時", "キャッチコピー", "商品名", "倉庫指定", "サーチ表示", "カタログID", "カタログIDなしの理由"];
  var namesToCheckForSKUchange  = ["システム連携用SKU番号", "在庫数", "在庫あり時納期管理番号", "在庫切れ時納期管理番号", "販売価格", "表示価格", "二重価格文言管理番号", "送料", "送料区分1", "配送方法セット管理番号", "再入荷お知らせボタン", "注文受付数", "倉庫指定", "商品属性", "カタログID", "カタログIDなしの理由", "バリエーション定義", "バリエーション項目名・選択肢"];


  // クリックイベントを追加

  //売変用
  $('#baihen').on('click', function() {
    namesToCheckForBaihen.forEach(function(name) {
      var checkbox = $('input[type="checkbox"][name="' + name + '"]');
      if(!checkbox.prop('checked')) {
        checkbox.click();
      }
    });
  });

  //SKU書き換え用
  $('#baihen').on('click', function() {
    namesToCheckForSKUchange.forEach(function(name) {
      var checkbox = $('input[type="checkbox"][name="' + name + '"]');
      if(!checkbox.prop('checked')) {
        checkbox.click();
      }
    });
  });

  //リセット
  $('#reset').on('click', function() {
    $('input[type="checkbox"]').each(function() {
      if($(this).prop('checked')) {
        $(this).click();
      }
    });
  });


})
);
