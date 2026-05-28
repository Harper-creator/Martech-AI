import React, { useState, useEffect } from "react";
import { getAdviceTemplate } from "./adviceTemplates";
import LLMSettings from "./components/LLMSettings";
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Layers, 
  Briefcase, 
  CheckCircle, 
  ShieldAlert, 
  Copy, 
  Check, 
  FileText, 
  ChevronRight, 
  Sliders, 
  Database, 
  Users, 
  Target, 
  LineChart, 
  BookOpen, 
  Download, 
  HelpCircle, 
  Info, 
  Zap,
  Activity,
  ArrowRight,
  Lightbulb,
  Settings,
  ChevronDown
} from "lucide-react";

// Predefined industry-specific profiles to streamline consulting workflows
interface IndustryPreset {
  id: string;
  name: string;
  painPoints: string[];
  suggestedStack: string;
  defaultContext: string;
}

const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: "ecom",
    name: "零售与全渠道电商 (Retail & E-commerce)",
    painPoints: [
      "消费者跨端行为割裂，私域(社交/小程序)与公域(直播/内容平台)数据无法协同分析",
      "转化漏斗各环节优化没有优先级，营销ROI无法与IT数据一致对焦",
      "促销活动仍以人工经验驱动，内容生产拉垮，素材投放效率低至3-5%"
    ],
    suggestedStack: "Shopify / WeChat Mini-Program + 私域CDP + RAG多模态内容敏捷中心 + 超级推荐引擎 (LLM-powered Recommendation Agent)",
    defaultContext: "一家新兴的完美日记/花知晓级垂直品牌，通过小红书、小程序、直播等私域渠道年销10亿+ RMB。面临的核心难点是：① 跨渠道用户身份无法打通，无法精准定位该用户在从认知→种草→转化的具体位置，导致"看似活跃度高，实际ROI低迷"；② 每逢618、双11大促，仍需要50人营销运营团队日夜手工配置文案、价格、活动素材，效率极低。希望打造一套"AI驱动的智能营销自动化中枢"，通过LLM实时生成个性化的文案、价格、优惠组合，并根据消费者的浏览/加购/留资行为实时反馈优化。"
  },
  {
    id: "fintech",
    name: "金融科技与财富管理 (FinTech & Wealth Management)",
    painPoints: [
      "投资者教育成本高，获客难，客户流失率高达40%+，回本周期超过18个月",
      "投顾建议标准化程度低，难以量化投资业绩归因，投资者信心不稳定",
      "合规报告与客户定期沟通完全靠人，无法实现个性化、实时的投资组合更新提醒"
    ],
    suggestedStack: "Salesforce Financial Services + 市场数据接入 + LLM智能投研助手 + 自动化客户定期通讯 (AI-generated Investment Updates)",
    defaultContext: "一家互联网财富管理平台，AUM管理规模为 300亿 RMB，直连50万+小微投资者。当前痛点：① 获客拉新成本高达2000元/户，而平均客户年收入佣金仅800元，导致获客周期长达2.5年以上；② 投顾人工服务能力不足，投资者常常在市场波动大的时候"闻风而逃"；③ 常规的定期通讯和风险提示仍靠人工整理发送。希望通过AI驱动的"智能财顾大脑"，自动生成个性化的投资建议、定期复盘、市场洞察，并通过多渠道(App/邮件/短信)实时触达，提升投资者的粘性与满意度。"
  },
  {
    id: "saas",
    name: "SaaS与企业软件 (SaaS & Enterprise Software)",
    painPoints: [
      "销售线索转化率低，销售周期长达6-9个月，难以快速甄别高质量客户",
      "客户成功团队无法通过数据驱动的方式识别高流失风险客户，续费率仅70%",
      "产品更新和最佳实践传播缓慢，用户采纳率与产品活跃度远低于行业基准"
    ],
    suggestedStack: "Salesforce + Gainsight CSM + 知识库RAG智能体 + 自动化邮件营销流 (Drip Campaigns)",
    defaultContext: "一家专注于企业数据治理SaaS的初创，产品年ARR达5000万。当前业务挑战：① 销售管道中有大量"僵尸线索"，销售团队难以快速判断哪些线索值得投入精力；② 虽然已有1000+客户，但续费率仅72%，离行业标杆95%+的水平差距明显；③ 完整的用户成功方案还未建立，客户通常在购买后的前90天内流失。希望部署一套"AI驱动的智能客户成功系统"，通过行为分析、健康度评分、自动化关怀触达等机制，提升续费率到85%+。"
  },
  {
    id: "auto",
    name: "传统制造与新能源汽车 (Automotive & OEM)",
    painPoints: [
      ""留资-到店-试驾-锁单"链条极长，各环节转化黑盒、断层严重",
      "车机与手机App触达无协同，用户经常在不同端收到重复的多余提醒",
      "车主售后运营无温度，缺乏主动、关怀式的车机故障预警及套餐定制AI生成"
    ],
    suggestedStack: "汽车CRM + 车控数据流 + 情绪感知Agent对话库 + 经销商协同平台 (WeCom Matrix)",
    defaultContext: "新能源车主高频活跃于手机端APP和车机屏。希望系统化地将车机物联网状态(比如：剩余保养里程低于500km)与售后服务营销相融合，通过大模型向对应车主动态推荐'千车千案'的个性化保养维保礼券和尊享路线提示。"
  },
  {
    id: "healthcare",
    name: "医疗、大健康与美业 (Healthcare & Premium Beauty)",
    painPoints: [
      "传统问卷式肤质/健康评估转化率低，用户不愿填写几十道题目",
      "预约流失率高，缺乏结合医生班表及用户行为的AI自动化精细调优通知",
      "复购周期没有数智化管理，无法按周期(如护肤品或维他命用完前)自动化进行情感式补货推送"
    ],
    suggestedStack: "智能影像肤质鉴别API + 诊后主动关怀系统 + 动态生命旅程编排 (Orchestration Engine)",
    defaultContext: "提供高端消费医美和健康管理服务，客单价高，但决策周期长。希望打造AI驱动的"智能数字美学顾问"，用户上传面部照片后AI生成肤质诊断并推荐医美项目，后由客服系统根据预警时间进行定制化随访，以缩短线上到线下的交付链路。"
  }
];

export default function App() {
  // LLM Settings visibility state
  const [showLLMSettings, setShowLLMSettings] = useState(false);

  // Config States
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ecom");
  const [selectedSize, setSelectedSize] = useState<string>("中大型企业 (1000-5000人 / Mid-Market)");
  const [selectedRole, setSelectedRole] = useState<string>("Business Analyst / 业务分析顾问");
  
  // Custom Extra Context Input
  const [extraContext, setExtraContext] = useState<string>(INDUSTRY_PRESETS[0].defaultContext);
  
  // Lifecycle Tab Mode
  // diagnose: Demand Assessment
  // architect: Technical Integration Blueprints
  // delivery-plan: RACI & Delivery Roadmaps
  // csm-kpi: Value Metrics & LTV Calculations
  // bd-pitch: Pitch Prep & BD Templates
  const [mode, setMode] = useState<string>("diagnose");

  // Assessment Checker States
  const [diagnosticScores, setDiagnosticScores] = useState<{ [key: string]: number }>({
    dataSilo: 3,       // 数据孤岛严重性 (0: 打通, 10: 极度孤岛)
    aiReadiness: 2,    // AI基础设施成熟度 (0: 零基础, 10: 极度完善)
    toolIntegration: 4,// 工具集成打通率 (0: 完全���离, 10: 无缝集成)
    contentSpeed: 3,   // 内容创作与触达效率 (0: 纯人工极慢, 10: 分钟级AI自动化)
    complianceGaps: 6, // 隐私与合规安全合规风险 (0: 无风险, 10: 极高爆雷风险)
  });

  // ROI Value Tree Calculation States
  const [roiModel, setRoiModel] = useState<"conversion" | "retention" | "cac" | "viral">("conversion");
  const [metricsInput, setMetricsInput] = useState<{ [key: string]: string }>({
    monthlyRevenue: "5000000",
    cvr: "2.5",
    aov: "500",
    activeUsers: "50000",
    retentionRate: "85",
    churnRate: "5",
    acqCost: "200",
    kFactor: "1.5"
  });

  // AI Output States
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showKpiModal, setShowKpiModal] = useState(false);

  // Copy to Clipboard Utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage("已复制到剪贴板 ✓");
    setTimeout(() => setToastMessage(""), 2000);
  };

  // AI Generation Function
  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          role: selectedRole,
          industry: selectedIndustry,
          size: selectedSize,
          extraContext
        })
      });
      const data = await response.json();
      setGeneratedContent(data.text);
    } catch (error) {
      console.error("Generation Error:", error);
      setToastMessage("生成失败，请检查配置 ⚠️");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate ROI metrics based on selected model
  const calculateRoi = () => {
    const monthlyRev = parseInt(metricsInput.monthlyRevenue) || 0;
    const cvr = parseFloat(metricsInput.cvr) || 0;
    const aov = parseInt(metricsInput.aov) || 0;
    const activeUsers = parseInt(metricsInput.activeUsers) || 0;
    const retentionRate = parseInt(metricsInput.retentionRate) || 0;
    const churnRate = parseInt(metricsInput.churnRate) || 0;
    const acqCost = parseInt(metricsInput.acqCost) || 0;
    const kFactor = parseFloat(metricsInput.kFactor) || 0;

    const aiUpliftRate = 30; // AI平均提升率

    switch (roiModel) {
      case "conversion":
        return {
          baseVal: monthlyRev,
          aiVal: monthlyRev * (1 + aiUpliftRate / 100),
          metric: "月度收入"
        };
      case "retention":
        const ltvBase = monthlyRev / (1 - retentionRate / 100) * 12;
        const ltvAi = ltvBase * (1 + aiUpliftRate / 100);
        return { baseVal: ltvBase, aiVal: ltvAi, metric: "LTV" };
      case "cac":
        const cacTarget = acqCost;
        const cacOptimized = cacTarget * (1 - aiUpliftRate / 100);
        return {
          baseVal: cacTarget,
          aiVal: cacOptimized,
          metric: "获客成本"
        };
      case "viral":
        const virBase = activeUsers * kFactor;
        const virAi = virBase * (1 + aiUpliftRate / 100);
        return {
          baseVal: virBase,
          aiVal: virAi,
          metric: "传播效应"
        };
      default:
        return { baseVal: 0, aiVal: 0, metric: "" };
    }
  };

  const roiData = calculateRoi();
  const chartBaseVal = roiData.baseVal;
  const chartAiVal = roiData.aiVal;
  const increasePercent = ((chartAiVal - chartBaseVal) / chartBaseVal * 100).toFixed(1);
  const incrementalValue = (chartAiVal - chartBaseVal).toFixed(0);

  // Advanced KPI Metrics Derived from Base ROI Calculations
  const aiUpliftRate = 30;
  const activeUsers = parseInt(metricsInput.activeUsers) || 0;
  const cvr = parseFloat(metricsInput.cvr) || 0;
  const retentionRate = parseInt(metricsInput.retentionRate) || 0;
  const churnRate = parseInt(metricsInput.churnRate) || 0;
  const kFactor = parseFloat(metricsInput.kFactor) || 0;
  const aiAcquired = Math.floor(activeUsers * (aiUpliftRate / 100) * (cvr / 100) * (kFactor - 1));
  const incrementalSavedUsers = Math.floor(activeUsers * (retentionRate / 100) * (aiUpliftRate / 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 flex flex-col">
      {/* Header with LLM Settings Toggle */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-full px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              顾问
            </div>
            <h1 className="text-xl font-bold text-slate-800">Martech + AI 战略顾问助手</h1>
          </div>
          
          {/* LLM Settings Toggle Button */}
          <button
            onClick={() => setShowLLMSettings(!showLLMSettings)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium transition-all"
          >
            <Settings size={18} />
            LLM 设置
            <ChevronDown size={18} className={`transform transition-transform ${showLLMSettings ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* LLM Settings Panel - Collapsible */}
        {showLLMSettings && (
          <div className="bg-blue-50 border-t border-blue-200 max-h-96 overflow-y-auto">
            <div className="p-4">
              <LLMSettings onConfigChange={(config) => {
                setToastMessage(`已切换到: ${config.name} ✓`);
                setTimeout(() => setToastMessage(""), 2000);
              }} />
            </div>
          </div>
        )}
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 p-4 lg:p-6 grid grid-cols-12 gap-6" id="main-content-layout">
        
        {/* Left Side: Parameters, Presets, and Interactive Calculators */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6" id="left-workspace-rail">
          
          {/* Top Panel: Customer Environment Profiles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4" id="client-config-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                行业与客户画像
              </h2>
            </div>

            {/* Industry Selection Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">行业定位 *</label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  const preset = INDUSTRY_PRESETS.find(p => p.id === e.target.value);
                  if (preset) {
                    setSelectedIndustry(e.target.value);
                    setExtraContext(preset.defaultContext);
                  }
                }}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-700"
              >
                {INDUSTRY_PRESETS.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </div>

            {/* Company Size Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">企业规模 *</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-700"
              >
                <option>初创企业 (&lt;100人)</option>
                <option>成长型企业 (100-500人 / SMB)</option>
                <option>中大型企业 (1000-5000人 / Mid-Market)</option>
                <option>大型企业集团 (&gt;5000人 / Enterprise)</option>
              </select>
            </div>

            {/* User Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">用户角色 *</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-700"
              >
                <option>Business Analyst / 业务分析顾问</option>
                <option>PMO & Delivery Lead / 项目管理</option>
                <option>Chief Marketing Officer / CMO</option>
                <option>Chief Customer Officer / CCO</option>
                <option>Chief Technology Officer / CTO</option>
                <option>Chief Financial Officer / CFO</option>
              </select>
            </div>

            {/* Custom Context Textarea */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">客户痛点背景 *</label>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                rows={4}
                placeholder="在此处输入客户特有痛点、现有系统环境(如已经购买了Salesforce/已经在使用本地自研CRM)等..."
                className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 leading-relaxed custom-scrollbar"
              />
            </div>
          </div>

          {/* Core Interactive Assessor Panel */}
          <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-md shadow-indigo-950 flex flex-col gap-4" id="assessor-section">
            <div className="border-b border-indigo-800 pb-3 flex justify-between items-center">
              <h2 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                诊断评分器 (Diagnostic Scorer)
              </h2>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-indigo-100 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-indigo-300" /> 中国大陆/全球数据拉通率 
                </span>
                <span className="font-bold text-teal-300 font-mono">{diagnosticScores.dataSilo}/10</span>
              </div>
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="10"
                value={diagnosticScores.dataSilo}
                onChange={(e) => setDiagnosticScores({...diagnosticScores, dataSilo: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[9px] text-indigo-300">
                <span>0% 完全打通统一CDP</span>
                <span>10% 极度割裂</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-indigo-100 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-300" /> AI & LLM 基础设施成熟度
                </span>
                <span className="font-bold text-teal-300 font-mono">{diagnosticScores.aiReadiness}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={diagnosticScores.aiReadiness}
                onChange={(e) => setDiagnosticScores({...diagnosticScores, aiReadiness: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[9px] text-indigo-300">
                <span>0% 零基础未启动</span>
                <span>10% 全栈AI赋能完善</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-indigo-100 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-300" /> 工具与系统集成打通率
                </span>
                <span className="font-bold text-teal-300 font-mono">{diagnosticScores.toolIntegration}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={diagnosticScores.toolIntegration}
                onChange={(e) => setDiagnosticScores({...diagnosticScores, toolIntegration: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[9px] text-indigo-300">
                <span>0% 完全隔离</span>
                <span>10% 无缝集成</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-indigo-100 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> 内容创作与营销敏捷度
                </span>
                <span className="font-bold text-teal-300 font-mono">{diagnosticScores.contentSpeed}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={diagnosticScores.contentSpeed}
                onChange={(e) => setDiagnosticScores({...diagnosticScores, contentSpeed: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[9px] text-indigo-300">
                <span>0% 纯人工极低效</span>
                <span>10% 分钟级AI自动化</span>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-800">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-indigo-100 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" /> 隐私与合规风险指数
                </span>
                <span className="font-bold text-teal-300 font-mono">{diagnosticScores.complianceGaps}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={diagnosticScores.complianceGaps}
                onChange={(e) => setDiagnosticScores({...diagnosticScores, complianceGaps: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
              />
              <div className="flex justify-between text-[9px] text-indigo-300 mt-1">
                <span>0% 风险极低(符合全球法规)</span>
                <span>10% 极高风险</span>
              </div>
            </div>

            <div className="pt-3 border-t border-indigo-800">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-indigo-100 flex items-center gap-1">
                  📊 综合诊断分(系统评级):
                </span>
                <span className="font-bold text-teal-300 font-mono">
                  {Math.round((diagnosticScores.dataSilo * 0.4 + (10 - diagnosticScores.aiReadiness) * 0.4 + diagnosticScores.complianceGaps * 0.2) * 10)} / 100
                </span>
              </div>
              <div className="mt-2 text-[10px] text-indigo-300 leading-relaxed italic">
                {diagnosticScores.dataSilo > 6 ? (
                  "💡 数据孤岛指数偏高：重点建议一期采用微CDP/Identity Bridge机制，先行拉通核心渠道用户身份，暂缓庞大的多维数据库。 "
                ) : (
                  "💡 数据底坐拉通良好：具备良好数智化底座。建议聚焦AI RAG内容敏捷中心构建，利用Gemini进行精细化投放运营。"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Combined: Methodology Tabs & Live Document Editor */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6" id="right-workspace-panel">
          
          {/* Methodology Top Indicator Roadmap */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" id="methodology-flow-nav">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              5阶段 Martech + AI 战略咨询路线图
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2">
              
              {/* Phase 01 */}
              <button
                id="btn-tab-diagnose"
                onClick={() => setMode("diagnose")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "diagnose"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${mode === "diagnose" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 01</span>
                <span className="text-xs font-bold truncate max-w-full">需求诊断与访谈</span>
              </button>

              {/* Phase 02 */}
              <button
                id="btn-tab-architect"
                onClick={() => setMode("architect")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "architect"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${mode === "architect" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 02</span>
                <span className="text-xs font-bold truncate max-w-full">架构设计与整合</span>
              </button>

              {/* Phase 03 */}
              <button
                id="btn-tab-delivery"
                onClick={() => setMode("delivery-plan")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "delivery-plan"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
                >
                <div className={`p-1.5 rounded-lg ${mode === "delivery-plan" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 03</span>
                <span className="text-xs font-bold truncate max-w-full">交付与RACI规划</span>
              </button>

              {/* Phase 04 */}
              <button
                id="btn-tab-csm-kpi"
                onClick={() => setMode("csm-kpi")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "csm-kpi"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${mode === "csm-kpi" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <LineChart className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 04</span>
                <span className="text-xs font-bold truncate max-w-full">价值评估与KPI</span>
              </button>

              {/* Phase 05 */}
              <button
                id="btn-tab-bd-pitch"
                onClick={() => setMode("bd-pitch")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "bd-pitch"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${mode === "bd-pitch" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 05</span>
                <span className="text-xs font-bold truncate max-w-full">商务提案与话术</span>
              </button>

            </div>
          </div>

          {/* Core Interactive ROI Estimator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col gap-5" id="roi-estimator-card">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                ROI 价值树 & AI提升评估模型
              </h2>
              <button
                onClick={() => setShowKpiModal(!showKpiModal)}
                className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium"
              >
                {showKpiModal ? "收起详情" : "展开详情"}
              </button>
            </div>

            {/* ROI Model Selector */}
            <div className="grid grid-cols-2 gap-2">
              {(["conversion", "retention", "cac", "viral"] as const).map(model => (
                <button
                  key={model}
                  onClick={() => setRoiModel(model)}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    roiModel === model
                      ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-200"
                  }`}
                >
                  {model === "conversion" && "💰 转化率 GMV"}
                  {model === "retention" && "🔄 复购与LTV"}
                  {model === "cac" && "🎯 获客成本优化"}
                  {model === "viral" && "🚀 裂变增长"}
                </button>
              ))}
            </div>

            {/* Input Controls */}
            {roiModel === "conversion" && (
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">月度收入</label>
                  <input
                    type="number"
                    value={metricsInput.monthlyRevenue}
                    onChange={(e) => setMetricsInput({...metricsInput, monthlyRevenue: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">CVR %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={metricsInput.cvr}
                    onChange={(e) => setMetricsInput({...metricsInput, cvr: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">客单价</label>
                  <input
                    type="number"
                    value={metricsInput.aov}
                    onChange={(e) => setMetricsInput({...metricsInput, aov: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            {roiModel === "retention" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">活跃用户</label>
                  <input
                    type="number"
                    value={metricsInput.activeUsers}
                    onChange={(e) => setMetricsInput({...metricsInput, activeUsers: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">保留率 %</label>
                  <input
                    type="number"
                    step="1"
                    value={metricsInput.retentionRate}
                    onChange={(e) => setMetricsInput({...metricsInput, retentionRate: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            {roiModel === "cac" && (
              <div className="flex flex-col">
                <label className="text-[9px] font-bold text-slate-600 mb-1">当前获客成本 (¥)</label>
                <input
                  type="number"
                  value={metricsInput.acqCost}
                  onChange={(e) => setMetricsInput({...metricsInput, acqCost: e.target.value})}
                  className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            {roiModel === "viral" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">活跃用户</label>
                  <input
                    type="number"
                    value={metricsInput.activeUsers}
                    onChange={(e) => setMetricsInput({...metricsInput, activeUsers: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-600 mb-1">K-因子</label>
                  <input
                    type="number"
                    step="0.1"
                    value={metricsInput.kFactor}
                    onChange={(e) => setMetricsInput({...metricsInput, kFactor: e.target.value})}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Visual ROI Comparison */}
            <div className="bg-gradient-to-b from-amber-50 to-white p-4 rounded-lg border border-amber-100">
              <h3 className="text-xs font-bold text-amber-900 mb-3">AI 增量价值对比</h3>
              <div className="flex items-end justify-around h-[125px] pt-4 relative">
                {/* Background dashed grids */}
                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200/60 z-0"></div>
                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-200/60 z-0"></div>
                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-200/60 z-0"></div>

                {/* Bar 1: Base Case */}
                <div className="flex flex-col items-center gap-2 z-10 w-24">
                  <span className="text-[9px] font-bold text-slate-500 font-mono text-center truncate w-full px-1">
                    {roiModel === "conversion" || roiModel === "cac" 
                      ? `￥${Math.round(chartBaseVal).toLocaleString()}` 
                      : Math.round(chartBaseVal).toLocaleString()}
                  </span>
                  <div
                    className="bg-slate-400 rounded-t-sm w-12 transition-all"
                    style={{ height: `${Math.max(20, (chartBaseVal / Math.max(chartBaseVal, chartAiVal)) * 90)}px` }}
                  ></div>
                  <span className="text-[8px] font-bold text-slate-600 uppercase">当前状态</span>
                </div>

                {/* Arrow */}
                <div className="text-amber-500 text-xl font-bold">→</div>

                {/* Bar 2: AI Enhanced */}
                <div className="flex flex-col items-center gap-2 z-10 w-24">
                  <span className="text-[9px] font-bold text-amber-900 font-mono text-center truncate w-full px-1">
                    {roiModel === "conversion" || roiModel === "cac" 
                      ? `￥${Math.round(chartAiVal).toLocaleString()}` 
                      : Math.round(chartAiVal).toLocaleString()}
                  </span>
                  <div
                    className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm w-12 transition-all shadow-md shadow-amber-200"
                    style={{ height: `${Math.max(20, (chartAiVal / Math.max(chartBaseVal, chartAiVal)) * 90)}px` }}
                  ></div>
                  <span className="text-[8px] font-bold text-amber-700 uppercase">AI赋能后</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <span className="text-[9px] text-slate-600">增长百分比</span>
                  <p className="font-bold text-blue-700">{increasePercent}%</p>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <span className="text-[9px] text-slate-600">增量价值</span>
                  <p className="font-bold text-green-700">+¥{Math.round(parseFloat(incrementalValue)).toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <span className="text-[9px] text-slate-600">评估周期</span>
                  <p className="font-bold text-purple-700">12个月</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  正在生成咨询方案...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成专业咨询方案
                </>
              )}
            </button>
          </div>

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col gap-4" id="generated-content">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  咨询方案输出
                </h2>
                <button
                  onClick={() => copyToClipboard(generatedContent)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制全部
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                <div dangerouslySetInnerHTML={{
                  __html: generatedContent
                    .split('\n')
                    .map((line: string) => {
                      if (line.startsWith('#')) return `<h3 class="font-bold text-sm mt-3 mb-2">${line.replace(/^#+\s*/, '')}</h3>`;
                      if (line.startsWith('-') || line.startsWith('*')) return `<li class="ml-4">${line.replace(/^[-*]\s*/, '')}</li>`;
                      return `<p>${line}</p>`;
                    })
                    .join('')
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 max-w-sm bg-slate-900 border border-indigo-500/30 text-white rounded-2xl shadow-2xl p-4 flex gap-3 animate-slideIn">
          <div className="bg-indigo-600/30 p-2 rounded-xl text-teal-300">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-bold text-teal-300">模组已应用 (State Injected)</p>
            <p className="text-xs text-slate-300 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
