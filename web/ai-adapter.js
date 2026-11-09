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
 "方案比较要围绕本问题最重要的3至5个因素，简要说明收益、成本/资源、主要风险、可逆性和适用条件。无需强行给百分制评分；若使用权重，必须说明是启发式估计而非客观测量。不要堆砌思维模型名称。",
 "行动建议最多3步，第一步必须最具体：谁来做什么、何时做、完成标准是什么；如信息不足，先给一个低成本的信息获取动作。写出明确的停止线或回滚条件。专业人士建议必须说明要向哪类专业人士核实哪个具体问题，不能只说“咨询专业人士”。",
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
 "【可用思维模型库】",JSON.stringify(ctx.models),
 "【候选历史案例资料】",JSON.stringify(ctx.cases),
 "请严格按以下格式输出，不要添加开场白或结尾客套话：",
 "【结论】第一句直接写“建议选择：具体方案”。随后用一句话说明把握程度（较高/中等/暂定）及最重要的前提。",
 "【为什么选它】最多3条，每条都要引用本问题中的具体信息或明确标注推断。说明它相对其他方案的优势。",
 "【方案对比】列出2至3个真实选项，每个只写：预期收益｜主要代价/风险｜何时适合。明确指出为什么首选胜出；用户给定的方案必须纳入。",
 "【接下来怎么做】最多3步。每步写清动作、时间/顺序、完成标准；不确定的时间或成本写“需确认”，不可捏造。",
 "【停止线 / 改变建议的条件】写出具体触发条件及触发后采取什么动作。不要只写风险名称。",
 "【唯一待确认问题】只有当一个未知答案确实可能改变首选时才提出；否则写“目前没有必须追问的问题”。一次只问一个问题。",
 "篇幅通常控制在300至500个中文字符；复杂或高风险决策可适当增加，但必须先给结论。不得出现让用户自行补齐候选方案、自己权衡、自己查资料等把核心工作推回用户的表述。"
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
 const btn=aiEl("runAiReasoning");btn.disabled=true;aiStatus("正在整理本地模型库与历史案例，并请求模型……");
 try{
  PIOS_AI_KEY=key;const ctx=await aiLoadContext();const prompt=aiBuildPrompt(ctx);
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+PIOS_AI_KEY},body:JSON.stringify({model:model,temperature:0.2,messages:[{role:"system",content:"你是一个严谨、可解释、重视证据与风险边界的个人决策分析助手。不要编造来源或事实。对未知内容明确标注。"},{"role":"user",content:prompt}]})});
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