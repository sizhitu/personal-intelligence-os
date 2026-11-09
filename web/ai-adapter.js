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
 const deterministic=aiEl("engineReport")?.innerText||"尚未运行规则引擎。";
 return "请用中文完成一份可审计的决策分析。\n\n【当前问题】\n"+aiReadText("problem")+"\n\n【领域】\n"+aiReadText("domain")+"\n\n【约束】\n"+aiReadText("constraints")+"\n\n【目标】\n"+aiReadText("engineGoal")+"\n\n【候选方案】\n"+aiReadText("engineOptions")+"\n\n【期限/可逆性/利益相关者】\n"+aiReadText("engineHorizon")+" / "+aiReadText("engineReversibility")+" / "+aiReadText("engineStakeholders")+"\n\n【事先识别的失败模式】\n"+aiReadText("aiExpectedFailures")+"\n\n【失败暴露上限】\n"+aiReadText("aiFailureBudget")+"\n\n【规则引擎结果】\n"+deterministic+"\n\n【可用思维模型库】\n"+JSON.stringify(ctx.models)+"\n\n【候选历史案例资料】\n"+JSON.stringify(ctx.cases)+"\n\n请严格遵循：1.先区分用户明确价值/硬约束与普通可权衡因素，硬约束不可被分数抵消；不要替用户解释信仰。2.选择少量最相关模型，说明适用条件和失效边界。3.普通因素权重建议合计100%，权重是启发式提案；证据可信度、因素重要性、方案表现分开。4.列明事实、假设、未知、反证和需要核实的信息。5.引用案例只能使用上面提供的案例ID和source，明确机制相似与关键差异；不得编造案例、出处或数据。6.检查全局优化、二阶效应、外部性、反馈延迟、Goodhart风险及不行动方案。7.建立正反馈和复利机制，但分阶段验证，不因一次成功盲目扩大。8.失败哲学：可预见、可控、事先登记、损失有上限、合规安全且产生信息的实验失败，可以庆祝其学习价值；不可接受伤害、越过安全/法律/伦理红线、隐瞒风险、重复可避免错误、超预算失败绝不能浪漫化。区分智能失败、预防性失败和鲁莽失败。9.给出可检验预测、领先/滞后指标、停止/回滚条件、复盘日期建议。10.不要声称数学上证明全局最优；最终决定由用户作出。\n\n【输出结构】\n一、结论与信心边界\n二、问题重构与硬约束\n三、模型路由及理由\n四、动态因素与权重（合计100%）\n五、方案比较（表现分与证据可信度分开）\n六、历史案例与反例（ID/机制/差异/启示）\n七、全局优化与敏感性\n八、失败预演与可控实验设计\n九、正反馈、复现和分阶段放大条件\n十、行动计划、监控指标、停止条件和复盘问题。";
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
aiEl("aiApiKey")?.addEventListener("blur",()=>{PIOS_AI_KEY="";});
window.addEventListener("pagehide",()=>{PIOS_AI_KEY="";});