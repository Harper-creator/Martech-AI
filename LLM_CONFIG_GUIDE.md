# 🔧 LLM 配置管理 - 完整指南

## 📋 概述

这个功能允许你在前端直接配置和切换不同的大语言模型 (LLM) 提供商，无需修改代码或环境变量。支持 **DeepSeek**、**OpenAI**、**Claude** 等多个提供商。

## ✨ 主要特性

- ✅ **前端配置** - 直接在浏览器中添加和管理 LLM 配置
- ✅ **多提供商支持** - DeepSeek、OpenAI、Claude、Gemini、自定义
- ✅ **一键切换** - 随时切换不同的 LLM 提供商
- ✅ **本地存储** - 配置安全地保存在本地浏览器存储中
- ✅ **参数自定义** - 调整温度、Max Tokens 等参数
- ✅ **配置验证** - 快速验证 API Key 和配置有效性

## 🚀 快速开始

### 1. 集成 LLMSettings 组件

在你的 React 应用中导入并使用 `LLMSettings` 组件：

```typescript
import React from 'react';
import LLMSettings from './components/LLMSettings';

function App() {
  const handleConfigChange = (config) => {
    console.log('当前使用配置:', config);
    // 保存配置到全局状态或 Context
  };

  return (
    <div>
      <LLMSettings onConfigChange={handleConfigChange} />
    </div>
  );
}

export default App;
```

### 2. 在代码中使用配置

从 localStorage 读取当前配置并用于 API 调用：

```typescript
import { LLMFactory } from './services/llmProvider';
import { GenerateRequest } from './types/llm';

async function generateReport(prompt: string) {
  // 读取保存的配置
  const configs = JSON.parse(localStorage.getItem('llm_configs') || '[]');
  const defaultConfig = configs.find((c: any) => c.isDefault);

  if (!defaultConfig) {
    alert('请先在设置中配置 LLM');
    return;
  }

  // 创建 LLM 提供商实例
  const provider = LLMFactory.createProvider(defaultConfig);

  // 发送请求到后端
  const response = await fetch('/api/generate-with-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      llmConfig: defaultConfig,
      prompt,
      systemInstruction: '你是一个专业的商业顾问...',
    })
  });

  const result = await response.json();
  return result.text;
}
```

## 📖 支持的 LLM 提供商

### 1. DeepSeek 🚀

```
提供商: deepseek
默认模型: deepseek-chat
API 地址: https://api.deepseek.com/v1
获取 API Key: https://platform.deepseek.com/
```

**配置示例：**
```json
{
  "name": "DeepSeek 配置",
  "provider": "deepseek",
  "apiKey": "sk-xxxxx",
  "model": "deepseek-chat",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

### 2. OpenAI 🤖

```
提供商: openai
默认模型: gpt-4-turbo
API 地址: https://api.openai.com/v1
获取 API Key: https://platform.openai.com/account/api-keys
```

**配置示例：**
```json
{
  "name": "OpenAI GPT-4",
  "provider": "openai",
  "apiKey": "sk-proj-xxxxx",
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

### 3. Claude (Anthropic) 🧠

```
提供商: claude
默认模型: claude-3-sonnet-20240229
API 地址: https://api.anthropic.com/v1
获取 API Key: https://console.anthropic.com/
```

**配置示例：**
```json
{
  "name": "Claude 3 Sonnet",
  "provider": "claude",
  "apiKey": "sk-ant-xxxxx",
  "model": "claude-3-sonnet-20240229",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

### 4. Google Gemini 🌟

```
提供商: gemini
默认模型: gemini-pro
API 地址: https://generativelanguage.googleapis.com/v1beta
获取 API Key: https://aistudio.google.com/app/apikey
```

### 5. 自定义 LLM 🛠️

支持任何兼容 OpenAI API 格式的自定义 LLM：

```json
{
  "name": "自定义本地模型",
  "provider": "custom",
  "apiKey": "your-api-key",
  "apiUrl": "http://localhost:8000/v1",
  "model": "your-model-name",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

## 🔌 API 端点

### 1. 配置可调用的 LLM 生成

**端点：** `POST /api/generate-with-llm`

**请求体：**
```typescript
{
  llmConfig: {
    provider: 'deepseek',
    apiKey: 'sk-xxxxx',
    model: 'deepseek-chat',
    temperature?: 0.7,
    maxTokens?: 2000
  },
  prompt: '你好，请告诉我...',
  systemInstruction?: '你是一个专业顾问...',
  temperature?: 0.7,
  maxTokens?: 2000
}
```

**响应：**
```typescript
{
  text: "生成的内容...",
  provider: "deepseek",
  model: "deepseek-chat",
  usage: {
    promptTokens: 100,
    completionTokens: 200,
    totalTokens: 300
  }
}
```

### 2. 验证 LLM 配置

**端点：** `POST /api/validate-llm`

**请求体：**
```typescript
{
  llmConfig: {
    provider: 'deepseek',
    apiKey: 'sk-xxxxx',
    model: 'deepseek-chat'
  }
}
```

**响应：**
```typescript
{
  valid: true,
  message: "Configuration is valid",
  response: { ... }
}
```

## 💻 使用示例

### 示例 1: 添加 DeepSeek 配置

1. 在应用中打开 LLMSettings 组件
2. 填写表单：
   - 配置名称: "我的 DeepSeek"
   - 提供商: 选择 "DeepSeek"
   - API Key: 粘贴你的 DeepSeek API Key
   - 模型: `deepseek-chat`
3. 点击"保存配置"

### 示例 2: 在报告生成器中使用 LLM

```typescript
// src/components/ReportGenerator.tsx
import { useState, useEffect } from 'react';
import { SavedLLMConfig } from '../types/llm';

export function ReportGenerator() {
  const [config, setConfig] = useState<SavedLLMConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 读取默认配置
    const configs = JSON.parse(localStorage.getItem('llm_configs') || '[]');
    const defaultConfig = configs.find((c: any) => c.isDefault);
    setConfig(defaultConfig);
  }, []);

  const generateReport = async (prompt: string) => {
    if (!config) {
      alert('请先在设置中配置 LLM');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-with-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llmConfig: config,
          prompt,
          systemInstruction: '你是一个专业的商业报告撰写专家...',
        })
      });

      const result = await response.json();
      console.log('生成的报告:', result.text);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>当前使用: {config?.name || '未配置'}</p>
      <button onClick={() => generateReport('生成一份市场分析报告')}>
        生成报告
      </button>
    </div>
  );
}
```

### 示例 3: 动态切换 LLM

```typescript
function LLMSwitcher() {
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('llm_configs') || '[]');
    setConfigs(saved);
  }, []);

  const switchConfig = (configId: string) => {
    const updated = configs.map(c => ({
      ...c,
      isDefault: c.id === configId
    }));
    localStorage.setItem('llm_configs', JSON.stringify(updated));
    window.location.reload(); // 或使用 Context 更新
  };

  return (
    <div>
      {configs.map(config => (
        <button
          key={config.id}
          onClick={() => switchConfig(config.id)}
          className={config.isDefault ? 'active' : ''}
        >
          {config.name}
        </button>
      ))}
    </div>
  );
}
```

## 🔐 安全建议

### 1. API Key 安全管理

```typescript
// ❌ 不要这样做
const apiKey = "sk-xxxxx";

// ✅ 使用环境变量（仅限开发）
const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;

// ✅ 使用本地存储（浏览器内置安全）
const apiKey = localStorage.getItem('deepseek_api_key');
```

### 2. 防止 API Key 泄露

- ✅ API Key 存储在本地浏览器 localStorage（不传输）
- ✅ 配置管理界面中 API Key 输入框支持隐藏显示
- ✅ 生产环境建议使用后端代理
- ❌ 永远不要在代码中硬编码 API Key
- ❌ 永远不要在 Git 中提交 API Key

### 3. 后端代理模式（推荐用于生产）

```typescript
// server.ts - 后端代理 API 请求
app.post("/api/generate-with-llm", async (req, res) => {
  const { prompt, mode } = req.body;
  
  // 使用服务器端的 API Key，而不是客户端传来的
  const llmConfig = {
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat'
  };
  
  const provider = LLMFactory.createProvider(llmConfig);
  const response = await provider.generate({ prompt, llmConfig });
  res.json(response);
});
```

## 📊 性能优化

### 1. 缓存生成结果

```typescript
const cache = new Map<string, any>();

async function generateWithCache(prompt: string, config: SavedLLMConfig) {
  const cacheKey = `${config.id}:${prompt}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await fetch('/api/generate-with-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ llmConfig: config, prompt })
  });
  
  const result = await response.json();
  cache.set(cacheKey, result);
  return result;
}
```

### 2. 并行生成多个请求

```typescript
async function generateMultiple(prompts: string[], config: SavedLLMConfig) {
  return Promise.all(
    prompts.map(prompt =>
      fetch('/api/generate-with-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llmConfig: config, prompt })
      }).then(r => r.json())
    )
  );
}
```

## 🐛 故障排除

### 问题 1: API Key 无效

```
错误: 401 Unauthorized
解决步骤:
1. 检查 API Key 是否正确复制
2. 确认 API Key 未过期
3. 访问提供商的官方网站重新生成 API Key
4. 在 LLMSettings 中重新保存配置
```

### 问题 2: 请求超时

```
错误: Request timeout
解决步骤:
1. 检查网络连接
2. 尝试减少 maxTokens 参数
3. 检查 API 提供商的服务状态
4. 切换到其他 LLM 提供商测试
```

### 问题 3: 跨域错误 (CORS)

```
错误: CORS policy violation
解决:
- 确保使用了正确的 API 端点
- 如需支持多个域名，在后端配置 CORS
```

### 问题 4: 生成内容质量不佳

```
改进建议:
1. 调整 temperature 参数（0 = 确定，2 = 创意）
2. 优化 systemInstruction 提示词
3. 提供更详细的上下文信息
4. 尝试其他 LLM 提供商对比
```

## 📚 相关文档

- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Claude API 文档](https://docs.anthropic.com/)
- [Google Gemini API 文档](https://ai.google.dev/docs)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
