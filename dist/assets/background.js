chrome.runtime.onInstalled.addListener(()=>{console.log("伴航 NavPal 已安装")});chrome.runtime.onMessage.addListener(e=>{e.type==="OPEN_TAB"&&chrome.tabs.create({url:e.url})});
