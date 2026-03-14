# 依存関係の方針

## 更新ポリシー

- **週次**: Dependabot が npm 依存の PR を自動作成します。`dependencies` ラベルで管理。
- **手動**: 四半期に1回程度、`npm outdated` でメジャーアップデートを確認し、破壊変更がないか検討してから更新。

## 脆弱性

- **CI**: `npm audit --audit-level=high` を実行。high 以上があればログに出力（現状はビルドは通す）。
- **本番デプロイ前**: `npm audit` で critical/high が 0 であることを確認すること。

## 主要ライブラリ

| 用途 | パッケージ | 備考 |
|------|-----------|------|
| バックエンド | @supabase/supabase-js | RLS で多テナント分離 |
| UI | react, react-dom, react-router-dom | React 18 |
| ドラッグ | @dnd-kit/core, @dnd-kit/sortable | カンバン・プロジェクト並び替え |
| ビルド | vite | ESM ネイティブ |

## 新規追加時

- `npm install <pkg>` のあと `npm audit` を実行し、既知の脆弱性がないか確認する。
- ライセンスが MIT 等、プロジェクト方針と矛盾しないか確認する。
