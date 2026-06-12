# 伴航 NavPal

> 专为多网络环境用户设计的轻量高频网址工作台，具备物理级防窥功能

## 核心特性

- **即用即走** - 点击图标即可展开 Popup，无需打开新标签页
- **分组管理** - 按属性（AI工具、开发、后台、娱乐等）分块看板展示
- **地域标识** - 自动识别国内外网站 (CN/Global 标签)
- **隐私保护** - 隐藏项完全不渲染 DOM，无痕模式安全切换
- **极速体验** - 首屏 FCP 控制在 120ms 以内

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite + CRX/RMP |
| 规范 | Chrome Manifest V3 |
| 状态 | Zustand |
| 样式 | Tailwind CSS |
| 存储 | chrome.storage.local |

## 项目结构

```
navpal-extension/
├── src/
│   ├── popup/          # Popup 视图
│   ├── background/     # Service Worker
│   ├── content/        # Content Scripts
│   ├── components/     # 公共组件
│   ├── hooks/          # 自定义 Hooks
│   ├── stores/         # Zustand Store
│   ├── utils/          # 工具函数
│   └── types/          # TypeScript 类型
├── public/
├── package.json
└── README.md
```

## 任务看板

| # | 任务 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | Manifest V3 项目初始化 | P0 | ⏳ |
| 2 | Popup 基础框架 | P0 | ⏳ |
| 3 | 分组 CRUD + 拖拽 | P0 | ⏳ |
| 4 | 网站 CRUD + 拖拽 | P0 | ⏳ |
| 5 | CN/Global 标签系统 | P0 | ⏳ |
| 6 | 隐藏模式 | P0 | ⏳ |
| 7 | 全量无痕模式 | P0 | ⏳ |
| 8 | Seed Data | P1 | ⏳ |
| 9 | 性能优化 | P1 | ⏳ |
| 10 | 快捷搜索 | P1 | ⏳ |

## 图标说明

Chrome 扩展需要 PNG 格式图标。请使用以下命令生成（或手动转换为 PNG）:

```bash
# 安装 convert (ImageMagick)
brew install imagemagick

# 转换 SVG 为 PNG
convert public/icons/icon16.svg public/icons/icon16.png
convert public/icons/icon48.svg public/icons/icon48.png
convert public/icons/icon128.svg public/icons/icon128.png
```

## 开发指南

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## License

MIT
