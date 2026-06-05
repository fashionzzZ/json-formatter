// background.js - Context menu and message routing

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'format-json',
    title: '格式化选中的JSON',
    contexts: ['selection']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'format-json') {
    const selectedText = info.selectionText;

    // Open popup in a new tab with the selected JSON
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    }, (newTab) => {
      // Store the JSON data to be retrieved by the popup
      chrome.storage.local.set({
        pendingJson: selectedText,
        autoFormat: true
      });
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopupWithData') {
    // Store the JSON data temporarily
    chrome.storage.local.set({
      pendingJson: message.jsonText,
      autoFormat: true
    });

    // Open popup in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });

    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});