// 国内常用网站 TLD 映射
const CN_TLDS = new Set([
  '.cn', '.com.cn', '.net.cn', '.org.cn', '.gov.cn',
  '.ac.cn', '.edu.cn', '.mil.cn',
]);

// 国内主流网站域名关键词映射
const CN_WEBSITE_MAP: Record<string, string> = {
  'baidu.com': 'CN',
  'baidu.cn': 'CN',
  'taobao.com': 'CN',
  'tmall.com': 'CN',
  'jd.com': 'CN',
  'alipay.com': 'CN',
  'aliyun.com': 'CN',
  'alibaba.com': 'CN',
  'tencent.com': 'CN',
  'qq.com': 'CN',
  'weixin.qq.com': 'CN',
  'weibo.com': 'CN',
  'douyin.com': 'CN',
  'bilibili.com': 'CN',
  'zhihu.com': 'CN',
  'csdn.net': 'CN',
  'juejin.cn': 'CN',
  'oschina.net': 'CN',
  'gitee.com': 'CN',
  '163.com': 'CN',
  '126.com': 'CN',
  'youku.com': 'CN',
  'iqiyi.com': 'CN',
  'douban.com': 'CN',
  'meituan.com': 'CN',
  'dianping.com': 'CN',
  'ele.me': 'CN',
  'amap.com': 'CN',
  'kugou.com': 'CN',
  'yy.com': 'CN',
  'huya.com': 'CN',
  'longzhu.com': 'CN',
  'xinhuanet.com': 'CN',
  'people.com.cn': 'CN',
  'cctv.com': 'CN',
  'ifeng.com': 'CN',
  'sina.com.cn': 'CN',
  'sohu.com': 'CN',
  'toutiao.com': 'CN',
  'feishu.cn': 'CN',
  'dingtalk.com': 'CN',
  'wps.cn': 'CN',
  'zhipin.com': 'CN',
  'lagou.com': 'CN',
  'boss.zhipin.com': 'CN',
  '36kr.com': 'CN',
  'ithome.com': 'CN',
  'geekpark.net': 'CN',
  'lieyunwang.com': 'CN',
};

// 解析 URL 获取域名
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

// 根据 TLD 判断地域
export function isCNTld(domain: string): boolean {
  return CN_TLDS.has(domain.slice(domain.lastIndexOf('.')));
}

// 根据域名关键词判断地域
export function matchCNKeyword(domain: string): boolean {
  // 完全匹配
  if (CN_WEBSITE_MAP[domain]) {
    return true;
  }
  // 后缀匹配 (e.g., "pan.baidu.com" matches "baidu.com")
  const parts = domain.split('.');
  for (let i = 1; i < parts.length; i++) {
    const suffix = parts.slice(i).join('.');
    if (CN_WEBSITE_MAP[suffix]) {
      return true;
    }
  }
  return false;
}

// 自动识别地域
export function autoDetectRegion(url: string): 'CN' | 'Global' {
  const domain = extractDomain(url);
  if (!domain) return 'Global';

  if (matchCNKeyword(domain) || isCNTld(domain)) {
    return 'CN';
  }
  return 'Global';
}

// Generate unique ID using crypto UUID (falls back to timestamp+random for non-crypto contexts)
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto (e.g., some test runners)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 验证 URL 格式
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 确保 URL 有协议前缀
export function normalizeUrl(url: string): string {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

// 格式化日期
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// 计算存储大小 (KB)
export function getStorageSize(data: object): number {
  return new Blob([JSON.stringify(data)]).size / 1024;
}

// 防抖函数
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
