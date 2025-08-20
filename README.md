# ブックマークレット置き場

便利なブックマークレット（JavaScript）を管理するリポジトリです。

リポジトリ: [https://github.com/ryl-teamB/bookmarklet.git](https://github.com/ryl-teamB/bookmarklet.git)

## 概要

ECプラットフォーム（楽天市場など）での通販業務を効率化するためのブックマークレットを提供しています。商品情報取得、CSV操作、在庫チェックなどの作業を自動化します。

## 主な機能

- **楽天RMSのCSVダウンロード補助**（csv_dl-btn.js）
- **商品ページから各種情報取得 - 最新SKU**（get_iteminfo-rktn.js）
- **SKU情報取得機能**（get_skuinfo_rktn.js）
- **粗利セール判定機能**（rough_sale_check_rktn.js）
- **動作確認用HTMLファイル**（app.html）

## システム要件

- Windows OS（推奨）
- 対応ブラウザ: Chrome、Firefox、Edge等のモダンブラウザ
- JavaScript有効環境

## 使用方法

1. リポジトリをクローンまたはダウンロード
   ```bash
   git clone https://github.com/ryl-teamB/bookmarklet.git
   ```
2. 使用したいJavaScriptファイルを開き、コードをコピー
3. ブラウザでブックマークを作成し、URLにコードを貼り付け
4. 対象のECサイトでブックマークを実行

詳細な使用方法については、以下を参照してください：
[ブックマークレットをGitHub管理するメモ](###)

## プロジェクト構造

```
bookmarklet/
├── README.md              # プロジェクト説明
├── app.html              # 動作テスト用HTMLファイル
├── csv_dl-btn.js         # 楽天RMSのCSVダウンロード補助
├── get_iteminfo-rktn.js  # 商品ページから各種情報取得
├── get_skuinfo_rktn.js   # 商品ページからSKU情報取得
├── rough_sale_check_rktn.js # 簡易セール判定
└── backlog_mark_as_read.js # Backlogお知らせ一括既読
```

## 注意事項

- 本ツールは通販業務自動化を目的として開発されています
- APIキーやアクセストークンは適切に管理してください
- 各ECプラットフォームのAPI利用規約を遵守してください
- Windows環境でのUI自動化機能が含まれているため、Windows OSでの実行を推奨します

## サポート

- 本ツールの機能要望はDXチームまでご連絡ください
- バグ報告や社内システムに関するお問い合わせは情報システム部までお願いします