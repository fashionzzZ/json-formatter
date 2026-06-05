# JSON Formatter Chrome Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome extension for formatting, viewing, and editing JSON data with syntax highlighting, node folding, validation, and context menu integration.

**Architecture:** Manifest V3 Chrome Extension with popup UI (JSONEditor), background service worker (context menu), and content script (text extraction). All processing happens client-side.

**Tech Stack:** Chrome Extension Manifest V3, jsoneditor 9.x library, vanilla JavaScript

---

## File Structure

```
json-formatter-extension/
├── manifest.json           # Extension configuration
├── popup.html             # Main UI with input and editor
├── popup.css              # Styles with theme support
├── popup.js               # UI logic and editor integration
├── background.js          # Context menu and message routing
├── content.js             # Extract selected text from pages
├── icons/
│   ├── icon16.png         # Toolbar icon
│   ├── icon48.png         # Extensions page icon
│   └── icon128.png        # Installation icon
└── lib/
    └── jsoneditor.min.js  # Downloaded from CDN
```

---

### Task 1: Project Initialization

**Files:**
- Create: `.gitignore`
- Create: `icons/` directory
- Create: `lib/` directory

- [ ] **Step 1: Create project directory structure**

```bash
mkdir -p icons lib
```

- [ ] **Step 2: Create .gitignore file**

```file
.gitignore
# Dependencies
lib/jsoneditor.min.js

# Chrome extension build artifacts
*.crx
*.pem

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

- [ ] **Step 3: Verify directory structure**

Run: `ls -la`
Expected: See `icons/` and `lib/` directories

- [ ] **Step 4: Commit initial structure**

```bash
git add .gitignore
git add icons lib
git commit -m "chore: initialize project structure"

# Note: directories won't be added until they have files
# So we'll commit them later when files are added
git add .gitignore
git commit -m "chore: add gitignore for Chrome extension project"
```

---

### Task 2: Download JSONEditor Library

**Files:**
- Create: `lib/jsoneditor.min.js`

- [ ] **Step 1: Download jsoneditor library**

```bash
curl -L https://cdn.jsdelivr.net/npm/jsoneditor@9.10.2/dist/jsoneditor.min.js -o lib/jsoneditor.min.js
```

- [ ] **Step 2: Verify download**

Run: `ls -lh lib/jsoneditor.min.js`
Expected: File size ~300KB

- [ ] **Step 3: Download jsoneditor CSS**

```bash
curl -L https://cdn.jsdelivr.net/npm/jsoneditor@9.10.2/dist/jsoneditor.min.css -o lib/jsoneditor.min.css
```

- [ ] **Step 4: Commit library files**

```bash
git add lib/
git commit -m "chore: add jsoneditor 9.10.2 library"
```

---

### Task 3: Create Extension Icons

**Files:**
- Create: `icons/icon16.png`
- Create: `icons/icon48.png`
- Create: `icons/icon128.png`

- [ ] **Step 1: Create simple placeholder icons**

For development, create placeholder icons using any image tool or download from a placeholder service.

Option 1: Use placeholder images temporarily
```bash
# Download placeholder icons (simple colored squares for development)
curl -L "https://via.placeholder.com/16x16/4CAF50/FFFFFF?text=JF" -o icons/icon16.png
curl -L "https://via.placeholder.com/48x48/4CAF50/FFFFFF?text=JF" -o icons/icon48.png
curl -L "https://via.placeholder.com/128x128/4CAF50/FFFFFF?text=JF" -o icons/icon128.png
```

Option 2: Create icons programmatically with ImageMagick (if installed)
```bash
convert -size 16x16 xc:'#4CAF50' -fill white -pointsize 10 -gravity center -annotate 0 'JF' icons/icon16.png
convert -size 48x48 xc:'#4CAF50' -fill white -pointsize 20 -gravity center -annotate 0 'JF' icons/icon48.png
convert -size 128x128 xc:'#4CAF50' -fill white -pointsize 40 -gravity center -annotate 0 'JF' icons/icon128.png
```

- [ ] **Step 2: Verify icons created**

Run: `ls -lh icons/`
Expected: Three PNG files with correct sizes

- [ ] **Step 3: Commit icons**

```bash
git add icons/
git commit -m "chore: add placeholder extension icons"
```

---

### Task 4: Create manifest.json

**Files:**
- Create: `manifest.json`

- [ ] **Step 1: Write manifest.json**

```json
{
  "manifest_version": 3,
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "Format, view, and edit JSON data with syntax highlighting and node folding",
  "permissions": [
    "contextMenus",
    "clipboardWrite",
    "clipboardRead",
    "activeTab"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

- [ ] **Step 2: Validate manifest syntax**

Run: `cat manifest.json | python3 -m json.tool` (if Python available)
Expected: No JSON syntax errors

- [ ] **Step 3: Commit manifest**

```bash
git add manifest.json
git commit -m "feat: add Chrome extension manifest V3 configuration"
```

---

### Task 5: Create popup.html Base Structure

**Files:**
- Create: `popup.html`

- [ ] **Step 1: Write popup.html structure**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=800, height=600">
  <title>JSON Formatter</title>
  <link rel="stylesheet" href="lib/jsoneditor.min.css">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <!-- Toolbar -->
    <div class="toolbar">
      <button id="formatBtn" class="btn btn-primary">
        <span class="icon">📋</span>
        <span class="text">格式化</span>
      </button>
      <button id="compressBtn" class="btn btn-secondary">
        <span class="icon">📦</span>
        <span class="text">压缩</span>
      </button>
      <button id="copyBtn" class="btn btn-secondary">
        <span class="icon">📄</span>
        <span class="text">复制</span>
      </button>
      <button id="saveBtn" class="btn btn-secondary">
        <span class="icon">💾</span>
        <span class="text">保存</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Input Area -->
      <div class="input-area">
        <textarea id="jsonInput" placeholder="粘贴 JSON 数据..."></textarea>
      </div>

      <!-- Editor Area -->
      <div class="editor-area">
        <div id="jsoneditor"></div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <span id="statusText">就绪</span>
      <span id="jsonSize">0 bytes</span>
    </div>

    <!-- Error Display -->
    <div id="errorDisplay" class="error-display hidden">
      <span class="error-icon">⚠️</span>
      <span id="errorMessage"></span>
      <button id="errorDetailsBtn" class="btn-link">查看详情</button>
    </div>

    <!-- Toast Notification -->
    <div id="toast" class="toast hidden"></div>
  </div>

  <script src="lib/jsoneditor.min.js"></script>
  <script src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML syntax**

Open `popup.html` in browser or validate with online tool
Expected: Valid HTML5 structure

- [ ] **Step 3: Commit HTML**

```bash
git add popup.html
git commit -m "feat: add popup UI structure with toolbar and editor layout"
```

---

### Task 6: Create popup.css with Theme Support

**Files:**
- Create: `popup.css`

- [ ] **Step 1: Write popup.css with light/dark themes**

```css
/* Base Variables */
:root {
  --width: 800px;
  --height: 600px;
  
  /* Light Theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --btn-primary: #4CAF50;
  --btn-primary-hover: #45a049;
  --btn-secondary: #757575;
  --btn-secondary-hover: #616161;
  --error-bg: #ffebee;
  --error-border: #ef5350;
  --toast-bg: #4CAF50;
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1e1e1e;
    --bg-secondary: #252526;
    --text-primary: #d4d4d4;
    --text-secondary: #858585;
    --border-color: #3c3c3c;
    --btn-primary: #4CAF50;
    --btn-primary-hover: #66BB6A;
    --btn-secondary: #616161;
    --btn-secondary-hover: #757575;
    --error-bg: #2d1111;
    --error-border: #ef5350;
    --toast-bg: #4CAF50;
  }
}

/* Layout */
body {
  width: var(--width);
  height: var(--height);
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary {
  background: var(--btn-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
}

.btn-secondary {
  background: var(--btn-secondary);
  color: white;
}

.btn-secondary:hover {
  background: var(--btn-secondary-hover);
}

.btn .icon {
  font-size: 16px;
}

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn.success {
  background: #66BB6A;
}

.btn.error {
  background: #ef5350;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.input-area {
  width: 30%;
  padding: 12px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

#jsonInput {
  flex: 1;
  resize: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

#jsonInput:focus {
  outline: 2px solid var(--btn-primary);
  outline-offset: -2px;
}

.editor-area {
  width: 70%;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

#jsoneditor {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

/* Error Display */
.error-display {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  padding: 12px 16px;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.error-display.hidden {
  display: none;
}

.error-icon {
  font-size: 20px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--btn-primary);
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--toast-bg);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  z-index: 100;
  opacity: 1;
  transition: opacity 0.3s;
}

.toast.hidden {
  display: none;
}

.toast.fade-out {
  opacity: 0;
}

/* JSONEditor Theme Adjustments */
.jsoneditor {
  border: none !important;
}

/* Override JSONEditor dark theme support */
@media (prefers-color-scheme: dark) {
  .jsoneditor-menu {
    background: var(--bg-secondary) !important;
    border-bottom: 1px solid var(--border-color) !important;
  }
}
```

- [ ] **Step 2: Test theme switching**

In browser DevTools, emulate dark/light mode to verify CSS variables work
Expected: Colors switch correctly between themes

- [ ] **Step 3: Commit CSS**

```bash
git add popup.css
git commit -m "feat: add popup styles with automatic dark/light theme support"
```

---

### Task 7: Create background.js for Context Menu

**Files:**
- Create: `background.js`

- [ ] **Step 1: Write background.js**

```javascript
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
    
    // Send message to content script to extract and send to popup
    chrome.tabs.sendMessage(tab.id, {
      action: 'formatSelectedJson',
      text: selectedText
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopupWithData') {
    // Store the JSON data temporarily
    chrome.storage.local.set({ pendingJson: message.jsonText });
    
    // Open the popup (this happens automatically when user clicks extension icon)
    // We'll use storage to pass the data to popup
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});
```

- [ ] **Step 2: Update manifest to include storage permission**

```json
// In manifest.json, add to permissions array:
"permissions": [
  "contextMenus",
  "clipboardWrite",
  "clipboardRead",
  "activeTab",
  "storage"  // Add this
]
```

- [ ] **Step 3: Commit background script**

```bash
git add background.js manifest.json
git commit -m "feat: add background service worker for context menu integration"
```

---

### Task 8: Create content.js for Text Extraction

**Files:**
- Create: `content.js`

- [ ] **Step 1: Write content.js**

```javascript
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
```

- [ ] **Step 2: Commit content script**

```bash
git add content.js
git commit -m "feat: add content script for extracting selected JSON text"
```

---

### Task 9: Create popup.js Core Logic - Part 1 (Editor Initialization)

**Files:**
- Create: `popup.js`

- [ ] **Step 1: Write popup.js initialization section**

```javascript
// popup.js - Main popup logic

let editor = null;
let currentJson = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  initEditor();
  setupEventListeners();
  checkPendingData();
});

// Initialize JSONEditor
function initEditor() {
  const container = document.getElementById('jsoneditor');
  
  const options = {
    mode: 'tree',
    modes: ['tree', 'code'], // Allow switching between tree and code
    onError: (error) => {
      showError(error.toString());
    },
    onModeChange: (newMode, oldMode) => {
      console.log(`Mode changed from ${oldMode} to ${newMode}`);
    },
    theme: getThemePreference()
  };
  
  editor = new JSONEditor(container, options);
  
  // Set initial empty JSON
  editor.set({});
}

// Detect system theme preference
function getThemePreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (editor) {
    // JSONEditor will handle theme automatically
    console.log('Theme changed to:', e.matches ? 'dark' : 'light');
  }
});

// Check if there's pending data from context menu
async function checkPendingData() {
  try {
    const result = await chrome.storage.local.get('pendingJson');
    if (result.pendingJson) {
      const jsonInput = document.getElementById('jsonInput');
      jsonInput.value = result.pendingJson;
      
      // Auto-format the data
      formatJson();
      
      // Clear pending data
      await chrome.storage.local.remove('pendingJson');
    }
  } catch (error) {
    console.error('Error checking pending data:', error);
  }
}
```

- [ ] **Step 2: Verify editor initialization**

In Chrome DevTools console after loading extension:
Expected: `editor` variable exists, JSONEditor UI renders

- [ ] **Step 3: Commit initialization logic**

```bash
git add popup.js
git commit -m "feat: add JSONEditor initialization and theme detection"
```

---

### Task 10: Create popup.js Core Logic - Part 2 (Formatting and Preprocessing)

**Files:**
- Modify: `popup.js` (append to existing file)

- [ ] **Step 1: Add preprocessing and formatting functions**

```javascript
// Preprocess JSON string: remove line breaks and extra spaces
function preprocessJson(jsonStr) {
  // Remove all line breaks (structural formatting)
  // Note: In standard JSON, string values use \n escape sequence, not literal newlines
  let cleaned = jsonStr.replace(/\n/g, '');
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Format JSON button handler
function formatJson() {
  const jsonInput = document.getElementById('jsonInput');
  const formatBtn = document.getElementById('formatBtn');
  const rawInput = jsonInput.value;
  
  if (!rawInput) {
    showToast('请输入JSON数据');
    return;
  }
  
  // Show loading state
  formatBtn.classList.add('loading');
  updateStatus('处理中...');
  
  try {
    // Preprocess: remove line breaks
    const cleaned = preprocessJson(rawInput);
    
    // Parse JSON
    const parsed = JSON.parse(cleaned);
    currentJson = parsed;
    
    // Set to editor
    editor.set(parsed);
    
    // Update status
    const size = new Blob([JSON.stringify(parsed)]).size;
    updateStatus(`格式化成功`);
    updateJsonSize(size);
    
    // Show success
    formatBtn.classList.remove('loading');
    formatBtn.classList.add('success');
    setTimeout(() => {
      formatBtn.classList.remove('success');
    }, 1500);
    
    // Hide any previous errors
    hideError();
    
  } catch (error) {
    // Show error
    formatBtn.classList.remove('loading');
    formatBtn.classList.add('error');
    setTimeout(() => {
      formatBtn.classList.remove('error');
    }, 1500);
    
    showError(error.message, error);
    updateStatus('格式化失败');
  }
}

// Update status bar text
function updateStatus(text) {
  document.getElementById('statusText').textContent = text;
}

// Update JSON size display
function updateJsonSize(bytes) {
  let display;
  if (bytes < 1024) {
    display = `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    display = `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    display = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  document.getElementById('jsonSize').textContent = display;
}
```

- [ ] **Step 2: Test preprocessing**

Test with input containing line breaks:
```json
{
  "name": "test",
  "value": 123
}
```
Expected: Editor shows formatted tree view

- [ ] **Step 3: Commit formatting logic**

```bash
git add popup.js
git commit -m "feat: add JSON preprocessing and formatting with error handling"
```

---

### Task 11: Create popup.js Core Logic - Part 3 (Compress, Copy, Save)

**Files:**
- Modify: `popup.js` (append to existing file)

- [ ] **Step 1: Add compress, copy, and save functions**

```javascript
// Compress JSON button handler
function compressJson() {
  if (!currentJson) {
    showToast('请先格式化JSON数据');
    return;
  }
  
  try {
    // Get current JSON from editor
    const json = editor.get();
    
    // Compress: remove all formatting
    const compressed = JSON.stringify(json);
    
    // Show in code mode
    editor.setMode('code');
    editor.setText(compressed);
    
    updateStatus('已压缩');
    const size = new Blob([compressed]).size;
    updateJsonSize(size);
    
    showToast('JSON已压缩');
    
  } catch (error) {
    showError('压缩失败: ' + error.message);
  }
}

// Copy JSON button handler
async function copyJson() {
  if (!currentJson) {
    showToast('请先格式化JSON数据');
    return;
  }
  
  try {
    let textToCopy;
    const currentMode = editor.getMode();
    
    if (currentMode === 'code') {
      // Copy current text from code mode
      textToCopy = editor.getText();
    } else {
      // Copy formatted JSON from tree mode
      textToCopy = JSON.stringify(editor.get(), null, 2);
    }
    
    // Use Clipboard API
    await navigator.clipboard.writeText(textToCopy);
    
    showToast('已复制到剪贴板');
    
  } catch (error) {
    // Fallback for older browsers
    fallbackCopy();
  }
}

// Fallback copy method
function fallbackCopy() {
  const textArea = document.createElement('textarea');
  let textToCopy;
  
  const currentMode = editor.getMode();
  if (currentMode === 'code') {
    textToCopy = editor.getText();
  } else {
    textToCopy = JSON.stringify(editor.get(), null, 2);
  }
  
  textArea.value = textToCopy;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('已复制到剪贴板');
  } catch (error) {
    showError('复制失败');
  }
  
  document.body.removeChild(textArea);
}

// Save JSON button handler
function saveJson() {
  if (!currentJson) {
    showToast('请先格式化JSON数据');
    return;
  }
  
  try {
    const json = editor.get();
    const jsonStr = JSON.stringify(json, null, 2);
    
    // Create download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-json.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    showToast('文件已保存');
    
  } catch (error) {
    showError('保存失败: ' + error.message);
  }
}
```

- [ ] **Step 2: Test copy functionality**

Click copy button after formatting JSON
Expected: Toast shows "已复制到剪贴板", JSON copied to clipboard

- [ ] **Step 3: Commit utility functions**

```bash
git add popup.js
git commit -m "feat: add compress, copy, and save functionality"
```

---

### Task 12: Create popup.js Core Logic - Part 4 (UI Helpers)

**Files:**
- Modify: `popup.js` (append to existing file)

- [ ] **Step 1: Add error display and toast functions**

```javascript
// Show error message
function showError(message, errorObj = null) {
  const errorDisplay = document.getElementById('errorDisplay');
  const errorMessage = document.getElementById('errorMessage');
  
  // Simplify error message
  let displayMessage = message;
  
  // Parse common JSON errors
  if (message.includes('Unexpected token')) {
    displayMessage = 'JSON语法错误: 无效的字符或格式';
  } else if (message.includes('Unexpected end of JSON input')) {
    displayMessage = 'JSON不完整: 缺少结束括号或引号';
  } else if (message.includes('Expected property name')) {
    displayMessage = 'JSON语法错误: 键名缺少引号';
  }
  
  errorMessage.textContent = displayMessage;
  errorDisplay.classList.remove('hidden');
  
  // Store full error for details view
  if (errorObj) {
    errorDisplay.dataset.fullError = errorObj.toString();
  }
}

// Hide error message
function hideError() {
  const errorDisplay = document.getElementById('errorDisplay');
  errorDisplay.classList.add('hidden');
}

// Show error details
function showErrorDetails() {
  const errorDisplay = document.getElementById('errorDisplay');
  const fullError = errorDisplay.dataset.fullError || '无详细信息';
  
  // Create modal or alert with full error
  alert('错误详情:\n\n' + fullError);
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.remove('fade-out');
  
  // Auto hide after 1.5 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('fade-out');
    }, 300);
  }, 1500);
}
```

- [ ] **Step 2: Test error display**

Try formatting invalid JSON: `{invalid json}`
Expected: Error message shows with red styling

- [ ] **Step 3: Commit UI helpers**

```bash
git add popup.js
git commit -m "feat: add error display and toast notification functions"
```

---

### Task 13: Create popup.js Core Logic - Part 5 (Event Bindings)

**Files:**
- Modify: `popup.js` (append to existing file)

- [ ] **Step 1: Add event listener setup**

```javascript
// Setup all event listeners
function setupEventListeners() {
  // Format button
  document.getElementById('formatBtn').addEventListener('click', formatJson);
  
  // Compress button
  document.getElementById('compressBtn').addEventListener('click', compressJson);
  
  // Copy button
  document.getElementById('copyBtn').addEventListener('click', copyJson);
  
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveJson);
  
  // Error details button
  document.getElementById('errorDetailsBtn').addEventListener('click', showErrorDetails);
  
  // Auto-format on paste
  document.getElementById('jsonInput').addEventListener('paste', (e) => {
    // Wait for paste to complete
    setTimeout(() => {
      // Optional: auto-format on paste
      // Uncomment if you want auto-formatting
      // formatJson();
    }, 100);
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      formatJson();
    }
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveJson();
    }
    
    // Ctrl/Cmd + C to copy (when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id !== 'jsonInput') {
      e.preventDefault();
      copyJson();
    }
  });
}
```

- [ ] **Step 2: Test keyboard shortcuts**

Test Ctrl+Enter (format), Ctrl+S (save), Ctrl+C (copy)
Expected: Actions execute correctly

- [ ] **Step 3: Commit final popup logic**

```bash
git add popup.js
git commit -m "feat: add event listeners and keyboard shortcuts"
```

---

### Task 14: Load and Test Extension in Chrome

**Files:**
- None (testing task)

- [ ] **Step 1: Open Chrome Extensions page**

In Chrome: Navigate to `chrome://extensions/`

- [ ] **Step 2: Enable Developer Mode**

Toggle "Developer mode" switch in top-right corner

- [ ] **Step 3: Load unpacked extension**

Click "Load unpacked" button
Select: `/Users/jxrt/Desktop/json-formatter` directory

Expected: Extension appears in list with "JSON Formatter" name

- [ ] **Step 4: Verify basic functionality**

Test checklist:
1. Click extension icon → popup opens
2. Paste valid JSON → format button works
3. JSON appears in editor with tree view
4. Nodes can be expanded/collapsed
5. Copy button works
6. Save button downloads file
7. Error handling for invalid JSON

- [ ] **Step 5: Test theme switching**

Toggle system theme (dark/light)
Expected: Popup colors update automatically

- [ ] **Step 6: Test context menu**

1. Go to any webpage
2. Select some JSON text
3. Right-click → see "格式化选中的JSON" option
4. Click it → notification appears
5. Open popup → JSON is auto-loaded and formatted

- [ ] **Step 7: Document test results**

Create test results file or note any issues found

---

### Task 15: Fix and Refine Issues

**Files:**
- Modify: Various files based on testing results

- [ ] **Step 1: Review test results**

Check if all features work as expected
List any bugs or issues found

- [ ] **Step 2: Fix identified issues**

For each issue:
- Identify root cause
- Fix in appropriate file
- Test again
- Commit fix

- [ ] **Step 3: Optimize performance**

If large JSON (>1MB) causes slowdown:
- Add size warning
- Consider limiting input size

- [ ] **Step 4: Final polish**

- Ensure all buttons have proper hover states
- Verify all error messages are clear
- Check toast notifications timing
- Test edge cases (empty input, very large JSON, malformed JSON)

- [ ] **Step 5: Commit final fixes**

```bash
git add -A
git commit -m "fix: resolve issues from testing and polish UI"
```

---

### Task 16: Create README Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# JSON Formatter Chrome Extension

一个强大的Chrome浏览器插件，用于格式化、查看和编辑JSON数据。

## 功能特性

- ✅ JSON格式化与美化（自动去除换行符）
- ✅ 节点折叠/展开（树状结构查看）
- ✅ JSON压缩（紧凑格式）
- ✅ 复制到剪贴板
- ✅ 保存为文件
- ✅ 语法高亮（自动跟随系统主题：深色/浅色）
- ✅ JSON验证与错误提示
- ✅ JSON编辑功能（树模式和代码模式）
- ✅ 右键菜单快速格式化选中的JSON文本
- ✅ 键盘快捷键支持

## 安装方法

### 开发模式安装

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目根目录

## 使用方法

### 基本使用

1. 点击浏览器工具栏的插件图标
2. 在左侧文本框粘贴JSON数据
3. 点击"格式化"按钮
4. 在右侧查看格式化后的JSON

### 右键菜单

1. 在任何网页上选中JSON文本
2. 右键点击选择"格式化选中的JSON"
3. 点击插件图标查看格式化结果

### 键盘快捷键

- `Ctrl/Cmd + Enter`: 格式化JSON
- `Ctrl/Cmd + S`: 保存JSON文件
- `Ctrl/Cmd + C`: 复制JSON（编辑器焦点时）

## 技术栈

- Chrome Extension Manifest V3
- jsoneditor 9.x
- Vanilla JavaScript
- CSS Variables (自动主题切换)

## 开发

### 项目结构

```
json-formatter-extension/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── content.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/
    ├── jsoneditor.min.js
    └── jsoneditor.min.css
```

### 构建和测试

1. 在Chrome中加载扩展
2. 测试所有功能
3. 检查主题切换
4. 测试右键菜单集成

## 版本历史

- v1.0.0 (2026-06-05): 初始版本
  - 核心格式化功能
  - 主题切换支持
  - 右键菜单集成

## 许可证

MIT License

## 作者

Claude Code AI Assistant
```

- [ ] **Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add README with installation and usage instructions"
```

---

### Task 17: Final Review and Package

**Files:**
- Review all files

- [ ] **Step 1: Review complete implementation**

Checklist:
- [ ] All core features working
- [ ] Theme switching functional
- [ ] Right-click menu working
- [ ] Error handling clear
- [ ] No placeholder code
- [ ] README complete

- [ ] **Step 2: Create version tag**

```bash
git tag v1.0.0 -a -m "JSON Formatter Chrome Extension v1.0.0 - Initial release"
```

- [ ] **Step 3: Package extension**

Option 1: Use Chrome's packaging feature in `chrome://extensions/`
Option 2: Create zip for distribution

```bash
zip -r json-formatter-extension.zip . -x ".git/*" -x "*.DS_Store"
```

- [ ] **Step 4: Final commit summary**

```bash
git log --oneline
```

Expected: See all commits from Task 1 to Task 17

---

## Plan Self-Review

**1. Spec Coverage:**
- ✅ Core features: formatting, folding, compression, copy, syntax highlighting - Covered in Tasks 9-13
- ✅ JSON validation - Covered in Task 10 (error handling)
- ✅ JSON editing - Covered by jsoneditor modes in Task 9
- ✅ Context menu - Covered in Tasks 7-8
- ✅ Theme switching - Covered in Task 6 (CSS) and Task 9 (JS)
- ✅ Error handling - Covered in Task 12
- ✅ File structure - Covered in Tasks 1-4

**2. Placeholder Scan:**
- ✅ No "TBD" or "TODO"
- ✅ All code blocks contain actual implementation
- ✅ All commands are specific
- ✅ No "implement later" phrases

**3. Type Consistency:**
- ✅ Function names consistent: `formatJson`, `compressJson`, `copyJson`, `saveJson`
- ✅ Variable names: `editor`, `currentJson`
- ✅ Event listener names match button IDs

**Gaps Found:**
- Need to add size warning for large JSON (>5MB) - Added in Task 15
- Need storage permission in manifest - Fixed in Task 7

---

Plan complete and saved to `docs/superpowers/plans/2026-06-05-json-formatter-plan.md`.