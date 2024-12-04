function app() {
	// スタイルの作成と追加
	const style = document.createElement('style');
	style.textContent = `
        #floating-extractor {
            position: fixed;
            top: 75px;
            right: 20px;
            width: 400px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 999999999;
            font-family: Arial, sans-serif;
            max-height: 90vh;
            overflow-y: auto;
        }
        #floating-extractor.minimized {
            width: 40px;
            height: 40px;
            overflow: hidden;
        }
        #floating-extractor .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            cursor: move;
            background: #f8f8f8;
            padding: 8px;
            border-radius: 4px;
        }
        #floating-extractor .controls {
            display: flex;
            gap: 5px;
        }
        #floating-extractor button {
            border: none;
            background: #e0e0e0;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        #floating-extractor button:hover {
            background: #d0d0d0;
        }
        #floating-extractor .content {
            padding: 10px;
        }
        #floating-extractor .section {
            margin-bottom: 15px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        #floating-extractor .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        #floating-extractor .item {
            margin: 5px 0;
            padding: 5px;
            background: white;
            border-radius: 2px;
        }
        #floating-extractor .review {
            border-left: 3px solid #4caf50;
            padding-left: 10px;
            margin: 10px 0;
        }
    `;

	document.head.appendChild(style);

	// データの取得と解析
	const scriptElement = document.getElementById('item-page-app-data');
	if (!scriptElement) {
		alert('データが見つかりませんでした');
		return;
	}

	let data;
	try {
		data = JSON.parse(scriptElement.textContent);
	} catch (e) {
		alert('JSONの解析に失敗しました: ' + e.message);
		return;
	}

	const itemInfo = data.api.data.itemInfoSku;
	const reviews = itemInfo.itemReviewInfo?.reviews || [];

	// コンテナの作成
	const container = document.createElement('div');
	container.id = 'floating-extractor';

	// 基本情報の構築
	const basicInfo = '<div class="header">' + '<span>商品情報抽出</span>' + '<div class="controls">' + '<button class="minimize">_</button>' + '<button class="close">×</button>' + '</div>' + '</div>' + '<div class="content">' + '<div class="section">' + '<div class="section-title">基本情報</div>' + '<div class="item">商品ID: ' + itemInfo.itemId + '</div>' + '<div class="item">商品番号: ' + itemInfo.manageNumber + '</div>' + '<div class="item">最低価格: ¥' + itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.minPrice.toLocaleString() + '</div>';

	// 最高価格の追加（存在する場合）
	const maxPrice = itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.maxPrice;
	const maxPriceHtml = maxPrice ? '<div class="item">最高価格: ¥' + maxPrice.toLocaleString() + '</div>' : '';

	// シングルSKUとマルチSKUで取得する項目を分ける
	const determinedSKU = itemInfo.purchaseInfo.sku.length > 0 ? 'マルチSKU' : 'シングルSKU';
	// alert(determinedSKU);

	let inventoryInfo = '';
	let skuInfo = '';
	if (determinedSKU === 'マルチSKU') {
		// 在庫情報の構築
		inventoryInfo =
			'</div><div class="section">' +
			'<div class="section-title">在庫情報</div>' +
			itemInfo.purchaseInfo.sku
				.map(function (inv) {
					return '<div class="item">SKU: ' + inv.variantId + ' - 在庫数: ' + inv.newPurchaseSku.quantity + '</div>';
				})
				.join('');

		// SKU価格情報の構築
		skuInfo =
			'</div><div class="section">' +
			'<div class="section-title">SKU価格情報</div>' +
			itemInfo.sku
				.map(function (inv) {
					return '<div class="item">SKU: ' + inv.variantId + ' - ' + inv.selectorValues + '<br>価格: ¥' + inv.taxIncludedPrice + '</div>';
				})
				.join('');
	} else {
		// 在庫情報の構築
		inventoryInfo =
			'</div><div class="section">' +
			'<div class="section-title">在庫情報</div>' +
			itemInfo.purchaseInfo.variantMappedInventories
				.map(function (inv) {
					return '<div class="item">SKU: ' + inv.sku + ' - 在庫数: ' + inv.quantity + '</div>';
				})
				.join('');

		// SKU価格情報の構築
		skuInfo = '</div><div class="section">' + '<div class="section-title">SKU価格情報</div>' + '<div class="item">シングルSKUページのためSKU価格情報は表示されません。</div>';
	}

	// レビュー情報の構築
	const reviewInfo =
		'</div><div class="section">' +
		'<div class="section-title">レビュー情報</div>' +
		'<div class="item">総レビュー数: ' +
		itemInfo.itemReviewInfo.summary.itemReviewCount +
		'</div>' +
		'<div class="item">平均評価: ' +
		itemInfo.itemReviewInfo.summary.itemReviewRating +
		'</div>' +
		reviews
			.slice(0, 3)
			.map(function (review) {
				return '<div class="review">' + '<div>評価: ' + review.evaluation + '点</div>' + '<div>投稿者: ' + review.nickName + '</div>' + '<div>コメント: ' + review.review + '</div>' + '</div>';
			})
			.join('') +
		'</div></div>';

	// すべての情報を結合
	container.innerHTML = basicInfo + maxPriceHtml + inventoryInfo + skuInfo + reviewInfo;
	document.body.appendChild(container);

	// ドラッグ機能の実装
	let isDragging = false;
	let currentX;
	let currentY;
	let initialX;
	let initialY;
	let xOffset = 0;
	let yOffset = 0;

	const header = container.querySelector('.header');

	header.addEventListener('mousedown', dragStart);
	document.addEventListener('mousemove', drag);
	document.addEventListener('mouseup', dragEnd);

	function dragStart(e) {
		initialX = e.clientX - xOffset;
		initialY = e.clientY - yOffset;
		if (e.target === header) {
			isDragging = true;
		}
	}

	function drag(e) {
		if (isDragging) {
			e.preventDefault();
			currentX = e.clientX - initialX;
			currentY = e.clientY - initialY;
			xOffset = currentX;
			yOffset = currentY;
			container.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
		}
	}

	function dragEnd() {
		initialX = currentX;
		initialY = currentY;
		isDragging = false;
	}

	// 最小化ボタンの機能
	const minimizeBtn = container.querySelector('.minimize');
	minimizeBtn.addEventListener('click', function () {
		container.classList.toggle('minimized');
		minimizeBtn.textContent = container.classList.contains('minimized') ? '□' : '_';
	});

	// 閉じるボタンの機能
	const closeBtn = container.querySelector('.close');
	closeBtn.addEventListener('click', function () {
		container.remove();
	});
}

app();
