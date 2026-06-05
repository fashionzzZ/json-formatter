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
    mode: 'code', // Default to code mode
    modes: ['code', 'tree'], // Allow switching between code and tree
    onError: (error) => {
      showError(error.toString());
    },
    onModeChange: (newMode, oldMode) => {
      console.log(`Mode changed from ${oldMode} to ${newMode}`);
    }
  };

  editor = new JSONEditor(container, options);

  // Set initial empty JSON
  editor.set({});
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (editor) {
    console.log('Theme changed to:', e.matches ? 'dark' : 'light');
  }
});

// Check if there's pending data from context menu
async function checkPendingData() {
  try {
    const result = await chrome.storage.local.get(['pendingJson', 'autoFormat']);
    if (result.pendingJson) {
      const jsonInput = document.getElementById('jsonInput');
      jsonInput.value = result.pendingJson;

      // Auto-format the data if requested
      if (result.autoFormat) {
        setTimeout(() => {
          formatJson();
        }, 100); // Small delay to ensure editor is ready
      }

      // Clear pending data
      await chrome.storage.local.remove(['pendingJson', 'autoFormat']);
    }
  } catch (error) {
    console.error('Error checking pending data:', error);
  }
}

// Preprocess JSON string: remove line breaks and extra spaces
function preprocessJson(jsonStr) {
  // Remove all line breaks (structural formatting)
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

// Setup all event listeners
function setupEventListeners() {
  // Format button
  document.getElementById('formatBtn').addEventListener('click', formatJson);

  // Compress button
  document.getElementById('compressBtn').addEventListener('click', compressJson);

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', copyJson);

  // Error details button
  document.getElementById('errorDetailsBtn').addEventListener('click', showErrorDetails);

  // Auto-format on paste (optional)
  document.getElementById('jsonInput').addEventListener('paste', (e) => {
    // Wait for paste to complete
    setTimeout(() => {
      // Uncomment if you want auto-formatting on paste
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

    
    // Ctrl/Cmd + C to copy (when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id !== 'jsonInput') {
      e.preventDefault();
      copyJson();
    }
  });
}