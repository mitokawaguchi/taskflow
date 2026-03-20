# Chatwork リマインド（Edge Function `send-reminders`）

## 必要なシークレット（Supabase Dashboard → Edge Functions → Secrets）

| 名前 | 説明 |
|------|------|
| `SUPABASE_URL` | 通常 Edge に自動注入される。未設定ならプロジェクト URL |
| `SUPABASE_SERVICE_ROLE_KEY` | サービスロール（**絶対にクライアントに出さない**） |
| `CHATWORK_API_TOKEN` | Chatwork API トークン |
| `CHATWORK_MY_ROOM_ID` | マイチャットのルーム ID |
| `REMINDER_CRON_SECRET` | （任意）設定時は `Authorization: Bearer <値>` が必須 |
| `REMINDER_OWNER_ID` | （任意）指定時はそのユーザーの未完了タスクのみ |

## デプロイ

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

`REMINDER_CRON_SECRET` を付ける場合は JWT 検証をどうするかプロジェクト方針に合わせる。

## 手動テスト

```bash
curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/send-reminders" \
  -H "Authorization: Bearer <anon or service role>" \
  -H "Content-Type: application/json"
```

`REMINDER_CRON_SECRET` がある場合は `Authorization: Bearer <REMINDER_CRON_SECRET>`。

## pg_cron（毎朝 JST 9:00 相当）

1. Dashboard → Database → Extensions で `pg_cron` / `pg_net` を有効化（プランによる）。
2. SQL Editor で `net.http_post` で Edge URL を叩く `cron.schedule` を登録。
3. UTC `0 0 * * *` は **冬時間で JST 9:00**（サマータイム無し前提）。

## ロジックの単体テスト

アプリ側の純粋関数は `src/features/reminders/` の Vitest を参照。
