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
			font-size: 16px;
        }
        #floating-extractor.minimized {
            width: 400px;
            height: 63px;
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
            padding: 0;
        }
        #floating-extractor .section {
            margin-bottom: 15px;
            padding: 10px;
            background: #ededed;
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
			line-height: 1.5;
        }
        #floating-extractor .review {
            border-left: 3px solid #4caf50;
            padding-left: 10px;
            margin: 10px 0;
        }
		.emphasis {
			font-weight: bold;
		}
    `;

function getYahooInfo() {
	document.head.appendChild(style);

	// データの取得と解析
	const scriptElement = document.getElementById('__NEXT_DATA__');
	if (!scriptElement) {
		alert('データが見つかりませんでした');
		return;
	}

	let data;
	try {
		data = JSON.parse(scriptElement.textContent);
	} catch (e) {
		alert('JSONの解析に失敗しました：' + e.message);
		return;
	}

	const itemInfo = data.props.pageProps.item;

	// コンテナの作成
	const container = document.createElement('div');
	container.id = 'floating-extractor';

	// 基本情報の構築
	const basicInfo = `
		<div class="section">
			<div class="section-title">基本情報</div>
			<div class="item">商品ID：${itemInfo.srid}</div>
			<div class="item">商品番号：${itemInfo.sellerManagedItemId}</div>
			<div class="item">PRオプション料率：<span class="emphasis">${itemInfo.prRate}%</span></div>
		</div>
		`;

	// 価格情報の取得
	const regularPrice = itemInfo.regularPrice;
	const bargainPrice = itemInfo.bargainPrice;
	const premiumPrice = itemInfo.premiumPrice;
	const originalPrice = itemInfo.originalPrice;

	const regularPriceItem = regularPrice ? `<div class="item">通常価格：<span class="emphasis">¥${regularPrice.toLocaleString()}</span></div>` : '';
	const bargainPriceItem = bargainPrice ? `<div class="item">セール価格：<span class="emphasis">¥${bargainPrice.toLocaleString()}</span></div>` : '';
	const premiumPriceItem = premiumPrice ? `<div class="item">LYPプレミアム会員価格：<span class="emphasis">¥${premiumPrice.toLocaleString()}</span></div>` : '';
	const originalPriceItem = originalPrice ? `<div class="item">メーカー希望小売価格：<span class="emphasis">¥${originalPrice.toLocaleString()}</span></div>` : '';

	// 価格情報の構築
	const priceInfo = `
		<div class="section">
			<div class="section-title">価格情報</div>
			${regularPriceItem}
			${bargainPriceItem}
			${premiumPriceItem}
			${originalPriceItem}
		</div>
		`;

	// SKU情報の構築
	// SKU別在庫を出す

	// マルチSKUの場合
	const individualItemList = itemInfo.individualItemList;

	let quantity = '';
	if (individualItemList) {
		quantity = individualItemList
			.map(function (inv) {
				return `<div class="item">
				SKU：${inv.skuId}<br>
				${inv.optionList
					.map(function (opt) {
						return `${opt.name}：${opt.choiceName}<br>`;
					})
					.join('')}
				在庫数：<span class="emphasis">${inv.stock.quantity}</span></div>`;
			})
			.join('');
	} else {
		quantity = `<div class="item">在庫数：<span class="emphasis">${itemInfo.stock.quantity}</span></div>`;
	}

	const inventoryInfo =
		`
		<div class="section">
			<div class="section-title">在庫情報</div>
			${quantity}
		</div>
		` || '';

	// メインフレームの構築
	const mainFrame = `
		<div class="header">
			<span>商品情報抽出</span>
			<div class="controls">
				<button class="minimize">_</button>
				<button class="close">×</button>
			</div>
		</div>
		<div class="content">
			${basicInfo}
			${priceInfo}
			${inventoryInfo}
		</div>
		`;

	// すべての情報を結合
	container.innerHTML = mainFrame;
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
function getRakutenInfo() {
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

	// 最高価格の追加（存在する場合）
	const maxPrice = itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.maxPrice;
	const maxPriceHtml = maxPrice ? '<div class="item">最高価格: ¥' + maxPrice.toLocaleString() + '</div>' : '';

	// 基本情報の構築
	const basicInfo = `
		<div class="section">
			<div class="section-title">基本情報</div>
			<div class="item">商品ID: ${itemInfo.itemId}</div>
			<div class="item">商品番号: ${itemInfo.manageNumber}</div>
			<div class="item">最低価格: ¥${itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.minPrice.toLocaleString()}</div>
			${maxPriceHtml}
		</div>
		`;

	// SKU情報の構築

	// シングルSKUとマルチSKUで取得する項目を分ける
	const classifiedSKU = itemInfo.purchaseInfo.sku.length > 0 ? 'マルチSKU' : 'シングルSKU';
	// alert(classifiedSKU);

	let quantity = '';
	let skuPrice = '';
	if (classifiedSKU == 'マルチSKU') {
		quantity = itemInfo.purchaseInfo.sku
			.map(function (inv) {
				return `<div class="item">SKU: ${inv.variantId} - 在庫数: ${inv.newPurchaseSku.quantity}</div>`;
			})
			.join('');
		skuPrice = itemInfo.sku
			.map(function (inv) {
				return `<div class="item">SKU: ${inv.variantId} - ${inv.selectorValues}<br>価格: ¥${inv.taxIncludedPrice}</div>`;
			})
			.join('');
	} else if (classifiedSKU == 'シングルSKU') {
		quantity = itemInfo.purchaseInfo.variantMappedInventories
			.map(function (inv) {
				return `<div class="item">SKU: ${inv.sku} - 在庫数: ${inv.quantity}</div>`;
			})
			.join('');
		skuPrice = '<div class="item">シングルSKUページのためSKU価格情報は表示されません。</div>';
	}

	const inventoryInfo =
		`
		<div class="section">
			<div class="section-title">在庫情報</div>
			${quantity}
		</div>
		` || '';

	const skuInfo =
		`
		<div class="section">
			<div class="section-title">SKU価格情報</div>
			${skuPrice}
		</div>
		` || '';

	// レビュー情報の構築
	const reviewInfo = `
		<div class="section">
			<div class="section-title">レビュー情報</div>
			<div class="item">総レビュー数: 
				${itemInfo.itemReviewInfo.summary.itemReviewCount}
			</div>
			<div class="item">平均評価: 
				${itemInfo.itemReviewInfo.summary.itemReviewRating}
			</div>
			${reviews
				.slice(0, 3)
				.map(function (review) {
					return `
						<div class="review">
							<div>評価: ${review.evaluation} 点</div>
							<div>投稿者: ${review.nickName} </div>
							<div>コメント: ${review.review} </div>
						</div>`;
				})
				.join('')}
		`;

	// メインフレームの構築
	const mainFrame = `
		<div class="header">
			<span>商品情報抽出</span>
			<div class="controls">
				<button class="minimize">_</button>
				<button class="close">×</button>
			</div>
		</div>
		<div class="content">
			${basicInfo}
			${inventoryInfo}
			${skuInfo}
			${reviewInfo}
		</div>
		`;

	// すべての情報を結合
	container.innerHTML = mainFrame;
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

// ########################################

//  既にUIが表示されている場合は削除する
if (document.getElementById('floating-extractor')) {
	document.getElementById('floating-extractor').remove();
}

const currentUrl = window.location.hostname;
if (currentUrl.includes('rakuten')) {
	// console.log('RAKUTEN');
	getRakutenInfo();
} else if (currentUrl.includes('yahoo')) {
	// console.log('YAHOO');
	getYahooInfo();
} else {
	alert('このサイトには対応していません。');
}
