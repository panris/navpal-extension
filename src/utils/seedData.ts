// 初始 Seed Data - 85个常用网站（含中英文介绍）

import { Group, Bookmark } from '@/types';
import { generateId } from '@/utils';

// 辅助函数：为书签添加描述
function withDescription(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>, desc: { en: string; zh: string }): Bookmark {
  return {
    ...bookmark,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    description: desc,
  };
}

export const DEFAULT_GROUPS: Group[] = [
  { id: 'group-ai', name: 'AI 工具', nameI18n: { zh: 'AI 工具', en: 'AI Tools' }, icon: 'sparkles', color: '#8b5cf6', hidden: false, order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-dev', name: '开发', nameI18n: { zh: '开发', en: 'Dev' }, icon: 'code', color: '#06b6d4', hidden: false, order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-design', name: '设计', nameI18n: { zh: '设计', en: 'Design' }, icon: 'palette', color: '#ec4899', hidden: false, order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-work', name: '工作', nameI18n: { zh: '工作', en: 'Work' }, icon: 'briefcase', color: '#f59e0b', hidden: false, order: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-tools', name: '工具箱', nameI18n: { zh: '工具箱', en: 'Tools' }, icon: 'wrench', color: '#10b981', hidden: false, order: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-media', name: '影音', nameI18n: { zh: '影音', en: 'Media' }, icon: 'music', color: '#ef4444', hidden: false, order: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'group-entertainment', name: '娱乐', nameI18n: { zh: '娱乐', en: 'Entertainment' }, icon: 'gamepad-2', color: '#22c55e', hidden: false, order: 6, createdAt: Date.now(), updatedAt: Date.now() },
];

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  // ========== AI 工具 ==========
  withDescription(
    { title: 'ChatGPT', url: 'https://chat.openai.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 0 },
    { en: 'OpenAI\'s conversational AI. Writing, coding, analysis, and creative assistance. 全球最流行的AI对话工具。', zh: 'OpenAI开发的AI对话助手。写作、编程、分析和创意任务。全球最流行的AI聊天工具。' }
  ),
  withDescription(
    { title: 'Claude', url: 'https://claude.ai', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 1 },
    { en: 'Anthropic\'s AI assistant. Helpful, harmless, and honest. Excellent for long documents and analysis.', zh: 'Anthropic开发的AI助手，专注于有用、无害和诚实。非常擅长处理长文档和分析任务。' }
  ),
  withDescription(
    { title: 'Gemini', url: 'https://gemini.google.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 2 },
    { en: 'Google\'s multimodal AI. Text, images, code, audio in one model. Integrated with Google services.', zh: 'Google的多模态AI模型，融合文本、图像、代码、音频。与Google服务深度集成。' }
  ),
  withDescription(
    { title: '通义千问', url: 'https://tongyi.aliyun.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-ai', order: 3 },
    { en: 'Alibaba\'s LLM. Excellent Chinese language understanding. Free tier available. 中国最强开源模型。', zh: '阿里云大语言模型，中文理解能力出色，提供免费版本。国内最强大的开源大模型。' }
  ),
  withDescription(
    { title: '文心一言', url: 'https://yiyan.baidu.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-ai', order: 4 },
    { en: 'Baidu\'s ERNIE Bot. Deep Chinese language understanding. Image generation included.', zh: '百度文心大模型，具备深度中文理解能力，内置图像生成功能。' }
  ),
  withDescription(
    { title: 'Kimi', url: 'https://kimi.moonshot.cn', region: 'CN', regionManual: false, hidden: false, groupId: 'group-ai', order: 5 },
    { en: '200K context window. Document analysis and long-form reading. 中国AI产品的出海标杆。', zh: '支持20万字超长上下文，擅长文档分析和长文阅读。中国AI产品的出海标杆。' }
  ),
  withDescription(
    { title: 'DeepSeek', url: 'https://chat.deepseek.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-ai', order: 6 },
    { en: 'Open-source reasoning model. Excellent cost-performance ratio. API access available.', zh: '开源推理模型，性价比出色。支持API调用，开发者友好。' }
  ),
  withDescription(
    { title: 'Cursor', url: 'https://cursor.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 7 },
    { en: 'AI-first code editor. Built on VS Code. Tab autocomplete, chat, and agent mode.', zh: 'AI优先的代码编辑器，基于VS Code。Tab自动补全、聊天模式和Agent模式。' }
  ),
  withDescription(
    { title: 'Midjourney', url: 'https://www.midjourney.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 8 },
    { en: 'AI image generation. Stunning artistic renders from text. Top choice for concept art.', zh: 'AI图像生成器，通过文字描述创建精美艺术图像。概念艺术的首选工具。' }
  ),
  withDescription(
    { title: 'Stable Diffusion', url: 'https://stability.ai', region: 'Global', regionManual: false, hidden: false, groupId: 'group-ai', order: 9 },
    { en: 'Open-source image models. Run locally or use cloud API. Fully customizable.', zh: '开源AI图像模型，可本地运行或使用云端API，完全可定制。' }
  ),

  // ========== 开发工具 ==========
  withDescription(
    { title: 'GitHub', url: 'https://github.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 0 },
    { en: 'Code hosting platform. Git repos, pull requests, CI/CD, GitHub Actions. World\'s largest developer community.', zh: '代码托管平台，提供Git仓库、PR、CI/CD和GitHub Actions。全球最大开发者社区。' }
  ),
  withDescription(
    { title: 'GitLab', url: 'https://gitlab.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 1 },
    { en: 'DevOps platform. Complete CI/CD pipeline, issue tracking, wiki. Self-host option available.', zh: '一站式DevOps平台，提供完整CI/CD流水线、问题追踪和Wiki。支持自托管部署。' }
  ),
  withDescription(
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 2 },
    { en: 'Q&A for developers. Largest programming Q&A community. Find solutions to any coding problem.', zh: '开发者问答社区，全球最大的编程问答平台，解决各种编程问题。' }
  ),
  withDescription(
    { title: 'MDN', url: 'https://developer.mozilla.org', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 3 },
    { en: 'Web docs by Mozilla. Complete reference for HTML, CSS, JS, Web APIs. The web developer\'s bible.', zh: 'Mozilla官方Web文档，HTML/CSS/JS/Web API完整参考。Web开发者的权威指南。' }
  ),
  withDescription(
    { title: 'npm', url: 'https://www.npmjs.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 4 },
    { en: 'Node package manager. World\'s largest software registry. Find and install any Node.js package.', zh: 'Node.js包管理器，全球最大的软件注册表，查找和安装Node.js包。' }
  ),
  withDescription(
    { title: 'Docker Hub', url: 'https://hub.docker.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 5 },
    { en: 'Container registry. Share and discover Docker images. Official images for popular software.', zh: '容器镜像仓库，分享和发现Docker镜像，提供官方镜像和热门软件镜像。' }
  ),
  withDescription(
    { title: 'Vercel', url: 'https://vercel.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 6 },
    { en: 'Frontend cloud platform. Instant deployment for Next.js, React, Vue, static sites. Free tier included.', zh: '前端云平台，Next.js、React、Vue和静态站点的即时部署服务，提供免费额度。' }
  ),
  withDescription(
    { title: 'Cloudflare', url: 'https://dash.cloudflare.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 7 },
    { en: 'CDN and security platform. DNS, SSL, Workers, R2 storage, D1 database. Free tier available.', zh: 'CDN和安全平台，提供DNS、SSL、Workers、R2存储、D1数据库。免费额度充足。' }
  ),
  withDescription(
    { title: 'Gitee', url: 'https://gitee.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-dev', order: 8 },
    { en: 'China\'s GitHub alternative. Popular for Chinese open-source projects. Fast访问速度。', zh: '中国版GitHub，国内开发者首选的代码托管平台。访问速度快，适合国内开源项目。' }
  ),
  withDescription(
    { title: '掘金', url: 'https://juejin.cn', region: 'CN', regionManual: false, hidden: false, groupId: 'group-dev', order: 9 },
    { en: 'Tech community by ByteDance. High-quality articles on programming, AI, and technology. 中文技术文章宝库。', zh: '字节跳动技术社区，高质量编程、AI和技术文章平台。中文技术文章宝库。' }
  ),
  withDescription(
    { title: 'Roadmap.sh', url: 'https://roadmap.sh', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 10 },
    { en: 'Developer learning paths. Step-by-step guides for any tech stack. Community-curated roadmaps.', zh: '开发者学习路线图，任何技术栈的循序渐进指南，社区策划的成长路径。' }
  ),
  withDescription(
    { title: 'Learn X in Y Minutes', url: 'https://learnxinyminutes.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 11 },
    { en: 'Quick syntax cheat sheets. Learn any programming language in minutes. Scenic tour of syntax.', zh: '快速语法速查表，几分钟内了解任何编程语言语法。语言语法快速导览。' }
  ),
  withDescription(
    { title: 'DevDocs', url: 'https://devdocs.io', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 12 },
    { en: 'Unified API documentation. Search across multiple docs offline. Fast and organized.', zh: '统一API文档，离线搜索多个文档库，快速且有组织。' }
  ),
  withDescription(
    { title: 'JSON Crack', url: 'https://jsoncrack.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 13 },
    { en: 'JSON visualizer. Turn JSON into interactive graphs. Debug and explore data structures.', zh: 'JSON可视化工具，将JSON转换为交互式图表，方便调试和探索数据结构。' }
  ),
  withDescription(
    { title: 'Crontab Guru', url: 'https://crontab.guru', region: 'Global', regionManual: false, hidden: false, groupId: 'group-dev', order: 14 },
    { en: 'Crontab expression editor. Validate and understand cron schedules. Human-readable explanations.', zh: 'Crontab表达式编辑器，验证和理解定时任务计划，提供人类可读的说明。' }
  ),

  // ========== 设计工具 ==========
  withDescription(
    { title: 'Figma', url: 'https://figma.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 0 },
    { en: 'Collaborative design tool. Real-time UI/UX design, prototyping, developer handoff. Industry standard.', zh: '协作文具工具，实时UI/UX设计、原型制作和开发交付。行业标准工具。' }
  ),
  withDescription(
    { title: 'Miro', url: 'https://miro.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 1 },
    { en: 'Visual collaboration platform. Online whiteboards for brainstorming, mind mapping, and planning. 无限画布。', zh: '可视化协作平台，用于头脑风暴、思维导图和规划的在线白板，无限画布。' }
  ),
  withDescription(
    { title: 'Excalidraw', url: 'https://excalidraw.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 2 },
    { en: 'Hand-drawn style diagrams. Collaborative whiteboard with sketchy aesthetic. Export to PNG/SVG.', zh: '手绘风格图表工具，支持协作的Sketch风格白板，可导出PNG/SVG。' }
  ),
  withDescription(
    { title: 'Unsplash', url: 'https://unsplash.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 3 },
    { en: 'Free high-res photos. Beautiful, royalty-free images. Search by color, orientation, etc.', zh: '免费高清图片，美丽无版权图片，支持按颜色、方向等条件搜索。' }
  ),
  withDescription(
    { title: 'Font Awesome', url: 'https://fontawesome.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 4 },
    { en: 'Icon library. Thousands of icons for web and UI projects. Free and Pro versions.', zh: '图标库，数千个适用于Web和UI项目的图标，提供免费版和专业版。' }
  ),
  withDescription(
    { title: 'Google Fonts', url: 'https://fonts.google.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 5 },
    { en: 'Free web fonts library. Hundreds of open-source fonts. Preview and pair fonts easily.', zh: '免费网页字体库，数百种开源网页字体，方便预览和搭配字体。' }
  ),
  withDescription(
    { title: 'Coolors', url: 'https://coolors.co', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 6 },
    { en: 'Color palette generator. Create beautiful color schemes in seconds. Browse trending palettes.', zh: '配色方案生成器，几秒内创建美丽的色彩搭配，浏览热门配色方案。' }
  ),
  withDescription(
    { title: '稿定设计', url: 'https://www.gaoding.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-design', order: 7 },
    { en: 'Online design platform. Templates for social media, marketing, presentations. 中文设计神器。', zh: '在线设计平台，提供社交媒体、营销和演示文稿模板，中文设计神器。' }
  ),
  withDescription(
    { title: 'tldraw', url: 'https://tldraw.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-design', order: 8 },
    { en: 'Infinite canvas whiteboard. Open-source, customizable. Great for diagrams and documentation.', zh: '无限画布白板，开源可定制，擅长图表和文档绘制。' }
  ),

  // ========== 工作工具 ==========
  withDescription(
    { title: 'Notion', url: 'https://notion.so', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 0 },
    { en: 'All-in-one workspace. Notes, docs, wikis, project management. Highly customizable.', zh: '一体化工作空间，笔记、文档、知识库和项目管理，高度可定制。' }
  ),
  withDescription(
    { title: 'Linear', url: 'https://linear.app', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 1 },
    { en: 'Issue tracking for software teams. Fast, beautiful, keyboard-driven. GitHub integration.', zh: '软件团队的问题追踪工具，快速、漂亮、键盘驱动，与GitHub深度集成。' }
  ),
  withDescription(
    { title: 'Slack', url: 'https://slack.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 2 },
    { en: 'Team communication platform. Channels, DMs, integrations. Connect all your tools.', zh: '团队协作平台，提供频道、私信、集成，连接所有工作工具。' }
  ),
  withDescription(
    { title: 'Trello', url: 'https://trello.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 3 },
    { en: 'Kanban-style boards. Visual project management with cards and lists. Simple and intuitive.', zh: '看板风格面板，视觉化项目管理，用卡片和列表组织任务，简单直观。' }
  ),
  withDescription(
    { title: '飞书', url: 'https://feishu.cn', region: 'CN', regionManual: false, hidden: false, groupId: 'group-work', order: 4 },
    { en: 'ByteDance\'s productivity suite. IM, docs, calendar, video meetings. Great替代企业微信。', zh: '字节跳动办公套件，即时通讯、文档、日历和视频会议，企业微信的优质替代。' }
  ),
  withDescription(
    { title: '钉钉', url: 'https://dingtalk.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-work', order: 5 },
    { en: 'Alibaba\'s enterprise app. Communication, OA, management tools. Government and enterprise popular.', zh: '阿里企业级应用，提供沟通、OA和管理工具，政府和企业用户众多。' }
  ),
  withDescription(
    { title: '企业微信', url: 'https://work.weixin.qq.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-work', order: 6 },
    { en: 'WeChat for business. Corporate communication and customer management. Deep企业微信生态。', zh: '微信企业版，企业内部沟通和客户管理工具，与微信生态深度整合。' }
  ),
  withDescription(
    { title: '语雀', url: 'https://www.yuque.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-work', order: 7 },
    { en: 'Knowledge management platform. Beautiful docs and team wikis by Alibaba. 中文知识库首选。', zh: '知识管理平台，阿里出品的美观文档和团队知识库，中文知识库首选。' }
  ),
  withDescription(
    { title: 'WPS', url: 'https://www.wps.cn', region: 'CN', regionManual: false, hidden: false, groupId: 'group-work', order: 8 },
    { en: 'Office suite alternative. Documents, spreadsheets, presentations. Free with cloud sync.', zh: '办公套件替代品，文档、电子表格和演示文稿，免费且支持云同步。' }
  ),
  withDescription(
    { title: 'Zapier', url: 'https://zapier.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 9 },
    { en: 'Automation platform. Connect apps and automate workflows. No coding required.', zh: '自动化平台，连接应用并自动化工作流，无需编码。' }
  ),
  withDescription(
    { title: 'n8n', url: 'https://n8n.io', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 10 },
    { en: 'Open-source workflow automation. Self-host or use cloud. Powerful and flexible.', zh: '开源工作流自动化，支持自托管或云端，功能强大且灵活。' }
  ),
  withDescription(
    { title: 'Otter.ai', url: 'https://otter.ai', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 11 },
    { en: 'AI meeting transcription. Real-time voice to text. Auto summary and action items.', zh: 'AI会议转录，实时语音转文字，自动生成摘要和待办事项。' }
  ),
  withDescription(
    { title: 'Loom', url: 'https://loom.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 12 },
    { en: 'Video messaging. Record screen and camera. Share async video updates easily.', zh: '视频消息，录制屏幕和摄像头，轻松分享异步视频更新。' }
  ),
  withDescription(
    { title: 'AlternativeTo', url: 'https://alternativeto.net', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 13 },
    { en: 'Software alternatives. Find alternatives to any app. User reviews and comparisons.', zh: '软件替代品查找，找到任何应用替代品，用户评价和对比参考。' }
  ),
  withDescription(
    { title: 'BuiltWith', url: 'https://builtwith.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-work', order: 14 },
    { en: 'Website technology profiler. Discover what tech a site uses. Frameworks, analytics, etc.', zh: '网站技术分析器，发现网站使用的技术栈，包括框架、分析工具等。' }
  ),

  // ========== 工具箱 ==========
  withDescription(
    { title: 'Web Archive', url: 'https://web.archive.org', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 0 },
    { en: 'Internet archive. View old versions of websites. Historical snapshots since 1996.', zh: '互联网档案馆，查看网站的旧版本，自1996年以来的历史快照。' }
  ),
  withDescription(
    { title: 'Temp Mail', url: 'https://temp-mail.org', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 1 },
    { en: 'Temporary email addresses. Disposable emails for signups. Protect your inbox.', zh: '临时邮箱，一次性邮箱地址用于注册，保护你的真实邮箱。' }
  ),
  withDescription(
    { title: 'FutureMe', url: 'https://futureme.org', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 2 },
    { en: 'Email to the future. Write a letter to yourself. Scheduled delivery in months or years.', zh: '写给未来的邮件，给未来的自己写一封信，在数月或数年后送达。' }
  ),
  withDescription(
    { title: 'Cleanup.pictures', url: 'https://cleanup.pictures', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 3 },
    { en: 'Remove objects from photos. AI-powered inpainting. Clean up images in seconds.', zh: '从照片中移除物体，AI驱动的图像修复，几秒钟清理图片。' }
  ),
  withDescription(
    { title: 'Photopea', url: 'https://photopea.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 4 },
    { en: 'Online Photoshop alternative. Browser-based image editing. PSD file support.', zh: '在线Photoshop替代品，基于浏览器的图像编辑，支持PSD文件。' }
  ),
  withDescription(
    { title: 'Remove.bg', url: 'https://remove.bg', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 5 },
    { en: 'Remove background from images. AI-powered. Batch processing available.', zh: '一键移除图片背景，AI驱动抠图，支持批量处理。' }
  ),
  withDescription(
    { title: 'LetsEnhance', url: 'https://letsenhance.io', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 6 },
    { en: 'AI image upscaler. Enhance and enlarge photos. 4x and 8x upscaling options.', zh: 'AI图片放大器，增强和放大照片，支持4倍和8倍放大。' }
  ),
  withDescription(
    { title: 'TinyWow', url: 'https://tinywow.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 7 },
    { en: 'Free file tools. PDF, image, video converters. All browser-based, no signup.', zh: '免费文件工具，PDF、图片、视频转换器，全部基于浏览器，无需注册。' }
  ),
  withDescription(
    { title: 'PDF24', url: 'https://pdf24.org', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 8 },
    { en: 'PDF toolkit. Merge, split, compress, convert. Free and easy to use.', zh: 'PDF工具箱，合并、分割、压缩、转换，免费且易于使用。' }
  ),
  withDescription(
    { title: 'Dictation.io', url: 'https://dictation.io', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 9 },
    { en: 'Browser-based speech to text. Type with your voice. Supports multiple languages.', zh: '基于浏览器的语音转文字，用声音打字，支持多种语言。' }
  ),
  withDescription(
    { title: 'Descript', url: 'https://descript.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 10 },
    { en: 'All-in-one video editor. Edit by editing transcript. Screen recording included.', zh: '一体化视频编辑器，通过编辑转录稿来编辑视频，内置屏幕录制。' }
  ),
  withDescription(
    { title: 'CamelCamelCamel', url: 'https://camelcamelcamel.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 11 },
    { en: 'Amazon price tracker. Get alerts for price drops. Find the best time to buy.', zh: '亚马逊价格追踪器，价格下降提醒，找到最佳购买时机。' }
  ),
  withDescription(
    { title: 'JustTheRecipe', url: 'https://justtherecipe.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 12 },
    { en: 'Recipe extractor. Remove ads and fluff from recipe sites. Just the ingredients and steps.', zh: '食谱提取器，去除食谱网站的广告和废话，只保留配料和步骤。' }
  ),
  withDescription(
    { title: 'CopyChar', url: 'https://copychar.cc', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 13 },
    { en: 'Copy special characters. Symbols, emojis, accents. Click to copy to clipboard.', zh: '复制特殊字符，符号、emoji、重音符号，点击即可复制到剪贴板。' }
  ),
  withDescription(
    { title: 'Screenshot Guru', url: 'https://screenshot.guru', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 14 },
    { en: 'High-res website screenshots. Capture any URL in retina quality. Free to use.', zh: '高清网站截图，以视网膜质量捕获任何网址，免费使用。' }
  ),
  withDescription(
    { title: 'WordCounter', url: 'https://wordcounter.net', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 15 },
    { en: 'Word and character counter. Track writing stats. Keyword density analysis.', zh: '字数和字符计数器，跟踪写作统计，关键字密度分析。' }
  ),
  withDescription(
    { title: 'Untools', url: 'https://untools.co', region: 'Global', regionManual: false, hidden: false, groupId: 'group-tools', order: 16 },
    { en: 'Thinking tools collection. Decision frameworks, problem solving. Applied intelligence.', zh: '思维工具集合，决策框架、问题解决，应用智慧方法论。' }
  ),

  // ========== 影音 ==========
  withDescription(
    { title: 'Pixabay', url: 'https://pixabay.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-media', order: 0 },
    { en: 'Free media library. Photos, videos, music. All royalty-free for commercial use.', zh: '免费媒体库，图片、视频、音乐，全部无版权可商用。' }
  ),
  withDescription(
    { title: 'Mixkit', url: 'https://mixkit.co', region: 'Global', regionManual: false, hidden: false, groupId: 'group-media', order: 1 },
    { en: 'Free video assets. Stock videos, music, sound effects. High quality, no attribution.', zh: '免费视频素材，库存视频、音乐、音效，高质量无需署名。' }
  ),

  // ========== 娱乐 ==========
  withDescription(
    { title: 'Radio Garden', url: 'https://radio.garden', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 0 },
    { en: 'Explore world radio. Tune into thousands of live radio stations worldwide. 探索全球电台。', zh: '探索世界电台，收听全球数千个直播电台，探索世界各地的声音。' }
  ),
  withDescription(
    { title: 'YouTube', url: 'https://youtube.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 1 },
    { en: 'Video platform. Watch, create, share videos. World\'s largest video sharing site.', zh: '视频平台，与世界分享和观看视频，全球最大的视频分享网站。' }
  ),
  withDescription(
    { title: 'Twitter/X', url: 'https://twitter.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 2 },
    { en: 'Social news platform. Real-time updates, trends, microblogging. 实时动态和热点讨论。', zh: '社交新闻平台，实时动态、趋势和微博客，实时动态和热点讨论。' }
  ),
  withDescription(
    { title: 'Reddit', url: 'https://reddit.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 3 },
    { en: 'Community discussions. Forums organized by topics (subreddits). Deep discussions on any topic.', zh: '社区讨论论坛，按主题（子版块）组织，任何话题的深度讨论。' }
  ),
  withDescription(
    { title: 'Bilibili', url: 'https://bilibili.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 4 },
    { en: 'Chinese video site. Anime, gaming, creative content. Danmu culture发源地。', zh: '中国视频网站，动漫、游戏和创意内容，弹幕文化发源地。' }
  ),
  withDescription(
    { title: '微博', url: 'https://weibo.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 5 },
    { en: 'Chinese microblogging. Social media for news, entertainment, trends. 中国热搜第一站。', zh: '中国微博客平台，社交媒体与新闻热点聚集地，中国热搜第一站。' }
  ),
  withDescription(
    { title: '知乎', url: 'https://zhihu.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 6 },
    { en: 'Chinese Q&A platform. In-depth discussions on knowledge, opinions, experiences. 中文深度问答。', zh: '中文问答社区，深入讨论知识、观点和经验，中文深度问答平台。' }
  ),
  withDescription(
    { title: '抖音', url: 'https://www.douyin.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 7 },
    { en: 'Short video platform. Trending videos, live streaming, social entertainment. 短视频巨头。', zh: '短视频平台，热播视频、直播和社交娱乐，国内短视频巨头。' }
  ),
  withDescription(
    { title: '小红书', url: 'https://www.xiaohongshu.com', region: 'CN', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 8 },
    { en: 'Lifestyle platform. Shopping tips, travel guides, user-generated content. 种草神器。', zh: '生活方式分享平台，购物攻略、旅行指南和UGC内容，种草神器。' }
  ),
  withDescription(
    { title: 'Spotify', url: 'https://spotify.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 9 },
    { en: 'Music streaming service. Millions of songs, podcasts, personalized playlists. Free tier available.', zh: '音乐流媒体服务，数百万首歌曲、播客和个性化播放列表，提供免费版。' }
  ),
  withDescription(
    { title: 'Netflix', url: 'https://netflix.com', region: 'Global', regionManual: false, hidden: false, groupId: 'group-entertainment', order: 10 },
    { en: 'Streaming service. TV shows, movies, original content on demand. 全球流媒体巨头。', zh: '流媒体服务，点播电视剧、电影和原创内容，全球流媒体巨头。' }
  ),
];

export const DEFAULT_SETTINGS = {
  secretCode: '000',
  triggerZone: 'bottom-left' as const,
  lockDuration: 60000,
  showRegionLabels: true,
  compactMode: false,
  storageQuota: 100,
};
