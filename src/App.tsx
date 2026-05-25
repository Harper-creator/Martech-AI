import React, { useState, useEffect } from "react";
import { getAdviceTemplate } from "./adviceTemplates";
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
  Lightbulb
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
      "全渠道会员数据割裂，线上APP与线下门店积分/画像无法匹配",
      "大促活动千人一面，缺乏基于实时行为的多波段营销(CDP+Trigger API)",
      "推荐算法落后，加购流失率高达75%，缺乏基于LLM的即时召回与内容匹配"
    ],
    suggestedStack: "CDP (如Segment/SensorsData) + Trigger API + RAG GenAI 智能文案生成器 + 全渠道推送 (SMS/WeChat/App Push)",
    defaultContext: "品牌拥有200家直营门店与千万线上注册会员。目前线上线下数据相互孤立，用户流失严重。期望引入AI-CDP底座，打通消费者旅程。应用生成式AI实现即时个性化折扣与商品文案推送，以提升LTV与复购率。"
  },
  {
    id: "b2b",
    name: "科技与高科技服务 (B2B Enterprise SaaS)",
    painPoints: [
      "销售线索(MQL)质量良莠不齐，SDR团队人工甄别成本极高",
      "客户产品试用期活跃度低，缺乏智能触发的主动式客户关怀生命周期模板",
      "大客户拜访前准备不足，缺乏对客户工商、舆情与技术构架的AI一键深度研判"
    ],
    suggestedStack: "Marketing Automation (如Marketo) + AI Lead Scoring + Sales Copilot + RAG CRM 深度报告生成集",
    defaultContext: "公司的B2B云服务产品每天产生上千个注册试用客户，但由于没有线索自动分类和AI评分，销售资源分配错位。希望通过AI实现‘人货匹配’式销售流转，并根据客户在平台上的核心操作动态推荐AI使用指导，将试用转化率提升30%。"
  },
  {
    id: "finance",
    name: "金融与财富管理 (Wealth Management & Banking)",
    painPoints: [
      "严苛的合规监管(PIPL/GDPR)，任何对外推广信息必须多审机制且不能包含敏感PII数据",
      "金融投顾投研报告生成低效，无法按客户风险偏好进行分钟级的自动化精炼改写",
      "理财产品购买转化路径长，投顾缺乏智能对话助手，无法基于实时交互话术即时推荐下一个产品"
    ],
    suggestedStack: "私有化向量数据库 (PGVector) + 本地化LLM集群 + 金融大客户CDP + 合规性脱敏防火墙",
    defaultContext: "面对复杂的股票和基金市场波动，传统统一理财期刊转化效率极低。希望部署合规脱敏的Martech+AI，由顾问专属AI助手对公募基金招募书及市场新闻做‘分钟级’改写，定向推送给高净值客群，并确保不发生法律合规风险。"
  },
  {
    id: "auto",
    name: "传统制造与新能源汽车 (Automotive & OEM)",
    painPoints: [
      "“留资-到店-试驾-锁单”链条极长，各环节转化黑盒、断层严重",
      "车机与手机App触达无协同，用户经常在不同端收到重复的多余提醒",
      "车主售后运营无温度，缺乏主动、关怀式的车机故障预警及套餐定制AI生成"
    ],
    suggestedStack: "汽车CRM + 车控数据流 + 情绪感知Agent对话库 + 经销商协同平台 (WeCom Matrix)",
    defaultContext: "新能源车主高频活跃于手机端APP和车机屏。希望系统化地将车机物联网状态(比如：剩余保养里程低于500km)与售后服务营销相融合，通过大模型向对应车主动态推荐‘千车千案’的个性化保养维保礼券和尊享路线提示。"
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
    defaultContext: "提供高端消费医美和健康管理服务，客单价高，但决策周期长。希望打造AI驱动的“智能数字美学顾问”，用户上传面部照片后AI生成肤质诊断并推荐医美项目，后由客服系统根据预警时间进行定制化随访，以缩短线上到线下的交付链路。"
  }
];

export default function App() {
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
    toolIntegration: 4,// 工具集成打通率 (0: 完全隔离, 10: 无缝集成)
    contentSpeed: 3,   // 内容创作与触达效率 (0: 纯人工极慢, 10: 分钟级AI自动化)
    complianceGaps: 6, // 隐私与合规安全合规风险 (0: 无风险, 10: 极高爆雷风险)
  });

  // ROI Value Tree Calculation States
  const [roiModel, setRoiModel] = useState<"conversion" | "retention" | "churn" | "cac">("conversion");

  // Model 1: Conversion & GMV (existing)
  const [calcTraffic, setCalcTraffic] = useState<number>(500000); // 月活跃触达流量
  const [calcCtr, setCalcCtr] = useState<number>(3.5); // 原点击率 %
  const [calcCvr, setCalcCvr] = useState<number>(2.0); // 原转化率 %
  const [calcAov, setCalcAov] = useState<number>(299); // 客单价 元/美金

  // Model 2: Retention & LTV
  const [calcTotalUsers, setCalcTotalUsers] = useState<number>(1000000);
  const [calcBaseRetention, setCalcBaseRetention] = useState<number>(20);
  const [calcArpu, setCalcArpu] = useState<number>(80);

  // Model 3: Churn & Save Rate
  const [calcAtRisk, setCalcAtRisk] = useState<number>(150000);
  const [calcBaseChurn, setCalcBaseChurn] = useState<number>(6.5);
  const [calcLossValue, setCalcLossValue] = useState<number>(1200);
  const [calcRuleSaveRate, setCalcRuleSaveRate] = useState<number>(5.0);

  // Model 4: CAC & K-Factor
  const [calcSeedTraffic, setCalcSeedTraffic] = useState<number>(40000);
  const [calcBaseCac, setCalcBaseCac] = useState<number>(150);
  const [calcBaseK, setCalcBaseK] = useState<number>(0.12);
  const [calcLtv, setCalcLtv] = useState<number>(550);

  const [aiUpliftRate, setAiUpliftRate] = useState<number>(25); // Martech+AI 业务指标相对预期提升 %

  // Custom Override Prompts
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResultText, setAiResultText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Interactive study modal state for bench and agents
  const [activeAgentModal, setActiveAgentModal] = useState<"agentA" | "agentB" | "allBenchmarks" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize tool tips and suggestions depending on selection
  const activePreset = INDUSTRY_PRESETS.find(p => p.id === selectedIndustry) || INDUSTRY_PRESETS[0];

  // Sync preset if user switches industry
  const handleIndustryChange = (indId: string) => {
    setSelectedIndustry(indId);
    const preset = INDUSTRY_PRESETS.find(p => p.id === indId);
    if (preset) {
      setExtraContext(preset.defaultContext);
    }
  };

  // Preset click applier
  const handleApplyBenchmark = (type: string) => {
    if (type === "ecom-double11") {
      setSelectedIndustry("ecom");
      setDiagnosticScores({
        dataSilo: 8,
        aiReadiness: 3,
        toolIntegration: 4,
        contentSpeed: 3,
        complianceGaps: 5,
      });
      setExtraContext("【双11全触达AI文案归因预设】\n企业面临零售电商双11等大促期间，流量高并发、多端行为十分离散等瓶颈。期望在一期打通电商多维度高并发数据埋点，并利用在端上计算实时归因，通过Gemini智能预测并即时推送最符合购买意向的千人千面个性化文案。");
      setCalcCtr(3.5);
      setCalcCvr(2.0);
      setAiUpliftRate(22.4);
    } else if (type === "auto-rag") {
      setSelectedIndustry("auto");
      setDiagnosticScores({
        dataSilo: 6,
        aiReadiness: 3,
        toolIntegration: 5,
        contentSpeed: 4,
        complianceGaps: 4,
      });
      setExtraContext("【汽车行业全渠道留资AI-RAG预诊话术预设】\n传统车主生命周期‘留资-试驾-锁单’连条太长，过程不透明。期望通过打通车机端状态（保养/用电偏好等）与手机应用。依靠AI-RAG实时检索生成具备个性、温度的邀约话术并提供经销商WeCom多端实时协同流转。");
      setCalcCtr(4.2);
      setCalcCvr(1.8);
      setAiUpliftRate(18.2);
    } else if (type === "beauty-ltv") {
      setSelectedIndustry("healthcare");
      setDiagnosticScores({
        dataSilo: 5,
        aiReadiness: 4,
        toolIntegration: 3,
        contentSpeed: 2,
        complianceGaps: 7,
      });
      setExtraContext("【高奢美业周期性主动关怀系统预设】\n高端美容与健康行业高消费、高复购。希望将消费者产品消耗周期与主动AI随访相结合。通过AI对历史肤质图像自适应生成专业数字美学背景的随访诊断及补货关怀问候，将用户周期性触达转化效率极大提升。");
      setCalcCtr(5.0);
      setCalcCvr(2.5);
      setAiUpliftRate(35.0);
    }

    setToastMessage(`🎉 成功载入指标！已同步至成熟度评分、业务上下文与ROI估算参数，咨询文稿已自动重新构建。`);
    // Scroll a bit up or let them know
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Pre-load structured high-quality consulting templates in case AI api is loading or not configured
  const getPreloadedAdvice = (tab: string, indId: string) => {
    const preset = INDUSTRY_PRESETS.find(p => p.id === indId) || INDUSTRY_PRESETS[0];

    // Compute all dynamic model variables so they are safe to reference below
    // 1. Conversion Model
    const originalOrders = calcTraffic * (calcCtr / 100) * (calcCvr / 100);
    const originalGMV = originalOrders * calcAov;
    const liftedCvr = calcCvr * (1 + aiUpliftRate / 100);
    const liftedOrders = calcTraffic * (calcCtr / 100) * (liftedCvr / 100);
    const liftedGMV = liftedOrders * calcAov;
    const incrementalGMV = liftedGMV - originalGMV;

    // 2. Retention Model
    const baseActiveUsers = Math.round(calcTotalUsers * (calcBaseRetention / 100));
    const liftedRetentionPercent = Math.min(100, calcBaseRetention * (1 + aiUpliftRate / 100));
    const liftedActiveUsers = Math.round(calcTotalUsers * (liftedRetentionPercent / 100));
    const incrementalRetentionMonthlyVal = (liftedActiveUsers - baseActiveUsers) * calcArpu;

    // 3. Churn Model
    const riskUsers = calcAtRisk;
    const lostUsers = Math.round(riskUsers * (calcBaseChurn / 100));
    const baseSavedUsers = Math.round(lostUsers * (calcRuleSaveRate / 100));
    const aiSavedUsersRate = Math.min(100, calcRuleSaveRate * (1 + aiUpliftRate / 100));
    const aiSavedUsers = Math.round(lostUsers * (aiSavedUsersRate / 100));
    const incrementalSavedUsers = Math.max(0, aiSavedUsers - baseSavedUsers);
    const baseSavedValueMonthly = baseSavedUsers * calcLossValue;
    const aiSavedValueMonthly = aiSavedUsers * calcLossValue;
    const incrementalSavedValueMonthly = aiSavedValueMonthly - baseSavedValueMonthly;

    // 4. CAC Model
    const seedTraffic = calcSeedTraffic;
    const baseK = calcBaseK;
    const baseAcquired = Math.round(seedTraffic * (1 + baseK));
    const baseProfit = baseAcquired * (calcLtv - calcBaseCac);
    const aiK = baseK * (1 + aiUpliftRate / 100);
    const aiAcquired = Math.round(seedTraffic * (1 + aiK));
    const aiProfit = aiAcquired * (calcLtv - calcBaseCac);
    const incrementalCacProfit = aiProfit - baseProfit;

    // Build model specific display outputs
    let kpiAnalysisText = "";
    let valueTreeText = "";
    let pitchGoldSec = "";
    let pitchMetricGoalText = "";

    if (roiModel === "conversion") {
      kpiAnalysisText = [
        `- 基准月销量预估：**${Math.round(originalOrders).toLocaleString()} 单** / 月`,
        `- 基准月GMV流水：**￥${Math.round(originalGMV).toLocaleString()}**`,
        `- 💡 预测在提升 **${aiUpliftRate}%** 的 Martech 转化效能后，月度GMV可提升至：**￥${Math.round(liftedGMV).toLocaleString()}**`,
        `- 🚀 月度新增增量 GMV 高达：**￥${Math.round(incrementalGMV).toLocaleString()}**`
      ].join("\n");

      valueTreeText = [
        "                                     ┌──► 实时多波段意图召回 ────► 点击率 (CTR) 提升 [现估 " + calcCtr + "%]",
        "          ┌──► 转化漏斗效率 (CVR) ───┼──► 千人千面即时文案 ──────► 详情页流失率下降 [预估提成 " + aiUpliftRate + "%]",
        "          │                          └──► RAG 智能售前快速解惑 ──► 留资购买意图转化",
        "GMV 提升 ─┼",
        "          │                          ┌──► 主动预测生命周期节点 ──► 避免用户流失 (Churn)",
        "          └──► 客户生命价值 (LTV) ───┼──► 单用户专属加购交叉打包 ──► 复购客单价 (AOV) [现估 ￥" + calcAov + "]",
        "                                     └──► 会员成长梯度智能任务 ──► 推荐裂变价值"
      ].join("\n");

      pitchGoldSec = `王总，针对目前【**${preset.name}**】高度内卷、且全渠道买量成本居高不下的现状，如果我们继续靠以往的粗放式漫天撒网推送，流失率只会越来越高。我们的 **Martech+AI 解决方案**，能在不额外追加首期获客投放的前提下，用生成式AI在一秒内为不同偏好的活跃会员实时生成千人千面的动态购买推荐。仅需 1 个月的低阻部署，预计就能为咱们整体转化漏斗带来 **${aiUpliftRate}%** 的核心效能抬升。预估月度净增增值 GMV 高达 **￥${Math.round(incrementalGMV).toLocaleString()}**！我们不是在卖一个冷冰冰的IT软件，而是在为您的业务，直接嫁接一台通过 AI 自动帮企业变现的**增长引擎**。`;
      
      pitchMetricGoalText = `提升 ${aiUpliftRate}% CVR/转化率`;
    } else if (roiModel === "retention") {
      kpiAnalysisText = [
        `- 注册用户底数 (MAU-Base)：**${calcTotalUsers.toLocaleString()} 名**`,
        `- 基准月度活跃留存率 (Baseline Retention)：**${calcBaseRetention}%** (约合 ${baseActiveUsers.toLocaleString()} 名常态活跃客群)`,
        `- 💡 预测在引入AI智能随访、周期性情感维系后，月度活跃留存率拉升至：**${liftedRetentionPercent.toFixed(1)}%** (相对留存提能 **${aiUpliftRate}%** )`,
        `- 🚀 换算每月净增活跃粘性熟客：**+ ${(liftedActiveUsers - baseActiveUsers).toLocaleString()} 名留存用户**`,
        `- 💎 估算每月贡献增量 LTV 产值 (按ARPU ￥${calcArpu}/月计算)：**￥${Math.round(incrementalRetentionMonthlyVal).toLocaleString()} / 月**`
      ].join("\n");

      valueTreeText = [
        "                                     ┌──► AI周期性主动关怀 ────► 活跃率提升 (DAU/MAU)",
        "          ┌──► 留存复购漏斗 (Retention)┼──► 专属肤质/车况随访 ──► 退订率下降 [留存提成 " + aiUpliftRate + "%]",
        "          │                          └──► 智能维保提醒/新品试用 ──► 活跃熟客数 [现估 " + liftedActiveUsers.toLocaleString() + "人]",
        "LTV 提效 ─┼",
        "          │                          ┌──► 用户情绪流流失预警 ──► 留存期延长 (+ 12个月)",
        "          └──► 常态用户值 (ARPU) ───┼──► 关联品类组合装促销 ──► 用户平均ARPU [均值 ￥" + calcArpu + "]",
        "                                     └──► 尊享权益梯度促活 ────► 活动参与率"
      ].join("\n");

      pitchGoldSec = `王总，针对目前【**${preset.name}**】拉新越来越贵、陷入‘买量即亏损’的恶性循环，老用户的长效维系才是企业盈利的生命线。我们的 **Martech+AI 解决方案**，通过打通用户生命耗材周期与情感标签，实现高精度、无打扰的关怀式售后回访推荐。我们能够将月度活跃留存率从 **${calcBaseRetention}%** 提高到 **${liftedRetentionPercent.toFixed(1)}%**（相对留存提能 **${aiUpliftRate}%**），仅此一项每月就能为贵司净增活跃常客 **${(liftedActiveUsers - baseActiveUsers).toLocaleString()}** 人，直接变现增产 **￥${Math.round(incrementalRetentionMonthlyVal).toLocaleString()}** 的常态月度销售额！`;
      
      pitchMetricGoalText = `提升 ${aiUpliftRate}% 的活跃留存率`;
    } else if (roiModel === "churn") {
      kpiAnalysisText = [
        `- 月度面临流失风险客群 (At-Risk Users)：**${riskUsers.toLocaleString()} 名** / 月`,
        `- 基准月度自然流失率 (Churn Rate)：**${calcBaseChurn}%** (月预计折损 ${lostUsers.toLocaleString()} 名客户)`,
        `- 原传统硬编码策略拦截挽回率 (Rule Save Rate)：**${calcRuleSaveRate}%** (通过枯燥代金券骚扰救回 ${baseSavedUsers.toLocaleString()} 人)`,
        `- 🛡️ 引入智能体挽留精准拦截后，AI预测精准阻断挽回率升至：**${aiSavedUsersRate.toFixed(1)}%** (综合抗流失拦截提能 **${aiUpliftRate}%** )`,
        `- 🚀 相当于每月帮企业成功挽救用户数：**+ ${incrementalSavedUsers.toLocaleString()} 名高忠诚客户**`,
        `- 💸 每月净减少流失折损坏账 (按流失挽回单客LTV价值 ￥${calcLossValue} 计算)：**￥${Math.round(incrementalSavedValueMonthly).toLocaleString()} / 月**`
      ].join("\n");

      valueTreeText = [
        "                                     ┌──► 意图拦截智能触达 ────► 即时防退订 (Opt-Out down)",
        "          ┌──► 挽回拦截效率 (Save Rate)┼──► 行为阻断代金券 ──────► 拦截防漏提效 [挽回提升 " + aiUpliftRate + "%]",
        "          │                          └──► 专属折扣情感挽留 ────► 召回挽留客户 [月增 " + incrementalSavedUsers.toLocaleString() + "人]",
        "挽回减损 ─┼",
        "          │                          ┌──► 流失概率动态分级 ────► 减小无用打扰率",
        "          └──► 流失重置价值 (LTV) ───┼──► 高净值流失大客专席 ──► 挽回单客LTV [估￥" + calcLossValue + "]"
      ].join("\n");

      pitchGoldSec = `王总，在【**${preset.name}**】客户流失极快且重置成本高达千元的重压下，防止用户悄无声息流失就是直接保住您的净利润。我们的 **Martech+AI 解决方案**，能抢在用户打开竞品或点击退订前的‘临界1分钟’，实时做出高精度干预。我们能将拦截挽回成功率提升到 **${aiSavedUsersRate.toFixed(1)}%**（相比传统规则策略高出 **${aiUpliftRate}%** 挽回提能），每月成功保住 **${incrementalSavedUsers.toLocaleString()}** 名面临流失的大客，折算到单客终身价值，直接为公司挽留 **￥${Math.round(incrementalSavedValueMonthly).toLocaleString()}** 的濒临折损利润！`;
      
      pitchMetricGoalText = `提升 ${aiUpliftRate}% 的流失挽救成功率`;
    } else if (roiModel === "cac") {
      kpiAnalysisText = [
        `- 月度新增触达种子触达用户量 (Seed Traffic)：**${seedTraffic.toLocaleString()} 名**`,
        `- 基准获客成本 (CAC / Cost per Acq)：**￥${calcBaseCac}** / 人`,
        `- 基准推荐裂变系数 (K-Factor)：**${calcBaseK}** (即每名老客自然带入 ${calcBaseK} 个成交新用户，实际获取 ${baseAcquired.toLocaleString()} 人)`,
        `- 🔗 引入智能社交分享、动态裂变激励机制后，K-Factor裂变常数提至：**${aiK.toFixed(3)}** (相对社交裂变扩散率提能 **${aiUpliftRate}%** )`,
        `- 🚀 月度全渠道 AI 会员带新成交总量增至：**${aiAcquired.toLocaleString()} 名** (净新增 **+ ${(aiAcquired - baseAcquired).toLocaleString()} 名新客** )`,
        `- 💎 新注入客流的新增生命总价值 (按单客终身LTV净利润 ￥${calcLtv} 换算)：**￥${Math.round(incrementalCacProfit).toLocaleString()} / 月**`
      ].join("\n");

      valueTreeText = [
        "                                     ┌──► AI个性化裂变推荐 ────► 提升裂变参与度",
        "          ┌──► 裂变能力提效 (K-Factor)─┼──► 微信社交分享自动化 ──► 提高带新成交 [推荐提升 " + aiUpliftRate + "%]",
        "          │                          └──► 智能专属动态优惠 ────► 社交回响被动新客 [引客 " + aiAcquired.toLocaleString() + "人]",
        "裂变增值 ─┼",
        "          │                          ┌──► 免费新客引入 ────────► 摊薄平均CAC成本",
        "          └──► 新客获利区间 (LTV-CAC)─┼──► 会员终身生命价值 ──► 用户单客LTV [估￥" + calcLtv + "]"
      ].join("\n");

      pitchGoldSec = `王总，由于目前全行业买量获客成本 (CAC) 节节攀升，仅靠单向花钱投流已经难以为继。我们的 **Martech+AI 解决方案**，通过打通老客户的强粘性社交推荐机制，提供千人千面的个性化拼团/福袋/动态分享裂变策略。仅需1个月联调，我们就能将老客户的月度裂变传染系数 (K-Factor) 从 **${calcBaseK}** 极大提升至 **${aiK.toFixed(3)}**（相对提升 **${aiUpliftRate}%**）。在不额外增加任何一分钱买量预算的前提下，每月由老客社交链路被动带入的成交新用户增加 **${(aiAcquired - baseAcquired).toLocaleString()}** 人，直接变现增产 **￥${Math.round(incrementalCacProfit).toLocaleString()}** 的常态客群毛利空间！`;
      
      pitchMetricGoalText = `提升 ${aiUpliftRate}% 社交裂变系数 (K-Factor)`;
    }

    const adviceParams = {
      presetName: preset.name,
      selectedSize,
      selectedRole,
      kpiAnalysisText,
      valueTreeText,
      pitchGoldSec,
      pitchMetricGoalText
    };

    const text = getAdviceTemplate(tab, adviceParams);
    setAiResultText(text);
  };

  // Run initial call and keep dynamic content updated on any input change so text reflects sliders instantly
  useEffect(() => {
    getPreloadedAdvice(mode, selectedIndustry);
  }, [
    mode, 
    selectedIndustry, 
    selectedSize, 
    selectedRole, 
    extraContext, 
    calcTraffic, 
    calcCtr, 
    calcCvr, 
    calcAov, 
    aiUpliftRate,
    diagnosticScores.dataSilo,
    diagnosticScores.aiReadiness,
    diagnosticScores.complianceGaps,
    roiModel,
    calcTotalUsers,
    calcBaseRetention,
    calcArpu,
    calcAtRisk,
    calcBaseChurn,
    calcLossValue,
    calcRuleSaveRate,
    calcSeedTraffic,
    calcBaseCac,
    calcBaseK,
    calcLtv
  ]);

  // Copy helper
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(aiResultText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger real server-side Gemini API call via /api/generate
  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    setAiError(null);

    let kpiContextString = "";
    if (roiModel === "conversion") {
      kpiContextString = `指标模型：转化率与GMV变现（触达月流量：${calcTraffic}，点击率：${calcCtr}%，基础CVR：${calcCvr}%，平均客单价：${calcAov}元，预估AI提效：${aiUpliftRate}%）`;
    } else if (roiModel === "retention") {
      kpiContextString = `指标模型：活跃度与留存率（注册用户底盘：${calcTotalUsers}，基准活跃留存率：${calcBaseRetention}%，平均单客ARPU：${calcArpu}元/月，预估AI留存相对提升：${aiUpliftRate}%）`;
    } else if (roiModel === "churn") {
      kpiContextString = `指标模型：用户流失与精准挽留（面临流失风险客群：${calcAtRisk}，基准月度自然流失率：${calcBaseChurn}%，手动规则挽留挽回率：${calcRuleSaveRate}%，被挽留老客LTV：${calcLossValue}元，预估AI提效：${aiUpliftRate}%）`;
    } else if (roiModel === "cac") {
      kpiContextString = `指标模型：社交裂变与获客CAC（月度新增裂变种子量：${calcSeedTraffic}，基准获客成本CAC：${calcBaseCac}元，基准推荐裂变系数K-Factor：${calcBaseK}，被带新客户生命周期价值LTV：${calcLtv}元，预估AI提效：${aiUpliftRate}%）`;
    }

    try {
      const preset = INDUSTRY_PRESETS.find(p => p.id === selectedIndustry) || INDUSTRY_PRESETS[0];
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: mode,
          role: selectedRole,
          industry: preset.name,
          size: selectedSize,
          extraContext: `${kpiContextString}\n\n${extraContext}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        setAiResultText(data.text);
      } else {
        throw new Error("API did not return any text.");
      }
    } catch (err) {
      console.error("Error generating with Gemini:", err);
      setAiError(err.message || "连接至 AI 增长引擎失败，请检查密钥配置。");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col min-h-screen font-sans text-slate-800" id="main-consultant-suite">
      
      {/* Dynamic Header Section */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm shrink-0 gap-4" id="header-wrapper">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-indigo-100" id="brand-logo">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              MARTECH AI <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded text-xs tracking-wider">EXPERT CO-PILOT OS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">打造 Martech + 智能 AI 融合领域的一流交付、客户成功、业务分析与商业拓展专家大脑</p>
          </div>
        </div>
        
        {/* Real-time Assistant Profile */}
        <div className="flex items-center gap-4 self-end md:self-auto" id="user-info-section">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-800">高级实战解决方案专家</span>
            </div>
            <span className="text-xs text-slate-400">Martech+AI 战略与价值实现总监级</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            顾问
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 p-4 lg:p-6 grid grid-cols-12 gap-6" id="main-content-layout">
        
        {/* Left Side: Parameters, Presets, and Interactive Calculators */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6" id="left-workspace-rail">
          
          {/* Top Panel: Customer Environment Profiles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4" id="client-config-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                1. 客户业务特征画像配置
              </h2>
              <span className="text-[11px] bg-slate-100 font-medium px-2 py-0.5 rounded text-slate-600">
                配置越准 方案越专
              </span>
            </div>

            {/* Target Industry Selection */}
            <div className="flex flex-col gap-1.5" id="industry-selector-group">
              <label className="text-xs font-bold text-slate-700">目标客户行业特征 (Target Industry)</label>
              <div className="grid grid-cols-1 gap-2 mt-1">
                {INDUSTRY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    id={`industry-btn-${preset.id}`}
                    onClick={() => handleIndustryChange(preset.id)}
                    className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                      selectedIndustry === preset.id
                        ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                        : "bg-stone-50/50 hover:bg-stone-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${selectedIndustry === preset.id ? "text-indigo-800" : "text-slate-800"}`}>
                        {preset.name}
                      </span>
                      {selectedIndustry === preset.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate w-full">
                      主推构架: {preset.suggestedStack}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Selector */}
            <div className="flex flex-col gap-1.5 mt-2" id="scale-selector-group">
              <label className="text-xs font-bold text-slate-700">企业规模级别 (Company Scale)</label>
              <select
                id="select-company-size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
              >
                <option value="超大型企业 (5000人以上 / Multi-national Enterprise)">超大型企业 (5000人以上 / Enterprise Tier)</option>
                <option value="中大型企业 (1000-5000人 / Mid-Market)">中大型企业 (1000-5000人 / Mid-Market)</option>
                <option value="高成长中型企业 (200-1000人 / Growth Startup)">高成长中型企业 (200-1000人 / Growth Startup)</option>
                <option value="创业型小企业 (200人以下 / SMB)">创业型团队 (200人以下 / Small Business)</option>
              </select>
            </div>

            {/* Solution Expert Perspective */}
            <div className="flex flex-col gap-1.5" id="user-role-selector">
              <label className="text-xs font-bold text-slate-700">专家研判侧重点 (User Professional Role)</label>
              <select
                id="select-user-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
              >
                <option value="Business Analyst / 业务分析顾问">Business Analyst / 业务分析主导 (侧重商业诊断与痛点梳理)</option>
                <option value="Solutions Architect / 解决方案架构师">Solutions Architect / 解决方案架构师 (侧重系统联接、数据流蓝图)</option>
                <option value="Delivery PMO / 交付项目经理">Delivery PMO / 交付项目经理 (侧重RACl职责划分、排期路线图、风险控制)</option>
                <option value="Customer Success Manager / 客户成功经理">Customer Success Manager / 客户成功经理 (侧重KPI、高价值ROI运营及LTV保障)</option>
                <option value="Business Development / 商务与BD专员">Business Development / 商业开发BD (侧重一分钟电梯演讲、高管话术与开拓邮件)</option>
              </select>
            </div>
            
            {/* Custom Interactive Pain points / Context Description */}
            <div className="flex flex-col gap-1.5" id="interaction-text-editor">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">定制化背景描述 / 特殊业务诉求</label>
                <button 
                  id="reset-context-btn"
                  onClick={() => setExtraContext(activePreset.defaultContext)}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  重置为预设背景
                </button>
              </div>
              <textarea
                id="preset-extra-context-area"
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
                <Brain className="w-4 h-4 text-teal-300" />
                2. 数智化成熟度自测模型 (Maturity Assessor)
              </h2>
              <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
                PRO DIAGNOSTIC
              </span>
            </div>

            <p className="text-[11px] text-indigo-200 leading-relaxed">
              拖动滑块模拟客户在5个核心维度的底层能力现状。系统将实时评分并在下方方案中生成针对性补强建议：
            </p>

            <div className="space-y-3.5 my-1" id="sliders-container">
              {/* Slider 1: Data Silo */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-100 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-indigo-300" /> 中国大陆/全球数据拉通率 
                  </span>
                  <span className="font-bold text-teal-300 font-mono">{diagnosticScores.dataSilo}/10</span>
                </div>
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
                  <span>100% 毫无关联各部门自研孤岛</span>
                </div>
              </div>

              {/* Slider 2: AI Tech Readiness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> 大模型/智能化就绪度
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
                  <span>0% 空白/无任何AI接口</span>
                  <span>100% 具备RAG与微调Agent中台</span>
                </div>
              </div>

              {/* Slider 3: Compliance risks */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-100 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" /> 信息合规与Pll管控水位
                  </span>
                  <span className="font-bold text-teal-300 font-mono">{diagnosticScores.complianceGaps}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={diagnosticScores.complianceGaps}
                  onChange={(e) => setDiagnosticScores({...diagnosticScores, complianceGaps: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[9px] text-indigo-300">
                  <span>完美脱敏无隐患</span>
                  <span>敏感数据明文传输裸奔</span>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Dynamic Indicator */}
            <div className="bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-800/80 mt-1" id="quick-diagnosis-box">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-200">综合诊断分(系统评级):</span>
                <span className="text-xs bg-indigo-800 text-teal-300 px-2 py-0.5 rounded font-bold font-mono">
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
              MARTECH+AI 专家生命周期方法论 (Consulting Methodology Phases)
            </h2>
            
            <div className="grid grid-cols-5 gap-2" id="methodology-phases-grid">
              
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
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 03</span>
                <span className="text-xs font-bold truncate max-w-full">交付阶段与RACI</span>
              </button>

              {/* Phase 04 */}
              <button
                id="btn-tab-csm"
                onClick={() => setMode("csm-kpi")}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  mode === "csm-kpi"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${mode === "csm-kpi" ? "bg-indigo-750 text-white" : "bg-white text-indigo-600 shadow-sm"}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold block uppercase tracking-wider">Phase 04</span>
                <span className="text-xs font-bold truncate max-w-full">价值实估与CSM</span>
              </button>

              {/* Phase 05 */}
              <button
                id="btn-tab-pitch"
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
            <div className="border-b border-stone-100 pb-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-teal-600 animate-pulse" />
                  3. 高阶顾问 ROI 动态归因估算器 (Value Modeling Calculator)
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  精细化推演“基本方案” vs “AI增强生态”的四大主流 Martech 北极星指标
                </p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-505 bg-emerald-500 rounded-full animate-ping"></span>
                实时归因算法已联调
              </span>
            </div>

            {/* Model Selector Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100/80 p-1 rounded-xl" id="roi-model-tabs-box">
              <button
                onClick={() => setRoiModel("conversion")}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  roiModel === "conversion"
                    ? "bg-white text-teal-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                🎯 转化率与GMV (Conversion)
              </button>
              <button
                onClick={() => setRoiModel("retention")}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  roiModel === "retention"
                    ? "bg-white text-teal-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                🔄 活跃与留存 (Retention)
              </button>
              <button
                onClick={() => setRoiModel("churn")}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  roiModel === "churn"
                    ? "bg-white text-teal-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                🛡️ 流失防损挽回 (Churn)
              </button>
              <button
                onClick={() => setRoiModel("cac")}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  roiModel === "cac"
                    ? "bg-white text-teal-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                🔗 社交传染裂变 (Viral K)
              </button>
            </div>

            {/* Calculations and Visual Representation Grid */}
            {(() => {
              let chartBaseVal = 0;
              let chartBoostedVal = 0;
              let chartTitle = "";
              let chartUnit = "";
              let chartBaseLabel = "";
              let chartBoostedLabel = "";
              let chartDiffLabel = "";

              if (roiModel === "conversion") {
                const originalOrders = calcTraffic * (calcCtr / 100) * (calcCvr / 100);
                const originalGMV = originalOrders * calcAov;
                const liftedCvr = calcCvr * (1 + aiUpliftRate / 100);
                const liftedOrders = calcTraffic * (calcCtr / 100) * (liftedCvr / 100);
                const liftedGMV = liftedOrders * calcAov;
                
                chartBaseVal = originalGMV;
                chartBoostedVal = liftedGMV;
                chartTitle = "月度流水 (GMV) 增长推演";
                chartUnit = "元";
                chartBaseLabel = `基准流水: ￥${Math.round(originalGMV).toLocaleString()}`;
                chartBoostedLabel = `AI流水: ￥${Math.round(liftedGMV).toLocaleString()}`;
                chartDiffLabel = `+￥${Math.round(liftedGMV - originalGMV).toLocaleString()}`;
              } else if (roiModel === "retention") {
                const baseActiveUsers = Math.round(calcTotalUsers * (calcBaseRetention / 100));
                const liftedRetentionPercent = Math.min(100, calcBaseRetention * (1 + aiUpliftRate / 100));
                const liftedActiveUsers = Math.round(calcTotalUsers * (liftedRetentionPercent / 100));
                
                chartBaseVal = baseActiveUsers;
                chartBoostedVal = liftedActiveUsers;
                chartTitle = "月粘性活跃常客 (MAU)";
                chartUnit = "人";
                chartBaseLabel = `基准留存: ${baseActiveUsers.toLocaleString()}人`;
                chartBoostedLabel = `AI留存: ${liftedActiveUsers.toLocaleString()}人`;
                chartDiffLabel = `+${(liftedActiveUsers - baseActiveUsers).toLocaleString()}人`;
              } else if (roiModel === "churn") {
                const lostUsers = Math.round(calcAtRisk * (calcBaseChurn / 100));
                const baseSavedUsers = Math.round(lostUsers * (calcRuleSaveRate / 100));
                const aiSavedUsersRate = Math.min(100, calcRuleSaveRate * (1 + aiUpliftRate / 100));
                const aiSavedUsers = Math.round(lostUsers * (aiSavedUsersRate / 100));
                
                chartBaseVal = baseSavedUsers;
                chartBoostedVal = aiSavedUsers;
                chartTitle = "月流失拦截客户拯救数";
                chartUnit = "人";
                chartBaseLabel = `原规则挽回: ${baseSavedUsers.toLocaleString()}人`;
                chartBoostedLabel = `AI智能挽回: ${aiSavedUsers.toLocaleString()}人`;
                chartDiffLabel = `+${Math.max(0, aiSavedUsers - baseSavedUsers).toLocaleString()}人`;
              } else if (roiModel === "cac") {
                const baseAcquired = Math.round(calcSeedTraffic * (1 + calcBaseK));
                const baseProfit = baseAcquired * (calcLtv - calcBaseCac);
                const aiK = calcBaseK * (1 + aiUpliftRate / 100);
                const aiAcquired = Math.round(calcSeedTraffic * (1 + aiK));
                const aiProfit = aiAcquired * (calcLtv - calcBaseCac);
                
                chartBaseVal = baseProfit;
                chartBoostedVal = aiProfit;
                chartTitle = "裂变带新客终身上限净利润";
                chartUnit = "元";
                chartBaseLabel = `原有获利: ￥${Math.round(baseProfit).toLocaleString()}`;
                chartBoostedLabel = `AI获利: ￥${Math.round(aiProfit).toLocaleString()}`;
                chartDiffLabel = `+￥${Math.round(aiProfit - baseProfit).toLocaleString()}`;
              }

              const maxChartVal = Math.max(chartBaseVal, chartBoostedVal) || 1;
              const basePercent = Math.max(15, Math.min(100, Math.round((chartBaseVal / maxChartVal) * 100)));
              const boostedPercent = Math.max(15, Math.min(100, Math.round((chartBoostedVal / maxChartVal) * 100)));

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-model-section">
                  {/* Left: Active Model Form Inputs */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Model 1 Inputs: Conversion */}
                    {roiModel === "conversion" && (
                      <div className="grid grid-cols-2 gap-3" id="inputs-conversion-grid">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">触达池月度流量</span>
                          <input
                            type="number"
                            value={calcTraffic}
                            onChange={(e) => setCalcTraffic(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">原渠道点击率 (CTR)</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={calcCtr}
                              onChange={(e) => setCalcCtr(Math.max(0, parseFloat(e.target.value) || 0.1))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">原购买转化 (CVR)</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={calcCvr}
                              onChange={(e) => setCalcCvr(Math.max(0, parseFloat(e.target.value) || 0.1))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">平均客单价 (AOV)</span>
                          <div className="relative">
                            <input
                              type="number"
                              value={calcAov}
                              onChange={(e) => setCalcAov(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">元</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Model 2 Inputs: Retention */}
                    {roiModel === "retention" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="inputs-retention-grid">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">注册用户底数 (MAU)</span>
                          <input
                            type="number"
                            value={calcTotalUsers}
                            onChange={(e) => setCalcTotalUsers(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">基准活跃留存率</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={calcBaseRetention}
                              onChange={(e) => setCalcBaseRetention(Math.max(0.1, Math.min(105, parseFloat(e.target.value) || 0.1)))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">单客月均 ARPU 贡献</span>
                          <div className="relative">
                            <input
                              type="number"
                              value={calcArpu}
                              onChange={(e) => setCalcArpu(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">元</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Model 3 Inputs: Churn */}
                    {roiModel === "churn" && (
                      <div className="grid grid-cols-2 gap-3" id="inputs-churn-grid">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">面临流失风险客群底数</span>
                          <input
                            type="number"
                            value={calcAtRisk}
                            onChange={(e) => setCalcAtRisk(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">基准常态自然流失率</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={calcBaseChurn}
                              onChange={(e) => setCalcBaseChurn(Math.max(0.1, Math.min(105, parseFloat(e.target.value) || 0.1)))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">基准手工规则拦截率</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={calcRuleSaveRate}
                              onChange={(e) => setCalcRuleSaveRate(Math.max(0.1, Math.min(105, parseFloat(e.target.value) || 0.1)))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">高净值客户单客 LTV 值</span>
                          <div className="relative">
                            <input
                              type="number"
                              value={calcLossValue}
                              onChange={(e) => setCalcLossValue(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">元</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Model 4 Inputs: CAC & Viral K-Factor */}
                    {roiModel === "cac" && (
                      <div className="grid grid-cols-2 gap-3" id="inputs-cac-grid">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">月度新增裂变种子量</span>
                          <input
                            type="number"
                            value={calcSeedTraffic}
                            onChange={(e) => setCalcSeedTraffic(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">基准获客单成本 (CAC)</span>
                          <div className="relative">
                            <input
                              type="number"
                              value={calcBaseCac}
                              onChange={(e) => setCalcBaseCac(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">元</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">基准 K-Factor 裂变常数</span>
                          <input
                            type="number"
                            step="0.01"
                            value={calcBaseK}
                            onChange={(e) => setCalcBaseK(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">裂变客群终身生命价值 (LTV)</span>
                          <div className="relative">
                            <input
                              type="number"
                              value={calcLtv}
                              onChange={(e) => setCalcLtv(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-mono"
                            />
                            <span className="absolute right-2 top-2  text-[10px] text-slate-400 font-bold">元</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Integrated Slider */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mt-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          Martech+AI 指标相对预期提升比率 (AI Lift Cap)
                        </span>
                        <span className="text-xs font-extrabold text-teal-600 font-mono">{aiUpliftRate}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal mb-3">
                        {roiModel === "conversion" && "💡 优化指向：AI文案一键生成与多波段主动触达机制对漏斗原转化率 (CVR) 的相对提升"}
                        {roiModel === "retention" && "💡 优化指向：AI周期策略性与情感随访对原生存周期老客月留存率 (Retention) 的相对提升"}
                        {roiModel === "churn" && "💡 优化指向：AI智能情绪意图拦截和即时挽救推荐对流失防御拯救率 (Save Rate) 的相对提升"}
                        {roiModel === "cac" && "💡 优化指向：老客户一键专属拼大包促裂变功能等机制对新老转化常数 (K-Factor) 的相对提升"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-slate-450 font-mono">5%</span>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={aiUpliftRate}
                          onChange={(e) => setAiUpliftRate(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <span className="text-[9px] text-slate-450 font-mono">50%</span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Live Responsive SVG Comparison Preview Chart */}
                  <div className="lg:col-span-5 bg-stone-50/75 p-4 rounded-xl border border-slate-200/55 flex flex-col justify-between h-full min-h-[230px]">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-200/60">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {chartTitle}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">
                        预测模拟器
                      </span>
                    </div>

                    {/* Funnel/Bar Visual Component */}
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
                            : `${Math.round(chartBaseVal).toLocaleString()}${chartUnit}`}
                        </span>
                        <div 
                          style={{ height: `${Math.max(15, basePercent)}%`, maxHeight: "100%" }} 
                          className="w-9 bg-slate-300 hover:bg-slate-350 rounded-t-md transition-all duration-500 shadow-sm border border-slate-400/20 relative group cursor-pointer"
                        >
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow font-mono">
                            {chartBaseLabel}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">基准未接入</span>
                      </div>

                      {/* Connection Indicator Arrow */}
                      <div className="flex flex-col items-center justify-center pb-6 z-10">
                        <span className="text-[10px] border border-emerald-200 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-full font-extrabold shadow-sm font-mono whitespace-nowrap animate-pulse">
                          {chartDiffLabel}
                        </span>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-slate-300 to-emerald-400 mt-1 relative">
                          <ChevronRight className="w-3 h-3 text-emerald-500 absolute -right-2.5 -top-1.5" />
                        </div>
                      </div>

                      {/* Bar 2: AI Uplift Case */}
                      <div className="flex flex-col items-center gap-2 z-10 w-24">
                        <span className="text-[9px] font-extrabold text-emerald-600 font-mono text-center truncate w-full px-1 animate-pulse">
                          {roiModel === "conversion" || roiModel === "cac" 
                            ? `￥${Math.round(chartBoostedVal).toLocaleString()}` 
                            : `${Math.round(chartBoostedVal).toLocaleString()}${chartUnit}`}
                        </span>
                        <div 
                          style={{ height: `${Math.max(15, boostedPercent)}%`, maxHeight: "100%" }} 
                          className="w-9 bg-gradient-to-t from-teal-500 to-emerald-400 hover:brightness-105 rounded-t-md transition-all duration-500 shadow-lg shadow-emerald-100 border border-emerald-400/20 relative group cursor-pointer"
                        >
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow font-mono">
                            {chartBoostedLabel}
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600">AI 智能重构</span>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-400 mt-2 text-center leading-relaxed border-t border-slate-200/50 pt-2 font-medium">
                      指标基于【方法论预设】底层计算。拖拉左侧滑块，下方方案文稿也将自动联动更新。
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Calculations Result Matrix Show */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-teal-50/40 p-4 rounded-xl border border-teal-100" id="calculation-results">
              
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {roiModel === "conversion" && "基准常规月度订单与流水"}
                  {roiModel === "retention" && "基准常态留存活跃 MAU"}
                  {roiModel === "churn" && "传统规则挽回大客数"}
                  {roiModel === "cac" && "基准裂变带新获客及获利区"}
                </span>
                <span className="text-base font-bold text-slate-700 font-mono mt-0.5" id="baseline-result-text">
                  {roiModel === "conversion" && `${Math.round(calcTraffic * (calcCtr / 100) * (calcCvr / 100)).toLocaleString()} 单 / ￥${Math.round((calcTraffic * (calcCtr / 100) * (calcCvr / 100)) * calcAov).toLocaleString()}`}
                  {roiModel === "retention" && `${Math.round(calcTotalUsers * (calcBaseRetention / 100)).toLocaleString()} 名常态客群`}
                  {roiModel === "churn" && `${Math.round((calcAtRisk * (calcBaseChurn / 105)) * (calcRuleSaveRate / 105)).toLocaleString()} 人`}
                  {roiModel === "cac" && `￥${Math.round(Math.round(calcSeedTraffic * (1 + calcBaseK)) * (calcLtv - calcBaseCac)).toLocaleString()}`}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">
                  {roiModel === "conversion" && `基础转化率 CVR: ${calcCvr}%`}
                  {roiModel === "retention" && `基准留存率 Retention: ${calcBaseRetention}%`}
                  {roiModel === "churn" && `流失警告折损: ${Math.round(calcAtRisk * (calcBaseChurn / 100)).toLocaleString()} 人/月`}
                  {roiModel === "cac" && `新客终身价值 LTV: ￥${calcLtv}`}
                </span>
              </div>

              <div className="flex flex-col border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-4">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {roiModel === "conversion" && "AI调优后预测月度GMV"}
                  {roiModel === "retention" && "AI赋能后预测活跃用户"}
                  {roiModel === "churn" && "AI策略精准干预成功挽回数"}
                  {roiModel === "cac" && "AI裂变放大系数后客群终身获利"}
                </span>
                <span className="text-base font-bold text-indigo-700 font-mono mt-0.5" id="boosted-result-text">
                  {roiModel === "conversion" && `￥${Math.round(((calcTraffic * (calcCtr / 100) * (calcCvr / 100)) * calcAov) * (1 + (aiUpliftRate / 100))).toLocaleString()}`}
                  {roiModel === "retention" && `${Math.round(calcTotalUsers * (Math.min(100, calcBaseRetention * (1 + aiUpliftRate / 100)) / 100)).toLocaleString()} 名活跃留存`}
                  {roiModel === "churn" && `${Math.round((calcAtRisk * (calcBaseChurn / 100)) * (Math.min(100, calcRuleSaveRate * (1 + aiUpliftRate / 100)) / 100)).toLocaleString()} 人成功留存`}
                  {roiModel === "cac" && `￥${Math.round(Math.round(calcSeedTraffic * (1 + (calcBaseK * (1 + aiUpliftRate / 100)))) * (calcLtv - calcBaseCac)).toLocaleString()}`}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">
                  {roiModel === "conversion" && `提升后 CVR: ${((calcCvr / 100) * (1 + (aiUpliftRate / 100)) * 100).toFixed(2)}%`}
                  {roiModel === "retention" && `月留存拉升至: ${Math.min(100, calcBaseRetention * (1 + aiUpliftRate / 100)).toFixed(1)}%`}
                  {roiModel === "churn" && `干预拦截率: ${Math.min(100, calcRuleSaveRate * (1 + aiUpliftRate / 100)).toFixed(1)}%`}
                  {roiModel === "cac" && `K裂变系数拉升至: ${(calcBaseK * (1 + aiUpliftRate / 100)).toFixed(3)}`}
                </span>
              </div>

              <div className="flex flex-col border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-4">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600 block shrink-0" />
                  {roiModel === "conversion" && "Martech+AI 月度净增 GMV 收益"}
                  {roiModel === "retention" && "Martech+AI 月度净增留存常态收入"}
                  {roiModel === "churn" && "月度减少流失坏账折损挽回值"}
                  {roiModel === "cac" && "全渠道增量 K 因子裂变毛利润"}
                </span>
                <span className="text-lg font-extrabold text-emerald-600 font-mono mt-0.5" id="incremental-result-text">
                  {roiModel === "conversion" && `+ ￥${Math.round((((calcTraffic * (calcCtr / 100) * (calcCvr / 100)) * calcAov) * (1 + (aiUpliftRate / 100))) - ((calcTraffic * (calcCtr / 100) * (calcCvr / 100)) * calcAov)).toLocaleString()}`}
                  {roiModel === "retention" && `+ ￥${Math.round((Math.round(calcTotalUsers * (Math.min(100, calcBaseRetention * (1 + aiUpliftRate / 100)) / 100)) - Math.round(calcTotalUsers * (calcBaseRetention / 100))) * calcArpu).toLocaleString()}`}
                  {roiModel === "churn" && `+ ￥${Math.round((Math.round((calcAtRisk * (calcBaseChurn / 100)) * (Math.min(100, calcRuleSaveRate * (1 + aiUpliftRate / 100)) / 100)) - Math.round((calcAtRisk * (calcBaseChurn / 100)) * (calcRuleSaveRate / 100))) * calcLossValue).toLocaleString()}`}
                  {roiModel === "cac" && `+ ￥${Math.round((Math.round(calcSeedTraffic * (1 + (calcBaseK * (1 + aiUpliftRate / 100)))) * (calcLtv - calcBaseCac)) - (Math.round(calcSeedTraffic * (1 + calcBaseK)) * (calcLtv - calcBaseCac))).toLocaleString()}`}
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 w-max px-2 py-0.5 rounded mt-1 font-bold">
                  极佳投资回报率 (MOM)
                </span>
              </div>

            </div>
          </div>

          {/* Live Strategy Output Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[450px]" id="strategy-live-panel">
            
            {/* Strategy Tab Header */}
            <div className="border-b border-stone-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {mode === "diagnose" && "Phase 01: 战略发现与诊断书"}
                    {mode === "architect" && "Phase 02: 技术与AI底座构架"}
                    {mode === "delivery-plan" && "Phase 03: 交付管理与责任排期"}
                    {mode === "csm-kpi" && "Phase 04: ROI指标树与客户成功"}
                    {mode === "bd-pitch" && "Phase 05: 商业大客户高管提案话术"}
                  </span>
                  <span className="text-slate-400 text-xs">ID: Martech-AI-XP-03</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-1">专属方案空间 (Strategy Workspace)</h3>
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center gap-2" id="action-trigger-row">
                <button
                  id="ai-generate-blueprint-btn"
                  onClick={handleGenerateAI}
                  disabled={isAiLoading}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-300 ${
                    isAiLoading 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-md"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin text-slate-400" : "text-teal-300"}`} />
                  {isAiLoading ? "大模型深度研判中..." : "一键AI深度生成咨询方案"}
                </button>
                
                <button
                  id="copy-to-clipboard-btn"
                  onClick={handleCopyToClipboard}
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 p-2.5 rounded-xl transition-all"
                  title="复制方案到剪贴板"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strategy Outputs (Supporting both static preloaded visual fallback & dynamic Gemini API response keys) */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[600px] leading-relaxed custom-scrollbar bg-white" id="strategy-doc-body">
              {aiError && (
                <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex gap-3 text-amber-800 text-xs mb-4">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold">连接到 AI 服务时遇到了合规性限制/或缺失 API Key</h4>
                    <p className="mt-1 leading-relaxed">
                      {aiError}
                    </p>
                    <p className="mt-2 font-semibold">
                      💡 现已为您自动切换并加载专家套件精编的 <span className="underline">中国区标准高转化率Martech方案模板</span>（见下方），您也可以通过调整上方的行业配置、成熟度参数与月度流量自动进行高阶运算替换。
                    </p>
                  </div>
                </div>
              )}

              {/* MD Output formatting container */}
              <div className="prose prose-indigo max-w-none text-slate-700 text-sm space-y-4" id="strategy-md-renderer">
                {aiResultText.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return <h1 key={idx} className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mt-4 flex items-center gap-2">{line.replace("# ", "")}</h1>;
                  }
                  if (line.startsWith("## ")) {
                    return <h2 key={idx} className="text-base font-bold text-slate-800 mt-4 flex items-center gap-1.5">{line.replace("## ", "")}</h2>;
                  }
                  if (line.startsWith("### ")) {
                    return <h3 key={idx} className="text-sm font-bold text-slate-700 mt-3">{line.replace("### ", "")}</h3>;
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    return <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-slate-600">{line.substring(2)}</li>;
                  }
                  if (line.startsWith("> ")) {
                    return (
                      <div key={idx} className="bg-indigo-50/70 border-l-4 border-indigo-500 p-4 rounded-r-xl italic text-xs text-indigo-900 my-3 leading-relaxed">
                        {line.replace("> ", "")}
                      </div>
                    );
                  }
                  // Render Tables with simplified premium structure
                  if (line.startsWith("|")) {
                    // Check if it's header line or separator
                    if (line.includes("---") || line.includes("===")) return null;
                    const cols = line.split("|").filter(col => col.trim() !== "");
                    return (
                      <div key={idx} className="overflow-x-auto my-2">
                        <table className="min-w-full text-xs text-left border-collapse border border-slate-200">
                          <tbody>
                            <tr className="bg-slate-50/80 hover:bg-slate-100/50">
                              {cols.map((col, colIdx) => (
                                <td key={colIdx} className="px-3 py-2 border border-slate-100 font-medium">
                                  {col.trim()}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return <p key={idx} className="text-xs leading-relaxed text-slate-600 my-1">{line}</p>;
                })}
              </div>

            </div>

            {/* Tactical Advice Footer bar */}
            <div className="bg-indigo-900/5 px-6 py-3 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-4" id="strategy-footer-tip">
              <div className="flex items-center gap-2 text-xs text-indigo-950 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {mode === "diagnose" && "【核心思考】对齐客户时：着重谈‘数据资产沉淀价值’而非IT成本项目。"}
                  {mode === "architect" && "【核心思考】架构落地方向：CDP是神经中枢，确保实时Trigger延迟低于200毫秒。"}
                  {mode === "delivery-plan" && "【核心思考】项目成功关键：第一阶段交付成果不可过大，聚焦高粘、高概率爆款运营。"}
                  {mode === "csm-kpi" && "【核心思考】续约底章：证明AI增量GMV能够抵扣Martech套件买断价格的2.5-3.5倍。"}
                  {mode === "bd-pitch" && "【核心思考】高管拜访：切忌介绍繁琐文档，优先展示ROI价值树推演和一键蓝图。"}
                </span>
              </div>
              <button 
                id="doc-download-btn"
                onClick={() => {
                  const blob = new Blob([aiResultText], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `Martech_AI_${mode}_${selectedIndustry}.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                导出TXT文稿
              </button>
            </div>

          </div>

          {/* Expert Core Patterns Matching Knowledge Base & Resource Shelf */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="consultant-lower-bento">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300" id="industry-case-bank">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    行业专家基线库 (Expert Standard Benchmarks)
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                    全球行业智库
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 mb-3.5 leading-relaxed">
                  💡 <strong>点击任意基线专家方案</strong>，即可一键将该经典的成熟度自测、ROI指标及痛点背景注入主控制台：
                </p>

                <div className="space-y-3">
                  <div 
                    onClick={() => handleApplyBenchmark("ecom-double11")}
                    className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 cursor-pointer hover:bg-slate-50 hover:text-indigo-600 p-1.5 -mx-1.5 rounded-lg active:scale-[0.98] transition-all duration-150"
                    title="点击立即注入并应用本专家预设"
                  >
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      双11全触达AI文案归因模型
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      + 22.4% CTR
                    </span>
                  </div>
                  
                  <div 
                    onClick={() => handleApplyBenchmark("auto-rag")}
                    className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 cursor-pointer hover:bg-slate-50 hover:text-indigo-600 p-1.5 -mx-1.5 rounded-lg active:scale-[0.98] transition-all duration-150"
                    title="点击立即注入并应用本专家预设"
                  >
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      汽车行业全渠道留资AI-RAG预诊话术
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      + 18.2% 锁单
                    </span>
                  </div>
                  
                  <div 
                    onClick={() => handleApplyBenchmark("beauty-ltv")}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 hover:text-indigo-600 p-1.5 -mx-1.5 rounded-lg active:scale-[0.98] transition-all duration-150"
                    title="点击立即注入并应用本专家预设"
                  >
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      高奢美业周期性主动关怀系统
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      + 35.0% LTV
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>平均UAT就绪周期: 14天</span>
                <span 
                  onClick={() => setActiveAgentModal("allBenchmarks")}
                  className="text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  查看更多行业库 <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md shadow-slate-900 border border-slate-800" id="ai-agent-patterns">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">AI AGENT Orchestration Patterns</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  专家级Martech推荐搭配Gemini智能体管道。<strong>点击下方各个智能体</strong>，可深度查看大模型Prompt微指令构造与系统联动架构：
                </p>
                
                <div className="mt-3.5 space-y-2">
                  <div 
                    onClick={() => setActiveAgentModal("agentA")}
                    className="text-xs bg-white/5 border border-white/10 p-2.5 rounded-xl flex justify-between items-center hover:bg-white/10 hover:border-indigo-500/50 duration-200 cursor-pointer active:scale-[0.98] transition-all"
                    title="点击研读智能体 A 系统提示词与架构机制"
                  >
                    <div>
                      <span className="font-bold text-indigo-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Agent A: Intent Classifier
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">从消费者全渠道实时点击行为识别购买冲动度</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </div>
                  <div 
                    onClick={() => setActiveAgentModal("agentB")}
                    className="text-xs bg-white/5 border border-white/10 p-2.5 rounded-xl flex justify-between items-center hover:bg-white/10 hover:border-indigo-500/50 duration-200 cursor-pointer active:scale-[0.98] transition-all"
                    title="点击研读智能体 B 系统提示词与架构机制"
                  >
                    <div>
                      <span className="font-bold text-indigo-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Agent B: Hyper-Personalizer
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">多线程高并发请求Gemini模型匹配最合适的折扣话术</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </div>
                </div>
              </div>
              
              <p className="text-[9px] text-slate-500 mt-3 text-right">
                Orchestrator Latency 基准: 21ms
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Pop-up Study Modals */}
      {activeAgentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="consultant-study-modal">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-indigo-950 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm tracking-tight">
                  {activeAgentModal === "agentA" && "Agent A 部署模式：Intent Classifier 意图智能体"}
                  {activeAgentModal === "agentB" && "Agent B 部署模式：Hyper-Personalizer 创意智能体"}
                  {activeAgentModal === "allBenchmarks" && "Martech+AI 精选专家基线知识库全量列表"}
                </h3>
              </div>
              <button 
                onClick={() => setActiveAgentModal(null)}
                className="text-indigo-200 hover:text-white font-bold text-lg p-1.5 hover:bg-white/10 rounded transition-colors"
                id="close-modal-btn"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-slate-700 text-xs leading-relaxed">
              
              {activeAgentModal === "agentA" && (
                <>
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
                    <p className="font-bold text-indigo-900 text-xs flex items-center gap-1">
                      <Info className="w-4 h-4 text-indigo-600" /> 智能体核心角色 (Role Definition)
                    </p>
                    <p className="mt-1.5 text-slate-600">
                      <strong>全渠道实时消费者意图精细分类器 (Real-time Intent Classifier)</strong>。该智能体挂载于品牌数据引擎与CDP事件总线最前端，负责在消费者产生微交互行为的50毫秒内，自适应分析其所处的即时购买旅程阶段。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs border-b pb-1.5">🔬 智能体核心决策流 (Decision Pipeline)</h4>
                    <ol className="list-decimal pl-4 space-y-2 text-slate-600">
                      <li><strong>微行为流监听</strong>：捕获高并发的用户交互事件（如大促活动微信加购、汽车行业官网保养服务浏览、美业小程序肤质检测等）。</li>
                      <li><strong>自适应意图评级 (Decision Matrix)</strong>：
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li><span className="text-indigo-600 font-semibold">【高转化偏好】</span>：意图评估分 &gt; 80。判定企业存在即时购买动机，立即触发 <strong>Hyper-Personalizer Agent</strong> 实时推送量身定做的文案。</li>
                          <li><span className="text-amber-600 font-semibold">【信息寻求阶段】</span>：判定处于对比犹豫。改为静默在聊天框中触发智能RAG咨询，避免打扰。</li>
                          <li><span className="text-slate-400 font-semibold">【低效噪音】</span>：直接静默过滤，避免高频广告推送造成客户反感与退订流失。</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border">
                    <h4 className="font-bold text-slate-750 font-mono text-[11px] mb-1.5">Gemini 智能指令提示词剧本 Mockup</h4>
                    <pre className="bg-slate-900 text-teal-300 p-3 rounded-lg text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
{`ROLE: High-Frequency Retail Intent Classifier (Gemini-3.5-Flash Core)
INPUTS: [DwellTimeMs: 12400, LastEvents: ["click_price", "scroll_specs", "add_to_cart"]]
INSTRUCTION: Evaluate user purchase likelihood in 50ms. Categorize into [HIGH_INTENT, RESEARCH, NOISE]. Respond strictly in JSON.`}
                    </pre>
                  </div>
                </>
              )}

              {activeAgentModal === "agentB" && (
                <>
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
                    <p className="font-bold text-indigo-900 text-xs flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> 智能体核心角色 (Role Definition)
                    </p>
                    <p className="mt-1.5 text-slate-600">
                      <strong>千人千面即时优惠与文案专属创意大师 (Hyper-Personalizer Agent)</strong>。接收来自 <strong>Intent Classifier</strong> 触发的主动营销契机，在毫秒级内定制属于该细分画像的商品卖点推荐文案。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs border-b pb-1.5">⚙️ RAG 检索对齐机制 (Grounding Blueprint)</h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                      <li><strong>动态属性注入</strong>：在向量库中匹配当前浏览内容的核心特点（比如新能源汽车的长续航、美业成分抗皱比等）。</li>
                      <li><strong>消费者偏好匹配</strong>：对接用户CDP标签（如：价格敏感、品质党、环保先锋），动态改写文案色调与语言风格。</li>
                      <li><strong>并发渲染派发</strong>：结合实时动态折扣 (Dynamic Coupon placeholder)，在100ms内通过WeCom/微信小程序推送至用户终端，大幅提升整体CTR。</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border">
                    <h4 className="font-bold text-slate-750 font-mono text-[11px] mb-1.5">Gemini 智能指令提示词剧本 Mockup</h4>
                    <pre className="bg-slate-900 text-teal-300 p-3 rounded-lg text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
{`ROLE: Generative Persuasive Copywritng Engine
CONTEXT: CustomerTag: "Eco-Conscious / High-Net-Worth", ProductSpecs: "Sedan Premium Long-Range"
GOAL: Generate personalized push notification. Tone: Sophisticated, emphasizing lifestyle. Keep under 80 chars with dynamic balance.`}
                    </pre>
                  </div>
                </>
              )}

              {activeAgentModal === "allBenchmarks" && (
                <>
                  <p className="text-slate-500 mb-2">
                    以下是全球智库沉淀的 Martech+AI 先导成熟案例库。<strong>点击任意案例可立即在主面板中实现参数预设与流程对齐：</strong>
                  </p>
                  
                  <div className="space-y-2 mt-2">
                    <div 
                      onClick={() => {
                        handleApplyBenchmark("ecom-double11");
                        setActiveAgentModal(null);
                      }}
                      className="p-3 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">1. 电商双11全渠道触达文案归因模型</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">+22.4% CTR</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">适用于高并发大促。通过自研轻量CDP进行实时多段召回，并利用生成式AI重写高带货文案。</p>
                    </div>

                    <div 
                      onClick={() => {
                        handleApplyBenchmark("auto-rag");
                        setActiveAgentModal(null);
                      }}
                      className="p-3 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">2. 新能源汽车留资到店智能RAG预诊邀约</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">+18.2% 锁单</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">适用于极长链路决策。打通车机端状态（保养/电量等）与WeCom门店协同，智能定制跟进话术。</p>
                    </div>

                    <div 
                      onClick={() => {
                        handleApplyBenchmark("beauty-ltv");
                        setActiveAgentModal(null);
                      }}
                      className="p-3 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">3. 高奢消费/美业周期性主动陪伴关怀</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">+35.0% LTV</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">针对超高客单。在产品用罄前提早触发，大模型自动编写温情而不唐突的主动关怀护肤贴士及补货邀约。</p>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t flex justify-end shrink-0">
              <button 
                onClick={() => setActiveAgentModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-colors"
              >
                确定并返回工作区
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 max-w-sm bg-slate-900 border border-indigo-500/30 text-white rounded-2xl shadow-2xl p-4 flex gap-3 animate-slideIn">
          <div className="bg-indigo-600/30 p-2 rounded-xl text-teal-300">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-bold text-teal-300">模组已应用 (State Injected)</p>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Footer System Status Bar with aligned layout */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-2 mt-auto" id="main-footer-bar">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Session/会话: MARTECH_CONSULTING_SUITE_V2</span>
          <span>● 专有云接入: OK</span>
          <span>● AI Engine: Gemini-3.5-Flash (Active)</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
            AI 专家系统在线支持 (Consulting Suit Online)
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </footer>

    </div>
  );
}
