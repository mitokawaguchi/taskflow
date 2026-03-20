# プロンプト集 — 実装状況一覧

Cursor に渡した「自作タスク管理サイト機能追加」プロンプト集に対する **実装状況**（随時更新）。

---

## 凡例

| 記号 | 意味 |
|------|------|
| ✅ | コード・テストまで入っている（運用手順はドキュメント参照） |
| 🟡 | コアはあるが、本番向けに追加作業あり（注記参照） |
| ⬜ | 未実装 |

---

## Phase 1

| ID | 内容 | 状態 | メモ |
|----|------|------|------|
| **1-1** | 上司の指摘 DB | 🟡→✅ | `src/features/boss-feedback/`。SQL: `supabase/migrations/20250320120000_boss_feedback.sql` |
| **1-2** | Chatwork リマインド | ✅ | `src/features/reminders/` + Edge `supabase/functions/send-reminders/` + `docs/SEND_REMINDERS.md`。pg_cron は SQL Editor 手動（プレースホルダー migration あり） |
| **1-3** | Gmail 未返信トラッカー | 🟡 | `src/features/mail-tracker/` + `docs/GMAIL_SETUP.md`。OAuth の code 交換は **本番は Edge 推奨**（現状は開発用トークン入力） |

---

## Phase 2

| ID | 内容 | 状態 |
|----|------|------|
| **2-1** | Chatwork 未返信 + Gmail 統合タブ | 🟡→✅ | `MailTrackerList` タブ + Edge `fetch-chatwork-unread`。Secrets: `CHATWORK_MY_ACCOUNT_ID` 追加。`docs/MAIL_TRACKER_QUICKSTART.md` |
| **2-2** | ガント UI 改善 | ⬜ |
| **2-3** | ダッシュボード UI 改善 | ⬜ |

---

## Phase 3

| ID | 内容 | 状態 |
|----|------|------|
| **3-1** 〜 **3-4** | AI・自動捕捉・進捗レポート等 | ⬜ |

---

## 環境変数（概要）

| 変数 | 用途 | リポジトリ |
|------|------|------------|
| `VITE_SUPABASE_*` | アプリ | `.env.example` |
| `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_REDIRECT_URI` | Gmail OAuth 同意 URL（1-3） | `.env.example` 追記済み |
| `CHATWORK_*` / `REMINDER_*` | Edge `send-reminders` / `fetch-chatwork-unread` | **Supabase Secrets**（クライアントに出さない） |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-20 | 1-2 / 1-3 追記、Phase 2/3 は未着手のまま |
| 2026-03-20 | Phase 2-1（未返信タブ統合 + fetch-chatwork-unread）追記 |
