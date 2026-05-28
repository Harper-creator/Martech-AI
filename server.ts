import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with defensive checks
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI capabilities will return a descriptive error.");
}

// Prompts helper
function getSystemInstruction(mode: string, role: string) {
  const baseInstruction = `You are a World-Class Senior Martech + AI Strategic Solutions Architect and Managing Consultant (ex-McKinsey/Accenture/Salesforce Solution Director).
Your mission is to empower the user—who could be a Deliver Lead (PMO), Customer Success Manager (CSM), Business Analyst (BA), or Business Development Director (BD)—to achieve an elite consultant's level of expertise, strategic depth, and professional polish.

You must deliver highly structured, practical, action-oriented, and industry-specific recommendations. Avoid generic advice, buzzword-heavy fluff, or empty promises. Provide rigorous, quantified frameworks, real-world tech stacks (CDP, CRM, GenAI, RAG, Marketing Automation integration), project plans, and value models.

Always speak in professional Chinese (Simplified). Use markdown for styling and format with excellent spacing, tables, and crystal-clear bullet points.`;

  switch(mode) {
    case 'diagnose':
      return `${baseInstruction}
Focus strictly on customer demand diagnosis, deep business discovery, and pain-point analysis for different industries.
Provide:
1. Dynamic Pre-consultation Discovery Questionnaire (5 key discovery questions with clear business rationale for asking).
2. Deep Pain-point Analysis Matrix tailored to their industry and size.
3. Diagnostic scoring framework (Diagnostic Assessment Metrics with standard parameters).
Let the user feel like an elite business analyst.`;

    case 'architect':
      return `${baseInstruction}
Focus on Technical and Business Integration Architecture. 
Provide a clear blueprints or block-logic proposal highlighting:
1. Data Layer: Where does client-data sit? (CDP, Lakehouse, CRM, SDKs)
2. Intelligence Layer: AI engines (RAG, LLM agent pools, Predictive ML, DSP, LLM-based content generators) and orchestrators.
3. Execution & Channel Layer: Touchpoints (SMS, Email, Web, WeChat, App, Customer Service Desk).
4. System Integration Checklist (APIs, Webhooks, Privacy & Compliance - e.g. GDPR, PIPL).
Use Markdown tables or flow charts (using text boundaries or simple tables) to design the visual flow blocks.`;

    case 'delivery-plan':
      return `${baseInstruction}
Focus on PMO, Delivery, and Project Management.
Provide:
1. Rigorous Deliver Roadmap (Phase 1-4, key durations, deliverables, and dependencies).
2. Martech+AI RACI Chart (Who does What: Client Marketing, Client IT, Consulting Team PM, Solution Architect, Success Manager).
3. Risk & Mitigation Register (GDPR/Compliance, data silo integration bottlenecks, model hallucinations, adoption speed) in a Markdown table.`;

    case 'csm-kpi':
      return `${baseInstruction}
Focus on Customer Success, Business Metrics, Value Realization, and Optimization.
Provide:
1. Core Value Tree (strategic goals mapped to operational KPIs, showing mathematical relations, e.g. GMV = Active Users * Conversion Rate * AOV, and how Martech+AI lifts each).
2. CSM Value Realization Action Playbook (First 30-60-90-180 days plan).
3. Retention and LTV Optimization Strategy.`;

    case 'bd-pitch':
      return `${baseInstruction}
Focus on BD, Sales Pitches, Client Proposals, and Client Relationship Nurturing.
Provide:
1. Executive Summary Elevator Pitch (Perfect script for a senior executive client).
2. Value Proposition Grid mapped to standard corporate buyer personas (CMO, CIO, CFO, CEO).
3. Tailored Email Pitch Outline or Proposal First-meet Script.`;

    default:
      return baseInstruction;
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", envHasKey: !!process.env.GEMINI_API_KEY });
});

// General AI generation endpoint
app.post("/api/generate", async (req, res) => {
  const { 
    mode, 
    role, 
    industry, 
    size, 
    extraContext, 
    customPrompt, 
    apiKey: reqApiKey, 
    model: reqModel, 
    provider = "gemini", 
    apiBase = "" 
  } = req.body;

  const anonymizedKey = reqApiKey ? `${reqApiKey.slice(0, 6)}...${reqApiKey.slice(-4)} (length: ${reqApiKey.length})` : "None";
  console.log(`[API Generate Router] Received request. Provider: ${provider}, Model: ${reqModel}, Base: ${apiBase}, Key: ${anonymizedKey}`);

  const systemInstruction = getSystemInstruction(mode || 'chat', role || 'general');
  let promptContent = "";
  if (customPrompt) {
    promptContent = customPrompt;
  } else {
    promptContent = `
=== Client profile ===
- Industry / 行业: ${industry || "Not Specified / 未指定"}
- Company Scale / 规模: ${size || "Not Specified"}
- User Role / 当前用户角色: ${role || "Solutions Specialist"}
- Mode / 期望诊断模块: ${mode || "General Strategic Consulting"}

=== Detailed Context / 背景及痛点 ===
${extraContext || "No additional text provided. Provide a robust framework based on typical challenges in this space."}

=== Requirement / 请生成： ===
Based on your specialization of "${mode}", generate a highly strategic, professional, and action-oriented roadmap.
Ensure to write with authority, combining Martech technologies with the latest AI capabilities (GenAI, RAG, hyper-personalization, CDP, LLM Orchestrator). Provide precise templates, checklists, and visual structures in markdown.
`;
  }

  // Fallback check for provider type
  if (provider === "openai") {
    // Custom OpenAI compatible endpoint e.g., DeepSeek, OpenAI, Kimi, Local
    const activeBaseUrl = (apiBase || "https://api.openai.com/v1").trim();
    const activeApiKey = (reqApiKey || process.env.OPENAI_API_KEY || "").trim();
    const activeModel = (reqModel || "gpt-4o-mini").trim();

    if (!activeApiKey) {
      return res.status(400).json({
        error: "未检测到 API Key。请在页面顶部的【AI配置面板】选择并输入您的第三方 API Key。"
      });
    }

    const endpoint = `${activeBaseUrl.replace(/\/+$/, "")}/chat/completions`;
    try {
      const fetchResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptContent }
          ],
          temperature: 0.7
        })
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`API 终结点返回了错误 (HTTP ${fetchResponse.status}): ${errorText || "未知错误"}`);
      }

      const data: any = await fetchResponse.json();
      const resultText = data.choices?.[0]?.message?.content;
      if (!resultText) {
        throw new Error("API 响应中未找到 choices[0].message.content 字段，请核对您选择的模型或接口配置。");
      }

      return res.json({ text: resultText });
    } catch (error: any) {
      console.error("OpenAI Compatible API Error:", error);
      return res.status(550).json({ error: error.message || "连接第三方 OpenAI 兼容端失败，请确认 API Key 及 Base URL 是否有误。" });
    }
  } else {
    // Standard Google Gemini SDK flow
    const activeApiKey = reqApiKey || process.env.GEMINI_API_KEY;
    const activeModel = reqModel || "gemini-3.5-flash";

    if (!activeApiKey) {
      return res.status(400).json({
        error: "未检测到 API Key。请在页面顶部的【AI配置面板】输入您的 Gemini API 秘钥，或者联系管理员配置系统变量。"
      });
    }

    // Create an on-the-fly client with the active key
    let activeAi: GoogleGenAI;
    try {
      activeAi = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        error: `Gemini API Key 格式或初始化失败: ${err.message}`
      });
    }

    try {
      const response = await activeAi.models.generateContent({
        model: activeModel,
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(550).json({ error: error.message || "An error occurred during Gemini generation." });
    }
  }
});

// Vite middleware for dev setup or static file server for prod
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
