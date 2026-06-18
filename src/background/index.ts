// Background Service Worker (MV3)
// 处理扩展生命周期事件

chrome.runtime.onInstalled.addListener(() => {
  console.log('伴航 NavPal 已安装');
  // 启用点击图标打开 side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// 设置 side panel 默认路径
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: 'src/popup/index.html' });
});

// 处理来自 popup 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: message.url });
  }
});
