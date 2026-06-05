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
- jsoneditor 9.10.2
- Vanilla JavaScript
- CSS Variables (自动主题切换)

## 开发

### 项目结构

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
    ├── jsoneditor.min.js  # JSONEditor library
    └── jsoneditor.min.css # JSONEditor styles
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