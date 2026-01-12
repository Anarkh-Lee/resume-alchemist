// 按类别分组的行业列表
export const INDUSTRIES = [
  // 技术类
  { id: 'programmer', label: '程序员', icon: 'Code2', description: 'Java/Go/前端/全栈', category: 'tech' },
  { id: 'devops', label: '运维/SRE', icon: 'Server', description: '自动化运维/云原生', category: 'tech' },
  { id: 'security', label: '网络安全', icon: 'Shield', description: '安全攻防/合规审计', category: 'tech' },
  { id: 'qa', label: '测试工程师', icon: 'Bug', description: '自动化测试/质量保障', category: 'tech' },
  // 产品设计类
  { id: 'pm', label: '产品经理', icon: 'Lightbulb', description: '产品规划/用户研究', category: 'product' },
  { id: 'designer', label: 'UI/UX设计师', icon: 'Palette', description: '视觉/交互设计', category: 'product' },
  { id: 'analyst', label: '数据分析师', icon: 'BarChart3', description: '数据分析/BI', category: 'product' },
  // 业务职能类
  { id: 'marketing', label: '市场/运营', icon: 'Megaphone', description: '品牌/增长/内容', category: 'business' },
  { id: 'sales', label: '销售', icon: 'Handshake', description: '客户开发/商务', category: 'business' },
  { id: 'hr', label: 'HR', icon: 'Users', description: '招聘/组织发展', category: 'business' },
  { id: 'accountant', label: '会计/财务', icon: 'Calculator', description: '财务分析/税务筹划', category: 'business' },
] as const;

export type IndustryId = typeof INDUSTRIES[number]['id'];

// 完整的行业深度配置
export interface IndustryConfig {
  id: IndustryId;
  name: string;
  dimensions: string[];
  expertModeName: string;
  expertStrategy: string;
  dataPlaceholders: string[];
  roastOpeners: string[];
}

export const INDUSTRY_CONFIG: Record<IndustryId, IndustryConfig> = {
  programmer: {
    id: 'programmer',
    name: '技术/程序员',
    dimensions: ['算法基础', '系统架构', '工程质量', '技术广度', '业务理解', '影响力'],
    expertModeName: '架构思维与技术壁垒版',
    expertStrategy: '强调高并发处理、系统稳定性、源码级理解、技术选型决策。突出对底层原理的掌握和架构设计的经验。',
    dataPlaceholders: [
      '[QPS 提升了 X%]',
      '[延迟降低了 Yms]',
      '[Crash率降低至 Z%]',
      '[节省服务器成本 W%]',
      '[代码覆盖率提升至 X%]',
      '[系统可用性达到 99.X%]',
    ],
    roastOpeners: [
      '你的简历堆砌了一堆技术名词，像个报菜名的服务员，看不出任何深度。',
      '这项目经历写得像记流水账，你是个打字员吗？',
      '看完你的简历，我只记住了你会用 CRUD，这就是你的核心竞争力？',
      '技术栈罗列了一整页，但我看不到任何一个你真正精通的。',
    ],
  },
  devops: {
    id: 'devops',
    name: '运维/SRE',
    dimensions: ['自动化运维', '系统稳定性', '云原生技术', '成本控制', '故障响应', '安全合规'],
    expertModeName: 'SRE 体系与稳定性建设版',
    expertStrategy: '强调 SLA/SLO 承诺、CI/CD 流水线效率、容器化编排 (K8s)、可观测性建设、以及降本增效。',
    dataPlaceholders: [
      '[系统可用性 (SLA) 提升至 99.99%]',
      '[部署效率提升 X%]',
      '[云资源成本降低 Y%]',
      '[故障恢复时间 (MTTR) 缩短 Z分钟]',
    ],
    roastOpeners: [
      '你只是个会重启服务器的网管吗？我看不到任何自动化思维。',
      '出了故障全靠人肉填坑？你的容灾方案和监控体系在哪里？',
      '写了一堆运维脚本就叫 DevOps？CI/CD 流水线呢？可观测性呢？',
      '云原生时代还在手动部署？你确定不是在维护上古系统？',
    ],
  },
  security: {
    id: 'security',
    name: '网络安全',
    dimensions: ['漏洞挖掘', '防御架构', '应急响应', '合规审计', '渗透测试', '安全开发'],
    expertModeName: '零信任架构与攻防对抗版',
    expertStrategy: '强调主动防御体系、SDL (安全开发生命周期)、等级保护/GDPR 合规、以及攻防演练战果。',
    dataPlaceholders: [
      '[修复高危漏洞 X个]',
      '[拦截恶意攻击 Y万次]',
      '[安全审计通过率 100%]',
      '[应急响应速度缩短至 Z分钟]',
    ],
    roastOpeners: [
      '你只会用脚本跑现成的扫描器吗？我看不到深度攻防能力。',
      '等黑客进来了再报警？你的纵深防御体系和威胁情报在哪里？',
      '安全报告写得像百度百科，有实战经验吗？',
      '只会做合规检查？真正的红蓝对抗你打过几场？',
    ],
  },
  qa: {
    id: 'qa',
    name: '测试工程师',
    dimensions: ['测试策略', '自动化覆盖', '缺陷分析', '性能测试', '持续集成', '用户视角'],
    expertModeName: '质量效能与自动化体系版',
    expertStrategy: '强调测试左移 (Shift Left)、精准测试、自动化覆盖率提升、以及对线上质量 (线上故障率) 的保障。',
    dataPlaceholders: [
      '[自动化测试覆盖率达到 X%]',
      '[线上故障率降低 Y%]',
      '[回归测试周期缩短 Z天]',
      '[发现核心性能瓶颈 W个]',
    ],
    roastOpeners: [
      '你只会对着页面点点点的"点工"吗？自动化代码在哪里？',
      '测了半天上线还是挂，你的测试用例设计逻辑不仅简陋，而且全是漏洞。',
      '功能测试做得热闹，性能瓶颈一个没发现？',
      '测试报告写得像流水账，缺陷根因分析在哪里？',
    ],
  },
  pm: {
    id: 'pm',
    name: '产品经理',
    dimensions: ['商业洞察', '用户体验', '数据分析', '项目管理', '沟通协调', '战略规划'],
    expertModeName: '商业闭环与产品战略版',
    expertStrategy: '强调 ROI（投资回报率）、GTM（上市策略）、Roadmap 规划、从 0 到 1 的破局能力。体现商业思维和战略视野。',
    dataPlaceholders: [
      '[DAU 提升了 X%]',
      '[用户留存率 +Y%]',
      '[转化率提升 Z%]',
      '[带来营收 W万]',
      '[NPS 提升 X 分]',
      '[功能使用率达到 Y%]',
    ],
    roastOpeners: [
      '我看不到任何商业思考，你只是个画原型的工具人吗？',
      "全是'参与了'、'协助了'，你的个人贡献在哪里？",
      '这简历像是在写工作日志，不是在证明你的产品能力。',
      '你的项目成果呢？我只看到了过程，没看到结果。',
    ],
  },
  designer: {
    id: 'designer',
    name: 'UI/UX设计师',
    dimensions: ['视觉表现', '交互逻辑', '用户同理心', '设计规范', '品牌理解', '工具效率'],
    expertModeName: '设计思维与用户体验版',
    expertStrategy: '强调 Design System（设计系统）的搭建、全链路设计、品牌一致性、设计对数据的赋能。体现从用户洞察到设计落地的闭环能力。',
    dataPlaceholders: [
      '[点击率 (CTR) 提升 X%]',
      '[改稿效率提升 Y%]',
      '[用户满意度 (NPS) +Z]',
      '[任务完成时间缩短 W%]',
      '[设计规范覆盖率达到 X%]',
      '[跳出率降低 Y%]',
    ],
    roastOpeners: [
      '这排版乱得像我在地铁上挤出来的。',
      '你的作品集看起来像是 5 年前的 Dribbble 练习稿，毫无落地性。',
      '我看不到任何用户思维，你确定你不是美工？',
      '设计好看有什么用，你能证明它有效吗？',
    ],
  },
  analyst: {
    id: 'analyst',
    name: '数据分析师',
    dimensions: ['统计学基础', '建模能力', '业务洞察', '数据可视化', 'SQL/Python', '决策支持'],
    expertModeName: '商业智能与决策驱动版',
    expertStrategy: '强调从数据中发现机会、归因分析、预测模型精准度、对战略决策的直接支撑。体现数据驱动业务增长的能力。',
    dataPlaceholders: [
      '[预测准确率达到 X%]',
      '[发现潜在营收机会 Y万]',
      '[报表自动化节约 Z小时/周]',
      '[数据异常检出率提升 W%]',
      '[分析效率提升 X%]',
      '[决策周期缩短 Y天]',
    ],
    roastOpeners: [
      '你只是个人肉取数机吗？我只看到了数字，没看到观点 (Insights)。',
      '这图表选得比我的午餐还随便。',
      'SQL 写得 6 有什么用，你的业务理解在哪里？',
      '分析了半天，结论就是"数据有待进一步观察"？',
    ],
  },
  marketing: {
    id: 'marketing',
    name: '市场/运营',
    dimensions: ['获客能力', '内容创意', '活动策划', '数据复盘', '渠道管理', '品牌建设'],
    expertModeName: '增长黑客与品牌操盘版',
    expertStrategy: '强调低成本获客、漏斗转化优化、私域流量运营、品牌声量引爆。体现增长思维和全链路运营能力。',
    dataPlaceholders: [
      '[ROI 达到 1:X]',
      '[获客成本 (CAC) 降低 Y%]',
      '[全网曝光量 Z万+]',
      '[GMV 增长 W%]',
      '[粉丝/用户增长 X万]',
      '[活动参与率达到 Y%]',
    ],
    roastOpeners: [
      '全是自嗨型的文案，我看不到任何转化逻辑。',
      '这简历像是在烧老板的钱，完全没有 ROI 意识。',
      '做了那么多活动，效果呢？数据呢？',
      '我看你很擅长"参与"，但不擅长"负责"。',
    ],
  },
  sales: {
    id: 'sales',
    name: '销售',
    dimensions: ['客户开发', '谈判技巧', '业绩达成', '渠道拓展', '客户维系', '销售管理'],
    expertModeName: '销冠策略与大客攻坚版',
    expertStrategy: '强调 KA 大客户攻单、销售漏斗管理、超额完成率、年度复合增长。体现销售策略思维和大客户经营能力。',
    dataPlaceholders: [
      '[业绩达成率 X%]',
      '[年度销售额 Y万]',
      '[签约行业头部客户 Z家]',
      '[回款率 W%]',
      '[客户续约率达到 X%]',
      '[新客户开发 Y家]',
    ],
    roastOpeners: [
      '你在写简历还是在写小说？我要看数字，不是看过程。',
      '连业绩目标都没写，你打算进去养老吗？',
      '这简历像在写工作汇报，不是在证明你能卖货。',
      '客户资源呢？成单周期呢？客单价呢？全是空话。',
    ],
  },
  hr: {
    id: 'hr',
    name: '人力资源',
    dimensions: ['招聘配置', '组织发展', '薪酬绩效', '员工关系', '企业文化', '流程合规'],
    expertModeName: '组织效能与人才战略版',
    expertStrategy: '强调 OD（组织发展）、人才梯队建设、人效提升、合规风险控制。体现战略人力资源管理能力。',
    dataPlaceholders: [
      '[招聘周期缩短 X天]',
      '[员工满意度提升 Y%]',
      '[核心人才流失率降低 Z%]',
      '[人效提升 W%]',
      '[招聘完成率达到 X%]',
      '[培训覆盖率达到 Y%]',
    ],
    roastOpeners: [
      '你看起来像个只会发通知的行政，而不是懂业务的 HRBP。',
      '我看不到你对组织效率的任何贡献。',
      '招了多少人？留存率多少？成本多少？数据呢？',
      '这简历像 HR 部门的工作说明书，不是你的能力证明。',
    ],
  },
  accountant: {
    id: 'accountant',
    name: '会计/财务',
    dimensions: ['财务分析', '风险控制', '税务筹划', '合规准则', '资金管理', '报表效率'],
    expertModeName: 'CFO 视角与财务战略版',
    expertStrategy: '强调业财融合、现金流优化、审计合规率、税务风险规避及对经营决策的数据支撑。',
    dataPlaceholders: [
      '[税务成本节约 X万]',
      '[月结耗时缩短 Y天]',
      '[审计一次通过率 100%]',
      '[资金周转率提升 Z%]',
    ],
    roastOpeners: [
      '你只是个记流水账的算盘吗？我只看到了发票，没看到财务分析。',
      '我看不到任何风险管控意识，这种简历去大厂第一轮就会被财务总监毙掉。',
      '除了记账还会什么？业财融合在哪里？',
      '财务报表做得规规矩矩，但对经营决策有什么支撑？',
    ],
  },
};

// 获取行业配置的辅助函数
export function getIndustryConfig(industryId: string): IndustryConfig {
  return INDUSTRY_CONFIG[industryId as IndustryId] || INDUSTRY_CONFIG.programmer;
}

// 获取随机毒舌开场白
export function getRandomRoastOpener(industryId: string): string {
  const config = getIndustryConfig(industryId);
  const index = Math.floor(Math.random() * config.roastOpeners.length);
  return config.roastOpeners[index];
}

// 获取分类标签
export const CATEGORY_LABELS: Record<string, string> = {
  tech: '技术类',
  product: '产品设计类',
  business: '业务职能类',
};
