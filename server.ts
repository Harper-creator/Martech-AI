import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { LLMFactory } from "./src/services/llmProvider";
import { LLMConfig, GenerateRequest } from "./src/types/llm";

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
Your mission is to empower the user—who could be a Deliver Lead (PMO), Customer Success Manager (CSM), Business Analyst (BA), or Business Development Director (BD)—to achieve an elite consulta[...]

You must deliver highly structured, practical, action-oriented, and industry-specific recommendations. Avoid generic advice, buzzword-heavy fluff, or empty promises. Provide rigorous, quantified f[...]

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

// General AI generation endpoint (using Gemini - original)
app.post("/api/generate", async (req, res) => {
  const { mode, role, industry, size, extraContext, customPrompt } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Gemini API Client is not initialized. Please verify your GEMINI_API_KEY configuration in Settings > Secrets."
    });
  }

  try {
    const systemInstruction = getSystemInstruction(mode || 'chat', role || 'general');
    
    // Construct prompt
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
Ensure to write with authority, combining Martech technologies with the latest AI capabilities (GenAI, RAG, hyper-personalization, CDP, LLM Orchestrator). Provide precise templates, checklists, a[...]
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during generation." });
  }
});

// New endpoint: LLM generation with configurable provider
app.post("/api/generate-with-llm", async (req, res) => {
  const { llmConfig, prompt, systemInstruction, temperature, maxTokens, mode, role, industry, size, extraContext, customPrompt } = req.body;

  try {
    // Use provided llmConfig or construct from legacy parameters
    let config: LLMConfig;
    if (llmConfig) {
      config = llmConfig;
    } else {
      // Fallback to default DeepSeek if no config provided
      config = {
        provider: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
      };
    }

    if (!config.apiKey) {
      return res.status(400).json({
        error: "API Key not provided. Please configure your LLM provider."
      });
    }

    // Create provider instance
    const provider = LLMFactory.createProvider(config);

    // Construct prompt
    let finalPrompt = prompt || customPrompt;
    if (!finalPrompt && !customPrompt) {
      const sysInstruction = getSystemInstruction(mode || 'chat', role || 'general');
      finalPrompt = `
=== Client profile ===
- Industry / 行业: ${industry || "Not Specified / 未指定"}
- Company Scale / 规模: ${size || "Not Specified"}
- User Role / 当前用户角色: ${role || "Solutions Specialist"}
- Mode / 期望诊断模块: ${mode || "General Strategic Consulting"}

=== Detailed Context / 背景及痛点 ===
${extraContext || "No additional text provided. Provide a robust framework based on typical challenges in this space."}
`;
      systemInstruction = sysInstruction;
    }

    const generateRequest: GenerateRequest = {
      prompt: finalPrompt,
      llmConfig: config,
      systemInstruction,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 2000,
    };

    const response = await provider.generate(generateRequest);
    res.json(response);
  } catch (error: any) {
    console.error("LLM Generation Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during generation." });
  }
});

// Endpoint to validate LLM configuration
app.post("/api/validate-llm", async (req, res) => {
  const { llmConfig } = req.body;

  try {
    if (!llmConfig || !llmConfig.apiKey) {
      return res.status(400).json({ valid: false, error: "API Key required" });
    }

    const provider = LLMFactory.createProvider(llmConfig);
    const testRequest: GenerateRequest = {
      prompt: "你��，请回复一个字：是",
      llmConfig,
    };

    const response = await provider.generate(testRequest);
    res.json({ valid: true, message: "Configuration is valid", response });
  } catch (error: any) {
    console.error("LLM Validation Error:", error);
    res.status(400).json({ valid: false, error: error.message });
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
