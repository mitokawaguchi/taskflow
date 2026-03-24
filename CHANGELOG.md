# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/ja/).

## [Unreleased]

### Added
- GitHub Actions CI（typecheck / build / unit test）
- CONTRIBUTING.md
- 品質・ロードマップ（内部ドキュメントで管理）

### Changed
- App.jsx: useTaskActions, useProjectActions, useTemplateActions, useClientActions, Sidebar, ProjectCard で短縮
- api: 全モジュールを TypeScript 化（helpers, auth, categories, projects, tasks, templates, users, clients, remember）

## [0.1.0] - 初回

- タスク・プロジェクト・テンプレート・クライアント・覚えておくこと
- Supabase 連携、RLS 用 SQL ドキュメント
