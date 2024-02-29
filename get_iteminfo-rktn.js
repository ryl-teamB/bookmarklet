var info = '';
var url		= window.location.href;
var con		= $('#pagebody').prop('outerHTML');
var jsonData = JSON.parse($('#item-page-app-data').html());

var style = {
'width': 'auto',
'padding': '20px',
'background': '#ffffff',
'position': 'fixed',
'top': '70px',
'left': '10px',
'font-size': '12px',
'letter-spacing': '0.05em',
'line-height': '1.7',
'text-align': 'left',
'border': '2px solid #cccccc',
'z-index': '9999999999',
};


//infoある場合削除
var iFlag	= con.indexOf('id="info"');
if(iFlag !== -1) {
$("#info").remove();
};

//品番取得
var spl		= url.split('/');
var numSet	= spl[spl.length - 2];
var br1		= numSet.slice(0, 1);
var br4		= numSet.slice(0, 4);

//売り切れ
var uFlag = con.indexOf("この商品は売り切れです");
if(uFlag !== -1) {
info		= info + '<span style="color:#dd0000;">売り切れ</span><br><br>';
}

//ブランド公式サイト掲載価格
var bFlag = con.indexOf("ブランド公式サイト掲載価格");
if(bFlag !== -1) {
var bPrice	= $('.pr_cp_p').text().replace('円','');
var bPriceNum	= Number(bPrice.replace(',',''));
}


//json用変数
var tblinfo = '';
var prices = []; // 販売価格を格納する配列
var referencePrices = []; // 二重価格を格納する配列
var discountRates = []; // 割引率を格納する配列
var minPrice = 0;
var maxReference = 0;
var maxReferencePrefix = '';
var maxRate = 0;
var minFlag = '';
var maxFlag = '';
var maxRateFlag = '';
var discountRate = '';

//json処理
jsonData.api.data.itemInfoSku.sku.forEach(function(sku) {
	var variantId = sku.variantId;
	var selectorValues = sku.selectorValues.join(' : ');
	var taxIncludedPrice = Intl.NumberFormat('ja-JP').format(Math.floor(sku.taxIncludedPrice)) + '円';
	var referencePrice = sku.taxIncludedReferencePrice ? Intl.NumberFormat('ja-JP').format(Math.floor(sku.taxIncludedReferencePrice)) + '円' : '－';

	// 販売価格を配列に追加する前にチェック
	var priceValue = Math.floor(sku.taxIncludedPrice);
	if (!prices.includes(priceValue)) {
		prices.push(priceValue);
	}

	// 二重価格を配列に追加する前にチェック
	if (sku.taxIncludedReferencePrice) {
		var referencePriceValue = Math.floor(sku.taxIncludedReferencePrice);
		if (!referencePrices.includes(referencePriceValue)) {
			referencePrices.push(referencePriceValue);
		}
	}

	// 二重価格 記号
	var referencePricePrefix = sku.referencePricePrefix || '';
	var referencePrefixOm = '';
	if (referencePricePrefix !== '' && bPriceNum) {
		referencePricePrefix = 'ブランド公式サイト掲載価格';
		referencePrefixOm = '【ブ】';
		referencePrice = bPriceNum;
	} else {
		switch (referencePricePrefix) {
		case '当店通常価格':
			referencePrefixOm = '【当】';
			break;
		case 'メーカー希望小売価格':
			referencePrefixOm = '【メ】';
			break;
		}
	}

	// 割引率の処理
	var discountValue = sku.taxIncludedReferencePrice ? Math.round((1 - (sku.taxIncludedPrice / sku.taxIncludedReferencePrice)) * 100) : '－';
	if (discountValue !== '－' && !discountRates.includes(discountValue)) {
		discountRates.push(discountValue);
	} else if (discountValue === '－' && !discountRates.includes(0)) {
		// '－'を0%として扱う
		discountRates.push(0);
	}

	//二重価格 文言
	if(maxReference < Math.floor(sku.taxIncludedReferencePrice)) {
		maxReference = Math.floor(sku.taxIncludedReferencePrice);
		maxReferencePrefix = referencePricePrefix;
	}

	//出力用
	tblinfo += '<tr>' +
	'<th style="vertical-align: middle;">' + variantId + '</th>' +
	'<td>' + selectorValues + '</td>' +
	'<td>' + taxIncludedPrice + '</td>' +
	'<td>' + referencePrefixOm + referencePrice + '</td>' +
	'<td>' + (discountValue === '－' ? '－' : discountValue + '%') + '</td>' +
	'</tr>';
});


// 販売価格と二重価格の処理
if (prices.length > 1) {
	minPrice = Math.min(...prices);
	minFlag = '【最小】';
} else if (prices.length === 1) {
	minPrice = prices[0];
	minFlag = '';
}

if (referencePrices.length > 1) {
	maxReference = Math.max(...referencePrices);
	maxFlag = '【最大】';
} else if (referencePrices.length === 1) {
	maxReference = referencePrices[0];
	maxFlag = '';
}

if (discountRates.length > 1) {
	maxRate = Math.max(...discountRates);
	maxRateFlag = '【最大】';
} else if (discountRates.length === 1) {
	maxRate = discountRates[0];
	maxRateFlag = '';
}

//販売価格・二重価格・割引率の出力
info = info + "販売価格：" + Intl.NumberFormat('ja-JP').format(minPrice) + "円" + minFlag;
if (maxReference > 0) {
	info = info + "<br>" + maxReferencePrefix + " " + Intl.NumberFormat('ja-JP').format(maxReference) + "円" + maxFlag;
	info = info + "<br>割引率 " + (maxRate === 0 ? '－' : maxRate + '%') + maxRateFlag;
}

//販売期間
var kFlag = con.indexOf("timeSalePeriod");
if(kFlag !== -1) {
var kPeriod	= $('.normal_reserve_time_sale:not(#timeSalePeriod)').text();
info		= info + "<br>販売期間 " + kPeriod;
}

//ポイントアップ
nmlPoint    = Math.floor(Math.round(minPrice / 1.1) / 100);
info        = info + "<br><br>ポイント 1倍（" +  nmlPoint + " pt）";

var pFlag = con.indexOf('class="multiplier');
if(pFlag !== -1) {
var camp	= $('.multiplier + li').text().replace('倍UP','');
var cX      = Number(camp) + 1;
var cPoint	= nmlPoint * cX;
info		= info + "<br>ポイント " + cX + "倍（" +  cPoint + " pt）";
}

//-1画像挿入
var img01	= $('#itemImg').find('img[src*="' + numSet + '"]').attr('src');
var img02	= $('#pagebody').find('img[src^="https://tshop.r10s.jp/"]').attr('src');
info		= info + '<br><br><img src="' + img01 + '" width="100">　<img src="' + img02 + '" width="100">';

//SKUテーブル
info = info + '<br><br><div style="max-height: 300px; overflow:auto;"><table style="width:100%; font-size: 10px; border-collapse:separate; border-spacing: 15px 5px; background:#eee;">' + tblinfo + '</table></div>';

//AフォルダURL
var folderA	= "\\\\128.1.100.13\\通販\\ItemImage\\up済\\" + br1 + "\\" + br4 + "\\" + numSet;
info		= info + '<br><input type="text" value="' + folderA + '" onclick="this.select();" style="width:250px; height:30px;">';

//RMS表示
var zUrl	= "https://item.rms.rakuten.co.jp/rms-item/shops/192229/item/edit/" + numSet;
var jsUrl	= "'" + zUrl + "','subwin','width=1200,height=800,top=30,left=500'";
info		= info + '　<button type="button"href="javascript:void(0);" onclick="window.open(' + jsUrl + ')" style="margin-top:5px; padding:3px;">　別窓RMS　</button>';

//挿入
$('#pagebody').prepend('<div id="info">' +info + '</div>');
$('#info').css(style);


//マトリクスアンカー
window.location.hash = "";
window.location.hash = "rakutenLimitedId_aroundCart";
var x = window.pageXOffset;
var y = window.pageYOffset;
window.scrollTo(x,y - 150);

