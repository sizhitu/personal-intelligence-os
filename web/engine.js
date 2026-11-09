/* Explainable, local-first Model Router and Decision Engine v0.3.
   It is a transparent heuristic, not an LLM, legal/medical advice, or validated predictor. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").toLowerCase().replace(/\s+/g," ");
const terms={
 faith:["信仰","faith","教会","宗教","良知","原则","价值观","承诺"],
 family:["家庭","配偶","夫妻","孩子","父母","照护","婚姻","生育","家人"],
 business:["事业","客户","销售","团队","经营","公司","创业","业务","收入","利润","招聘","市场"],
 life:["健康","学习","成长","生活","时间","休息","习惯","职业","迁移","旅行"],
 investment:["投资","股票","基金","etf","仓位","估值","买入","卖出","资产","现金流","回撤","风险"],
 highRisk:["安全","法律","医疗","健康","手术","药物","重大","不可逆","借款","杠杆","破产","辞职","移民","签约","诉讼"],
 system:["团队","客户","家庭","组织","供应链","平台","流程","多方","利益相关者","长期","规模","生态"],
 uncertainty:["不确定","预测","是否","可能","假设","验证","试验","实验","新产品","新业务","市场"],
 money:["资金","预算","成本","价格","投资","收益","利润","现金","估值","收入"],
 learning:["学习","实验","测试","验证","试点","原型","研发","迭代","失败"]
};
let caseRecords=[];
let latest=null;
const models={
 cognitive:{name:"认知心理学：System 1 / System 2 与偏差检查",why:"识别锚定、确认偏误、过度自信和计划谬误；尤其适合情绪强、时间压力或已有强烈倾向的问题。",factors:["判断偏差与情绪压力","基准率与反证"]},
 munger:{name:"芒格多元思维模型：激励、机会成本与逆向思维",why:"检查激励错位、隐藏成本、替代方案和二阶后果。",factors:["机会成本与激励","长期复利与战略适配"]},
 science:{name:"科学方法 / 贝叶斯：假设、证伪与证据更新",why:"问题含有不确定假设或需要预测时，先明确可观察指标、基准率和反证。",factors:["可验证性与信息价值","因果机制与可验证性"]},
 systems:{name:"控制论 / 系统思维：边界、反馈、延迟与全局优化",why:"决策影响多个利益相关者、多个领域或存在反馈延迟时，检查局部优化和外部性。",factors:["全局影响与利益相关者","反馈、可控性与韧性"]},
 risk:{name:"风险与决策理论：下行、可逆性与期权价值",why:"潜在损失较大、难以撤回或涉及生存风险时，优先保护下行并分阶段承诺。",factors:["下行风险与安全边际","可逆性与选择权"]},
 strategy:{name:"经济与战略：交易成本、竞争优势与代理问题",why:"涉及商业模式、客户、团队、市场或资源配置时，检查单位经济、激励和可持续优势。",factors:["经济可持续性","机会成本与激励"]}
};
const factorCatalog={
 "目标契合度":{base:18,models:["cognitive","systems"],why:"衡量方案对本次明确目标的贡献；用户确认的信仰承诺、法律、安全和其他底线仍是独立门槛，不参与权重抵消。"},
 "下行风险与安全边际":{base:17,models:["risk","munger"],why:"关注最坏情景、损失上限、脆弱性和生存能力。"},
 "可验证性与信息价值":{base:15,models:["science","cognitive"],why:"衡量方案能否产生可观察、可证伪的信息；证据可信度另行标注，不作为重要性权重。"},
 "长期影响与复利":{base:13,models:["munger","systems"],why:"检查短期收益是否损害长期能力、关系、信任或复利。"},
 "可逆性与选择权":{base:11,models:["risk","science"],why:"优先考虑可试点、可分阶段、可撤回的路径。"},
 "全局影响与利益相关者":{base:11,models:["systems"],why:"检查成本转移、二阶影响和不同领域的长期结果。"},
 "可行性与资源匹配":{base:8,models:["munger","strategy"],why:"评估能力、时间、预算、执行容量与机会成本。"},
 "经济可持续性":{base:7,models:["strategy"],why:"检查净收益、现金流、单位经济和激励结构。"}
};
function includesAny(s,arr){return arr.some(x=>s.includes(x));}
function parseDomain(text,selected){
 const t=norm(text),hits=[];
 Object.keys(terms).filter(k=>["faith","family","business","life"].includes(k)).forEach(k=>{if(includesAny(t,terms[k]))hits.push(k);});
 if(hits.length>1)return {label:"跨领域",hits};
 if(hits.length===1)return {label:({faith:"信仰 Faith",family:"家庭 Family",business:"事业 Business",life:"生活 Life"})[hits[0]],hits};
 const map={"信仰 Faith":"faith","家庭 Family":"family","事业 Business":"business","生活 Life":"life"};
 return {label:selected||"跨领域",hits:map[selected]?[map[selected]]:[]};
}
function routeModels(text,domain,rev){
 const t=norm(text),picked=["cognitive","munger"];
 if(includesAny(t,terms.uncertainty)||includesAny(t,terms.learning)||t.includes("是否"))picked.push("science");
 if(includesAny(t,terms.system)||domain.hits.length>1||domain.hits.includes("family")||domain.hits.includes("faith"))picked.push("systems");
 if(includesAny(t,terms.highRisk)||rev==="low"||includesAny(t,terms.money))picked.push("risk");
 if(domain.hits.includes("business")||domain.hits.includes("investment")||includesAny(t,terms.business)||includesAny(t,terms.investment))picked.push("strategy");
 return [...new Set(picked)];
}
function makeFactors(text,domain,rev){
 const t=norm(text),names=Object.keys(factorCatalog),raw={};
 names.forEach(n=>raw[n]=factorCatalog[n].base);
 if(includesAny(t,terms.highRisk)||rev==="low")raw["下行风险与安全边际"]+=15;
 if(includesAny(t,terms.uncertainty)||includesAny(t,terms.learning))raw["可验证性与信息价值"]+=12;
 if(domain.hits.length>1||includesAny(t,terms.system))raw["全局影响与利益相关者"]+=12;
 if(includesAny(t,terms.money)||domain.hits.includes("business"))raw["经济可持续性"]+=8;
 if(rev==="high")raw["可逆性与选择权"]+=10;
 if(rev==="low")raw["可逆性与选择权"]+=8;
 if(domain.hits.includes("faith"))raw["目标契合度"]+=8;
 if(domain.hits.includes("family"))raw["全局影响与利益相关者"]+=8;
 if(domain.hits.includes("business"))raw["长期影响与复利"]+=5;
 const active=names.filter(n=>factorCatalog[n].base>0);
 const total=active.reduce((s,n)=>s+raw[n],0);
 const out=active.map(n=>({name:n,weight:Math.round(raw[n]/total*1000)/10,why:factorCatalog[n].why,models:factorCatalog[n].models}));
 const rounded=out.reduce((s,x)=>s+x.weight,0);out[out.length-1].weight=Math.round((out[out.length-1].weight+100-rounded)*10)/10;return out;
}
function routeExplanation(ids){return ids.map(id=>'<div class="engine-card"><h4>'+esc(models[id].name)+'</h4><p>'+esc(models[id].why)+'</p><div>'+models[id].factors.map(x=>'<span class="engine-tag">'+esc(x)+'</span>').join("")+'</div></div>').join("");}
function getKeywords(s){return norm(s).replace(/[，。！？、；：,.!?;:()（）]/g," ").split(" ").filter(x=>x.length>1);}
function caseScore(c,q,domain){
 const text=norm([c.title,c.question,c.facts,c.models,c.mechanism,c.trigger,c.domain].join(" "));
 const vocabulary=[...new Set(Object.values(terms).flat())];
 let overlap=0;vocabulary.forEach(w=>{if(norm(q).includes(norm(w))&&text.includes(norm(w)))overlap+=2;});
 const qwords=getKeywords(q).filter(x=>x.length>2);qwords.forEach(w=>{if(text.includes(w))overlap+=1;});
 const qDomain=domain.hits[0];
 const d=(c.domain||"").toLowerCase();
 let domainBonus=qDomain&&d===qDomain?5:0;
 if(qDomain==="business"&&c.type==="semiconductor")domainBonus=3;
 return overlap+domainBonus;
}
function renderCases(q,domain){
 const sorted=caseRecords.map(c=>({c,score:caseScore(c,q,domain)})).sort((a,b)=>b.score-a.score);
 const chosen=sorted.filter(x=>x.score>0).slice(0,4);
 if(!chosen.length)return '<p class="engine-muted">当前内置案例库没有足够相关的可核验案例；不强行凑数。可以在后续接入公开案例检索。</p>';
 return '<div class="engine-cases">'+chosen.map(({c,score})=>{
 const actors=(c.actors||[]),actor=actors[0]||{};
 const conclusion=actor.conclusion||c.holder?.decision||"案例记录中暂无决策结论";
 const redteam=actor.redteam||c.holder?.blindspot||c.limits||"需进一步核对边界";
 const source=c.source||"";
 return '<article class="engine-case"><span class="engine-tag">'+esc(c.id||"公开案例")+'</span><h4>'+esc(c.title)+'</h4><p class="engine-muted">'+esc(c.date||"时间未标注")+' · 机制匹配提示 '+score+'</p><p>'+esc(c.facts||c.mechanism||"")+'</p><p><b>历史处理 / 结论：</b>'+esc(conclusion)+'</p><p><b>反面提醒：</b>'+esc(redteam)+'</p><p class="engine-muted">匹配是关键词与领域启发式排序，不是因果相似度证明。'+(c.limits?"边界："+esc(c.limits):"")+'</p>'+(source?'<a href="'+esc(source)+'" target="_blank" rel="noopener">查看来源 ↗</a>':"")+'</article>';
 }).join("")+'</div>';
}
function drawEngineRadar(factors){
 const w=360,h=310,cx=180,cy=145,R=105,n=factors.length;
 const p=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n,r=R*v/100;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
 let out="";
 for(let l=20;l<=100;l+=20){out+='<polygon points="'+factors.map((f,i)=>p(i,l).join(",")).join(" ")+'" fill="none" stroke="#e0e5eb"/>';}
 factors.forEach((f,i)=>{const [x,y]=p(i,100),[tx,ty]=p(i,122);out+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="#e0e5eb"/><text x="'+tx+'" y="'+ty+'" font-size="9" text-anchor="'+(tx<cx-5?"end":tx>cx+5?"start":"middle")+'" fill="#68778a">'+esc(f.name.slice(0,8))+'</text>';});
 const pts=factors.map((f,i)=>p(i,f.weight).join(",")).join(" ");
 out+='<polygon points="'+pts+'" fill="#c6a56a" fill-opacity=".25" stroke="#ad8950" stroke-width="2.5"/>';
 $("engineRadar").innerHTML=out;
}
function buildScoreTable(options,factors){
 const host=$("engineScoring");let html='<p class="engine-muted">先判断方案是否通过硬约束门槛，再按 1–5 分评估普通因素表现。评分是你的判断输入，不是系统事实。证据可信度另行记录。</p>';
 options.forEach((opt,i)=>{
 html+='<div class="engine-card"><h4>'+esc(opt)+'</h4><label class="engine-label">硬约束状态<select class="field" data-gate="'+i+'"><option value="unknown">尚未核实</option><option value="pass">通过</option><option value="fail">不通过 / 触发否决</option></select></label>';
 factors.forEach((f,j)=>{html+='<div class="engine-score"><span>'+esc(f.name)+' <b>'+f.weight+'%</b></span><select data-score="'+i+'" data-factor="'+j+'"><option value="">未评分</option><option value="1">1 · 很弱</option><option value="2">2 · 较弱</option><option value="3">3 · 中等</option><option value="4">4 · 较强</option><option value="5">5 · 很强</option></select><span class="engine-muted">表现分</span></div>';});
 html+='<label class="engine-label">该方案的关键证据 / 假设<textarea class="field" rows="2" data-evidence="'+i+'" placeholder="说明评分依据；没有证据请明确写假设"></textarea></label><label class="engine-label">证据可信度（独立于因素权重与表现分）<select class="field" data-confidence="'+i+'"><option value="unknown">未知 / 尚无证据</option><option value="low">低 · 单一来源或弱推断</option><option value="medium">中 · 多项一致但仍有混杂</option><option value="high">高 · 可核验、多来源或强设计</option></select></label></div>';
 });
 host.innerHTML=html;
 host.querySelectorAll("select[data-score],select[data-gate],select[data-confidence]").forEach(el=>el.addEventListener("change",()=>calculateScores(options,factors)));
}
function calculateScores(options,factors){
 const host=$("engineResults"),rows=[];
 options.forEach((opt,i)=>{
 const gate=$("engineScoring").querySelector('[data-gate="'+i+'"]').value;
 const scores=factors.map((f,j)=>{const el=$("engineScoring").querySelector('[data-score="'+i+'"][data-factor="'+j+'"]');return el.value===""?null:Number(el.value);});
 const evidence=$("engineScoring").querySelector('[data-evidence="'+i+'"]').value;
 const confidence=$("engineScoring").querySelector('[data-confidence="'+i+'"]').value;
 const complete=scores.every(x=>x!==null);
 const score=complete?factors.reduce((s,f,j)=>s+f.weight*scores[j]/5,0):null;
 rows.push({opt,gate,scores,evidence,confidence,complete,score});
 });
 const eligible=rows.filter(r=>r.gate==="pass"&&r.complete).sort((a,b)=>b.score-a.score);
 let conclusion="";
 if(rows.some(r=>r.gate==="fail"))conclusion+='<div class="engine-warning">至少一个方案触发硬约束否决。该方案不得通过其他因素的高分抵消。</div>';
 if(!eligible.length)conclusion+='<div class="engine-warning">尚无同时通过硬约束且完成评分的方案。当前不能给出方案排名；请补充门槛判断和评分。</div>';
 else{
 const winner=eligible[0],runner=eligible[1];
 let sensitivity="当前只有初步评分，需补充证据并进行敏感性检查。";
 if(runner){
 const gap=winner.score-runner.score;
 const flips=factors.filter((f,j)=>{
 const alt=factors.map((x,k)=>x.weight*(k===j?1.2:1));
 const total=alt.reduce((a,b)=>a+b,0);
 const calc=r=>r.scores.reduce((s,v,k)=>s+(v===null?0:v*alt[k]/total/5),0);
 return calc(runner)>calc(winner);
 }).length;
 sensitivity=flips===0?"逐项将因素权重上调或下调 20% 时，领先方案未发生反转（仅是简化敏感性检查）。":"逐项将权重上调或下调 20% 时，有 "+flips+" 个因素可能使排序反转；结论对权重较敏感。";
 conclusion+='<div class="engine-conclusion"><b>在已通过门槛且完成评分的方案中，暂定优先：</b>'+esc(winner.opt)+'（表现加权分 '+winner.score.toFixed(1)+'/100）<br><b>与次优方案差距：</b>'+gap.toFixed(1)+' 分。<br><b>稳健性：</b>'+esc(sensitivity)+'<br><span class="engine-muted">此排序只反映你输入的表现评分和当前权重，不是客观预测或自动替你作出的最终决定。</span></div>';
 }else conclusion+='<div class="engine-conclusion"><b>唯一通过门槛且完成评分的方案：</b>'+esc(winner.opt)+'（'+winner.score.toFixed(1)+'/100）。尚无第二个完整方案用于比较，因此不能称为最优方案。</div>';
 }
 rows.forEach(r=>{conclusion+='<div class="engine-factor"><span>'+esc(r.opt)+' · '+(r.gate==="pass"?"通过门槛":r.gate==="fail"?"门槛否决":"门槛未核实")+'<br><small>证据可信度：'+esc(({unknown:"未知",low:"低",medium:"中",high:"高"})[r.confidence])+'</small></span><strong>'+(r.score===null?"待评分":r.score.toFixed(1)+"/100")+'</strong></div>';});
 host.querySelectorAll("[data-evidence]").forEach((el,i)=>{rows[i].evidence=el.value;});
 host.querySelectorAll("[data-score]").forEach(el=>el.disabled=false);
 host.querySelectorAll("[data-gate]").forEach(el=>el.disabled=false);
 host.dataset.latest=JSON.stringify(rows);
 host.innerHTML=host.innerHTML; // retain controls; output below is separate
 host.parentElement.querySelector("#engineResults").innerHTML=conclusion;
 latest={rows,factors,sensitivity:conclusion};
}
async function loadCases(){
 const base=new URL(".",location.href);
 const urls=["data/cross-domain-cases.json","data/market-cases.json"];
 const all=[];
 for(const u of urls){try{const r=await fetch(new URL(u,base));if(!r.ok)continue;const j=await r.json();all.push(...(j.cases||j.events||[]));}catch(e){console.warn("Case dataset unavailable",u,e);}}
 caseRecords=all;
}

/* Local-first retrieval across the user's own knowledge and decision history. */
let latestPersonalMatches={knowledge:[],models:[],cases:[],history:[],playbooks:[],all:[]};
function personalTerms(text){
 const t=norm(text),out=new Set();
 Object.values(terms).flat().forEach(w=>{const z=norm(w);if(z.length>1&&t.includes(z))out.add(z);});
 (t.match(/[a-z0-9][a-z0-9._-]{1,}/g)||[]).forEach(w=>out.add(w));
 const compact=t.replace(/[\s，。！？、；：,.!?;:()（）【】《》“”"']/g,"");
 for(let i=0;i<compact.length-1;i++){const z=compact.slice(i,i+2);if(/[\u4e00-\u9fff]{2}/.test(z))out.add(z);}
 return [...out].filter(x=>x.length>1);
}
function personalScore(query,record,domain){
 const q=personalTerms(query),text=norm(record.text||"");
 if(!q.length||!text)return {score:0,matched:[]};
 const matched=q.filter(w=>text.includes(w));
 let score=matched.reduce((n,w)=>n+(w.length>3?2:1),0);
 (record.tags||[]).map(norm).forEach(tag=>{if(tag&&norm(query).includes(tag))score+=3;});
 const d=norm(record.domain||"");
 if(domain&&d&&((domain.hits||[]).some(x=>d.includes(x))||d.includes(norm(domain.label))))score+=2;
 return {score,matched:matched.slice(0,5)};
}
function retrievePersonalContext(query,domain,modelIds){
 const allKnowledge=(typeof wb!=="undefined"?(wb.knowledge||[]):[]);
 const knowledge=allKnowledge.filter(x=>x.kind!=="playbook").map(x=>({id:x.id,title:x.title,type:"knowledge",domain:x.domain,source:x.source,content:x.content,tags:x.tags||[],raw:x}));
 const playbookRecords=allKnowledge.filter(x=>x.kind==="playbook"&&["approved","active"].includes(x.status)).map(x=>({id:x.id,title:x.title,type:"playbook",domain:x.domain,source:x.source,content:[x.content,x.contexts,x.necessaryConditions,x.failureModes,x.counterexamples].join(" "),tags:x.tags||[],raw:x}));
 const models=(typeof piosLibrary!=="undefined"?(piosLibrary.models||[]):[]).map(x=>({id:x.id,title:x.name,type:"model",domain:x.family,source:(x.sources||[]).join(" · "),content:[x.summary,...(x.use_when||[]),...(x.avoid_when||[])].join(" "),raw:x}));
 const cases=(caseRecords||[]).map(x=>({id:x.id,title:x.title,type:"case",domain:x.domain,source:x.source,content:[x.facts,x.mechanism,x.question,x.limits].join(" "),raw:x}));
 const history=[];
 if(typeof wb!=="undefined"){
  (wb.decisions||[]).forEach(d=>history.push({id:d.id,title:d.title,type:"decision",domain:d.domain,content:[d.objective,d.constraints,d.hypothesis,d.metrics].join(" "),raw:d}));
  (wb.experiments||[]).forEach(x=>{const d=(wb.decisions||[]).find(y=>y.id===x.decisionId);const r=(wb.reviews||[]).find(y=>y.experimentId===x.id);history.push({id:x.id,title:x.title,type:"experiment",domain:d?.domain,content:[x.hypothesis,x.expected,x.failureModes,x.learning,r?.result,r?.learning,r?.nextStep].join(" "),raw:x,decision:d,review:r});});
 }
 const rank=arr=>arr.map(x=>({...x,...personalScore(query,{text:[x.title,x.content,x.source,x.domain,(x.tags||[]).join(" ")].join(" "),tags:x.tags,domain:x.domain},domain)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const k=rank(knowledge).slice(0,5),p=rank(playbookRecords).slice(0,4),m0=rank(models),c=rank(cases).slice(0,4),h=rank(history).slice(0,4);
 const selectedModels=new Set(modelIds||[]);
 const m=m0.map(x=>({...x,score:x.score+(selectedModels.has(x.id)?2:0)}));
 selectedModels.forEach(id=>{if(!m.some(x=>x.id===id)){const x=models.find(y=>y.id===id);if(x)m.push({...x,score:2,matched:[]});}});
 m.sort((a,b)=>b.score-a.score);m.splice(4);
 latestPersonalMatches={knowledge:k,models:m,cases:c,history:h,playbooks:p,all:[...k,...p,...m,...c]};
 window.PIOS_LAST_PERSONAL_CONTEXT={
  knowledge:k.map(x=>({id:x.id,title:x.title,domain:x.domain,source:x.source,content:String(x.content||"").slice(0,900),tags:x.tags,matched:x.matched})),
  models:m.map(x=>({id:x.id,title:x.title,domain:x.domain,summary:String(x.content||"").slice(0,700),matched:x.matched})),
  cases:c.map(x=>({id:x.id,title:x.title,domain:x.domain,source:x.source,mechanism:String(x.content||"").slice(0,700),matched:x.matched})),
  playbooks:p.map(x=>({id:x.id,title:x.title,domain:x.domain,source:x.source,content:String(x.content||"").slice(0,900),evidenceLevel:x.raw.evidenceLevel,replicationCount:x.raw.replicationCount,status:x.raw.status,matched:x.matched})),
  history:h.map(x=>({id:x.id,title:x.title,type:x.type,domain:x.domain,content:String(x.content||"").slice(0,700),matched:x.matched}))
 };
 return latestPersonalMatches;
}
function renderPersonalContext(query,domain,modelIds){
 const found=retrievePersonalContext(query,domain,modelIds),label={knowledge:"个人知识",playbook:"已批准方法",model:"思维模型",case:"历史案例",decision:"历史决策",experiment:"实验 / 复盘"};
 let html='<section class="engine-personal-context"><div class="eyebrow">YOUR KNOWLEDGE · LOCAL RETRIEVAL</div><h3>六、从你的知识与历史中检索</h3><p class="engine-muted">只检索当前浏览器本地记录和已加载的仓库资源。按关键词、标签、领域及模型路由进行启发式排序；匹配表示可供复核，不代表因果关系或结论正确。</p>';
 const block=(title,arr)=>'<div class="personal-match-group"><b>'+title+'（'+arr.length+'）</b>'+(arr.length?arr.map(x=>'<article class="personal-match"><div class="engine-tag">'+(label[x.type]||x.type)+' · '+esc(x.id)+'</div><h4>'+esc(x.title)+'</h4><p>'+esc(String(x.content||"").slice(0,260))+'</p><small>匹配词：'+esc((x.matched||[]).join("、")||"模型路由相关")+(x.source?' · 来源：'+esc(x.source):"")+'</small></article>').join(""):'<p class="engine-muted">没有找到达到匹配阈值的记录。</p>')+'</div>';
 html+=block("个人知识",found.knowledge)+block("已批准 / 启用的方法论",found.playbooks)+block("思维模型",found.models)+block("历史案例",found.cases)+block("历史决策 / 实验",found.history);
 const draftCount=(typeof wb!=="undefined"?(wb.knowledge||[]).filter(x=>x.kind==="playbook"&&!["approved","active"].includes(x.status)).length:0);if(draftCount)html+='<p class="engine-muted">另有 '+draftCount+' 条候选 / 未采用方法论未参与本次推荐；可在资源中心「方法库」中审核。</p>';
 html+='<div class="personal-link-box"><b>把本次检索结果沉淀到一条决策</b><p class="engine-muted">选择已登记的决策，明确保存本次实际参考的知识、模型和案例。不会自动改写旧决策的结论。</p>';
 const decisions=(typeof wb!=="undefined"?(wb.decisions||[]):[]);
 html+=decisions.length?'<div class="personal-link-row"><select id="personalContextDecision" class="field"><option value="">选择决策记录……</option>'+decisions.slice().reverse().map(d=>'<option value="'+esc(d.id)+'">'+esc(d.title)+'</option>').join("")+'</select><button type="button" class="primary" id="personalContextAttach">保存引用关系</button></div>':'<p class="engine-muted">当前还没有决策记录。请先登记一条决策，再回来建立引用。</p>';
 html+='<span class="engine-muted" id="personalContextStatus"></span></div><p class="engine-small">匹配规则：显式标签 / 领域 / 关键词 / 当前模型路由；没有匹配时不强行推荐。历史资料只作为待核对的经验，不自动当作事实证据。</p></section>';
 return html;
}
function attachPersonalContext(){
 const select=$("personalContextDecision"),status=$("personalContextStatus"),id=select?.value;
 if(!id){if(status)status.textContent="请先选择一条决策。";return;}
 const d=(wb.decisions||[]).find(x=>x.id===id);if(!d)return;
 d.resources=Array.isArray(d.resources)?d.resources:[];
 let added=0;
 latestPersonalMatches.all.forEach(x=>{
  if(!d.resources.some(r=>r.id===x.id)){d.resources.push({id:x.id,title:x.title,type:x.type});added++;}
  if((x.type==="knowledge"||x.type==="playbook")&&x.raw){x.raw.linkedDecisions=Array.isArray(x.raw.linkedDecisions)?x.raw.linkedDecisions:[];if(!x.raw.linkedDecisions.includes(id))x.raw.linkedDecisions.push(id);}
 });
 if(wbSave()){if(status)status.textContent="已保存 "+added+" 条新引用关系；可在关系图谱和决策历史中追溯。";if(typeof piosGraphRender==="function")piosGraphRender();}
}

function run(){
 const problem=$("problem").value.trim(),constraints=$("constraints").value.trim(),goal=$("engineGoal").value.trim();
 const optionText=$("engineOptions").value.trim(),stakeholders=$("engineStakeholders").value.trim();
 const rev=$("engineReversibility").value;
 if(!problem){$("engineStatus").textContent="请先描述决策问题。";return;}
 const combined=[problem,goal,constraints,optionText,stakeholders].join(" ");
 const domain=parseDomain(combined,$("domain").value);
 const ids=routeModels(combined,domain,rev);
 const factors=makeFactors(combined,domain,rev);
 factorNames.splice(0,factorNames.length,...factors.map(f=>f.name));
 factorWeights.splice(0,factorWeights.length,...factors.map(f=>f.weight));
 if(typeof initRadar==="function")initRadar();
 const high=includesAny(norm(combined),terms.highRisk)||rev==="low";
 const gates=["用户明确的信仰承诺与其他不可妥协事项","法律与监管要求","人身安全、健康与知情同意","家庭责任及关键利益相关者的重大影响"];
 const opts=optionText.split(/\n/).map(x=>x.trim()).filter(Boolean).slice(0,6);
 const report=$("engineReport");report.style.display="block";
 const horizonLabel=$("engineHorizon").selectedOptions[0].text;
 const reversibilityLabel=$("engineReversibility").selectedOptions[0].text;
 const actionOptions=opts.length?opts:["方案 A：按原计划一次性推进","方案 B：先做小规模/分阶段推进","方案 C：暂缓或不行动"];
 const missingParts=[];
 if(!goal)missingParts.push("尚未明确这次决策要实现的首要结果");
 if(!opts.length)missingParts.push("尚未提供具体候选方案");
 if(!constraints)missingParts.push("尚未提供明确约束");
 const canCompare=!!goal&&opts.length>=2;
 const directRecommendation=canCompare
  ?"本地规则只能完成结构检查，不能可靠估算这些方案的收益概率或真实代价；当前不伪造胜出方案。请以 AI 深度分析或补充可核验数据完成实质比较。"
  :!goal
   ?"现在最重要的不是先设资金或关系边界，而是确定这次决策究竟要换来什么结果；目标不清时，任何方案排序都没有意义。"
   :"目前只有结构性风险提示，候选方案不足以支持可靠排序；先围绕已写明的目标补齐可比较路径。";
 const nextAction=!goal
  ?"请用一句话回答：如果这次决策最终成功，你最希望现实中发生哪一个具体变化？"
  :!opts.length
   ?"围绕目标“"+goal+"”，先生成三条路径：完整推进、低成本试点、暂缓/不行动；比较时写明每条路径的实际投入与预期结果。"
   :!constraints
    ?"只补充会改变选择的硬约束：最多可承受的损失、不可违反的底线；与本决策无关的边界不必填写。"
    :"本地引擎无法验证方案优劣；下一步应为每个候选方案补一条最关键的可核验证据，而不是继续填写通用风险清单。";
 const missing=missingParts.join("；");
 let html='<div class="engine-report"><div class="eyebrow">DECISION CHECK · LOCAL</div><h2>决策准备情况</h2><div class="engine-conclusion"><b>问题：</b>'+esc(problem)+'<br>'+(goal?'<b>目标：</b>'+esc(goal)+'<br>':'')+'<b>当前状态：</b>本地引擎已完成问题结构与硬约束初筛；真正的方案判断、利弊比较和首选建议由可选 AI 分析完成。<br><span class="engine-muted">期限：'+esc(horizonLabel)+' · 可逆性：'+esc(reversibilityLabel)+'</span></div><div class="engine-card"><h3>已识别的决策要素</h3><p>'+esc(actionOptions.join("；"))+'</p>'+(missing?'<p class="engine-muted">尚缺：'+esc(missing)+'。AI 分析会先基于现有信息给出暂定建议，只在缺失信息可能改变结论时追问。</p>':'')+'<p class="engine-muted">这不是最终建议，也不会用固定模板替你决定。点击下方“生成决策建议”，让 AI 完成方案构造、核心因素比较和行动建议。</p></div></div>';
 report.innerHTML=html;
 const attach=$("personalContextAttach");if(attach)attach.addEventListener("click",attachPersonalContext);
 if(opts.length){buildScoreTable(opts,factors);drawEngineRadar(factors);}
 $("engineStatus").textContent="问题结构已整理。生成决策建议以获得具体首选方案与行动步骤。";
 report.scrollIntoView({behavior:"smooth",block:"start"});
}
function bind(){const btn=$("runEngine");if(btn)btn.addEventListener("click",run);const analyze=$("analyze");if(analyze)analyze.addEventListener("click",()=>setTimeout(()=>{if($("problem").value.trim())run();},0));}
document.addEventListener("DOMContentLoaded",async()=>{await loadCases();bind();});
})();
