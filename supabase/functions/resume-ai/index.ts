import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 速率限制配置
const RATE_LIMIT_MAX_REQUESTS = 10; // 每分钟最大请求数
const RATE_LIMIT_ENDPOINT = 'resume-ai';

// 检查速率限制是否启用（通过环境变量控制）
function isRateLimitEnabled(): boolean {
  const enabled = Deno.env.get('RATE_LIMIT_ENABLED');
  // 默认关闭，只有明确设置为 'true' 时才启用
  return enabled === 'true';
}

// 获取当前分钟窗口标识
function getCurrentMinuteWindow(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
}

// 检查并更新速率限制
async function checkRateLimit(supabase: any, ipAddress: string): Promise<{ allowed: boolean; remaining: number }> {
  const minuteWindow = getCurrentMinuteWindow();
  
  // 尝试插入或更新速率限制记录
  const { data: existing, error: selectError } = await supabase
    .from('rate_limits')
    .select('request_count')
    .eq('ip_address', ipAddress)
    .eq('endpoint', RATE_LIMIT_ENDPOINT)
    .eq('minute_window', minuteWindow)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Rate limit check error:', selectError);
    // 出错时允许请求通过，避免误杀
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }

  if (existing) {
    // 记录已存在，检查是否超限
    if (existing.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }
    
    // 更新计数
    await supabase
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('ip_address', ipAddress)
      .eq('endpoint', RATE_LIMIT_ENDPOINT)
      .eq('minute_window', minuteWindow);
    
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.request_count - 1 };
  } else {
    // 新记录
    await supabase
      .from('rate_limits')
      .insert({
        ip_address: ipAddress,
        endpoint: RATE_LIMIT_ENDPOINT,
        minute_window: minuteWindow,
        request_count: 1
      });
    
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
}

interface RequestBody {
  type: 'roast' | 'polish_full' | 'polish_sentence' | 'jd_match';
  content: string;
  industry: string;
  jd?: string;
  style?: 'standard' | 'data' | 'expert';
}

// 完整的行业深度配置
interface IndustryConfig {
  name: string;
  dimensions: string[];
  expertModeName: string;
  expertStrategy: string;
  dataPlaceholders: string[];
  roastOpeners: string[];
}

const INDUSTRY_CONFIG: Record<string, IndustryConfig> = {
  programmer: {
    name: '技术/程序员',
    dimensions: ['算法基础', '系统架构', '工程质量', '技术广度', '业务理解', '影响力'],
    expertModeName: '架构思维与技术壁垒版',
    expertStrategy: '强调高并发处理、系统稳定性、源码级理解、技术选型决策。突出对底层原理的掌握和架构设计的经验。',
    dataPlaceholders: ['[QPS 提升了 X%]', '[延迟降低了 Yms]', '[Crash率降低至 Z%]', '[节省服务器成本 W%]'],
    roastOpeners: [
      '你的简历堆砌了一堆技术名词，像个报菜名的服务员，看不出任何深度。',
      '这项目经历写得像记流水账，你是个打字员吗？',
      '看完你的简历，我只记住了你会用 CRUD，这就是你的核心竞争力？',
      '技术栈罗列了一整页，但我看不到任何一个你真正精通的。',
    ],
  },
  pm: {
    name: '产品经理',
    dimensions: ['商业洞察', '用户体验', '数据分析', '项目管理', '沟通协调', '战略规划'],
    expertModeName: '商业闭环与产品战略版',
    expertStrategy: '强调 ROI（投资回报率）、GTM（上市策略）、Roadmap 规划、从 0 到 1 的破局能力。体现商业思维和战略视野。',
    dataPlaceholders: ['[DAU 提升了 X%]', '[用户留存率 +Y%]', '[转化率提升 Z%]', '[带来营收 W万]'],
    roastOpeners: [
      '我看不到任何商业思考，你只是个画原型的工具人吗？',
      "全是'参与了'、'协助了'，你的个人贡献在哪里？",
      '这简历像是在写工作日志，不是在证明你的产品能力。',
    ],
  },
  designer: {
    name: 'UI/UX设计师',
    dimensions: ['视觉表现', '交互逻辑', '用户同理心', '设计规范', '品牌理解', '工具效率'],
    expertModeName: '设计思维与用户体验版',
    expertStrategy: '强调 Design System（设计系统）的搭建、全链路设计、品牌一致性、设计对数据的赋能。',
    dataPlaceholders: ['[点击率 (CTR) 提升 X%]', '[改稿效率提升 Y%]', '[用户满意度 (NPS) +Z]', '[任务完成时间缩短 W%]'],
    roastOpeners: [
      '这排版乱得像我在地铁上挤出来的。',
      '你的作品集看起来像是 5 年前的 Dribbble 练习稿，毫无落地性。',
      '我看不到任何用户思维，你确定你不是美工？',
    ],
  },
  analyst: {
    name: '数据分析师',
    dimensions: ['统计学基础', '建模能力', '业务洞察', '数据可视化', 'SQL/Python', '决策支持'],
    expertModeName: '商业智能与决策驱动版',
    expertStrategy: '强调从数据中发现机会、归因分析、预测模型精准度、对战略决策的直接支撑。',
    dataPlaceholders: ['[预测准确率达到 X%]', '[发现潜在营收机会 Y万]', '[报表自动化节约 Z小时/周]'],
    roastOpeners: [
      '你只是个人肉取数机吗？我只看到了数字，没看到观点 (Insights)。',
      '这图表选得比我的午餐还随便。',
      'SQL 写得 6 有什么用，你的业务理解在哪里？',
    ],
  },
  marketing: {
    name: '市场/运营',
    dimensions: ['获客能力', '内容创意', '活动策划', '数据复盘', '渠道管理', '品牌建设'],
    expertModeName: '增长黑客与品牌操盘版',
    expertStrategy: '强调低成本获客、漏斗转化优化、私域流量运营、品牌声量引爆。',
    dataPlaceholders: ['[ROI 达到 1:X]', '[获客成本 (CAC) 降低 Y%]', '[全网曝光量 Z万+]', '[GMV 增长 W%]'],
    roastOpeners: [
      '全是自嗨型的文案，我看不到任何转化逻辑。',
      '这简历像是在烧老板的钱，完全没有 ROI 意识。',
      '做了那么多活动，效果呢？数据呢？',
    ],
  },
  sales: {
    name: '销售',
    dimensions: ['客户开发', '谈判技巧', '业绩达成', '渠道拓展', '客户维系', '销售管理'],
    expertModeName: '销冠策略与大客攻坚版',
    expertStrategy: '强调 KA 大客户攻单、销售漏斗管理、超额完成率、年度复合增长。',
    dataPlaceholders: ['[业绩达成率 X%]', '[年度销售额 Y万]', '[签约行业头部客户 Z家]', '[回款率 W%]'],
    roastOpeners: [
      '你在写简历还是在写小说？我要看数字，不是看过程。',
      '连业绩目标都没写，你打算进去养老吗？',
      '这简历像在写工作汇报，不是在证明你能卖货。',
    ],
  },
  hr: {
    name: '人力资源',
    dimensions: ['招聘配置', '组织发展', '薪酬绩效', '员工关系', '企业文化', '流程合规'],
    expertModeName: '组织效能与人才战略版',
    expertStrategy: '强调 OD（组织发展）、人才梯队建设、人效提升、合规风险控制。',
    dataPlaceholders: ['[招聘周期缩短 X天]', '[员工满意度提升 Y%]', '[核心人才流失率降低 Z%]', '[人效提升 W%]'],
    roastOpeners: [
      '你看起来像个只会发通知的行政，而不是懂业务的 HRBP。',
      '我看不到你对组织效率的任何贡献。',
      '招了多少人？留存率多少？成本多少？数据呢？',
    ],
  },
};

function getConfig(industry: string): IndustryConfig {
  return INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.programmer;
}

function getRandomRoastOpener(industry: string): string {
  const config = getConfig(industry);
  const index = Math.floor(Math.random() * config.roastOpeners.length);
  return config.roastOpeners[index];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 获取客户端 IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // 初始化 Supabase 客户端（使用 service role 访问速率限制表）
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 检查速率限制（可通过 RATE_LIMIT_ENABLED 环境变量控制）
    if (isRateLimitEnabled()) {
      const { allowed, remaining } = await checkRateLimit(supabase, clientIP);
      
      if (!allowed) {
        return new Response(JSON.stringify({ 
          error: '请求过于频繁，请稍后再试（每分钟最多 10 次）' 
        }), {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
          },
        });
      }
    }

    const { type, content, industry, jd, style } = await req.json() as RequestBody;
    const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');
    const SILICONFLOW_MODEL = Deno.env.get('SILICONFLOW_MODEL') || 'Qwen/Qwen3-8B';
    
    if (!SILICONFLOW_API_KEY) {
      throw new Error('SILICONFLOW_API_KEY is not configured');
    }

    const config = getConfig(industry);
    const dimensions = config.dimensions;
    const roastOpener = getRandomRoastOpener(industry);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'roast') {
      systemPrompt = `你是一位资深HR面试官，拥有15年招聘经验。你的任务是用犀利、幽默、略带刻薄但不失专业的视角点评简历。
你需要针对${config.name}岗位进行分析。

【重要】开场白必须使用以下这句话作为 roast 的开头，然后再进行具体分析：
"${roastOpener}"

你必须返回JSON格式，包含以下字段：
{
  "score": 0-100的综合评分,
  "roast": "以上面的开场白开始，用犀利幽默的语气写一段150字左右的毒舌点评，要戳中痛点但不失专业",
  "dimensions": {
    "${dimensions[0]}": 0-100,
    "${dimensions[1]}": 0-100,
    "${dimensions[2]}": 0-100,
    "${dimensions[3]}": 0-100,
    "${dimensions[4]}": 0-100,
    "${dimensions[5]}": 0-100
  },
  "ats_score": 0-100的ATS友好度评分,
  "highlights": ["3个简历亮点"],
  "weaknesses": ["3个需要改进的地方"],
  "keywords_missing": ["可能缺少的3-5个行业关键词"]
}

只返回JSON，不要有其他内容。所有回复必须使用中文。`;
      userPrompt = `请分析以下简历：\n\n${content}`;
    } else if (type === 'polish_full') {
      systemPrompt = `你是一位专业的简历优化专家，精通STAR法则。你需要为${config.name}岗位优化简历。

优化原则：
1. 使用STAR法则（Situation情境、Task任务、Action行动、Result结果）重构每段经历
2. 语气专业自信，避免谦虚和模糊表达
3. 量化成果，使用具体数据，可参考这些占位符格式：${config.dataPlaceholders.join('、')}
4. 突出${config.expertStrategy}

返回JSON格式：
{
  "polished": "完整优化后的简历文本",
  "changes": ["主要改动说明列表，3-5条"]
}

只返回JSON，所有回复必须使用中文。`;
      userPrompt = `请优化以下简历：\n\n${content}`;
    } else if (type === 'polish_sentence') {
      let styleInstruction = '';
      let forcedPlaceholders = '';
      
      if (style === 'standard') {
        styleInstruction = '语言简练专业，突出核心能力，避免冗余表达';
      } else if (style === 'data') {
        forcedPlaceholders = config.dataPlaceholders.join('、');
        styleInstruction = `【数据驱动模式】你是一个数据狂魔。用户给你的这句话缺乏说服力。请重写它，并**强制**插入量化数据占位符。
        
必须使用的占位符格式（从中选择1-2个最合适的）：
${forcedPlaceholders}

占位符必须用方括号 [] 包裹，这是强制要求！重写后的句子必须包含至少一个数据占位符。`;
      } else if (style === 'expert') {
        styleInstruction = `【${config.expertModeName}】
${config.expertStrategy}
强调技术深度和行业影响力，体现战略思维和专家视角。使用更高级的专业术语和商业语言。`;
      }

      systemPrompt = `你是一位专业的简历文案专家，针对${config.name}岗位优化简历语句。

${styleInstruction}

返回JSON格式：
{
  "result": "优化后的句子"
}

只返回JSON，所有回复必须使用中文。`;
      userPrompt = `请优化这句话：${content}`;
    } else if (type === 'jd_match') {
      systemPrompt = `你是一位资深招聘专家，擅长分析简历与职位描述的匹配度。请针对${config.name}岗位进行分析。

返回JSON格式：
{
  "match_score": 0-100的匹配度评分,
  "analysis": "100字左右的匹配度分析，指出主要差距和优势",
  "matched_keywords": ["简历中已有的匹配关键词，5-8个"],
  "missing_keywords": ["简历中缺少的重要关键词，5-8个"],
  "suggestions": ["5条具体的简历优化建议，针对这个职位"]
}

只返回JSON，所有回复必须使用中文。`;
      userPrompt = `职位描述：\n${jd}\n\n简历内容：\n${content}`;
    }

    // 使用硅基流动 API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SILICONFLOW_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI 额度已用完，请稍后再试' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI 服务暂时不可用');
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    // Parse JSON from AI response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', aiContent);
      throw new Error('AI 响应解析失败');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Resume AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '未知错误' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
