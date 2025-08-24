// JSでフォームを作成して追加
const formDiv = document.createElement('div');
formDiv.style.position = 'fixed';
formDiv.style.top = '20px';
formDiv.style.right = '20px';
formDiv.style.zIndex = '9999';
formDiv.style.backgroundColor = '#fff';
formDiv.style.border = '2px solid #f00';
formDiv.style.padding = '0.5rem';

const appLabel = document.createElement('label');
appLabel.innerHTML = '店舗を選択してください';
appLabel.style.display = 'block';
appLabel.style.fontSize = '1rem';
formDiv.appendChild(appLabel);

// const shopCodeInput = document.createElement('input');
// shopCodeInput.id = 'shopCodeInput';
// shopCodeInput.type = 'text';
// // shopCodeInput.value = 'z-craft';
// shopCodeInput.placeholder = 'z-craft'; // テキストボックスにプレースホルダーを追加
// shopCodeInput.style.fontSize = '1rem';
// shopCodeInput.style.width = '10rem';
// formDiv.appendChild(shopCodeInput);

const shopCodeSelect = document.createElement('select');
shopCodeSelect.id = 'shopCodeSelect';
shopCodeSelect.type = 'text';
shopCodeSelect.style.fontSize = '1rem';
shopCodeSelect.style.width = '10rem';
shopCodeSelect.style.padding = '0.5rem 0';
formDiv.appendChild(shopCodeSelect);

// 作成上限のためviaとbfは同じアプリケーションIDを使用する
const shopCodeDict = {
	zc: {
		shopCode: 'z-craft',
		appId: '1093853519945245128',
	},
	zspo: {
		shopCode: 'z-sports',
		appId: '1067143139286308132',
	},
	zm: {
		shopCode: 'z-mall',
		appId: '1066418199158018167',
	},
	via: {
		shopCode: 'via-torino',
		appId: '1023492695841644249',
	},
	kc: {
		shopCode: 'kutsu-collection',
		appId: '1097442740436399519',
	},
	bf: {
		shopCode: 'baseballfieldtofuture',
		appId: '1023492695841644249',
	},
};

const placeholderOption = document.createElement('option');
placeholderOption.value = '---';
placeholderOption.textContent = '選択してください';
shopCodeSelect.appendChild(placeholderOption);

for (let i = 0; i < Object.keys(shopCodeDict).length; i++) {
	const option = document.createElement('option');
	option.value = Object.keys(shopCodeDict)[i];
	option.textContent = Object.keys(shopCodeDict)[i];
	shopCodeSelect.appendChild(option);
}

const executeButton = document.createElement('button');
executeButton.textContent = '実行';
executeButton.addEventListener('click', startPriceCheck);
executeButton.style.fontSize = '1rem';
executeButton.style.marginLeft = '0.5rem';
formDiv.appendChild(executeButton);

const progressCounter = document.createElement('p');
progressCounter.innerHTML = '進捗（0 / 0）';
formDiv.appendChild(progressCounter);

document.body.appendChild(formDiv);

// エンターキーで実行できるようにする
document.getElementById('shopCodeSelect').addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		startPriceCheck();
	}
});

// アプリケーションIDを指定
const applicationId = '1008693261382501115';

// 処理停止フラグを追加
let shouldStopProcessing = false;

// ヘルパーメソッド: スタイルを設定する関数
function setStyles(element, styles) {
	for (let prop in styles) {
		element.style[prop] = styles[prop];
	}
}

function checkURLContainsSpecificString(url, searchString) {
	return url.includes(searchString);
}

// 商品価格を取得してaタグに追加する関数
async function addPriceToLink(apiEndpoint, link, keyword, shopCode, appId, retryCount = 0) {
	try {
		const response = await fetch(apiEndpoint);
		
		// レート制限エラーのチェック（リトライ対象）
		if (response.status === 429 || response.status === 503) {
			if (retryCount < 3) {
				console.log(`レート制限エラー (${response.status})。1秒後にリトライします... (${retryCount + 1}/3)`);
				await new Promise(resolve => setTimeout(resolve, 1000));
				return addPriceToLink(apiEndpoint, link, keyword, shopCode, appId, retryCount + 1);
			} else {
				throw new Error(`APIエラー (${response.status}): リトライ回数上限に達しました`);
			}
		}
		
		// その他のHTTPエラー
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch {
				throw new Error(`APIエラー (${response.status}): レスポンス解析エラー`);
			}
			throw new Error(`APIエラー (${response.status}): ${errorData.error || 'unknown_error'} - ${errorData.error_description || 'unknown error description'}`);
		}
		
		const data = await response.json();
		const items = data.Items;
		
		if (!items || items.length === 0) {
			throw new Error('在庫切れ、または該当商品なし：' + keyword);
		}
		
		for (const item of items) {
			const url = item.Item.itemUrl;
			const isMatch = checkURLContainsSpecificString(url, keyword);
			
			if (isMatch) {
				// 表示する項目を定義
				const price = `価格：${item.Item.itemPrice}円`;
				const pointRate_value = item.Item.pointRate;
				const startTime_value = item.Item.startTime;
				const endTime_value = item.Item.endTime;
				const pointRate = `ポイント変倍率：${pointRate_value}倍`;
				const startTime = `販売開始日時：${startTime_value}`;
				const endTime = `販売終了日時：${endTime_value}`;

				const wrapper_div = document.createElement('div');
				wrapper_div.className = 'js-checked-item';
				const price_div = document.createElement('div');
				const pointRate_div = document.createElement('div');
				const startTime_div = document.createElement('div');
				const endTime_div = document.createElement('div');
				
				price_div.textContent = price;
				price_div.className = 'item-page_price';
				pointRate_div.textContent = pointRate;
				pointRate_div.className = 'item-page_pointRate';
				startTime_div.textContent = startTime;
				endTime_div.textContent = endTime;

				// スタイルを設定
				setStyles(wrapper_div, {
					position: 'absolute',
					zIndex: '9999',
					backgroundColor: 'rgba(255,0,0,0.8)',
					color: '#fff',
					fontSize: '1.5rem',
					border: '2px solid red',
					padding: '1rem',
					top: '20px',
				});
				setStyles(startTime_div, { fontSize: '0.8rem' });
				setStyles(endTime_div, { fontSize: '0.8rem' });
				
				// 要素を追加
				wrapper_div.appendChild(price_div);
				if (pointRate_value != 1) {
					wrapper_div.appendChild(pointRate_div);
				}
				if (startTime_value != '') {
					wrapper_div.appendChild(startTime_div);
				}
				if (endTime_value != '') {
					wrapper_div.appendChild(endTime_div);
				}
				
				// aタグの前に新しい要素を挿入
				link.parentNode.insertBefore(wrapper_div, link);
				return;
			}
		}
		
		// マッチしなかった場合のエラー表示
		const wrapper_div = document.createElement('div');
		wrapper_div.className = 'js-checked-item';
		setStyles(wrapper_div, {
			position: 'absolute',
			zIndex: '9999',
			backgroundColor: 'rgba(0,0,0,0.8)',
			color: '#fff',
			fontSize: '1.5rem',
			border: '2px solid red',
			padding: '1rem',
		});
		wrapper_div.appendChild(document.createTextNode('取得エラー'));
		link.parentNode.insertBefore(wrapper_div, link);
		
	} catch (error) {
		console.error('Error:', error);

		// HTTPステータスコードが404以外の場合、処理を停止
		if (error.message.includes('APIエラー')) {
			const statusCode = error.message.match(/\((\d+)\)/);
			if (statusCode && statusCode[1] !== '404') {
				shouldStopProcessing = true;
				alert('APIエラーが発生しました。処理を停止します。\n\n' + error.message);
				throw error;
			}
		}

		// エラー表示
		const wrapper_div = document.createElement('div');
		wrapper_div.className = 'js-checked-item';
		setStyles(wrapper_div, {
			position: 'absolute',
			zIndex: '9999',
			backgroundColor: 'rgba(0,0,0,0.8)',
			color: '#fff',
			fontSize: '1.2rem',
			border: '2px solid red',
			padding: '1rem',
			maxWidth: '300px',
			wordWrap: 'break-word',
		});
		
		const errorMessage = error.message.includes('APIエラー') ? error.message : '取得エラー: ' + error.message;
		wrapper_div.appendChild(document.createTextNode(errorMessage));
		link.parentNode.insertBefore(wrapper_div, link);
	}
}


// ページ上の価格とAPI取得の価格を比較する関数
function comparePrices(nodes) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const parentNode = node.parentNode;
		// console.log(parentNode);
		// console.log(node.nodeType);
		// console.log(parentNode.nodeType);
		const itemUrl = parentNode.querySelector('a').href;
		try {
			// console.log(itemUrl);

			// 要素を取得
			const itemPage_price_elm = parentNode.querySelector('.item-page_price');
			const itemPage_point_elm = parentNode.querySelector('.item-page_pointRate');
			const salePage_price_elm = parentNode.querySelector('.price2');
			const salePage_icon_elm = parentNode.querySelectorAll('.icon');
			let salePage_point_elm = null;

			if (salePage_icon_elm.length >= 1) {
				for (let i = 0; i < salePage_icon_elm.length; i++) {
					if (salePage_icon_elm[i].innerText.includes('ポイント')) {
						salePage_point_elm = salePage_icon_elm[i];
					}
				}
			}

			// 値を取得、要素が存在しない場合は空文字を代入
			const itemPage_price = itemPage_price_elm ? itemPage_price_elm.innerText.replace(/\D/g, '') : '';
			const itemPage_point = itemPage_point_elm ? itemPage_point_elm.innerText.replace(/\D/g, '') : '';
			const salePage_price = salePage_price_elm ? salePage_price_elm.innerText.replace(/\D/g, '') : '';
			const salePage_point = salePage_point_elm ? salePage_point_elm.innerText.replace(/\D/g, '') : '';

			// 合否判定のときに使うノードを格納する変数
			let currentNode = parentNode.querySelector('.js-checked-item');

			// 価格の合否判定
			if (itemPage_price == '') {
				console.log('APIで価格が取得できません', itemUrl);
				continue;
			}
			if (salePage_price == '') {
				console.log('セールページで価格が取得できません', itemUrl);
				continue;
			}
			if (itemPage_price == salePage_price) {
				console.log('itemPage_price', itemPage_price);
				console.log('salePage_price', salePage_price);
				console.log('合格', itemUrl);
			} else {
				console.error('アイテムページの価格と一致しません。');
				console.error('itemPage_price', itemPage_price);
				console.error('salePage_price', salePage_price);
				console.error('不合格', itemUrl);
				currentNode.style.backgroundColor = '#00ff00';
				console.log(currentNode);
			}

			// ポイントの合否判定
			if (itemPage_point > '1' && salePage_point_elm && salePage_point_elm.innerText.includes('ポイント')) {
				// アイテムページにポイントが設定されている、かつセールページにポイントが設定されている場合
				console.log('ポイントが設定されています。整合性を確認します');
				if (itemPage_point == salePage_point) {
					console.log('itemPage_point', itemPage_point);
					console.log('salePage_point', salePage_point);
					console.log('合格', itemUrl);
				} else {
					console.error('セールページのポイントが間違っています。');
					console.error('itemPage_point', itemPage_point);
					console.error('salePage_point', salePage_point);
					console.error('不合格', itemUrl);
					currentNode.style.backgroundColor = '#00ff00';
					console.log(currentNode);
				}
			} else if (itemPage_point == '' && salePage_point == '') {
				// アイテムページにポイントが設定されていない、かつセールページにポイントが設定されていない場合
				console.log('itemPage_point', itemPage_point);
				console.log('salePage_point', salePage_point);
				console.log('合格', itemUrl);
			} else if (itemPage_point == '' && salePage_point >= '1') {
				// アイテムページにポイントが設定されていない、かつセールページにポイントが設定されている場合
				console.error('アイテムページにはポイントが設定されていません。');
				console.error('itemPage_point', itemPage_point);
				console.error('salePage_point', salePage_point);
				console.error('不合格', itemUrl);
				currentNode.style.backgroundColor = '#00ff00';
				console.log(currentNode);
			} else if (itemPage_point > '1' && !salePage_point) {
				// アイテムページにポイントが設定されているが、セールページにポイントが設定されていない場合
				console.error('セールページにポイントが設定されていません。');
				console.error('itemPage_point', itemPage_point);
				console.error('salePage_point', salePage_point);
				console.error('不合格', itemUrl);
				currentNode.style.backgroundColor = '#00ff00';
				console.log(currentNode);
			}
		} catch (error) {
			console.log(error, itemUrl);
		}
	}
}

// 実行ボタンをクリックしたときに処理を開始する関数
async function startPriceCheck() {
	// 処理停止フラグをリセット
	shouldStopProcessing = false;

	console.log(shopCodeSelect.value);

	if (shopCodeSelect.value == '---') {
		alert('店舗を選択してください！');
		return;
	}

	const shopCode = shopCodeDict[shopCodeSelect.value].shopCode;
	const appId = shopCodeDict[shopCodeSelect.value].appId;

	// ページ内のすべてのaタグを取得
	const allLinks = document.getElementsByTagName('a');
	const pattern = new RegExp('https://item\\.rakuten\\.co\\.jp/' + shopCode + '/[\\d\\-_]+');

	const matchedLinks = [];
	// 取得したすべてのaタグに対してループ処理
	for (let i = 0; i < allLinks.length; i++) {
		const link = allLinks[i];
		// リンクのURLが指定したパターンに一致するかチェック
		if (pattern.test(link.href)) {
			matchedLinks.push(link);
		}
	}

	console.log('マッチしたリンク数:', matchedLinks.length);
	console.log('商品情報を取得します');

	// 各リクエストを順次処理
	for (let i = 0; i < matchedLinks.length; i++) {
		// 処理停止フラグのチェック
		if (shouldStopProcessing) {
			console.log('エラーにより処理を停止しました。');
			return;
		}

		const link = matchedLinks[i];
		const url = link.href.split('/');
		const apiEndpoint = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=' + url[4] + '&shopCode=' + shopCode + '&applicationId=' + appId;
		
		// 進捗更新
		progressCounter.innerHTML = '進捗（' + (i + 1) + ' / ' + matchedLinks.length + '）';

		try {
			// addPriceToLinkの完了を待つ
			await addPriceToLink(apiEndpoint, link, url[4], shopCode, appId);
		} catch (error) {
			console.error('Request failed:', error);
			// エラーが発生しても処理停止フラグがセットされていなければ続行
			if (shouldStopProcessing) {
				return;
			}
		}

		// 最後のリクエスト以外は間隔を空ける
		if (i < matchedLinks.length - 1) {
			await new Promise(resolve => setTimeout(resolve, 300));
		}
	}

	console.log('商品情報取得完了');
	console.log('価格とポイントをチェックします');
	comparePrices(matchedLinks);
	alert('価格、ポイントチェックが完了しました！\nコンソールにエラーが出ていないか確認してください。');
}
