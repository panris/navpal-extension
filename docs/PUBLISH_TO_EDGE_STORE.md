# NavPal Extension - Microsoft Edge 扩展商店发布指南

> Edge 扩展商店对开发者免费开放，无需注册费用，无需信用卡，审核周期一般 1-2 个工作日。

## 一、Edge vs Chrome 商店对比

| 项目 | Edge Add-ons | Chrome Web Store |
|------|-------------|------------------|
| 注册费 | **免费** | $5.00 USD |
| 信用卡 | **不需要** | 需要 |
| 审核周期 | 1-2 个工作日 | 1-3 个工作日 |
| 兼容性 | Chromium 内核，MV3 直接兼容 | 原生 |
| 用户基数 | 国内用户占比高 | 全球用户最多 |
| 上架链接 | https://partner.microsoft.com/dashboard | https://chrome.google.com/webstore/devconsole |

## 二、上架前准备清单

### 2.1 代码兼容性确认

- [x] Manifest V3 规范 — Edge 完全支持
- [x] 权限仅使用 `storage` — 最小化权限原则
- [x] 图标已改为 PNG 格式（16/48/128 px）
- [x] 隐私政策文档已准备
- [ ] 截图准备（详见「截图准备」章节）

### 2.2 需要准备的文件

| 文件 | 说明 | 位置 |
|------|------|------|
| `navpal-extension-v{x.y.z}.zip` | 构建产物的 ZIP 包 | `releases/` 目录 |
| `icon512.png` | 商店页面图标 | 构建后 `dist/icons/` |
| 截图 × 1-5 张 | 展示功能截图 | 手动截取，1280×800 px 推荐 |
| 隐私政策 URL | 可用的隐私政策页面链接 | 建议使用 GitHub Pages |

## 三、构建与打包

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 构建生产版本 + 生成图标 + 打包 ZIP
npm run build

# 3. ZIP 包已生成在以下位置：
#    - dist/navpal-extension-v0.1.0.zip
#    - releases/navpal-extension-v0.1.0.zip
```

构建输出（`dist/` 目录结构）：
```
dist/
├── manifest.json
├── icons/
│   ├── icon16.png      ← manifest 引用
│   ├── icon48.png      ← manifest 引用
│   ├── icon128.png     ← manifest 引用
│   └── icon512.png     ← 商店提交用
├── assets/
│   ├── background.js   ← Service Worker
│   ├── popup.js
│   ├── fullpage.js
│   └── style.css
├── index.html
├── src/popup/index.html
└── navpal-extension-v0.1.0.zip
```

## 四、注册开发者账号

1. 访问 [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
2. 使用 **Microsoft 账号**登录（Outlook/Hotmail 均可，无需企业账号）
3. 选择 **"Microsoft Edge 扩展"** 项目类型
4. 填写开发者/公司信息：
   - 开发者名称（显示在商店页面）
   - 联系邮箱
   - 国家/地区
5. 提交注册，**无需支付任何费用**

> 提示：如果已经有 Microsoft 账号（用 OneDrive/Office 等），直接登录即可。否则免费注册一个 Outlook 邮箱。

## 五、提交扩展

### 5.1 创建新扩展

1. 在 Partner Center 点击 **"创建新扩展"**
2. 上传 `navpal-extension-v0.1.0.zip`
3. 系统会自动读取 `manifest.json` 中的信息

### 5.2 填写商店信息

#### 基本信息

| 字段 | 内容 |
|------|------|
| **名称 / Name** | 伴航 NavPal |
| **类别 / Category** | 生产力工具 (Productivity) |
| **标签 / Tags** | 导航、书签、效率、隐私、书签管理器 |
| **语言 / Language** | 中文（简体）、English |

#### 描述 (Description)

**中文描述：**
```
伴航 NavPal 是一款专为多网络环境用户设计的轻量高频网址工作台，支持分组管理、地域标识和物理级防窥保护。

🌟 核心功能
• 分组管理 — 7 大预置分组（AI 工具、开发、设计、工作、工具箱、影音、娱乐），覆盖 85+ 精选站点
• 地域标识 — 自动标记 CN/Global，根据语言智能过滤书签
• 物理级防窥 — 隐藏项完全不渲染 DOM，3 位 PIN 码解锁，最多 3 次尝试后锁定
• 拖拽排序 — 编辑模式下使用拖拽自由排列书签顺序
• 右键菜单 — 复制链接、新标签打开、移动到分组、隐藏/删除
• 批量操作 — 勾选多个书签进行批量管理
• 键盘导航 — 完整方向键 + 快捷键支持
• 数据导入导出 — JSON 格式备份恢复，含严格类型验证
• 中英双语 — 100+ UI 文本完整翻译，跟随系统或手动切换
• 4 套主题 — Light / Dark / Purple / Minimal

💡 为什么选择 NavPal？
✓ 即装即用 — 85 个精选书签覆盖开发者日常工作 7 大领域
✓ 真正的隐私保护 — 隐藏的书签在 DOM 中完全不可见
✓ 多环境不混乱 — CN/Global 标签根据语言自动筛选
✓ 免费无广告 — 开源项目 (MIT)，纯粹只为效率

🔒 隐私说明
所有书签数据和设置均存储在本地浏览器中，不会上传到任何服务器。项目开源可审计。

GitHub: https://github.com/panris/navpal-extension
```

**English Description：**
```
NavPal is a lightweight, high-frequency URL workstation designed for multi-network users, featuring group management, region labeling, and physical-grade privacy protection.

🌟 Key Features
• Group Management — 7 preset groups (AI Tools, Dev, Design, Work, Toolbox, Media, Entertainment) covering 85+ handpicked sites
• Region Labeling — Auto-tags sites as CN/Global with smart filtering based on language
• Physical-Grade Privacy — Hidden items are completely removed from the DOM. Unlock with a 3-digit PIN, auto-locks after 3 failed attempts
• Drag & Drop — Freely reorder bookmarks in edit mode
• Context Menu — Copy link, open in new tab, move to group, hide/delete
• Batch Actions — Select multiple bookmarks for bulk management
• Keyboard Navigation — Full arrow key + shortcut support
• Import/Export — JSON backup with strict type validation
• Bilingual — 100+ UI translations in Chinese and English
• 4 Themes — Light / Dark / Purple / Minimal

💡 Why NavPal?
✓ Ready to use — 85 handpicked bookmarks covering 7 dev domains
✓ True privacy — Hidden bookmarks are completely absent from the DOM
✓ No clutter across environments — CN/Global tags auto-filter by language
✓ Free & ad-free — Open source (MIT), built purely for efficiency

🔒 Privacy
All bookmark data and settings are stored locally in your browser. Nothing is uploaded to any server. Fully open-source and auditable.

GitHub: https://github.com/panris/navpal-extension
```

### 5.3 图标

上传 `dist/icons/icon512.png` 作为商店页面图标。

### 5.4 截图（必需）

- 上传 **1-5 张** 截图
- 推荐尺寸：**1280 × 800 px** 或 **640 × 400 px**
- 格式：**PNG**
- 截图内容建议：
  - 截图 1：Popup 主界面（分组标签 + 书签网格）
  - 截图 2：编辑模式（展示拖拽排序功能）
  - 截图 3：设置面板（展示主题切换、数据导入导出）
  - 截图 4：无痕模式（展示 PIN 码输入界面）
  - 截图 5：右键菜单或批量操作

### 5.5 隐私政策

- 上传隐私政策文档，或提供隐私政策 URL
- 建议使用 **GitHub Pages** 托管隐私政策页面

> 快速托管方案：将 `docs/privacy-policy.md` 内容放到 GitHub 仓库的 wiki 页面或 GitHub Pages，获得一个永久 URL。

### 5.6 权限说明

Edge 审核要求对每个权限提供用途解释：

| 权限 | 说明 |
|------|------|
| `storage` | 用于在本地存储用户的书签数据、分组信息和偏好设置。所有数据仅保存在用户设备上，不会传输到任何远程服务器。 |

### 5.7 提交审核

1. 检查所有必填项是否完成
2. 点击 **"提交 / Publish"**
3. 等待审核（通常 1-2 个工作日）
4. 审核结果会通过邮件通知

## 六、截图制作指南

### 方法一：Chrome/Edge 开发者工具截取（推荐）

1. 开发模式下加载扩展：`npm run dev`
2. 打开浏览器的 DevTools（F12）
3. 点击 `⋮` → More tools → Responsive
4. 设置尺寸为 `1280 × 800`
5. 在扩展弹窗上右键 → **Capture node screenshot**
6. 重复操作截取不同功能页面

### 方法二：使用截图工具

使用 CleanShot X / Snipaste / Xnip 等工具，精确截取扩展弹窗。

### 截图检查清单

- [ ] 每张截图清晰展示一个核心功能
- [ ] 截图内容与实际功能一致（不要 P 图过度）
- [ ] 避免截图中包含个人信息
- [ ] 截图尺寸统一为 1280 × 800

## 七、审核常见拒绝原因

| 原因 | 预防措施 |
|------|----------|
| 权限说明不清 | 在提交表单中对每个 `permissions` 项提供清晰的用途说明 |
| 描述与实际功能不符 | 确保描述中提到的每项功能都已实际实现 |
| 隐私政策缺失 | 提供可访问的隐私政策 URL |
| 图标不符合规范 | 确保已上传至少 128×128 PNG 图标 |
| 截图模糊或与功能无关 | 使用 1280×800 高清截图 |

## 八、发布后工作

### 版本更新流程

```bash
# 1. 更新 package.json 中的版本号
# "version": "0.1.0" -> "0.2.0"

# 2. 构建新版本
npm run build

# 3. 上传新的 ZIP 到 Partner Center
# 4. 填写版本更新说明
# 5. 提交审核
```

### 收集用户反馈

- 在 GitHub Issues 跟踪 bug 和功能请求
- 在扩展中内置反馈入口（可在设置面板添加链接）
- 监控 Edge 商店用户评论

## 九、有用链接

- [Microsoft Edge 扩展开发文档](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Edge 扩展商店发布指南](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
- [Edge 扩展最佳实践](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/best-practices)
- [GitHub Pages 部署教程](https://pages.github.com/)

## 十、联系方式

- GitHub: https://github.com/panris/navpal-extension
- GitHub Issues: https://github.com/panris/navpal-extension/issues

---

**最后更新：2026-10-06**