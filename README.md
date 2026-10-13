# 伴航 NavPal

> 专为多网络环境用户设计的轻量高频网址工作台，具备物理级防窥功能

## 核心特性

- **即用即走** — 点击图标即可展开 Popup，无需打开新标签页
- **分组管理** — 按属性（AI 工具、开发、后台、娱乐等）分块看板，85+ 精选书签即装即用
- **地域标识** — 自动识别国内外网站（CN/Global 标签），根据语言智能过滤
- **隐私保护** — 隐藏项完全不渲染 DOM，3 位 PIN 码解锁无痕模式，3 次失败后自动锁定
- **拖拽排序** — 编辑模式下自由拖拽排列书签
- **批量操作** — 勾选多个书签进行批量隐藏/删除/移动
- **键盘导航** — 完整方向键 + 快捷键支持
- **中英双语** — 100+ UI 文本完整翻译
- **数据导入导出** — JSON 格式备份恢复，含严格类型验证

## 安装方式

### 方式一：Edge 扩展商店（推荐，免费）

*即将上线* — 从 Microsoft Edge Add-ons 商店一键安装。

### 方式二：Chrome / Edge 开发者模式加载

```bash
# 1. 克隆仓库
git clone https://github.com/panris/navpal-extension.git
cd navpal-extension

# 2. 安装依赖
npm install

# 3. 构建
npm run build
```

4. 打开浏览器扩展管理页面：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
5. 开启右上角 **「开发者模式」**
6. 点击 **「加载解压缩的扩展」**，选择项目的 `dist/` 目录
7. 完成！点击浏览器工具栏的 NavPal 图标开始使用

### 方式三：GitHub Release 安装

从 [Releases](https://github.com/panris/navpal-extension/releases) 页面下载最新 ZIP 包，解压后在浏览器开发者模式下加载。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 规范 | Chrome Manifest V3 |
| 状态 | Zustand (persist → chrome.storage.local) |
| 样式 | Tailwind CSS 3 |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 图标 | Lucide React |

## 项目结构

```
navpal-extension/
├── src/
│   ├── popup/          # Popup 视图
│   ├── fullpage/       # 完整页面视图
│   ├── background/     # Service Worker
│   ├── components/     # 15 个公共组件
│   ├── hooks/          # 自定义 Hooks
│   ├── stores/         # Zustand Store
│   ├── utils/          # 工具函数 (i18n/导入导出/可见性等)
│   ├── constants/      # 常量定义
│   └── types/          # TypeScript 类型
├── public/
│   └── manifest.json   # 扩展 manifest
├── docs/               # 文档
│   ├── PUBLISH_TO_EDGE_STORE.md   # Edge 商店上架指南
│   ├── PUBLISH_TO_CHROME_STORE.md # Chrome 商店上架指南
│   ├── privacy-policy.html        # 隐私政策页面
│   └── OPTIMIZATION_TASKS.md     # 优化任务清单
├── scripts/            # 构建脚本
├── package.json
└── README.md
```

## 开发指南

```bash
# 安装依赖
npm install

# 开发模式 (热更新)
npm run dev

# 构建生产版本
npm run build
```

## 隐私

所有书签数据和设置均存储在本地浏览器中，不会上传到任何服务器。[隐私政策](./docs/privacy-policy.html)

## License

MIT