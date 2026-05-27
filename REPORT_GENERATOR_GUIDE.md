# AI 报告生成器 - 完整指南

## 📋 概述

AI 报告生成器是一个强大的工具，利用 Google Gemini API 的能力，帮助你一键生成专业、高质量的商业报告。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @google/generative-ai
```

### 2. 配置 API Key

在 `.env.local` 文件中添加你的 Gemini API Key：

```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
```

### 3. 集成到应用

```typescript
import ReportGeneratorComponent from "./components/ReportGenerator";

function App() {
  return <ReportGeneratorComponent />;
}
```

## 📊 主要功能

### 1. 报告类型

支持以下预设报告类型：

- **商业报告 (Business)** - 适合管理层、投资者、股东汇报
- **营销报告 (Marketing)** - 适合营销活动分析、策略制定
- **数据分析 (Analytics)** - 适合数据驱动的决策
- **性能报告 (Performance)** - 适合绩效评估、改进计划
- **自定义 (Custom)** - 完全自定义内容结构

### 2. 报告风格

- **正式 (Formal)** - 专业、结构化，适合高层汇报
- **轻松 (Casual)** - 易于理解，适合团队内部分享
- **技术性 (Technical)** - 深度技术分析，适合专家团队

### 3. 多语言支持

- 中文 (zh) - 生成中文报告
- 英文 (en) - 生成英文报告

## 📖 使用示例

### 示例 1: 生成月度商业报告

```typescript
const config: ReportConfig = {
  title: "2024年5月商业报告",
  type: "business",
  language: "zh",
  style: "formal",
  dataContext: `
    月收入: ¥500,000
    成本: ¥300,000
    新客户数: 50
    保留率: 85%
  `,
};

const report = await generator.generateReport(config);
```

### 示例 2: 流式生成报告

```typescript
const chunks: string[] = [];

await generator.generateReportStream(config, (chunk) => {
  chunks.push(chunk);
  console.log("接收到新内容:", chunk);
});
```

### 示例 3: 生成多个报告变体

```typescript
const variations = await generator.generateReportVariations(config, 3);

// variations 包含3个不同风格的报告
// [正式风格, 轻松风格, 技术性风格]
```

## 🔧 API 参考

### ReportConfig 接口

```typescript
interface ReportConfig {
  title: string;           // 报告标题（必填）
  type: ReportType;        // 报告类型（必填）
  dataContext?: string;    // 数据背景（可选）
  language?: "en" | "zh";  // 语言（默认: "en"）
  style?: ReportStyle;     // 报告风格（默认: "formal"）
  sections?: string[];     // 自定义章节（可选）
}
```

### GeneratedReport 接口

```typescript
interface GeneratedReport {
  title: string;           // 报告标题
  content: string;         // 完整报告内容
  summary: string;         // 摘要
  sections: ReportSection[]; // 结构化的章节
  generatedAt: string;     // 生成时间
  model: string;           // 使用的模型
}
```

### ReportSection 接口

```typescript
interface ReportSection {
  heading: string;         // 章节标题
  content: string;         // 章节内容
  insights?: string[];     // 关键洞察（可选）
}
```

## 💡 最佳实践

### 1. 提供充分的数据背景

```typescript
// 好
dataContext: `
季度销售数据:
- Q1: ¥1M, 增长 10%
- Q2: ¥1.2M, 增长 20%
- 主要产品: A产品销售占60%
- 客户满意度: 4.5/5
`

// 不好
dataContext: "销售很好"
```

### 2. 使用合适的报告类型

- 汇报给高层？使用 **Business + Formal**
- 团队内部讨论？使用 **Marketing + Casual**
- 数据驱动决策？使用 **Analytics + Technical**

### 3. 自定义章节结构

```typescript
const config: ReportConfig = {
  title: "产品市场分析",
  type: "custom",
  sections: [
    "执行摘要",
    "市场规模与增长",
    "竞争格局",
    "机会与威胁",
    "建议与行动计划",
  ],
};
```

### 4. 利用流式生成获得实时反馈

```typescript
// 适合长报告，可以实时显示生成进度
await generator.generateReportStream(config, (chunk) => {
  updateUI(chunk); // 实时更新UI
});
```

## 🎯 常见用途

### 1. 月度/季度业务汇报
```typescript
{
  title: `${month}月业务汇报`,
  type: "business",
  language: "zh",
  style: "formal"
}
```

### 2. 营销活动分析
```typescript
{
  title: "社媒营销活动效果分析",
  type: "marketing",
  language: "zh",
  dataContext: "阅读量: 50K, 互动率: 5%, 转化率: 2%"
}
```

### 3. 数据驱动的决策报告
```typescript
{
  title: "用户行为分析报告",
  type: "analytics",
  style: "technical",
  dataContext: "DAU增长: 15%, 保留率: 70%, 付费转化: 8%"
}
```

### 4. 绩效评估报告
```typescript
{
  title: "2024年度绩效评估",
  type: "performance",
  language: "zh",
  dataContext: "KPI完成率: 120%, 创新项目: 3个, 团队评分: 4.2/5"
}
```

## 🔐 安全建议

1. **不要在代码中硬编码 API Key**
   ```typescript
   // ❌ 不要这样做
   const apiKey = "sk-proj-xxxxx";
   
   // ✅ 使用环境变量
   const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
   ```

2. **设置 API 限流**
   ```typescript
   // 添加简单的速率限制
   const rateLimiter = new Map();
   
   function canGenerate(userId: string): boolean {
     const lastTime = rateLimiter.get(userId) || 0;
     if (Date.now() - lastTime < 3000) return false; // 3秒限制
     rateLimiter.set(userId, Date.now());
     return true;
   }
   ```

3. **验证用户输入**
   ```typescript
   function validateConfig(config: ReportConfig): boolean {
     if (!config.title || config.title.length > 200) return false;
     if (!config.dataContext || config.dataContext.length > 5000) return false;
     return true;
   }
   ```

## 📊 与其他系统集成

### 与数据库集成
```typescript
// 保存生成的报告
async function saveReport(report: GeneratedReport, userId: string) {
  await db.reports.insert({
    userId,
    title: report.title,
    content: report.content,
    summary: report.summary,
    sections: report.sections,
    createdAt: new Date(report.generatedAt),
  });
}
```

### 与邮件系统集成
```typescript
// 发送报告邮件
async function emailReport(report: GeneratedReport, email: string) {
  await mailer.send({
    to: email,
    subject: `报告: ${report.title}`,
    html: markdownToHtml(report.content),
    attachments: [{
      filename: `${report.title}.md`,
      content: report.content,
    }],
  });
}
```

### 与存储系统集成
```typescript
// 上传报告到云存储
async function uploadReport(report: GeneratedReport) {
  const filename = `reports/${Date.now()}-${report.title}.md`;
  await storage.upload({
    file: report.content,
    path: filename,
  });
  return filename;
}
```

## 🐛 故障排除

### 问题 1: API Key 不有效
```
错误: Failed to generate report: Invalid API key
解决: 检查 .env.local 文件中的 API Key 是否正确
```

### 问题 2: 请求超时
```
错误: Failed to generate report: Request timeout
解决: 
- 检查网络连接
- 减少 dataContext 的长度
- 尝试使用流式生成
```

### 问题 3: 生成内容质量不佳
```
改进建议:
- 提供更详细的 dataContext
- 选择更合适的 style
- 使用自定义 sections 指导内容结构
```

## 📈 性能优化

### 1. 缓存报告
```typescript
const cache = new Map<string, GeneratedReport>();

async function generateOrGetCached(config: ReportConfig) {
  const key = JSON.stringify(config);
  if (cache.has(key)) return cache.get(key);
  
  const report = await generator.generateReport(config);
  cache.set(key, report);
  return report;
}
```

### 2. 并行生成多个报告
```typescript
const [report1, report2, report3] = await Promise.all([
  generator.generateReport(config1),
  generator.generateReport(config2),
  generator.generateReport(config3),
]);
```

### 3. 异步生成
```typescript
// 立即返回，后台生成
async function generateAsync(config: ReportConfig) {
  const taskId = generateId();
  
  generator.generateReport(config).then(report => {
    saveReport(report, taskId);
    notifyUser(taskId); // 生成完成后通知用户
  });
  
  return taskId;
}
```

## 📚 相关资源

- [Google Gemini API 文档](https://ai.google.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [React 文档](https://react.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
