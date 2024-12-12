// スタイルの作成と追加
const style = document.createElement('style');
style.textContent = `
        #floating-extractor {
            position: fixed;
            top: 75px;
            right: 20px;
            width: 450px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 999999999999999999;
            font-family: Arial, sans-serif;
            max-height: 90svh;
			font-size: 16px;
			}
        #floating-extractor.widget-minimized {
            width: 450px;
            overflow: hidden;
        }
		#floating-extractor.widget-minimized .widget-content {
			max-height: 0;
		}
        #floating-extractor .widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            cursor: move;
            background: #f8f8f8;
            padding: 8px;
            border-radius: 4px;
        }
        #floating-extractor .widget-controls {
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
        #floating-extractor .widget-content {
            padding: 0;
			max-height: 80svh;
			overflow-y: auto;
			padding-right: 10px;
			--sb-track-color: #b7c7ce;
			--sb-thumb-color: #6BAF8D;
			--sb-size: 5px;
		}
		#floating-extractor .widget-content::-webkit-scrollbar {
			width: var(--sb-size);
		}
		#floating-extractor .widget-content::-webkit-scrollbar-track {
			background: var(--sb-track-color);
			border-radius: 3px;
			}
		#floating-extractor .widget-content::-webkit-scrollbar-thumb {
			background: var(--sb-thumb-color);
			border-radius: 3px;
		}
		#floating-extractor .widget-content::-webkit-scrollbar-thumb:hover {
			background: #555;
		}
		@supports not selector(::-webkit-scrollbar) {
			#floating-extractor .widget-content {
				scrollbar-color: var(--sb-thumb-color)
								var(--sb-track-color);
			}
		}
        #floating-extractor .widget-section {
            margin-bottom: 15px;
            padding: 10px;
            background: #ededed;
            border-radius: 4px;
        }
        #floating-extractor .widget-section table {
            width: 100%;
			border-collapse: separate;
			border-spacing: 2px
        }
        #floating-extractor .widget-section table th {
            vertical-align: middle;
			word-break: keep-all;
        }
        #floating-extractor .widget-section table td {
            text-align: left;
			padding: 5px;
			word-break: break-all;
			font-size: 16px;
			font-family: Arial, sans-serif;
        }
        #floating-extractor .widget-section table td.price {
			word-break: normal;
        }
        #floating-extractor .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        #floating-extractor .section-item {
            margin: 5px 0;
            padding: 5px;
            background: white;
            border-radius: 2px;
			line-height: 1.5;
			float: none;
        }
        #floating-extractor .section-item a {
            text-decoration: underline;
			color: #0077cc;
			font-size: 16px;
			font-family: Arial, sans-serif;
        }
        #floating-extractor .section-review {
            border-left: 3px solid #4caf50;
            padding-left: 10px;
            margin: 10px 0;
        }
		#floating-extractor .emphasis {
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
		<div class="widget-section">
			<div class="section-title">基本情報</div>
			<div class="section-item">商品ID：${itemInfo.srid}</div>
			<div class="section-item">商品番号：${itemInfo.sellerManagedItemId}</div>
			<div class="section-item">PRオプション料率：<span class="emphasis">${itemInfo.prRate}%</span></div>
		</div>
		`;

	// 価格情報の取得
	const regularPrice = itemInfo.regularPrice;
	const bargainPrice = itemInfo.bargainPrice;
	const premiumPrice = itemInfo.premiumPrice;
	const originalPrice = itemInfo.originalPrice;

	const regularPriceItem = regularPrice ? `<div class="section-item">通常価格：<span class="emphasis">¥${regularPrice.toLocaleString()}</span></div>` : '';
	const bargainPriceItem = bargainPrice ? `<div class="section-item">セール価格：<span class="emphasis">¥${bargainPrice.toLocaleString()}</span></div>` : '';
	const premiumPriceItem = premiumPrice ? `<div class="section-item">LYPプレミアム会員価格：<span class="emphasis">¥${premiumPrice.toLocaleString()}</span></div>` : '';
	const originalPriceItem = originalPrice ? `<div class="section-item">メーカー希望小売価格：<span class="emphasis">¥${originalPrice.toLocaleString()}</span></div>` : '';

	// 価格情報の構築
	const priceInfo = `
		<div class="widget-section">
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
	if (individualItemList.length > 0) {
		quantity = individualItemList
			.map(function (inv) {
				return `<tr class="section-item">
							<td>${inv.skuId}</td>
							<td>
							${inv.optionList
								.map(function (opt) {
									return `${opt.name}：${opt.choiceName}<br>`;
								})
								.join('')}
							</td>
							<td><span class="emphasis">${inv.stock.quantity}</span></td>
						</tr>`;
			})
			.join('');
	} else {
		quantity = `<tr class="section-item">
						<td>-</td>
						<td>-</td>
						<td><span class="emphasis">${itemInfo.stock.quantity}</span></td>
					</tr>`;
	}

	const inventoryInfo =
		quantity !== ''
			? `
				<div class="widget-section">
					<div class="section-title">在庫情報</div>
					<table>
						<tr>
							<th>SKU</th>
							<th>バリエーション</th>
							<th>在庫数</th>
						</tr>
						${quantity}
					</table>
				</div>
				`
			: '';

	// メインフレームの構築
	const mainFrame = `
		<div class="widget-header">
			<span>商品情報抽出</span>
			<div class="widget-controls">
				<button class="widget-minimize">_</button>
				<button class="widget-close">×</button>
			</div>
		</div>
		<div class="widget-content">
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
async function getRakutenInfo() {
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
	const maxPriceHtml = maxPrice ? '<div class="section-item emphasis">最高価格: ¥' + maxPrice.toLocaleString() + '</div>' : '';

	// 最低価格の定義
	const minPrice = itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.minPrice;

	// 基本情報の構築
	const basicInfo = `
		<div class="widget-section">
			<div class="section-title">基本情報</div>
			<div class="section-item">商品ID：${itemInfo.itemId}</div>
			<div class="section-item">商品番号：${itemInfo.manageNumber}</div>
			<div class="section-item emphasis">最低価格：¥${minPrice.toLocaleString()}</div>
			${maxPriceHtml}
		</div>
		`;

	// SKU情報の構築

	// シングルSKUとマルチSKUで取得する項目を分ける
	const classifiedSKU = itemInfo.purchaseInfo.sku.length > 0 ? 'マルチSKU' : 'シングルSKU';
	// console.log(classifiedSKU);

	let quantity = '';
	let skuPrice = '';
	if (classifiedSKU == 'マルチSKU') {
		quantity = itemInfo.purchaseInfo.sku
			.map(function (inv) {
				return `<tr class="section-item">
							<td>${inv.variantId}</td>
							<td class="emphasis">${inv.newPurchaseSku.quantity}</td>
						</tr>
						`;
			})
			.join('');
		skuPrice = itemInfo.sku
			.map(function (inv) {
				return `<tr class="section-item">
							<td>${inv.variantId}</td>
							<td>${inv.selectorValues}</td>
							<td class="price emphasis">¥${inv.taxIncludedPrice.toLocaleString()}</td>
						</tr>
						`;
			})
			.join('');
	} else if (classifiedSKU == 'シングルSKU') {
		quantity = itemInfo.purchaseInfo.variantMappedInventories
			.map(function (inv) {
				return `<tr class="section-item">
							<td>${inv.sku}</td>
							<td class="emphasis">${inv.quantity}</td>
						</tr>
						`;
			})
			.join('');
		skuPrice = '<div class="section-item">シングルSKUページのためSKU価格情報は表示されません。</div>';
	}

	const inventoryInfo =
		`
		<div class="widget-section">
			<div class="section-title">在庫情報</div>
			<table>
				<tr>
					<th>SKU</th>
					<th>在庫数</th>
				</tr>
				${quantity}
			</table>
		</div>
		` || '';

	const skuInfo =
		`
		<div class="widget-section">
			<div class="section-title">SKU価格情報</div>
			<table>
				<tr>
					<th>SKU</th>
					<th>バリエーション</th>
					<th>価格</th>
				</tr>
				${skuPrice}
			</table>
		</div>
		` || '';

	// レビュー情報の構築
	const reviewInfo = `
		<div class="widget-section">
			<div class="section-title">レビュー情報</div>
			<div class="section-item">総レビュー数：
				${itemInfo.itemReviewInfo.summary.itemReviewCount}
			</div>
			<div class="section-item">平均評価：
				${itemInfo.itemReviewInfo.summary.itemReviewRating}
			</div>
			${reviews
				.slice(0, 3)
				.map(function (review) {
					return `
						<div class="section-review">
							<div>評価：${review.evaluation} 点</div>
							<div>投稿者：${review.nickName} </div>
							<div>コメント：${review.review} </div>
						</div>`;
				})
				.join('')}
		</div>
		`;

	// クーポン情報を取得する
	const result = await fetchCouponData(itemInfo, minPrice);
	const resultJson = JSON.parse(result);
	const couponData = resultJson.items ? resultJson.items[0] : null;

	const couponBaseUrl = 'https://coupon.rakuten.co.jp/getCoupon?getkey=';
	// クーポン情報のHTML構築
	const coupons =
		couponData !== null
			? couponData.coupons
					.map(function (coupon) {
						return `
						<div class="section-item">
							<p><a href="${couponBaseUrl}${coupon.getKey}">${coupon.couponName}</a></p>
							<p>開始：${formatDateToCustomFormat(coupon.couponStartDate)}</p>
							<p>終了：${formatDateToCustomFormat(coupon.couponEndDate)}</p>
						</div>
						`;
					})
					.join('')
			: '現在利用できるクーポンは発行されていません。または楽天にログインしてから実行してください。';

	const couponInfo = `
		<div class="widget-section">
			<div class="section-title">クーポン情報</div>
			${coupons}
		</div>
		`;

	// メインフレームの構築
	const mainFrame = `
		<div class="widget-header">
			<span>商品情報抽出</span>
			<div class="widget-controls">
				<button class="widget-minimize">_</button>
				<button class="widget-close">×</button>
			</div>
		</div>
		<div class="widget-content">
			${basicInfo}
			${inventoryInfo}
			${skuInfo}
			${couponInfo}
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

	const header = container.querySelector('.widget-header');

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
	const minimizeBtn = container.querySelector('.widget-minimize');
	minimizeBtn.addEventListener('click', function () {
		container.classList.toggle('widget-minimized');
		minimizeBtn.textContent = container.classList.contains('widget-minimized') ? '□' : '_';
	});

	// 閉じるボタンの機能
	const closeBtn = container.querySelector('.widget-close');
	closeBtn.addEventListener('click', function () {
		container.remove();
	});
}

// 楽天のクーポン情報を取得する

function fetchCouponData(itemInfo, minPrice) {
	const callbackName = `jsonp${Math.floor(Math.random() * 9000000000000)}`;
	const params = {
		items: `["itemId=${itemInfo.itemId}&price=${minPrice}&shopId=${itemInfo.shopId}"]`,
		locId: '101',
		options: '["incAcqCond=true"]',
		callback: callbackName,
		_: Date.now(), // キャッシュバスター
	};

	const baseUrl = 'https://api.coupon.rakuten.co.jp/search';
	const queryString = Object.entries(params)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&');

	const url = `${baseUrl}?${queryString}`;

	return new Promise((resolve, reject) => {
		// JSONP用のスクリプトタグを作成
		const script = document.createElement('script');
		script.src = url;
		// コールバック関数を定義
		window[params.callback] = function (responce) {
			// const data = responce;
			const data = JSON.stringify(responce);
			try {
				if (data && data.length > 0) {
					resolve(data);
					// alert(data);
				} else {
					reject(new Error('データが空です'));
				}
			} catch (error) {
				reject(error);
			} finally {
				// 必要ならスクリプトタグを削除
				document.body.removeChild(script);

				// コールバック関数も削除
				delete window[params.callback];
			}
		};

		script.onerror = () => {
			reject(new Error('スクリプトのロードに失敗しました'));
			if (script.parentNode) {
				document.body.removeChild(script);
			}
			delete window[params.callback];
		};

		// スクリプトをDOMに追加
		document.body.appendChild(script);
	});
}

function formatDateToCustomFormat(isoDate) {
	const date = new Date(isoDate); // ISO形式の文字列をDateオブジェクトに変換

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	// フォーマットに組み立てる
	return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

// ########################################

//  既にUIが表示されている場合は削除する
if (document.getElementById('floating-extractor')) {
	document.getElementById('floating-extractor').remove();
}

const currentUrl = window.location.hostname;
if (currentUrl.includes('rakuten')) {
	console.log('RAKUTEN');
	getRakutenInfo();
} else if (currentUrl.includes('yahoo')) {
	console.log('YAHOO');
	getYahooInfo();
} else {
	alert('このサイトには対応していません。');
}
