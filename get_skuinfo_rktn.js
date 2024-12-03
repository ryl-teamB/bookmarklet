function app() {
	// スタイルを追加
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
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            border-left: 3px solid #4CAF50;
            padding-left: 10px;
            margin: 10px 0;
        }
        #floating-extractor .inventory-item {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            padding: 8px;
            background: white;
            border-radius: 4px;
            margin: 5px 0;
        }
        #floating-extractor .inventory-header {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            padding: 8px;
            background: #f0f0f0;
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        #floating-extractor .inventory-value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `;
	document.head.appendChild(style);

	// データを取得
	const scriptElement = document.querySelector('#item-page-app-data');
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

	// 商品情報を抽出
	const itemInfo = data.api.data.itemInfoSku;
	const reviews = itemInfo.itemReviewInfo?.reviews || [];

	// シングルSKUとマルチSKUで取得する項目を分ける
	let skuInfo = [];

	if (itemInfo.purchaseInfo.sku.length) {
		console.log('マルチSKUです');
		// 在庫情報とSKU情報をマージ
		const inventoryMap = new Map(itemInfo.purchaseInfo.variantMappedInventories.map((inv) => [inv.sku, inv]));
        
		skuInfo = itemInfo.sku.map((sku) => ({
			sku: sku.variantId,
			quantity: inventoryMap.get(sku.variantId)?.quantity || 0,
			price: sku.taxIncludedPrice,
			color: sku.selectorValues[0],
		}));
	} else {
        console.log('シングルSKUです');
        console.log(itemInfo.purchaseInfo);
        
		skuInfo.push({
			sku: itemInfo.purchaseInfo.variantMappedInventories[0].sku,
			quantity: itemInfo.purchaseInfo.variantMappedInventories[0].quantity || 0,
			price: itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.minPrice,
			color: "シングルSKUのため無し",
		});
	}

	// UIを作成
	const container = document.createElement('div');
	container.id = 'floating-extractor';
	container.innerHTML = `
        <div class="header">
            <span>商品情報抽出</span>
            <div class="controls">
                <button class="minimize">_</button>
                <button class="close">×</button>
            </div>
        </div>
        <div class="content">
            <div class="section">
                <div class="section-title">基本情報</div>
                <div class="item">商品ID: ${itemInfo.itemId}</div>
                <div class="item">商品番号: ${itemInfo.manageNumber}</div>
                <div class="item">最低価格: ¥${itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.minPrice.toLocaleString()}</div>
                ${itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.maxPrice ? `<div class="item">最高価格: ¥${itemInfo.purchaseInfo.purchaseBySellType.normalPurchase.price.maxPrice.toLocaleString()}</div>` : ''}
            </div>

            <div class="section">
                <div class="section-title">在庫情報</div>
                <div class="inventory-header">
                    <div>カラー</div>
                    <div>在庫数</div>
                    <div>価格</div>
                </div>
                ${skuInfo
									.map(
										(info) => `
                    <div class="inventory-item">
                        <div class="inventory-value">${info.color}</div>
                        <div class="inventory-value">${info.quantity}個</div>
                        <div class="inventory-value">¥${info.price.toLocaleString()}</div>
                    </div>
                `
									)
									.join('')}
            </div>

            <div class="section">
                <div class="section-title">レビュー情報</div>
                <div class="item">総レビュー数: ${itemInfo.itemReviewInfo.summary.itemReviewCount}</div>
                <div class="item">平均評価: ${itemInfo.itemReviewInfo.summary.itemReviewRating}</div>
                ${reviews
									.slice(0, 3)
									.map(
										(review) => `
                    <div class="review">
                        <div>評価: ${review.evaluation}点</div>
                        <div>投稿者: ${review.nickName}</div>
                        <div>コメント: ${review.review}</div>
                    </div>
                `
									)
									.join('')}
            </div>
        </div>
    `;
	document.body.appendChild(container);

	// ドラッグ機能
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

			container.style.transform = `translate(${currentX}px, ${currentY}px)`;
		}
	}

	function dragEnd() {
		initialX = currentX;
		initialY = currentY;
		isDragging = false;
	}

	// 最小化機能
	const minimizeBtn = container.querySelector('.minimize');
	minimizeBtn.addEventListener('click', () => {
		container.classList.toggle('minimized');
		minimizeBtn.textContent = container.classList.contains('minimized') ? '□' : '_';
	});

	// 閉じる機能
	const closeBtn = container.querySelector('.close');
	closeBtn.addEventListener('click', () => {
		container.remove();
	});
}

// 実行
app();
