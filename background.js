importScripts('config.js');

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.url && changeInfo.url.includes('files.finance.ozon.ru/download')) {
    chrome.tabs.remove(tabId);
    chrome.tabs.create({ url: ENV.pdfUrl });
  }
});