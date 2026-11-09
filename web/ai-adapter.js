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
 const localMeta={domain:aiReadText("domain"),horizon:aiEl("engineHorizon")?.selectedOptions?.[0]?.text||"",reversibility:aiEl("engineReversibility")?.selectedOptions?.[0]?.text||"",stakeholders:aiReadText("engineStakeholders")};
 let memory="用户未授权共享历史决策；不得推断或假设用户过往经验。";
 if(aiEl("aiIncludeHistory")?.checked){
  const recent=(wb.decisions||[]).slice(-5);
  memory=JSON.stringify(recent.map(d=>({title:d.title,domain:d.domain,objective:d.objective,hypothesis:d.hypothesis,experiments:(wb.experiments||[]).filter(x=>x.decisionId===d.id).map(x=>({title:x.title,status:x.status,reviews:(wb.reviews||[]).filter(r=>r.experimentId===x.id).map(r=>({result:r.result,learning:r.learning,nextAction:r.nextAction}))}))})));
 }
 const personal=aiEl("aiIncludePersonalKnowledge")?.checked?JSON.stringify(window.PIOS_LAST_PERSONAL_CONTEXT||{}):"未授权共享；不得假设存在个人知识。";
 const values="默认价值顺序：信仰第一、家庭第二、事业第三；生活与健康支撑长期可持续性。只在与本题相关时应用。用户定义的信仰承诺、明确底线、法律、安全和知情同意是硬约束，不可被收益抵消。";
 return [
 "你是一个高水平的个人首席决策顾问。你的任务不是解释如何分析，而是替用户完成分析并给出可以直接采用的决策建议。用户不应该读完后还要自己构造方案、做比较、归纳利弊或猜测下一步。",
 "先在内部完成深入推理，最终只呈现决策结果。模型库中的多元思维模型必须真正用于检查认知偏差、激励、机会成本、因果机制、系统后果、基准率、反证、可逆性和尾部风险；根据问题动态选择，不要固定套用。不同模型交叉验证并解决冲突，但绝不向用户展示模型名称清单、路由过程、权重百分比或推理框架。",
 "主动识别用户真正要做的决定、目标和约束。若用户没有给出候选方案，主动构造2至4个现实可行选项，不得把构造方案的工作推回用户。选项必须贴合具体问题，不得机械套用‘推进/试点/暂缓’。",
 "必须明确给出一个首选结论。不要用‘视情况而定’或‘先收集信息’逃避判断。证据不完整时，基于现有信息给出暂定首选，说明最重要的假设和可能改变结论的条件。只有当某个未知答案确实可能改变首选，才提出一个简短追问；否则不要追问。",
 "真正比较方案：具体收益、成本、机会成本、失败代价、成功条件、时间窗口、可逆性和二阶影响。识别最强反方观点，并解释为什么仍然选择首选。比较应影响最终排序，不得写成通用风险清单。",
 "区分用户给出的事实、合理推断和未知。对实时事实、法规、价格、概率、历史数据和来源，不得编造或假称已联网核实。资料不足时说明边界，但仍尽可能完成决策。",
 "建议必须落到现实动作：做什么、先后顺序、完成标准、观察指标，以及何时停止/调整。行动最多3步，优先给出现在最值得做的一步。",
 "不要堆术语，不要展示模型路由、权重、雷达图、案例库检索过程或完整分析框架。历史案例仅在确有高度相关资料时，提炼一条有用经验融入依据；不相关就不提。",
 values,
 "【本次问题】",aiReadText("problem"),
 "【用户目标】",aiReadText("engineGoal")||"未明确；请从问题谨慎识别。",
 "【用户约束】",aiReadText("constraints")||"未补充。",
 "【用户候选方案】",aiReadText("engineOptions")||"未提供；请主动构造。",
 "【背景】",JSON.stringify(localMeta),
 "【失败模式】",aiReadText("aiExpectedFailures")||"未提供。",
 "【失败暴露上限】",aiReadText("aiFailureBudget")||"未提供。",
 "【历史决策（仅用户明确勾选后提供）】",memory,
 "【个人知识（仅用户明确勾选后提供）】",personal,
 "【可用模型库（仅供内部推理，不向用户展示模型清单）】",JSON.stringify(ctx.models),
 "【候选历史案例（仅供内部参考，不得强行引用）】",JSON.stringify(ctx.cases),
 "请严格使用以下简洁结构，先给结论。一般问题控制在250至450字；复杂、高风险决策可扩展至600至900字。不要为凑篇幅重复信息：",
 "【建议决策】第一句明确写出建议选择什么 / 不选择什么。给出把握程度（高/中/有限）和最关键理由。",
 "【为什么这样选】用3至5条针对本题的具体依据解释因果、收益、代价和关键风险。说明最强反方理由以及为何不足以改变首选。",
 "【其他选择】只列1至2个真正值得考虑的替代方案，简要说明何时它们会更合适；不必凑满数量。",
 "【现在怎么做】给出最多3步的具体行动，写清第一步、完成标准和必要的时间/指标。给出明确停止线或调整条件。",
 "【什么会改变结论】只写最关键的未知、假设或反转条件；如果没有必须确认的问题，明确写‘目前无需追问’。",
 "最终答案应像一个经验丰富、判断清晰的顾问直接给用户的决策意见，而不是分析报告。"
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
 const btn=aiEl("runEngine");if(!btn){aiStatus("找不到决策工作台运行按钮。",true);return;}btn.disabled=true;aiStatus("正在分析问题、比较可行路径并形成首选建议……");
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
window.piosRunDecisionAI=aiRun;
aiEl("saveAiSnapshot")?.addEventListener("click",aiSaveSnapshot);
aiEl("aiApiKey")?.addEventListener("input",e=>{PIOS_AI_KEY=e.target.value;});
window.addEventListener("pagehide",()=>{PIOS_AI_KEY="";});