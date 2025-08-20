
// API設定
let BASE_URL = 'https://ryl6180.backlog.com/api/v2';

// APIキー入力フォームを作成
function createApiKeyForm() {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 10001;
		display: flex;
		justify-content: center;
		align-items: center;
	`;

	const formContainer = document.createElement('div');
	formContainer.style.cssText = `
		background: #fff;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.3);
		font-family: Arial, sans-serif;
		min-width: 400px;
	`;

	formContainer.innerHTML = `
		<div style="margin-bottom: 20px;">
			<h3 style="margin: 0 0 10px 0; color: #333;">Backlog APIキーを入力してください</h3>
			<p style="margin: 0; color: #666; font-size: 12px;">
				Backlogの個人設定 > APIから取得できます
			</p>
		</div>
		<div style="margin-bottom: 20px;">
			<input type="text" id="apiKeyInput" placeholder="APIキーを入力..." 
					style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
		</div>
		<div style="display: flex; gap: 10px;">
			<button id="executeBtn" style="flex: 1; padding: 12px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
				実行
			</button>
			<button id="cancelBtn" style="flex: 1; padding: 12px; background: #ccc; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
				キャンセル
			</button>
		</div>
	`;

	overlay.appendChild(formContainer);
	document.body.appendChild(overlay);

	const apiKeyInput = document.getElementById('apiKeyInput');
	const executeBtn = document.getElementById('executeBtn');
	const cancelBtn = document.getElementById('cancelBtn');

	// フォーカスを入力欄に設定
	setTimeout(() => apiKeyInput.focus(), 100);

	return new Promise((resolve, reject) => {
		// 実行ボタンクリック時
		executeBtn.addEventListener('click', () => {
			const apiKey = apiKeyInput.value.trim();
			if (!apiKey) {
				alert('APIキーを入力してください。');
				return;
			}
			document.body.removeChild(overlay);
			resolve(apiKey);
		});

		// キャンセルボタンクリック時
		cancelBtn.addEventListener('click', () => {
			document.body.removeChild(overlay);
			reject('キャンセルされました');
		});

		// Enterキーで実行
		apiKeyInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				executeBtn.click();
			}
		});

		// Escapeキーでキャンセル
		document.addEventListener('keydown', function escapeHandler(e) {
			if (e.key === 'Escape') {
				document.removeEventListener('keydown', escapeHandler);
				cancelBtn.click();
			}
		});
	});
}

// 処理状況を表示するダイアログを作成
function createStatusDialog() {
	const statusDialog = document.createElement('div');
	statusDialog.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		background: #fff;
		border: 2px solid #007acc;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		z-index: 10000;
		font-family: Arial, sans-serif;
		font-size: 14px;
		min-width: 300px;
	`;

	document.body.appendChild(statusDialog);
	return statusDialog;
}

// ステータス更新関数
function updateStatus(statusDialog, message, isError = false) {
	statusDialog.innerHTML = `
		<div style="color: ${isError ? '#d32f2f' : '#333'};">
			${message}
		</div>
	`;
	console.log(message);
}

// お知らせ一覧を取得する関数
async function getNotifications(apiKey) {
	try {
		const response = await fetch(`${BASE_URL}/notifications?count=100&apiKey=${apiKey}`);

		if (!response.ok) {
			throw new Error(`お知らせ一覧の取得に失敗しました: ${response.status} ${response.statusText}`);
		}

		const notifications = await response.json();
		return notifications;
	} catch (error) {
		console.error('お知らせ一覧取得エラー:', error);
		throw error;
	}
}

// 個別のお知らせを既読にする関数
async function markNotificationAsRead(apiKey, notificationId) {
	try {
		const response = await fetch(`${BASE_URL}/notifications/${notificationId}/markAsRead?apiKey=${apiKey}`, {
			method: 'POST',
		});

		if (!response.ok) {
			throw new Error(`お知らせID ${notificationId} の既読化に失敗: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error(`お知らせID ${notificationId} 既読化エラー:`, error);
		return false;
	}
}

// メイン処理
async function markAllNotificationsAsRead(apiKey) {
	const statusDialog = createStatusDialog();
	updateStatus(statusDialog, 'お知らせ一覧を取得しています...');

	try {
		// 1. お知らせ一覧を取得
		const notifications = await getNotifications(apiKey);

		if (!notifications || notifications.length === 0) {
			updateStatus(statusDialog, 'お知らせはありません。');
			setTimeout(() => document.body.removeChild(statusDialog), 3000);
			return;
		}

		// 2. 未読のお知らせのIDを配列に格納
		const unreadNotificationIds = notifications.filter((notification) => notification.resourceAlreadyRead === false).map((notification) => notification.id);

		if (unreadNotificationIds.length === 0) {
			updateStatus(statusDialog, '未読のお知らせはありません。');
			setTimeout(() => document.body.removeChild(statusDialog), 3000);
			return;
		}

		updateStatus(statusDialog, `${unreadNotificationIds.length}件の未読お知らせを既読にしています...`);

		// 3. 各お知らせを既読にする
		let successCount = 0;
		let errorCount = 0;

		for (let i = 0; i < unreadNotificationIds.length; i++) {
			const notificationId = unreadNotificationIds[i];

			// 進捗を表示
			updateStatus(statusDialog, `既読処理中: ${i + 1}/${unreadNotificationIds.length} (成功: ${successCount}, エラー: ${errorCount})`);

			const success = await markNotificationAsRead(apiKey, notificationId);

			if (success) {
				successCount++;
			} else {
				errorCount++;
			}

			// API制限を考慮して少し待機
			if (i < unreadNotificationIds.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		// 4. 結果を表示
		if (errorCount === 0) {
			updateStatus(statusDialog, `✅ 完了: ${successCount}件のお知らせを既読にしました。`);
		} else {
			updateStatus(statusDialog, `⚠️ 完了: ${successCount}件成功、${errorCount}件エラー`);
		}
	} catch (error) {
		updateStatus(statusDialog, `❌ エラーが発生しました: ${error.message}`, true);
	}

	// 5秒後にダイアログを自動で閉じる
	setTimeout(() => {
		if (document.body.contains(statusDialog)) {
			document.body.removeChild(statusDialog);
		}
	}, 5000);
}

// エントリーポイント - APIキー入力フォームを表示してからメイン処理を実行
createApiKeyForm()
	.then((apiKey) => markAllNotificationsAsRead(apiKey))
	.catch((error) => {
		if (error !== 'キャンセルされました') {
			console.error('エラー:', error);
		}
	});

