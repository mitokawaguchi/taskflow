# TaskFlow 実装指示書（LLM向け詳細ガイド）

このドキュメントは、LLMが迷わず実装できるよう、各タスクを**最小単位**に分解し、**具体的なコード例**を含めた実装指示書です。

---

## 目次

1. [現状把握](#1-現状把握)
2. [Phase 1: ガントチャート改善](#2-phase-1-ガントチャート改善)
3. [Phase 2: ダッシュボード改善](#3-phase-2-ダッシュボード改善)
4. [Phase 3: カテゴリ/ラベル機能追加](#4-phase-3-カテゴリラベル機能追加)
5. [Phase 4: 担当者機能（将来）](#5-phase-4-担当者機能将来)

---

## 1. 現状把握

### 実装済み機能

| 機能 | ファイル | 状態 |
|------|----------|------|
| カンバンボード | `KanbanBoard.jsx` | ✅ 完了（4列、D&D、進捗バー） |
| ダッシュボード | `Dashboard.jsx` | ✅ 基本完了（サマリー4枚、プロジェクト進捗） |
| ガントチャート | `GanttChart.jsx` | ⚠️ 基本のみ（開始日〜期限のバー描画なし） |
| トップバー | `App.jsx` | ✅ 完了（タブ、フィルター、検索、通知、アバター） |
| サイドバー | `App.jsx` | ✅ 完了（チームプレースホルダー、設定、ログアウト） |
| 設定モーダル | `App.jsx` | ✅ 基本完了 |
| データモデル | `api.js` | ✅ status, start_date, progress 対応済み |

### 未実装機能

| 機能 | 優先度 | 説明 |
|------|--------|------|
| ガント：開始日〜期限バー | 高 | `start_date` から `due` までのバー描画 |
| ガント：今日の赤点線 | 高 | 縦の赤い点線で今日を示す |
| ダッシュボード：円グラフ | 中 | プロジェクト進捗を円グラフ表示 |
| カテゴリ/ラベル | 中 | タスクにカテゴリタグを追加 |
| 担当者 | 低 | チーム・担当者機能 |

---

## 2. Phase 1: ガントチャート改善

### タスク 1-1: 今日の日付に赤い縦線を表示

**目的**: 今日の日付列に赤い点線を表示して、現在の日付を視覚的に明示する

**ファイル**: `src/GanttChart.jsx`

**手順**:

#### Step 1: CSSクラスを追加

`src/index.css` の `.gantt` セクションに以下を追加:

```css
/* ガント：今日の縦線 */
.gantt-today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--critical);
  border-left: 1px dashed var(--critical);
  z-index: 10;
  pointer-events: none;
}
```

#### Step 2: GanttChart.jsx を修正

**修正箇所**: `gantt-grid` の中に今日の縦線を追加

**変更前** (約107行目付近):
```jsx
        </div>
      </div>
    </div>
  )
```

**変更後**:
```jsx
        </div>
        {/* 今日の赤い縦線 */}
        {days.includes(todayStr) && (
          <div
            className="gantt-today-line"
            style={{
              left: `calc(200px + ${days.indexOf(todayStr) * DAY_WIDTH}px + ${DAY_WIDTH / 2}px)`,
            }}
          />
        )}
      </div>
    </div>
  )
```

#### Step 3: gantt-scroll に position: relative を追加

`src/index.css` の `.gantt-scroll` に追加:

```css
.gantt-scroll {
  /* 既存のスタイル... */
  position: relative;
}
```

---

### タスク 1-2: 開始日から期限までのバーを描画

**目的**: タスクに `start_date` がある場合、開始日から期限までの横長バーを描画する

**ファイル**: `src/GanttChart.jsx`

**手順**:

#### Step 1: バー描画ロジックを変更

**変更箇所**: `tasksWithDue.flatMap` 内のバー描画部分

**変更前** (約91-107行目):
```jsx
...days.map(d => (
  <div
    key={`${t.id}-${d}`}
    className={`gantt-cell ${d === todayStr ? 'today' : ''}`}
    onClick={handleOpen}
    role="button"
    tabIndex={0}
  >
    {t.due === d && (
      <div
        className="gantt-bar"
        style={{ background: proj?.color || 'var(--accent)' }}
        title={`${t.title} — ${formatDate(t.due)}（クリックで編集）`}
      />
    )}
  </div>
)),
```

**変更後**:
```jsx
...days.map((d, idx) => {
  const taskStart = t.startDate || t.due
  const taskEnd = t.due
  const isInRange = taskStart && taskEnd && d >= taskStart && d <= taskEnd
  const isStart = d === taskStart
  const isEnd = d === taskEnd
  
  return (
    <div
      key={`${t.id}-${d}`}
      className={`gantt-cell ${d === todayStr ? 'today' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
    >
      {isInRange && (
        <div
          className={`gantt-bar ${isStart ? 'gantt-bar--start' : ''} ${isEnd ? 'gantt-bar--end' : ''}`}
          style={{ background: proj?.color || 'var(--accent)' }}
          title={`${t.title} — ${taskStart !== taskEnd ? `${formatDate(taskStart)} 〜 ` : ''}${formatDate(taskEnd)}（クリックで編集）`}
        />
      )}
    </div>
  )
}),
```

#### Step 2: CSSにバーの角丸スタイルを追加

`src/index.css` に追加:

```css
.gantt-bar--start {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.gantt-bar--end {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
```

#### Step 3: フィルタ条件を修正

**変更箇所**: `tasksWithDue` の useMemo

**変更前** (約42-46行目):
```jsx
const tasksWithDue = useMemo(() => {
  return tasks
    .filter(t => t.due && t.due >= startDate && t.due <= endDate)
    .slice(0, 50)
}, [tasks, startDate, endDate])
```

**変更後**:
```jsx
const tasksWithDue = useMemo(() => {
  return tasks
    .filter(t => {
      const taskStart = t.startDate || t.due
      const taskEnd = t.due
      if (!taskEnd) return false
      // タスクの期間がガント表示期間と重なるか
      return taskStart <= endDate && taskEnd >= startDate
    })
    .slice(0, 50)
}, [tasks, startDate, endDate])
```

---

### タスク 1-3: ホバー時ツールチップの改善

**目的**: バーにホバーしたときに詳細なツールチップを表示

**ファイル**: `src/GanttChart.jsx`

**手順**:

#### Step 1: ツールチップ用のstate追加

**変更箇所**: コンポーネント冒頭

```jsx
const [tooltip, setTooltip] = useState(null)
```

#### Step 2: ツールチップコンポーネントを追加

**変更箇所**: return文の最後、閉じタグ直前

```jsx
{tooltip && (
  <div
    className="gantt-tooltip"
    style={{ left: tooltip.x, top: tooltip.y }}
  >
    <div className="gantt-tooltip__title">{tooltip.title}</div>
    <div className="gantt-tooltip__date">
      {tooltip.startDate && tooltip.startDate !== tooltip.endDate
        ? `${formatDate(tooltip.startDate)} 〜 ${formatDate(tooltip.endDate)}`
        : formatDate(tooltip.endDate)}
    </div>
    {tooltip.status && (
      <div className="gantt-tooltip__status">状態: {tooltip.status}</div>
    )}
  </div>
)}
```

#### Step 3: CSSを追加

```css
.gantt-tooltip {
  position: fixed;
  z-index: 100;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  pointer-events: none;
  font-size: 12px;
}

.gantt-tooltip__title {
  font-weight: 600;
  margin-bottom: 4px;
}

.gantt-tooltip__date {
  color: var(--text-muted);
}

.gantt-tooltip__status {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}
```

---

## 3. Phase 2: ダッシュボード改善

### タスク 2-1: 円グラフ/ドーナツチャートの追加

**目的**: プロジェクト進捗を視覚的な円グラフで表示

**ファイル**: `src/Dashboard.jsx`

**手順**:

#### Step 1: シンプルなSVG円グラフコンポーネントを作成

**変更箇所**: Dashboard.jsx の冒頭（export default の前）に追加

```jsx
function DonutChart({ percentage, color, size = 80 }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="donut-chart">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="donut-chart__text"
      >
        {percentage}%
      </text>
    </svg>
  )
}
```

#### Step 2: プロジェクト進捗セクションを円グラフ付きに変更

**変更前** (約60-76行目):
```jsx
projectProgress.map(({ project, total, done, pct }) => (
  <div key={project.id} className="dashboard-proj">
    <div className="dashboard-proj__head">
      <span className="dashboard-proj__name">{project.icon} {project.name}</span>
      <span className="dashboard-proj__pct">{pct}%</span>
    </div>
    <div className="dashboard-proj__bar">
      <div
        className="dashboard-proj__fill"
        style={{ width: `${pct}%`, background: project.color }}
      />
    </div>
    <div className="dashboard-proj__meta">{done} / {total} 完了</div>
  </div>
))
```

**変更後**:
```jsx
projectProgress.map(({ project, total, done, pct }) => (
  <div key={project.id} className="dashboard-proj dashboard-proj--with-chart">
    <DonutChart percentage={pct} color={project.color} size={64} />
    <div className="dashboard-proj__info">
      <div className="dashboard-proj__name">{project.icon} {project.name}</div>
      <div className="dashboard-proj__meta">{done} / {total} 完了</div>
    </div>
  </div>
))
```

#### Step 3: CSSを追加

```css
.donut-chart {
  flex-shrink: 0;
}

.donut-chart__text {
  font-size: 14px;
  font-weight: 600;
  fill: var(--text);
}

.dashboard-proj--with-chart {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.dashboard-proj__info {
  flex: 1;
  min-width: 0;
}
```

---

### タスク 2-2: ステータス別の横棒グラフ追加

**目的**: タスクの状態分布（未着手/進行中/レビュー中/完了）を棒グラフで表示

**ファイル**: `src/Dashboard.jsx`

**手順**:

#### Step 1: ステータス集計を追加

**変更箇所**: statsのuseMemo内

**変更前**:
```jsx
const stats = useMemo(() => {
  const all = tasks.length
  const done = tasks.filter(t => t.done).length
  const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'review').length
  const overdue = tasks.filter(t => !t.done && isOverdue(t.due)).length
  const todayCount = tasks.filter(t => !t.done && isToday(t.due)).length
  return { all, done, inProgress, overdue, todayCount }
}, [tasks])
```

**変更後**:
```jsx
const stats = useMemo(() => {
  const all = tasks.length
  const done = tasks.filter(t => t.done).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const review = tasks.filter(t => t.status === 'review').length
  const todo = tasks.filter(t => t.status === 'todo' || (!t.status && !t.done)).length
  const overdue = tasks.filter(t => !t.done && isOverdue(t.due)).length
  const todayCount = tasks.filter(t => !t.done && isToday(t.due)).length
  
  const statusBreakdown = [
    { key: 'todo', label: '未着手', count: todo, color: 'var(--text-muted)' },
    { key: 'in_progress', label: '進行中', count: inProgress, color: 'var(--accent)' },
    { key: 'review', label: 'レビュー中', count: review, color: '#ff8c42' },
    { key: 'done', label: '完了', count: done, color: '#06d6a0' },
  ]
  
  return { all, done, inProgress: inProgress + review, overdue, todayCount, statusBreakdown }
}, [tasks])
```

#### Step 2: 横棒グラフセクションを追加

**変更箇所**: プロジェクト進捗セクションの後に追加

```jsx
<div className="dashboard-section">
  <h2 className="dashboard-section__title">タスク状態の分布</h2>
  <div className="dashboard-status-chart">
    {stats.statusBreakdown.map(item => (
      <div key={item.key} className="dashboard-status-row">
        <span className="dashboard-status-label">{item.label}</span>
        <div className="dashboard-status-bar-wrap">
          <div
            className="dashboard-status-bar"
            style={{
              width: stats.all > 0 ? `${(item.count / stats.all) * 100}%` : '0%',
              background: item.color,
            }}
          />
        </div>
        <span className="dashboard-status-count">{item.count}</span>
      </div>
    ))}
  </div>
</div>
```

#### Step 3: CSSを追加

```css
.dashboard-status-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-status-label {
  width: 80px;
  font-size: 13px;
  color: var(--text-muted);
}

.dashboard-status-bar-wrap {
  flex: 1;
  height: 20px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.dashboard-status-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dashboard-status-count {
  width: 40px;
  text-align: right;
  font-weight: 600;
  font-size: 14px;
}
```

---

## 4. Phase 3: カテゴリ/ラベル機能追加

### タスク 3-1: データモデルにカテゴリを追加

**目的**: タスクにカテゴリ（デザイン/開発/バグ修正等）を追加

**手順**:

#### Step 1: SQLでカラム追加

`docs/` に新規ファイル `SUPABASE_CATEGORY.sql` を作成:

```sql
-- タスクにカテゴリを追加
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS category TEXT;

-- カテゴリマスタ（任意）
CREATE TABLE IF NOT EXISTS public.tf_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280'
);

-- 初期データ
INSERT INTO public.tf_categories (id, name, color) VALUES
  ('design', 'デザイン', '#3b82f6'),
  ('dev', '開発', '#8b5cf6'),
  ('bug', 'バグ修正', '#ef4444'),
  ('docs', 'ドキュメント', '#06b6d4'),
  ('other', 'その他', '#6b7280')
ON CONFLICT (id) DO NOTHING;
```

#### Step 2: constants.js にカテゴリ定数を追加

**変更箇所**: `src/constants.js` の末尾に追加

```javascript
/** タスクカテゴリ */
export const TASK_CATEGORIES = {
  design: { label: 'デザイン', color: '#3b82f6' },
  dev: { label: '開発', color: '#8b5cf6' },
  bug: { label: 'バグ修正', color: '#ef4444' },
  docs: { label: 'ドキュメント', color: '#06b6d4' },
  other: { label: 'その他', color: '#6b7280' },
}

export const CATEGORY_KEYS = ['design', 'dev', 'bug', 'docs', 'other']
```

#### Step 3: api.js を修正

**変更箇所**: `taskFromRow` 関数

**変更前**:
```javascript
function taskFromRow(row) {
  if (!row) return null
  const status = TASK_STATUS_KEYS.includes(row.status) ? row.status : (row.done ? 'done' : 'todo')
  const progress = row.progress != null && row.progress >= 0 && row.progress <= 100 ? row.progress : null
  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? '',
    priority: row.priority ?? 'medium',
    projectId: row.project_id,
    due: row.due ?? '',
    done: status === 'done' || Boolean(row.done),
    status,
    startDate: row.start_date ?? '',
    progress,
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}
```

**変更後**:
```javascript
function taskFromRow(row) {
  if (!row) return null
  const status = TASK_STATUS_KEYS.includes(row.status) ? row.status : (row.done ? 'done' : 'todo')
  const progress = row.progress != null && row.progress >= 0 && row.progress <= 100 ? row.progress : null
  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? '',
    priority: row.priority ?? 'medium',
    projectId: row.project_id,
    due: row.due ?? '',
    done: status === 'done' || Boolean(row.done),
    status,
    startDate: row.start_date ?? '',
    progress,
    category: row.category ?? null,
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}
```

**変更箇所**: `insertTask` 関数

**変更前の row オブジェクト**:
```javascript
const row = {
  id: task.id,
  project_id: task.projectId,
  title: task.title,
  desc: task.desc ?? '',
  priority: task.priority ?? 'medium',
  due: task.due || null,
  done: status === 'done',
  status,
  start_date: task.startDate || null,
  progress: task.progress != null && task.progress >= 0 && task.progress <= 100 ? task.progress : null,
  created: task.created,
}
```

**変更後**:
```javascript
const row = {
  id: task.id,
  project_id: task.projectId,
  title: task.title,
  desc: task.desc ?? '',
  priority: task.priority ?? 'medium',
  due: task.due || null,
  done: status === 'done',
  status,
  start_date: task.startDate || null,
  progress: task.progress != null && task.progress >= 0 && task.progress <= 100 ? task.progress : null,
  category: task.category || null,
  created: task.created,
}
```

**変更箇所**: `updateTask` 関数に追加

```javascript
if (patch.category !== undefined) row.category = patch.category || null
```

---

### タスク 3-2: TaskForm にカテゴリ選択を追加

**目的**: タスク作成/編集時にカテゴリを選択できるようにする

**ファイル**: `src/TaskForm.jsx`

**手順**:

#### Step 1: インポートを追加

```javascript
import { TASK_CATEGORIES, CATEGORY_KEYS } from './constants'
```

#### Step 2: フォームのstateにcategoryを追加

**変更箇所**: useState の初期値

```javascript
const [category, setCategory] = useState(task?.category ?? '')
```

#### Step 3: フォーム内にカテゴリ選択UIを追加

プロジェクト選択の後に追加:

```jsx
<div className="form-group">
  <label className="form-label">カテゴリ</label>
  <select
    className="form-input"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">なし</option>
    {CATEGORY_KEYS.map((key) => (
      <option key={key} value={key}>
        {TASK_CATEGORIES[key].label}
      </option>
    ))}
  </select>
</div>
```

#### Step 4: onSave に category を含める

**変更箇所**: handleSubmit 内の onSave 呼び出し

```javascript
onSave({
  title,
  desc,
  priority,
  projectId,
  due,
  status,
  startDate,
  progress: progressVal,
  category: category || null,
})
```

---

### タスク 3-3: カード・カンバンにカテゴリラベル表示

**目的**: タスクカード・カンバンカードにカテゴリの色付きラベルを表示

**ファイル**: `src/TaskCard.jsx`, `src/KanbanBoard.jsx`

**手順**:

#### Step 1: TaskCard.jsx にカテゴリラベルを追加

**インポート追加**:
```javascript
import { TASK_CATEGORIES } from './constants'
```

**変更箇所**: カードのJSX内（優先度バッジの近く）

```jsx
{task.category && TASK_CATEGORIES[task.category] && (
  <span
    className="category-badge"
    style={{
      background: `${TASK_CATEGORIES[task.category].color}20`,
      color: TASK_CATEGORIES[task.category].color,
      border: `1px solid ${TASK_CATEGORIES[task.category].color}40`,
    }}
  >
    {TASK_CATEGORIES[task.category].label}
  </span>
)}
```

#### Step 2: KanbanBoard.jsx にカテゴリラベルを追加

**インポート追加**:
```javascript
import { TASK_CATEGORIES } from './constants'
```

**変更箇所**: KanbanCard および DraggableKanbanCard 内のタイトル下

```jsx
{task.category && TASK_CATEGORIES[task.category] && (
  <span
    className="kanban-card__category"
    style={{
      background: `${TASK_CATEGORIES[task.category].color}20`,
      color: TASK_CATEGORIES[task.category].color,
    }}
  >
    {TASK_CATEGORIES[task.category].label}
  </span>
)}
```

#### Step 3: CSSを追加

```css
/* カテゴリラベル */
.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.kanban-card__category {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  margin-top: 4px;
}
```

---

## 5. Phase 4: 担当者機能（将来）

> **注意**: この機能はスキーマ変更が大きいため、Phase 1〜3 完了後に実装することを推奨

### 概要

1. **ユーザーテーブル追加**: `tf_users` テーブルを作成
2. **タスクに担当者追加**: `tf_tasks.assignee_id` カラム追加
3. **チームメンバー表示**: サイドバーにアバター一覧
4. **担当者フィルター**: トップバーでメンバー絞り込み

### SQL（参考）

```sql
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.tf_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created BIGINT NOT NULL
);

-- タスクに担当者追加
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS assignee_id TEXT REFERENCES public.tf_users(id);
```

---

## 実装順序チェックリスト

以下の順序で実装してください:

### Phase 1: ガントチャート改善
- [ ] タスク 1-1: 今日の赤い縦線
- [ ] タスク 1-2: 開始日〜期限バー
- [ ] タスク 1-3: ホバーツールチップ（任意）

### Phase 2: ダッシュボード改善
- [ ] タスク 2-1: 円グラフ追加
- [ ] タスク 2-2: ステータス別棒グラフ

### Phase 3: カテゴリ機能
- [ ] タスク 3-1: データモデル拡張
- [ ] タスク 3-2: TaskForm にカテゴリ選択
- [ ] タスク 3-3: カード表示にカテゴリラベル

### Phase 4: 担当者機能（将来）
- [ ] ユーザーテーブル作成
- [ ] タスクに担当者追加
- [ ] UI実装

---

## 注意事項

1. **CSS変数の使用**: 色は直接指定せず、CSS変数（`var(--accent)`, `var(--critical)` 等）を使用
2. **既存スタイルの維持**: ライト/ダークモードの切り替えに対応するため、ハードコードされた色は避ける
3. **レスポンシブ対応**: 新しいUIはモバイル表示も考慮する
4. **Lintエラーの確認**: 変更後は必ず `npm run lint` でエラーがないか確認

---

## 参照ドキュメント

- `docs/REFERENCE_DESIGN_GAP_AND_PLAN.md`: 元の差分分析
- `docs/DESIGN_CHANGES_SUMMARY.md`: デザイン変更の概要
- `docs/SUPABASE_TASKS_SCHEMA.sql`: タスクテーブルのスキーマ
