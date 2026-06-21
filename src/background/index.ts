// Background Service Worker (MV3)
// 处理扩展生命周期事件

chrome.runtime.onInstalled.addListener(() => {
  console.info('伴航 NavPal 已安装');
});

// 处理来自 popup 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_TAB') {
    const url = message.url;
    // Validate URL before creating tab
    if (typeof url !== 'string' || !url.trim()) {
      sendResponse?.({ error: 'Invalid URL' });
      return;
    }
    try {
      new URL(url); // validate well-formed
      chrome.tabs.create({ url });
    } catch {
      sendResponse?.({ error: 'Invalid URL' });
    }
  }
});
