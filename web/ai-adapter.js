"use strict";
/* Optional, user-controlled AI adapter. API credentials are held only in this page memory. */
let PIOS_AI_KEY = "";
let PIOS_LAST_AI_REPORT = null;
function aiEl(id){return document.getElementById(id);}
function aiEscape(s){return String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}
function aiStatus(msg,isError){const el=aiEl("aiStatus");if(el){el.textContent=msg;el.style.color=isError?"#b45309":"";}}
function aiReadText(id){return (aiEl(id)?.value||"").trim();}
async function aiLoadContext(){
 const [models,cross,market]=await Promise.all([fetch("data/model-library.json").then(r=>{if(!r.ok)throw new Error("模型库读取失败");return r.json();}),fetch("data/cross-domain-cases.json").then(r=>r.ok?r.json():{cases:[]}),fetch("data/market-cases.json").then(r=>r.ok?r.json():{events:[]})]);
 const domain=aiReadText("domain");const q=(aiReadText("problem")+" "+aiReadText("engineGoal")).toLowerCase();
 const domainMap={"信仰 Faith":"faith","家庭 Family":"family","事业 Business":"business","生活 Life":"life"};const d=domainMap[domain];
 let cases=(cross.cases||[]).filter(x=>!d||x.domain===d);
 if(!cases.length)cases=(cross.cases||[]);
 const marketTerms=["stock","market","invest","美股","股票","投资","估值","半导体","etf"];
 if(marketTerms.some(w=>q.includes(w)))cases=cases.concat((market.events||[]).slice(0,8));
 return {models:models.models||[],cases:cases.slice(0,8),modelVersion:models.dataset_version||"unknown"};
}
function aiBuildPrompt(ctx){
 const localMeta={
  domain:aiReadText("domain"),
  horizon:aiEl("engineHorizon")?.selectedOptions?.[0]?.text||"",
  reversibility:aiEl("engineReversibility")?.selectedOptions?.[0]?.text||"",
  stakeholders:aiReadText("engineStakeholders")
 };
 let memory="用户未授权共享历史决策；不得推断或假设用户过往经验。";
 if(aiEl("aiIncludeHistory")?.checked){
  const recent=(wb.decisions||[]).slice(-5);
  const summary=recent.map(d=>{
   const experiments=(wb.experiments||[]).filter(x=>x.decisionId===d.id).map(x=>{
    const reviews=(wb.reviews||[]).filter(r=>r.experimentId===x.id).map(r=>({classification:r.classification,result:r.result,attribution:r.attribution,learning:r.learning,nextAction:r.nextAction}));
    return {title:x.title,hypothesis:x.hypothesis,expected:x.expected,failureModes:x.failureModes,status:x.status,reviews:reviews};
   });
   return {id:d.id,title:d.title,domain:d.domain,objective:d.objective,hypothesis:d.hypothesis,metrics:d.metrics,reviewDate:d.reviewDate,experiments:experiments};
  });
  memory=JSON.stringify(summary);
 }
 const values="默认价值顺序：信仰第一、家庭第二、事业第三；生活与健康支撑长期可持续性。仅在与本次问题相关时应用。信仰承诺由用户定义，不得替用户解释。明确底线、法律、安全和知情同意属于硬约束，不能用收益抵消。";
 return [
 "你的工作不是写一篇分析报告，而是替用户完成决策工作：理解问题、主动构造可行选项、比较利弊、选择首选，并把决定转成下一步行动。衡量标准是用户读完后能否在几十秒内知道该选什么、为什么、接下来做什么。",
 "输出必须具体、直白、结论先行。禁止用“核实关键事实、权衡利弊、考虑长期影响、持续复盘、明确风险边界”等通用套话代替分析。每个建议必须绑定本问题中的具体对象、动作、判断标准或时间；没有依据的金额、概率、期限、事实不得编造。",
 "先判断问题究竟要做什么决定。用户没有提供候选方案时，你要主动提出2至3条现实路径，包括至少一个低风险/分阶段方案和“不行动/暂缓”对照；不要要求用户先自己想方案。用户已有方案时，逐一比较，不要忽略用户提出的选项。",
 "必须明确推荐一个首选。若证据不足，不要用空泛的“暂停”逃避判断：给出当前最合理的暂定选择，并说明缺少哪一条信息会改变结论。除非确实无法安全判断，否则不要把问题退回给用户。",
 "区分用户明确提供的事实、你的推断、关键假设和未知。对未知说明它为什么重要，以及最低成本的验证办法。没有实时检索能力时，不得声称已经核实外部事实、现行法规、价格或来源。",
 "先在内部完成一轮真正的决策推演，再写答案：①把用户问题改写成一个明确的选择命题；②识别真正的目标、硬约束、机会成本和时间窗口；③主动构造现实可执行的替代路径，不要把‘一次性推进/分阶段/不行动’机械套用于所有领域；④用因果链解释每条路径如何产生结果，找出最脆弱的关键假设；⑤进行基准率/历史类比检查，但只在资料支持时使用；⑥比较上行收益、下行损失、成功条件、失败代价、可逆性、资源占用和延迟成本；⑦站在反方角度提出最强反对意见，检查是否存在更优替代；⑧判断哪条未知信息最可能改变排序，并设计最低成本验证；⑨最后选出首选，并说明为什么它胜过次优方案。不要把模型名称当分析内容。", 
 "【核心多元思维模型必须真正参与推理】你必须先从下方模型库中动态选出3至5个最适合本题的模型，不能每次固定选择同一组。选择依据是问题机制，而不是模型知名度。至少覆盖不同视角（例如认知偏差、激励/机会成本、科学证伪/贝叶斯、系统反馈、风险/期权、战略竞争等），但只选真正有用的模型。",
 "对每个入选模型，必须执行其模型库中的具体 diagnostics 问题，并检查 avoid_when 与 failure_modes，防止误用。每个模型必须产出：①它揭示了本题哪一个容易忽略的机制；②它对各候选方案产生什么判断；③它指出什么证据或条件会推翻该判断。只写模型名称或复述 summary 视为没有使用模型。",
 "模型之间必须进行交叉检验：指出哪些模型结论相互支持，哪些发生冲突；解释冲突来自时间尺度、目标函数、证据质量还是风险偏好。不得把所有模型意见简单平均。必须判断哪些模型在本题中更有解释力、哪些模型的适用边界已触发，并给出取舍理由。",
 "综合层必须把模型输出整合成一条决策逻辑：硬约束先否决；再判断目标和关键因果机制；再比较收益/代价/机会成本/尾部风险；最后根据证据强度、可逆性和信息价值选择行动。模型权重不是固定百分比，不得机械平均或制造精确分数。",

 "方案比较要围绕本问题最重要的3至5个因素，明确给出各方案的相对优势/劣势和排序依据。能合理量化时给区间、情景或盈亏平衡条件；不能量化时说明缺少什么数据，绝不编造数字。必须讨论机会成本、二阶后果、失败后的损失与退出路径。无需强行给百分制评分；若使用权重，必须说明是启发式估计而非客观测量。不要堆砌思维模型名称。",
 "行动建议最多3步，必须把首选方案变成执行设计：第一步的具体动作、负责人、时间顺序、所需资源和完成标准；若首选是试点，写清试点范围、观察指标、继续/停止阈值；若首选是等待，写清等待期间要收集的信号、截止日期和届时如何决策。停止线必须可观察、可触发、可执行。", 
 "禁止默认把资金上限和关系影响当作所有问题的关键因素。只分析与本题直接相关的约束；例如职业选择看技能迁移、收入差额和职业资本，投资看估值/现金流/下行与组合暴露，家庭选择看成员福祉与长期责任，健康问题看证据质量与医疗风险。",
 "如本次问题与价值排序有关，使用以下默认顺序但允许用户本次明确指示覆盖：信仰第一、家庭第二、事业第三；生活与健康支撑长期可持续性。"+values,
 "历史案例只能使用提供资料中的案例ID和来源，说明相似机制与关键差异；资料不支持时明确说没有足够匹配案例，不要为了满足格式硬凑。",
 "【本次决策问题】",aiReadText("problem"),
 "【用户目标】",aiReadText("engineGoal")||"未明确；请从问题中谨慎识别，不确定时标注。",
 "【用户约束】",aiReadText("constraints")||"未补充。",
 "【用户提供的候选方案】",aiReadText("engineOptions")||"未提供；请主动构造现实选项。",
 "【决策背景】",JSON.stringify(localMeta),
 "【事先识别的失败模式】",aiReadText("aiExpectedFailures")||"未提供。",
 "【失败暴露上限】",aiReadText("aiFailureBudget")||"未提供。",
 "【历史决策与复盘（仅用户勾选后提供）】",memory,
 "【个人知识（仅用户勾选后提供）】",aiEl("aiIncludePersonalKnowledge")?.checked?JSON.stringify(window.PIOS_LAST_PERSONAL_CONTEXT||{}):"未授权共享；不得假设存在个人知识。",
 "【可用思维模型库（包含适用场景、诊断问题、误用边界与失败模式；必须从中选择并实际执行）】",JSON.stringify(ctx.models),
 "【候选历史案例资料】",JSON.stringify(ctx.cases),
 "请严格按以下格式输出，不要添加开场白或结尾客套话。首屏结论优先，模型推演紧随其后；复杂决策允许800至1200字，不要为了短而省略真正的推理：",
 "【结论】第一句直接写“建议选择：具体方案”。标注把握程度、关键前提和当前排序（首选/次选/不建议）。",
 "【本题调用的核心模型】列出实际选中的3至5个模型及选择原因；必须来自模型库，说明各自负责解决本题哪类问题。",
 "【模型逐项推演】逐个模型给出：本题关键洞察、对方案的具体判断、模型指出的反证/失效边界。必须针对用户问题，禁止只解释理论。",
 "【模型交叉验证与冲突处理】说明哪些结论相互印证、哪些冲突、为什么冲突，以及最终为何采纳某些模型而降低另一些模型的权重。明确不能简单平均。",
 "【综合决策】把模型洞察整合成完整因果链，给出方案排序；说明首选相对次选的关键优势、牺牲了什么、最大反方理由，以及什么证据会改变排序。",
 "【方案对比】列出2至3个真实选项，比较预期收益、主要代价/风险、机会成本、可逆性和适用条件。用户给定方案必须纳入。",
 "【执行设计】最多3步。每步写清动作、顺序/时间、资源和完成标准；试点要写范围、观察指标与继续/停止阈值；等待要写观察信号和截止日期。",
 "【停止线 / 改变建议的条件】写出可观察触发条件和触发后的动作。",
 "【唯一待确认问题】只有当一个未知答案确实可能改变首选时才提出；否则写“目前没有必须追问的问题”。",
 "历史案例仅在资料支持时使用，并解释机制相似点和关键差异。无匹配案例就明确说明，不得编造。",
 "不得把模型名称当装饰，不得只罗列模型，不得给所有模型同等权重，不得强行凑模型数量；若模型库中没有合适模型，明确说明。不得把核心分析工作推回用户。"
 ].join("\n");
}
async function aiRun(){
 const key=aiReadText("aiApiKey");const endpoint=aiReadText("aiEndpoint");const model=aiReadText("aiModel");
 if(!key){aiStatus("请填写 API Key。",true);return;}
 if(!model){aiStatus("请填写模型 ID。",true);return;}
 if(!aiEl("aiConsent").checked){aiStatus("请先确认数据发送授权。",true);return;}
 let url;try{url=new URL(endpoint);}catch(e){aiStatus("Endpoint 不是有效 URL。",true);return;}
 if(url.protocol!=="https:"){aiStatus("为保护传输安全，仅允许 HTTPS Endpoint。",true);return;}
 if(!url.pathname.endsWith("/chat/completions")){aiStatus("当前适配器要求 OpenAI 兼容的 /chat/completions Endpoint。",true);return;}
 if(aiEl("engineReport")?.style.display==="none"||!aiEl("engineReport")?.innerText.trim()){aiEl("runEngine")?.click();}
 const btn=aiEl("runAiReasoning");btn.disabled=true;aiStatus("正在路由核心思维模型，逐项推演并进行交叉验证……");
 try{
  PIOS_AI_KEY=key;const ctx=await aiLoadContext();const prompt=aiBuildPrompt(ctx);
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+PIOS_AI_KEY},body:JSON.stringify({model:model,temperature:0.2,messages:[{role:"system",content:"你是个人决策系统的首席决策分析师。你必须独立完成目标识别、替代方案构造、因果分析、反方检验、机会成本比较和首选决策。不要把通用风险清单当作分析，不要默认所有问题都要谈钱和关系。结论必须有问题专属依据、清晰排序和可执行动作。宁可指出真正缺失的一项决定性信息，也不要用空泛建议填充篇幅。绝不编造事实、概率、数字或来源。"},{"role":"user",content:prompt}]})});
  const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error((payload.error&&payload.error.message)||("API 请求失败："+response.status));
  const content=payload.choices?.[0]?.message?.content;if(!content)throw new Error("服务商响应中没有 choices[0].message.content；请确认接口兼容 Chat Completions。");
  PIOS_LAST_AI_REPORT={content:content,model:model,endpointHost:url.host,provider:"OpenAI-compatible",generatedAt:new Date().toISOString(),modelLibraryVersion:ctx.modelVersion,caseIds:ctx.cases.map(x=>x.id),question:aiReadText("problem"),domain:aiReadText("domain")};
  aiEl("aiOutput").textContent=content;aiEl("aiOutputWrap").style.display="block";aiStatus("分析完成。请核对事实、案例来源和约束；API Key 仅保留在当前页面内存。");
 }catch(e){aiStatus("调用失败："+e.message+"。部分服务商可能不允许浏览器跨域请求（CORS），或要求不同接口格式。",true);}finally{PIOS_AI_KEY="";const secret=aiEl("aiApiKey");if(secret)secret.value="";btn.disabled=false;}
}
function aiSaveSnapshot(){
 if(!PIOS_LAST_AI_REPORT){aiEl("aiSaveStatus").textContent="当前没有可保存的 AI 分析。";return;}
 const id=aiReadText("aiSaveDecision");if(!id){aiEl("aiSaveStatus").textContent="请先选择一条已登记决策。";return;}
 const decision=wb.decisions.find(x=>x.id===id);if(!decision){aiEl("aiSaveStatus").textContent="找不到这条决策，请刷新选择。";return;}
 if(!Array.isArray(decision.aiSnapshots))decision.aiSnapshots=[];
 decision.aiSnapshots.push({...PIOS_LAST_AI_REPORT,expectedFailures:aiReadText("aiExpectedFailures"),failureBudget:aiReadText("aiFailureBudget")});
 if(wbSave())aiEl("aiSaveStatus").textContent="已保存到决策记录。API Key 未保存；可在记录库导出 JSON 备份。";
}
aiEl("runAiReasoning")?.addEventListener("click",aiRun);
aiEl("saveAiSnapshot")?.addEventListener("click",aiSaveSnapshot);
aiEl("aiApiKey")?.addEventListener("input",e=>{PIOS_AI_KEY=e.target.value;});
window.addEventListener("pagehide",()=>{PIOS_AI_KEY="";});