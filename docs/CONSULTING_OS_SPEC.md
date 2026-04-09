# 外コンOS統合 — 実装メモ（Taskflow）

詳細なプロダクト仕様は開発者メモ（Cursor 指示書 v2）に準拠。**DB のタスクテーブル名は `tf_tasks`**（マイグレーション参照）。

## 実装済み（概要）

| Phase | 内容 |
|-------|------|
| 1 | `supabase/migrations/20260409140000_consulting_os.sql` — `tf_tasks` 拡張、`weekly_reviews`、`consulting_frameworks` + RLS、フレームワーク初期データ 12 件 |
| 2-1 | `TaskForm.jsx` + `TaskFormDeepThinking.jsx` — 「もう一歩深く考える」（折りたたみ・localStorage） |
| 2-2 | `CompleteNextTaskModal.jsx` — 完了時に次タスク作成 or スキップ |
| 3 | `KanbanCardOsSignals.jsx` — タイムボックス・🎯・⚠️・連鎖 → スクロール |
| 4 | `DashboardConsulting.jsx` — 3 ウィジェット（予想の的中率・アクションの連鎖・時間内終了率） |
| 5 | `WeeklyReviewScreen.jsx`（最小）— `/weekly-review`、成長メモの保存 |
| 6 | `docs/CONSULTING_OS_PROMPTS.md` — プレースホルダーのみ |

## 手動作業

1. Supabase SQL Editor で `20260409140000_consulting_os.sql` を実行（または `supabase db push`）。
2. 週次ふりかえりの本格 UI（TOP3・仮説検証フォーム等）は仕様書 Phase 5 の残タスクとして拡張可。
