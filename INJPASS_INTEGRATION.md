# INJ Pass 集成到 Omisper - 完成指南

## ✅ 已完成的工作

### 1. SDK 发布
- ✅ **Package**: `@injpass/connector@0.1.0`
- ✅ **NPM**: https://www.npmjs.com/package/@injpass/connector
- ✅ **发布时间**: 5分钟前

### 2. 集成文件已创建

#### 📁 文件清单

```
Omisper/apps/xmtp.chat/
├── src/
│   ├── services/
│   │   └── injpass-wallet.ts           ← 核心钱包适配器
│   ├── hooks/
│   │   └── useInjPassWallet.ts         ← React Hook
│   └── components/
│       └── InjPassWallet.tsx           ← UI 组件
└── package.json                        ← 已添加依赖
```

---

## 🔧 安装依赖

### 当前问题
Yarn 4.x 可能还没有从 NPM registry 同步到包。请等待 5-10 分钟后重试：

```bash
cd /Users/ivy/Desktop/program/injective/INJ_Pass/Omisper
yarn install
```

### 替代方案（如果 Yarn 仍然失败）

使用本地文件路径安装：

```bash
cd /Users/ivy/Desktop/program/injective/INJ_Pass/Omisper/apps/xmtp.chat

# 方法1：使用 NPM（绕过 Yarn）
npm install @injpass/connector

# 方法2：本地路径（开发测试）
yarn add file:/Users/ivy/Desktop/program/injective/INJ_Pass/inj-pass-frontend/packages/injpass-connector

# 方法3：等待 NPM 完全同步后（推荐）
# 等待 10分钟，然后：
yarn install
```

---

## 🎯 使用方法

### 1. 简单按钮集成

在任何组件中使用：

```tsx
import { InjPassConnectButton } from './components/InjPassWallet';

function MyComponent() {
  return (
    <div>
      <InjPassConnectButton />
    </div>
  );
}
```

### 2. 完整钱包面板

```tsx
import { InjPassWalletButton } from './components/InjPassWallet';

function Dashboard() {
  return (
    <div>
      <InjPassWalletButton />
    </div>
  );
}
```

### 3. 自定义逻辑（使用 Hook）

```tsx
import { useInjPassWallet } from './hooks/useInjPassWallet';

function CustomWallet() {
  const { 
    address, 
    isConnected, 
    connect, 
    disconnect,
    signMessage 
  } = useInjPassWallet();

  const handleSign = async () => {
    const signature = await signMessage('Hello XMTP!');
    console.log('Signature:', signature);
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <div>
          <p>Address: {address}</p>
          <button onClick={handleSign}>Sign Message</button>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

### 4. 直接使用服务

```tsx
import { getInjPassWallet } from './services/injpass-wallet';

async function someFunction() {
  const wallet = getInjPassWallet();
  
  // Connect
  const address = await wallet.connect();
  console.log('Connected:', address);
  
  // Sign
  const signature = await wallet.signMessage('test');
  
  // Disconnect
  wallet.disconnect();
}
```

---

## 🔐 配置 CSP（重要！）

在 Omisper 的配置中添加 CSP 允许 iframe：

### Vite 配置

如果有 `vite.config.ts`，添加：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "frame-src http://localhost:3000 https://injpass.xyz"
    }
  }
});
```

### Vercel 部署

创建 `vercel.json`（或添加到现有文件）：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-src https://injpass.xyz"
        }
      ]
    }
  ]
}
```

---

## 🧪 测试流程

### 本地测试（开发环境）

1. **启动 INJ Pass 前端**：
   ```bash
   cd /Users/ivy/Desktop/program/injective/INJ_Pass/inj-pass-frontend
   pnpm dev
   # 运行在 http://localhost:3000
   ```

2. **启动 Omisper**：
   ```bash
   cd /Users/ivy/Desktop/program/injective/INJ_Pass/Omisper
   yarn dev
   ```

3. **测试集成**：
   - 打开 Omisper 应用
   - 点击 "Connect INJ Pass" 按钮
   - Iframe 应该出现在右下角
   - 点击 "Connect with Passkey"
   - 完成 Touch ID/Face ID 认证
   - 查看连接状态

### 生产测试

部署 INJ Pass 到 Vercel 后，Omisper 会自动使用 `https://injpass.xyz/embed`。

---

## 📍 集成示例位置

### 建议集成点

1. **Header/Navbar**
   ```tsx
   // src/layouts/Header.tsx
   import { InjPassConnectButton } from '../components/InjPassWallet';
   
   export function Header() {
     return (
       <header>
         <Logo />
         <Nav />
         <InjPassConnectButton />  {/* ← 添加这里 */}
       </header>
     );
   }
   ```

2. **设置页面**
   ```tsx
   // src/pages/Settings.tsx
   import { InjPassWalletButton } from '../components/InjPassWallet';
   
   export function Settings() {
     return (
       <div>
         <h1>钱包设置</h1>
         <InjPassWalletButton />  {/* ← 完整面板 */}
       </div>
     );
   }
   ```

3. **登录页面**
   ```tsx
   // src/pages/Login.tsx
   import { useInjPassWallet } from '../hooks/useInjPassWallet';
   
   export function Login() {
     const { connect, address } = useInjPassWallet();
     
     const handleLogin = async () => {
       await connect();
       // 使用 address 进行 XMTP 认证
     };
     
     return <button onClick={handleLogin}>Login with INJ Pass</button>;
   }
   ```

---

## 🔄 环境配置

确保有正确的环境变量：

### 开发环境 (`.env.development`)
```bash
# INJ Pass embed URL (本地开发)
VITE_INJPASS_EMBED_URL=http://localhost:3000/embed
```

### 生产环境 (`.env.production`)
```bash
# INJ Pass embed URL (生产环境)
VITE_INJPASS_EMBED_URL=https://injpass.xyz/embed
```

然后在代码中使用，如果需要：

```typescript
// src/services/injpass-wallet.ts
embedUrl: import.meta.env.VITE_INJPASS_EMBED_URL || 'https://injpass.xyz/embed'
```

---

## ✅ 完成检查清单

- [x] SDK 发布到 NPM
- [x] 创建钱包适配器 (`injpass-wallet.ts`)
- [x] 创建 React Hook (`useInjPassWallet.ts`)
- [x] 创建 UI 组件 (`InjPassWallet.tsx`)
- [x] 添加依赖到 package.json
- [ ] 运行 `yarn install`（等待 NPM 同步）
- [ ] 配置 CSP
- [ ] 在 Omisper 界面中添加组件
- [ ] 本地测试连接流程
- [ ] 测试签名功能
- [ ] 生产部署测试

---

## 🐛 故障排查

### 问题 1: "No candidates found" (Yarn)

**原因**: NPM registry 同步延迟（刚发布的包）

**解决方案**:
1. 等待 5-10 分钟
2. 或使用 npm 安装：`npm install @injpass/connector`
3. 或使用本地路径（开发）

### 问题 2: Iframe 不显示

**原因**: CSP 限制

**解决方案**:
- 检查浏览器控制台
- 添加 `frame-src http://localhost:3000` 到 CSP

### 问题 3: "Connection timeout"

**可能原因**:
- INJ Pass 前端未运行
- embedUrl 配置错误
- 无钱包（需要先创建）

**解决方案**:
- 确认 http://localhost:3000/embed 可访问
- 先访问 http://localhost:3000/welcome 创建钱包

---

## 📞 下一步

1. **等待 10 分钟**让 NPM 完全同步
2. **运行** `yarn install`
3. **添加组件**到 Omisper 界面
4. **测试**完整流程

需要帮助可以随时询问！🚀
