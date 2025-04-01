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
var style_line = {
  "width": "100%",
  "height": "0",
  "margin": "5px 0 15px",
  "padding": "0",
  "border-top": "1px dotted #ccc",
  "display": "block"
};

// infoある場合削除
if($('#info').length) {
  $("#info").remove();
};

// 日付リセット（仮）
var datePicker = document.querySelector('div.rms-datepicker');
if (datePicker) {
  var newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.value = '2019/01/01';
  newInput.readOnly = true;
  newInput.onclick = function() { this.select(); };
  newInput.style.cursor = 'pointer';
  newInput.style.border = '1px solid #ccc';
  newInput.style.textAlign = 'center';
  newInput.style.marginBottom = '5px';
  newInput.style.width = '120px';
  newInput.style.display = 'block';
  datePicker.parentNode.insertBefore(newInput, datePicker);
} else {
  alert('指定された要素が見つかりませんでした。');
}

// ボタンを追加
var info = '<button id="all" class="btn">すべて</button><button id="baihen" class="btn">売変用</button><button id="skuChange" class="btn">SKU書き換え用</button><p class="line"></p><button id="description" class="btn">GPT用説明文</button><button id="attribute" class="btn">GPT用商品属性</button><p class="line"></p><button id="reset" class="btn">リセット</button>';
$('body').prepend('<div id="info">' + info + '</div>');
$('#info').css(style);
$('.btn').css(style_btn);
$('.line').css(style_line);

// チェックを入れたいチェックボックスのname属性の値の配列
var namesToCheckForAll  = ["管理","在庫","納期・最短お届け可能日表示","価格","配送","ポイント変倍","注文","説明文","画像・動画","表示設定","レイアウト","製品情報","バリエーション","商品オプション"];
var namesToCheckForBaihen  = ["商品番号", "システム連携用SKU番号", "在庫数", "通常購入販売価格", "表示価格", "二重価格文言管理番号", "送料", "送料区分1", "配送方法セット管理番号", "ポイント変倍率", "ポイント変倍率適用期間", "販売期間指定日時", "キャッチコピー", "商品名", "倉庫指定", "サーチ表示", "カタログID", "カタログIDなしの理由"];
var namesToCheckForSKUchange  = ["システム連携用SKU番号", "在庫数", "在庫あり時納期管理番号", "在庫切れ時納期管理番号", "通常購入販売価格", "表示価格", "二重価格文言管理番号", "送料", "送料区分1", "配送方法セット管理番号", "再入荷お知らせボタン", "注文受付数", "倉庫指定", "商品属性", "カタログID", "カタログIDなしの理由", "バリエーション定義", "バリエーション項目名・選択肢"];
var namesToCheckForDescription = ["管理","倉庫指定","在庫数","PC用商品説明文","ジャンルID"]
var namesToCheckForAttribute = ["管理","在庫数","商品属性","バリエーション項目名・選択肢"]

// クリックイベントを追加

//すべて
$('#all').on('click', function() {
  namesToCheckForAll.forEach(function(name) {
    var checkbox = $('input[type="checkbox"][name="' + name + '"]');
    if(!checkbox.prop('checked')) {
      checkbox.click();
    }
  });
});

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
$('#skuChange').on('click', function() {
  namesToCheckForSKUchange.forEach(function(name) {
    var checkbox = $('input[type="checkbox"][name="' + name + '"]');
    if(!checkbox.prop('checked')) {
      checkbox.click();
    }
  });
});

//GPT用説明文
$('#description').on('click', function() {
  namesToCheckForDescription.forEach(function(name) {
    var checkbox = $('input[type="checkbox"][name="' + name + '"]');
    if(!checkbox.prop('checked')) {
      checkbox.click();
    }
  });
});

//GPT用商品属性
$('#attribute').on('click', function() {
  namesToCheckForAttribute.forEach(function(name) {
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

// 更新日のリセット
// function resetDate() {
//   $('div.rms-datepicker:first-of-type input').val("2019/01/01").attr("value", "2019/01/01");
//   $('div.rms-datepicker:first-of-type input').css("background","#ccccff");
// }
