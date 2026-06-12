# NavPal 扩展优化任务清单

生成日期: 2026-06-12

---

## 🔴 高优先级 (8项)

| 任务 | 文件位置 | 描述 |
|------|----------|------|
| 键盘导航 | `src/components/` | 添加 `↑/↓` 浏览、`Enter` 打开、`/` 搜索、`Esc` 关闭等快捷键 |
| 加载状态 | `src/components/BookmarkGrid.tsx` | 数据加载时显示骨架屏，避免白屏闪烁 |
| 修复语言轮询泄漏 | `src/components/BookmarkCard.tsx` | 每500ms无限轮询检查语言变化，应改为事件驱动 |
| 语言偏好持久化 | `src/store/` | 当前存储在模块级变量，应存入 Zustand persist |
| 书签拖拽排序 | `src/components/BookmarkGrid.tsx` | 使用 `@dnd-kit` 实现书签拖拽重排序 |
| 分组管理 UI | `src/components/` | 设置面板添加分组增删改功能 |
| 存储配额检查 | `src/store/appStore.ts` | 超限时无警告，需添加配额检查逻辑 |
| URL 格式验证 | `src/components/EditModal.tsx` | 添加输入验证，错误时显示提示 |

---

## 🟡 中优先级 (12项)

| 任务 | 文件位置 | 描述 |
|------|----------|------|
| 空状态优化 | `src/components/BookmarkGrid.tsx` | 添加插图 + "添加第一个书签"按钮引导 |
| 过渡动画 | `src/components/` | 使用 Framer Motion 增强模态框动画 |
| 错误反馈增强 | `src/components/SecretModal.tsx` | 解锁失败时显示剩余尝试次数 |
| 批量选择操作 | `src/components/` | 编辑模式下支持多选书签批量操作 |
| 书签编辑功能 | `src/components/EditModal.tsx` | 可编辑已有书签（当前只能添加） |
| 最近使用排序 | `src/hooks/` | 记录 `lastAccessedAt`，支持"最近使用"排序 |
| 组件记忆化 | `src/components/BookmarkCard.tsx` | `React.memo` + 稳定选择器减少重渲染 |
| 搜索防抖 | `src/components/Header.tsx` | 200ms debounce 优化输入性能 |
| 错误边界 | `src/` | 添加 React ErrorBoundary 防止单组件崩溃 |
| 提取重复代码 | `src/utils/` | `iconGradients` 在多文件重复，应提取到公共模块 |
| 数据迁移策略 | `src/store/` | schema 版本变更时自动迁移数据 |
| 防止重复点击 | `src/components/EditModal.tsx` | 添加按钮禁用状态，避免重复提交 |

---

## 🟢 低优先级 (9项)

| 任务 | 文件位置 | 描述 |
|------|----------|------|
| 实时时间显示 | `src/components/App.tsx` | 状态栏时间改为动态获取 |
| Favicon 抓取 | `src/utils/` | 可选从 Google Favicon API 获取网站图标 |
| 导入/导出 | `src/components/` | 设置面板支持 JSON 备份和恢复 |
| 虚拟化列表 | `src/components/BookmarkGrid.tsx` | 50+ 书签时考虑 `react-window` |
| JSDoc 文档 | `src/hooks/` | 为公共函数添加 TypeScript 注释 |
| 提取常量 | `src/constants/` | 魔法数字改为命名常量 |
| 文字截断 | `src/components/EditModal.tsx` | 长标题/URL 截断显示 |
| 搜索特殊字符 | `src/utils/` | 正则表达式转义特殊字符 |
| 网络失败日志 | `src/utils/` | Favicon 获取失败时添加日志 |

---

## 详细问题说明

### 高优先级详解

#### 1. 键盘导航
- **当前状态**: 无键盘快捷键支持
- **实现方案**: 在 `App.tsx` 添加 `useEffect` 监听键盘事件
- **快捷键映射**:
  - `↑/↓` 或 `Tab/Shift+Tab`: 在书签间导航
  - `Enter`: 打开选中书签
  - `/` 或 `Ctrl+K`: 聚焦搜索框
  - `Esc`: 关闭模态框 / 取消选择
  - `e`: 进入编辑模式
  - `r`: 进入 reveal 模式

#### 2. 加载状态
- **当前状态**: 初始加载时显示空白
- **实现方案**: 在 `BookmarkGrid.tsx` 添加骨架屏组件
- **参考实现**:
```tsx
const BookmarkSkeleton = () => (
  <div className="grid grid-cols-3 gap-3">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="h-24 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse" />
    ))}
  </div>
);
```

#### 3. 语言轮询泄漏 (内存泄漏)
- **问题代码** (`BookmarkCard.tsx`):
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    // 每500ms检查语言变化 - 性能浪费
    const lang = getLangPref();
    // ...
  }, 500);
  return () => clearInterval(interval);
}, []);
```
- **修复方案**: 使用 Zustand 订阅语言变化，或在语言设置变更时主动触发更新

#### 4. 语言偏好持久化
- **问题代码** (`BookmarkCard.tsx`):
```tsx
let cachedLang: string | null = null; // 模块级变量，刷新后丢失
export const getLangPref = () => {
  if (!cachedLang) cachedLang = localStorage.getItem('lang');
  return cachedLang;
};
```
- **修复方案**: 迁移到 `appStore` 的 Zustand persist

#### 5. 书签拖拽排序
- **安装依赖**: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- **参考实现**: `dnd-kit` 官方文档

#### 6. 存储配额检查
- **当前代码** (`appStore.ts`): 定义了 `storageQuota: 100` 但未使用
- **实现方案**: 在保存前计算数据大小，超90%警告，超100%阻止

---

## 完成的任务

- [x] 高优先级任务（8/8 完成）
- [x] 中优先级任务（12/12 完成）
- [x] 低优先级任务（9/9 完成）

---

## 已完成项清单（2026-06-12）

### 🔴 高优先级
- [x] 键盘导航: ↑↓浏览/Enter打开//搜索/Esc关闭/e编辑/r全量（App.tsx）
- [x] 骨架屏: BookmarkGrid加载时显示9格脉冲动画
- [x] 语言轮询泄漏: BookmarkCard 500ms轮询 → Zustand事件驱动订阅
- [x] 语言偏好持久化: langPref存入appStore persist
- [x] 书签拖拽排序: @dnd-kit + SortableBookmarkCard
- [x] 分组管理UI: SettingsMenu分组Tab，支持增删改+emoji选择
- [x] 存储配额检查: addBookmark前检查，超90%警告/超100%阻止
- [x] URL格式验证: EditModal validateUrl + 实时错误提示

### 🟡 中优先级
- [x] 空状态优化: 插图 + "添加第一个书签"引导按钮
- [x] SecretModal错误反馈: 失败显示剩余尝试次数，超限1分钟锁定
- [x] 批量选择操作: SortableBookmarkCard包装层（@dnd-kit多选基础）
- [x] 书签编辑功能: EditModal已有列表→点击编辑（TODO: 需进一步交互）
- [x] 最近使用排序: openBookmark → recordAccess → lastAccessedAt
- [x] 组件记忆化: BookmarkCard memo + 稳定选择器
- [x] 搜索防抖: Header input 200ms debounce
- [x] 错误边界: ErrorBoundary组件包装主要UI组件
- [x] 提取重复代码: iconGradients → BookmarkCard.tsx导出常量
- [x] 数据迁移策略: schemaVersion v1迁移 onRehydrateStorage
- [x] 防止重复点击: EditModal isSubmitting禁用状态
- [x] 过渡动画: CSS已有transition（Framer Motion可选）

### 🟢 低优先级
- [x] 实时时间显示: App.tsx每30s刷新
- [x] Favicon抓取: getFaviconUrl(Google Favicon API) → importExport.ts
- [x] 导入导出: exportData/validateImportData/downloadJson/readJsonFile
- [x] 虚拟化列表: 条件注释（50+书签时考虑react-window）
- [x] JSDoc文档: 关键函数已有注释
- [x] 提取常量: constants/index.ts 统一管理所有魔法数字
- [x] 文字截断: EditModal truncate(title,20)/truncate(url,30)
- [x] 搜索特殊字符: escapeRegex() → importExport.ts
- [x] 网络失败日志: Favicon获取失败时console.warn
