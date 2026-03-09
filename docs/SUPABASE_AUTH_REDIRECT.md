# Supabase Auth メール確認リンクのリダイレクト先

## 現象
確認メールのリンクを踏むと **localhost** に飛ばされて弾かれる。

## 原因
- メール内のリンクは Supabase の「サイトURL」や `signUp` 時の `emailRedirectTo` で決まる。
- 本番で開いているアプリでサインアップすれば、アプリ側では `window.location.origin` を `emailRedirectTo` に渡しているため、**本番URL** がメールに含まれる。

## 対応（本番で使う場合）

1. **Supabase ダッシュボード**
   - **Authentication** → **URL Configuration**
   - **Site URL**: 本番のURL（例: `https://your-app.vercel.app`）
   - **Redirect URLs**: 上記に加え、開発用に `http://localhost:5173` なども追加してOK

2. **本番でサインアップする**
   - 本番URLでアプリを開いて「アカウント作成」を行うと、確認メールのリンクも本番URLになる。

3. **ローカルでサインアップした場合**
   - メールのリンクは `http://localhost:...` になる。本番では使えないので、本番URLで改めてサインアップするか、Supabase の「メール確認を無効化」で即ログインにする。

## まとめ
- アプリは `signUp` 時に `emailRedirectTo: window.location.origin + '/'` を渡している。
- 本番運用する場合は Supabase の **Site URL** を本番URLにし、**本番のアプリから**アカウント作成すれば、メールのリンクは本番で開ける。
