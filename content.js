// content.js - Extract selected text and communicate with background

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'formatSelectedJson') {
    // Get selected text from message
    const jsonText = message.text;

    // Send to background to open popup
    chrome.runtime.sendMessage({
      action: 'openPopupWithData',
      jsonText: jsonText
    }, (response) => {
      if (response && response.success) {
        // Notify user that popup will open
        showNotification('JSON已发送到格式化工具，请点击插件图标查看');
      }
    });

    sendResponse({ success: true });
  }

  return true;
});

// Show temporary notification on page
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: opacity 0.3s;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto remove after 2 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}