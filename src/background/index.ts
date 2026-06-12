// Background Service Worker (MV3)
// 处理扩展生命周期事件

chrome.runtime.onInstalled.addListener(() => {
  console.log('伴航 NavPal 已安装');
});

// 处理来自 popup 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: message.url });
  }
});
