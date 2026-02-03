# Omisper

<div align="center">

**基于 XMTP 协议的去中心化 P2P 消息应用**

*端到端加密 • 去中心化 • 隐私优先*

**Powered by XMTP • Secured on Injective**

</div>

---

## 📖 简介

Omisper 是一个基于 XMTP（Extensible Message Transport Protocol）协议构建的去中心化点对点消息应用。通过区块链技术和端到端加密，为用户提供安全、私密、无需信任第三方的通信体验。

**核心理念：**
- 🔐 **端到端加密** - 只有通信双方能读取消息内容
- 🌐 **去中心化** - 无中心化服务器，消息通过 XMTP 网络传输
- 🔑 **自主控制** - 您的密钥，您的消息，完全掌控数据
- ⚡ **高性能** - 基于 Injective 网络，快速且低成本

---

## ✨ 功能特性

### 核心功能

- **💬 实时消息** - 支持一对一私聊和群组聊天
- **👥 群组管理** - 创建、管理群组，添加/移除成员
- **📎 多媒体支持** - 支持文本、图片、文件附件
- **💬 富文本** - Markdown 格式支持
- **↩️ 消息回复** - 引用回复功能
- **👀 已读回执** - 消息已读状态
- **😊 表情反应** - 为消息添加表情回应

### 区块链集成

- **🌉 Injective 网络** - 支持 Injective 主网和测试网
- **👛 多钱包兼容** - 支持 MetaMask、Coinbase Wallet、WalletConnect 等
- **💼 智能合约钱包** - 支持 Account Abstraction (ERC-4337)
- **🔄 一键切换网络** - 便捷的网络切换功能

### 用户体验

- **🎨 现代化 UI** - 仿微信风格的清爽界面
- **📱 响应式设计** - 完美适配移动端和桌面端
- **🌓 主题系统** - 精心设计的颜色方案

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 22.0.0
- **Yarn**: 4.10.3+
- **浏览器**: 支持 Web3 的现代浏览器

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/injective-labs/omisper.git
cd omisper
```

2. **安装依赖**

```bash
yarn install
```

3. **配置环境变量**

在 `apps/xmtp.chat` 目录下创建 `.env` 文件：

```env
VITE_PROJECT_ID=your_walletconnect_project_id
```

> 💡 从 [WalletConnect Cloud](https://cloud.walletconnect.com/) 获取免费的 Project ID

4. **启动开发服务器**

```bash
cd apps/xmtp.chat
yarn dev
```

5. **访问应用**

打开浏览器访问 `http://localhost:5173`

---

## 🛠 技术栈

### 前端框架

- **React 19** - 用户界面构建
- **TypeScript 5.9** - 类型安全的 JavaScript
- **Vite 7** - 下一代前端构建工具

部署
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 本地构建
yarn build

# 4. 部署
wrangler pages deploy apps/xmtp.chat/dist

### Web3 技术

- **XMTP Browser SDK** - XMTP 协议集成
- **Wagmi 2** - React Hooks for Ethereum
- **Viem 2** - TypeScript Ethereum 库
- **Injective Chain** - 基于 Cosmos 的高性能区块链

### UI 组件库

- **Mantine 8** - React 组件库
- **React Markdown** - Markdown 渲染

---

## 🔐 安全性

### 端到端加密

- 所有消息使用 XMTP 协议的端到端加密
- 私钥永不离开用户设备
- 使用钱包签名进行身份验证

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🔗 相关链接

- **XMTP 官网**: [https://xmtp.org](https://xmtp.org)
- **Injective 官网**: [https://injective.com](https://injective.com)
- **WalletConnect**: [https://walletconnect.com](https://walletconnect.com)

---

<div align="center">

**用 ❤️ 构建，为去中心化未来**

Made with ❤️ for the decentralized future

</div>