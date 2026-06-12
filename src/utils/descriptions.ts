// 网站中英文描述数据

export const BOOKMARK_DESCRIPTIONS: Record<string, { en: string; zh: string }> = {
  // AI 工具
  'chat.openai.com': {
    en: 'AI chatbot by OpenAI. Conversational AI for writing, coding, analysis, and creative tasks.',
    zh: 'OpenAI开发的AI对话助手，可用于写作、编程、分析和创意任务。',
  },
  'claude.ai': {
    en: 'AI assistant by Anthropic. Focuses on being helpful, harmless, and honest.',
    zh: 'Anthropic开发的AI助手，专注于有用、无害和诚实。',
  },
  'gemini.google.com': {
    en: "Google's multimodal AI. Text, images, code, and more in one model.",
    zh: 'Google的多模态AI模型，融合文本、图像、代码等多种能力。',
  },
  'tongyi.aliyun.com': {
    en: "Alibaba's LLM. Chinese-focused AI for business and daily use.",
    zh: '阿里云大语言模型，专注于中文场景的企业和日常应用。',
  },
  'yiyan.baidu.com': {
    en: "Baidu's ERNIE Bot. China's answer to GPT with deep Chinese language understanding.",
    zh: '百度文心大模型，具备深度中文理解能力的国产大语言模型。',
  },
  'kimi.moonshot.cn': {
    en: "Moonshot AI's chatbot. Known for 200K context window and document analysis.",
    zh: '月之暗面Kimi，支持20万字超长上下文，擅长文档分析。',
  },
  'chat.deepseek.com': {
    en: 'DeepSeek V2/3. Open-source reasoning model with excellent cost-performance.',
    zh: '深度求索开源推理模型，性价比出色的国产大模型。',
  },
  'cursor.com': {
    en: 'AI-first code editor. Built on VS Code with integrated AI coding assistant.',
    zh: 'AI优先的代码编辑器，基于VS Code集成AI编程助手。',
  },
  'midjourney.com': {
    en: 'AI image generator. Create stunning images from text descriptions.',
    zh: 'AI图像生成器，通过文字描述创建精美图像。',
  },
  'stability.ai': {
    en: 'Open-source AI image models. Stable Diffusion and creative tools.',
    zh: '开源AI图像模型，Stable Diffusion及创意工具。',
  },

  // 开发工具
  'github.com': {
    en: 'Code hosting platform. Git repositories, pull requests, CI/CD, and social coding.',
    zh: '代码托管平台，提供Git仓库、PR、CI/CD和社交编程。',
  },
  'gitlab.com': {
    en: 'DevOps platform. Complete CI/CD pipeline with integrated issue tracking.',
    zh: '一站式DevOps平台，提供完整CI/CD流水线和问题追踪。',
  },
  'stackoverflow.com': {
    en: 'Q&A for developers. The largest community for programming questions and answers.',
    zh: '开发者问答社区，全球最大的编程问答平台。',
  },
  'developer.mozilla.org': {
    en: 'Web docs by Mozilla. Complete reference for HTML, CSS, JS, and Web APIs.',
    zh: 'Mozilla官方Web文档，HTML/CSS/JS/Web API完整参考。',
  },
  'npmjs.com': {
    en: "Node package manager. The world's largest software registry for Node.js packages.",
    zh: 'Node.js包管理器，全球最大的Node.js软件注册表。',
  },
  'hub.docker.com': {
    en: 'Container registry. Share and discover Docker images for your applications.',
    zh: '容器镜像仓库，分享和发现Docker镜像。',
  },
  'vercel.com': {
    en: 'Frontend cloud platform. Instant deployment for Next.js and static sites.',
    zh: '前端云平台，Next.js和静态站点的即时部署服务。',
  },
  'dash.cloudflare.com': {
    en: 'CDN and security platform. DNS, SSL, performance, and security services.',
    zh: 'CDN和安全平台，提供DNS、SSL、性能和安全服务。',
  },
  'gitee.com': {
    en: "China's GitHub alternative. Popular in China for code hosting and collaboration.",
    zh: '中国版GitHub，国内开发者首选的代码托管和协作平台。',
  },
  'juejin.cn': {
    en: 'Tech community by ByteDance. High-quality articles on programming and technology.',
    zh: '字节跳动技术社区，高质量编程和技术文章平台。',
  },

  // 设计工具
  'figma.com': {
    en: 'Collaborative design tool. Real-time UI/UX design, prototyping, and handoff.',
    zh: '协作文具工具，实时UI/UX设计、原型制作和设计交付。',
  },
  'miro.com': {
    en: 'Visual collaboration platform. Online whiteboards for brainstorming and planning.',
    zh: '可视化协作平台，用于头脑风暴和规划的在线白板。',
  },
  'excalidraw.com': {
    en: 'Hand-drawn style diagrams. Collaborative whiteboard with sketchy aesthetic.',
    zh: '手绘风格图表工具，支持协作的Sketch风格白板。',
  },
  'unsplash.com': {
    en: 'Free high-res photos. Beautiful, royalty-free images for any project.',
    zh: '免费高清图片，美丽无版权图片用于任何项目。',
  },
  'fontawesome.com': {
    en: 'Icon library. Thousands of icons for web and UI projects.',
    zh: '图标库，数千个适用于Web和UI项目的图标。',
  },
  'fonts.google.com': {
    en: 'Free web fonts library. Hundreds of open-source fonts for web use.',
    zh: '免费网页字体库，数百种开源网页字体。',
  },
  'coolors.co': {
    en: 'Color palette generator. Create beautiful color schemes in seconds.',
    zh: '配色方案生成器，几秒内创建美丽的色彩搭配。',
  },
  'gaoding.com': {
    en: 'Online design platform. Templates for social media, marketing, and presentations.',
    zh: '在线设计平台，提供社交媒体、营销和演示文稿模板。',
  },

  // 工作工具
  'notion.so': {
    en: 'All-in-one workspace. Notes, docs, wikis, and project management combined.',
    zh: '一体化工作空间，笔记、文档、知识库和项目管理合而为一。',
  },
  'linear.app': {
    en: 'Issue tracking for software teams. Fast, beautiful, and keyboard-driven.',
    zh: '软件团队的问题追踪工具，快速、漂亮、键盘驱动。',
  },
  'slack.com': {
    en: 'Team communication platform. Channels, DMs, integrations, and workflows.',
    zh: '团队协作平台，提供频道、私信、集成和工作流。',
  },
  'feishu.cn': {
    en: "ByteDance's productivity suite. IM, docs, calendar, and video meetings.",
    zh: '字节跳动办公套件，即时通讯、文档、日历和视频会议。',
  },
  'dingtalk.com': {
    en: "Alibaba's enterprise app. Communication, OA, and management tools.",
    zh: '阿里企业级应用，提供沟通、OA和管理工具。',
  },
  'work.weixin.qq.com': {
    en: 'WeChat for business. Corporate communication and customer management.',
    zh: '微信企业版，企业内部沟通和客户管理工具。',
  },
  'yuque.com': {
    en: 'Knowledge management platform. Beautiful docs and team wikis by Alibaba.',
    zh: '知识管理平台，阿里出品的美观文档和团队知识库。',
  },
  'trello.com': {
    en: 'Kanban-style boards. Visual project management with cards and lists.',
    zh: '看板风格面板，视觉化项目管理，用卡片和列表组织任务。',
  },
  'wps.cn': {
    en: 'Office suite alternative. Documents, spreadsheets, and presentations.',
    zh: '办公套件替代品，文档、电子表格和演示文稿。',
  },

  // 娱乐
  'youtube.com': {
    en: 'Video platform. Watch, create, and share videos with the world.',
    zh: '视频平台，与世界分享和观看视频。',
  },
  'twitter.com': {
    en: 'Social news platform. Real-time updates, trends, and microblogging.',
    zh: '社交新闻平台，实时动态、趋势和微博客。',
  },
  'reddit.com': {
    en: 'Community discussions. Forums organized by topics (subreddits) on everything.',
    zh: '社区讨论论坛，按主题（子版块）组织的全球社区。',
  },
  'bilibili.com': {
    en: 'Chinese video site. Anime, gaming, and creative content with danmu culture.',
    zh: '中国视频网站，动漫、游戏和创意内容，弹幕文化发源地。',
  },
  'weibo.com': {
    en: 'Chinese microblogging. Social media for news, entertainment, and trends.',
    zh: '中国微博客平台，社交媒体与新闻热点聚集地。',
  },
  'zhihu.com': {
    en: 'Chinese Q&A platform. In-depth discussions on knowledge, opinions, and experiences.',
    zh: '中文问答社区，深入讨论知识、观点和经验。',
  },
  'douyin.com': {
    en: 'Short video platform. Trending videos, live streaming, and social entertainment.',
    zh: '短视频平台，热播视频、直播和社交娱乐。',
  },
  'xiaohongshu.com': {
    en: 'Lifestyle platform. Shopping tips, travel guides, and user-generated content.',
    zh: '生活方式分享平台，购物攻略、旅行指南和UGC内容。',
  },
  'spotify.com': {
    en: 'Music streaming service. Millions of songs, podcasts, and personalized playlists.',
    zh: '音乐流媒体服务，数百万首歌曲、播客和个性化播放列表。',
  },
  'netflix.com': {
    en: 'Streaming service. TV shows, movies, and original content on demand.',
    zh: '流媒体服务，点播电视剧、电影和原创内容。',
  },
};

// 根据URL获取描述
export function getDescription(url: string): { en: string; zh: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    // 尝试精确匹配
    if (BOOKMARK_DESCRIPTIONS[hostname]) {
      return BOOKMARK_DESCRIPTIONS[hostname];
    }
    // 尝试匹配后缀 (e.g., "kimi.moonshot.cn" matches "moonshot.cn")
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length; i++) {
      const suffix = parts.slice(i).join('.');
      if (BOOKMARK_DESCRIPTIONS[suffix]) {
        return BOOKMARK_DESCRIPTIONS[suffix];
      }
    }
  } catch {
    // ignore
  }
  return null;
}
