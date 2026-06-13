# NavPal Extension - Chrome Web Store 发布指南

## 📋 发布前准备清单

### 1. 确保代码质量
- [x] 所有功能测试通过
- [x] 无 console 错误
- [x] 符合 Manifest V3 规范
- [x] 权限使用最小化

### 2. 准备商店素材

#### 必需素材
- [ ] **图标 (Icon)**
  - 128x128 px (required)
  - 64x64 px
  - 48x48 px
  - 32x32 px
  - 16x16 px
  
- [ ] **截图 (Screenshots)**
  - 至少 1 张，最多 5 张
  - 尺寸：1280x800 px 或 640x400 px
  - 格式：PNG, JPEG
  - 展示核心功能

- [ ] **宣传图 (Promotional Images)** (可选但推荐)
  - 小型宣传图：440x280 px
  - 大型宣传图：920x680 px
  - 营销视频链接 (YouTube)

#### 文案准备
- [ ] **名称** (最多 45 字符)
  - 建议：NavPal - 智能导航助手
  
- [ ] **摘要** (最多 132 字符)
  - 建议：简洁高效的浏览器主页，支持智能书签管理和多语言切换
  
- [ ] **详细描述** (无字数限制，但前 150 字会显示在搜索结果)
  - 功能亮点
  - 使用场景
  - 核心优势
  
- [ ] **关键词/标签**
  - 导航, 书签, 新标签页, 生产力, 效率工具

- [ ] **类别选择**
  - 建议：生产力工具 (Productivity)

- [ ] **语言支持**
  - 中文 (简体)
  - English

---

## 🚀 发布步骤

### Step 1: 打包扩展

```bash
# 1. 构建生产版本
cd /Users/panris/Projects/navpal-extension
npm run build

# 2. 验证构建产物
ls -la dist/

# 3. 创建 ZIP 包 (包含 dist 目录内容，不包含 dist 文件夹本身)
cd dist
zip -r ../navpal-extension-v1.0.0.zip ./*

# 4. 验证 ZIP 包结构
unzip -l ../navpal-extension-v1.0.0.zip | head -20
```

**重要：** ZIP 包的根目录应该直接包含 `manifest.json`，而不是 `dist/manifest.json`

### Step 2: 注册开发者账号

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 登录 Google 账号
3. 支付 **$5.00 USD** 一次性注册费
4. 填写开发者信息：
   - 姓名/公司名
   - 邮箱
   - 电话号码
   - 地址

### Step 3: 上传扩展

1. 在 Dashboard 点击 **"新建项目"**
2. 上传 `navpal-extension-v1.0.0.zip`
3. 等待系统处理 (约 1-2 分钟)

### Step 4: 填写商店信息

#### 4.1 基本信息
- **名称**：NavPal - 智能导航助手
- **摘要**：简洁高效的浏览器主页，支持智能书签管理和多语言切换
- **详细描述**：
  ```markdown
  NavPal 是一款现代化的浏览器新标签页扩展，为您的浏览体验带来全新的效率提升。
  
  🌟 核心功能：
  • 智能书签管理 - 快速添加、编辑、分类您的常用网站
  • 多语言支持 - 支持中英文界面，跟随系统或手动切换
  • 精美的视觉设计 - 渐变色图标、流畅的动画效果
  • 分类标签 - 按工作、学习、娱乐等分类管理书签
  • 搜索功能 - 快速过滤书签，一键直达目标网站
  • 响应式设计 - 完美适配各种屏幕尺寸
  
  💡 为什么选择 NavPal？
  ✓ 简洁不简单 - 功能丰富但界面清爽
  ✓ 高度可定制 - 根据个人习惯调整布局和功能
  ✓ 隐私安全 - 所有数据本地存储，无需担心隐私泄露
  ✓ 免费无广告 - 纯粹的工具，专注提升您的效率
  
  立即安装，让您的浏览器主页焕然一新！
  ```

#### 4.2 图标和截图
- 上传 128x128 图标
- 上传 1-5 张截图 (1280x800 推荐)
- 可选：上传宣传图

#### 4.3 隐私与权限
- **单点登录**：不使用
- **隐私政策网址**：需要填写
- **权限说明**：
  - `storage`: 用于存储用户的书签数据和偏好设置
  - `chrome://newtab`: 替换新标签页

#### 4.4 其他设置
- **网站**：https://github.com/panris/navpal-extension (可选)
- **支持邮箱**：你的邮箱
- **支持网址**：GitHub Issues 链接

### Step 5: 提交审核

1. 检查所有必填项是否完成
2. 点击 **"提交审核"**
3. 等待 Google 审核 (通常 1-3 个工作日)

---

## 📝 隐私政策模板

由于扩展使用了 `storage` 权限，需要提供一个隐私政策页面。

**创建隐私政策文件：**

```bash
# 创建隐私政策页面
cat > privacy-policy.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NavPal 隐私政策</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #7c3aed; }
    h2 { color: #4b5563; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>NavPal 隐私政策</h1>
  <p>最后更新：2026-06-12</p>
  
  <h2>信息收集</h2>
  <p>NavPal 扩展不收集任何个人信息。所有数据（包括书签、设置等）均存储在您的本地浏览器中，使用 Chrome 的 storage API。</p>
  
  <h2>数据使用</h2>
  <p>我们不会将您的数据传输到任何远程服务器。您的数据完全由您控制，仅在您的设备上使用。</p>
  
  <h2>权限说明</h2>
  <ul>
    <li><strong>storage</strong>：用于存储您的书签和偏好设置，所有数据保存在本地</li>
    <li><strong>chrome://newtab</strong>：用于替换浏览器的新标签页</li>
  </ul>
  
  <h2>第三方服务</h2>
  <p>NavPal 不使用任何第三方分析或跟踪服务。</p>
  
  <h2>联系方式</h2>
  <p>如有任何疑问，请通过 GitHub Issues 联系我们：<br>
  <a href="https://github.com/panris/navpal-extension/issues">https://github.com/panris/navpal-extension/issues</a></p>
  
  <h2>政策更新</h2>
  <p>如果我们更新此隐私政策，会在扩展更新时通知您。</p>
</body>
</html>
EOF
```

**托管选项：**
1. **GitHub Pages** (推荐)：将 `privacy-policy.html` 推送到 `gh-pages` 分支
2. **自己的网站**：上传到你的域名
3. **GitHub Raw**：使用 `https://raw.githubusercontent.com/...` (不推荐)

---

## ✅ 发布后检查

1. **验证安装**
   - 从 Chrome Web Store 安装
   - 测试所有功能
   - 检查新标签页是否正常

2. **监控反馈**
   - 关注用户评论
   - 及时回复问题
   - 记录功能请求

3. **准备更新**
   - 根据反馈优化
   - 修复 bug
   - 增加新功能

---

## 🐛 常见审核拒绝原因

### 1. 权限过度申请
**错误**：申请了不需要的权限  
**解决**：只保留必需的权限

### 2. 描述与功能不符
**错误**：描述中提到未实现的功能  
**解决**：确保描述准确，不夸大

### 3. 用户体验差
**错误**：界面混乱、功能难用  
**解决**：优化 UI/UX，确保易用性

### 4. 重复功能
**错误**：与其他扩展功能完全相同  
**解决**：突出差异化特色

### 5. 隐私政策缺失
**错误**：使用了 storage 权限但没有隐私政策  
**解决**：提供完整的隐私政策页面

---

## 📊 版本更新流程

当需要发布新版本时：

```bash
# 1. 更新版本号 (manifest.json)
# "version": "1.0.0" -> "1.0.1"

# 2. 构建新版本
npm run build

# 3. 打包
cd dist && zip -r ../navpal-extension-v1.0.1.zip ./*

# 4. 在 Developer Dashboard 上传新 ZIP
# 5. 更新版本说明
# 6. 提交审核
```

---

## 🔗 有用链接

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [商店上架最佳实践](https://developer.chrome.com/docs/webstore/best_practices/)
- [审核常见问题](https://developer.chrome.com/docs/webstore/faq/)

---

## 📞 支持

如遇问题，请联系：
- GitHub Issues: https://github.com/panris/navpal-extension/issues
- Email: [你的邮箱]

---

**最后更新**：2026-06-12
