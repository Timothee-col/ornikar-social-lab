import { useState, useMemo } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import _ from "lodash";

const THUMBS = {};
const LOGO_SRC = `${import.meta.env.BASE_URL}ornikar-logo.png`;

const PK = {"7":"7","15":"15","30":"30","90":"90","999":"all"};
const PRESETS = [{l:"7J",d:7},{l:"15J",d:15},{l:"30J",d:30},{l:"90J",d:90},{l:"Tout",d:999}];

// Build period ranges dynamically anchored on TODAY
const addDays = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
function buildRanges(today, earliest) {
  return {
    "7":   [addDays(today, -6),  today],
    "15":  [addDays(today, -14), today],
    "30":  [addDays(today, -29), today],
    "90":  [addDays(today, -89), today],
    "all": [earliest || addDays(today, -180), today],
  };
}
function buildPrevRanges(today) {
  return {
    "7":  [addDays(today, -13), addDays(today, -7)],
    "15": [addDays(today, -29), addDays(today, -15)],
    "30": [addDays(today, -59), addDays(today, -30)],
  };
}
const shortFR = s => { if (!s) return ""; const [, m, d] = s.split("-"); return `${d}/${m}`; };

// ── FORMATTERS ──
const fN  = n => { if(n==null) return "–"; if(n>=1e6) return (n/1e6).toFixed(1)+"M"; if(n>=1e3) return (n/1e3).toFixed(1)+"k"; return Math.round(n).toLocaleString("fr-FR"); };
const fE  = n => n==null?"–":Math.round(n).toLocaleString("fr-FR")+" €";
const fP  = n => !n?"–":(n*100).toFixed(1)+"%";
const fP2 = n => n==null?"–":(n*100).toFixed(2)+"%";
const fC1 = n => !n?"–":n.toFixed(1)+" €";
const fDt = s => { if(!s)return""; const d=new Date(s); return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}); };

const prodTag = p => p==="Theory"?{bg:"#eef2ff",c:"#6366f1"}:p==="Driving"?{bg:"#ecfdf5",c:"#10b981"}:{bg:"#f5f5f5",c:"#999"};

function quantiles(arr){ const s=[...arr].filter(x=>x>0).sort((a,b)=>a-b); if(!s.length)return[0,0]; return[s[Math.floor(s.length*.25)]||0,s[Math.floor(s.length*.75)]||0]; }
function mfc(v,q25,q75,higher){ if(!v)return{}; if(higher){if(v>=q75)return{background:"#dcfce7",color:"#15803d"};if(v<=q25)return{background:"#fee2e2",color:"#b91c1c"};return{background:"#fef9c3",color:"#a16207"};} if(v<=q25)return{background:"#dcfce7",color:"#15803d"};if(v>=q75)return{background:"#fee2e2",color:"#b91c1c"};return{background:"#fef9c3",color:"#a16207"}; }
function ageC(d){ if(d<7)return{bg:"#dcfce7",c:"#15803d"};if(d<=30)return{bg:"#fef9c3",c:"#a16207"};return{bg:"#fee2e2",c:"#b91c1c"}; }

const aggArr = arrs => { const r=[0,0,0,0,0,0]; arrs.forEach(a=>{for(let i=0;i<6;i++)r[i]+=a[i];}); return r; };
const metrics = ([im,ct,cl,v2,ins,su]) => ({
  im,ct,cl,v2,ins,su,
  hr:im>0?v2/im:0, ctr:im>0?cl/im:0, ci:cl>0?ins/cl:0, cs:ins>0?su/ins:0,
  cpa:su>0?ct/su:0, cpm:im>0?ct/im*1000:0, cpc:cl>0?ct/cl:0,
});

// ── KPI CARD ──
function KPI({ label, mainStr, mainRaw, prevStr, prevRaw, prevLabel, inverse, children }) {
  const delta = prevRaw>0&&mainRaw>0 ? (mainRaw-prevRaw)/prevRaw : null;
  const good  = delta!==null ? (inverse?delta<0:delta>0) : null;
  return (
    <div style={{background:"#fff",borderRadius:12,padding:"13px 15px",border:"1px solid #e8e8e8",minWidth:0}}>
      <div style={{fontSize:9.5,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:"#111",fontVariantNumeric:"tabular-nums",lineHeight:1.1}}>
        {children || mainStr}
      </div>
      {delta!==null && (
        <div style={{marginTop:5,fontSize:9.5,color:"#bbb",lineHeight:1.4}}>
          <span>{prevLabel}: </span>
          <span style={{fontWeight:700,color:"#999"}}>{prevStr}</span>
          <span style={{marginLeft:6,fontWeight:700,fontSize:10,color:good?"#16a34a":"#dc2626"}}>
            {delta>0?"+":""}{(delta*100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ── RANKING BLOCK ──
function Rank({ title, dim, data, metric, mLabel, mFmt, higher, color, bigAssets }) {
  const g={};
  data.forEach(d=>{
    const k=(d[dim]||"N/A")==="N/A"?"Non classé":d[dim];
    if(!g[k])g[k]={l:k,c:0,s:0,items:[]};
    g[k].items.push(d); g[k].c+=d._ct; g[k].s+=d._su;
  });
  const ranked=Object.values(g).map(x=>{
    const v=metric==="cpa"?(x.s>0?x.c/x.s:999):metric==="ct"?x.c:metric==="su"?x.s
      :x.items.reduce((a,d)=>a+(d["_"+metric]||0),0)/x.items.length;
    return{...x,v};
  }).sort((a,b)=>higher?b.v-a.v:a.v-b.v);
  const maxV=Math.max(...ranked.map(r=>r.v),1);
  const medals=["🥇","🥈","🥉"];
  return (
    <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #e5e5e5",minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#aaa",fontWeight:700}}>{title}</span>
        <span style={{fontSize:9,color,fontWeight:700,textTransform:"uppercase"}}>{mLabel}</span>
      </div>
      {ranked.slice(0,5).map((r,i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
            <div>
              <span style={{fontSize:11,fontWeight:600,color:"#333"}}>{medals[i]||""} {r.l}</span>
              {bigAssets&&<span style={{fontSize:12,fontWeight:700,color:"#888",marginLeft:8}}>{r.items.length} assets</span>}
            </div>
            <span style={{fontSize:11,fontWeight:700,color,fontVariantNumeric:"tabular-nums"}}>{mFmt(r.v)}</span>
          </div>
          <div style={{height:3,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:Math.max(r.v/maxV*100,2)+"%",height:"100%",background:color,opacity:.45,borderRadius:2}}/>
          </div>
          {!bigAssets&&<div style={{fontSize:8.5,color:"#ccc",marginTop:1}}>{fE(r.c)} · {fN(r.s)} SU · {r.items.length} créas</div>}
          {bigAssets&&<div style={{fontSize:8.5,color:"#ccc",marginTop:1}}>{fE(r.c)} · {fN(r.s)} SU</div>}
        </div>
      ))}
    </div>
  );
}

// ── PRODUCT SPLIT BAR ──
function ProdSplit({ data, metric, fmt, label }) {
  const g={};let tot=0;
  data.forEach(d=>{const p=d.p==="N/A"?"Non classé":d.p;if(!g[p])g[p]=0;g[p]+=(d["_"+metric]||0);tot+=(d["_"+metric]||0);});
  const cols={Driving:"#10b981",Theory:"#6366f1","Non classé":"#d1d5db"};
  const items=Object.entries(g).sort((a,b)=>b[1]-a[1]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <span style={{fontSize:9,color:"#bbb",fontWeight:700,textTransform:"uppercase",minWidth:36}}>{label}</span>
      <div style={{flex:1,display:"flex",height:6,borderRadius:3,overflow:"hidden",background:"#f0f0f0"}}>
        {items.map(([p,v],i)=><div key={i} style={{width:(v/Math.max(tot,1)*100)+"%",background:cols[p]||"#ccc",minWidth:v>0?2:0}}/>)}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {items.map(([p,v],i)=>(
          <span key={i} style={{fontSize:9.5,color:cols[p]||"#999",fontWeight:600,whiteSpace:"nowrap"}}>
            {p}: {fmt(v)}{tot>0?` (${(v/tot*100).toFixed(0)}%)`:""}</span>
        ))}
      </div>
    </div>
  );
}

// ── TOP ADS GRID ──
function TopAdsGrid({ ads, cpaQ, hrQ, csQ }) {
  const top = [...ads].filter(a=>a._ct>0).sort((a,b)=>b._ct-a._ct).slice(0,4);
  return (
    <div style={{marginBottom:22}}>
      <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 10px"}}>Top Ads</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        {top.map((a,i)=>{
          const name = a.v ? `${a.r!=="N/A"?a.r+" – ":""}${a.v}` : a.ad.slice(0,30);
          const pt   = prodTag(a.p);
          const thumb= a.thumb ? THUMBS[a.thumb] : null;
          const spendMx = Math.max(...top.map(x=>x._ct),1);
          const cpaCx  = mfc(a._cpa, cpaQ[0], cpaQ[1], false);
          const hrCx   = mfc(a._hr,  hrQ[0],  hrQ[1],  true);
          const csCx   = mfc(a._cs,  csQ[0],  csQ[1],  true);
          return (
            <div key={i} style={{background:"#fff",borderRadius:14,border:"1px solid #ebebeb",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{position:"relative",height:220,overflow:"hidden",background:"#1a1a2e",flexShrink:0}}>
                {a.url ? (
                  <video src={a.url} muted autoPlay loop playsInline preload="metadata"
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                    onError={e=>{e.target.style.display="none";}}/>
                ) : thumb ? (
                  <img src={thumb} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                ) : (
                  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:28,opacity:.2,color:"#fff"}}>▶</span>
                  </div>
                )}
                {a.url && (
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                    title="Ouvrir dans un onglet"
                    style={{position:"absolute",top:7,right:7,width:24,height:24,borderRadius:"50%",background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#fff",fontSize:11}}>
                    ↗
                  </a>
                )}
                <div style={{position:"absolute",top:7,left:7,display:"flex",gap:4,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 7px",borderRadius:6,fontSize:9,fontWeight:700,background:pt.bg,color:pt.c,border:`1px solid ${pt.c}22`}}>
                    {a.p==="N/A"?"–":a.p}
                  </span>
                  {a.ad2!=="N/A"&&(
                    <span style={{padding:"2px 7px",borderRadius:6,fontSize:9,fontWeight:600,background:"rgba(0,0,0,.55)",color:"#fff"}}>
                      {a.ad2}
                    </span>
                  )}
                </div>
              </div>
              <div style={{padding:"10px 12px",flex:1}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#222",lineHeight:1.3,marginBottom:8}}>{name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  <div style={{background:"#f8f8f8",borderRadius:7,padding:"5px 8px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:(a._ct/spendMx*100)+"%",background:"#e0e7ff",opacity:.5}}/>
                    <div style={{position:"relative"}}>
                      <div style={{fontSize:8.5,color:"#bbb",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>Spend</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#222",fontVariantNumeric:"tabular-nums"}}>{fE(a._ct)}</div>
                    </div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(cpaCx.background?cpaCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:cpaCx.color||"#bbb"}}>CPA SU</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:cpaCx.color||"#222"}}>{fC1(a._cpa)}</div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(hrCx.background?hrCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:hrCx.color||"#bbb"}}>Hook</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:hrCx.color||"#222"}}>{fP(a._hr)}</div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(csCx.background?csCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:csCx.color||"#bbb"}}>CVR SU/I</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:csCx.color||"#222"}}>{fP(a._cs)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── MAIN DASHBOARD ──
// ══════════════════════════════════════════════
export default function Dashboard({ DAILY = [], ADS = [], TODAY: TODAY_PROP, onReset }) {
  const [preset,   setPreset]   = useState(15);
  const [filters,  setFilters]  = useState({});
  const [prodOn,   setProdOn]   = useState({Driving:true,Theory:true,"N/A":false});
  const [sortKey,  setSortKey]  = useState("_ct");
  const [sortDir,  setSortDir]  = useState("desc");
  const [chartM,   setChartM]   = useState("cpa");
  const [engM,     setEngM]     = useState("hr");
  const [rankM,    setRankM]    = useState("ct");
  const [expanded, setExpanded] = useState(null);

  // Anchor on TODAY prop (or fall back to last DAILY entry)
  const TODAY = TODAY_PROP || (DAILY.length ? DAILY[DAILY.length-1][0] : null);
  const EARLIEST = DAILY.length ? DAILY[0][0] : null;
  const PRANGES = useMemo(() => buildRanges(TODAY, EARLIEST), [TODAY, EARLIEST]);
  const PREV_RANGES = useMemo(() => buildPrevRanges(TODAY), [TODAY]);
  const PREV_LABELS = useMemo(() => {
    const out = {};
    Object.entries(PREV_RANGES).forEach(([k, [s, e]]) => { out[k] = `${shortFR(s)}→${shortFR(e)}`; });
    return out;
  }, [PREV_RANGES]);
  const prevLabelFor = label => {
    const k = label === "Spend" || label === "Signups" || label === "CPA SU" || label === "Hook Rate" || label === "CTR" ? pk : null;
    return k ? (PREV_LABELS[k] || "") : "";
  };

  const pk            = PK[String(preset)];
  const [pStart,pEnd] = PRANGES[pk];
  const prevRange     = PREV_RANGES[pk];
  const activeProd    = useMemo(()=>Object.entries(prodOn).filter(([,v])=>v).map(([k])=>k),[prodOn]);

  const adsInPeriod = useMemo(()=>
    ADS.filter(a=>a.pd[pk]&&activeProd.includes(a.p))
      .map(a=>{ const m=metrics(a.pd[pk]); return{...a,_im:m.im,_ct:m.ct,_cl:m.cl,_v2:m.v2,_ins:m.ins,_su:m.su,_hr:m.hr,_ctr:m.ctr,_ci:m.ci,_cs:m.cs,_cpa:m.cpa,_cpm:m.cpm,_cpc:m.cpc}; })
  ,[pk,activeProd]);

  const filteredAds = useMemo(()=>
    adsInPeriod.filter(d=>Object.entries(filters).every(([k,v])=>!v||d[k]===v))
  ,[adsInPeriod,filters]);

  const curTot = useMemo(()=>{
    const arrs=filteredAds.map(a=>a.pd[pk]).filter(Boolean);
    return arrs.length?metrics(aggArr(arrs)):metrics([0,0,0,0,0,0]);
  },[filteredAds,pk]);

  const prevTot = useMemo(()=>{
    if(!prevRange)return null;
    const arrs=ADS.filter(a=>a.pp?.[pk]&&activeProd.includes(a.p)&&Object.entries(filters).every(([k,v])=>!v||a[k]===v)).map(a=>a.pp[pk]);
    return arrs.length?metrics(aggArr(arrs)):null;
  },[prevRange,pk,activeProd,filters]);

  const totalAssets = adsInPeriod.length;

  const chartData = useMemo(()=>
    DAILY.filter(r=>r[0]>=pStart&&r[0]<=pEnd).map(r=>{
      const[d,im,ct,cl,v2,ins,su]=r;
      return{date:fDt(d),spend:ct,impr:im,
        cpa:su>0?ct/su:null, hr:im>0?v2/im:null, ctr:im>0?cl/im:null,
        cvrI:cl>0?ins/cl:null, cvrSU:ins>0?su/ins:null,
        cpm:im>0?ct/im*1000:null, cpc:cl>0?ct/cl:null};
    })
  ,[pStart,pEnd]);

  const sortedAds = useMemo(()=>_.orderBy(filteredAds.filter(a=>a._ct>0),[sortKey],[sortDir]),[filteredAds,sortKey,sortDir]);
  const maxCost   = useMemo(()=>Math.max(...sortedAds.map(a=>a._ct),1),[sortedAds]);

  const cpaQ = useMemo(()=>quantiles(sortedAds.map(a=>a._cpa)),[sortedAds]);
  const hrQ  = useMemo(()=>quantiles(sortedAds.filter(a=>a.f!=="Static").map(a=>a._hr)),[sortedAds]);
  const ctrQ = useMemo(()=>quantiles(sortedAds.filter(a=>a.f!=="Static").map(a=>a._ctr)),[sortedAds]);
  const ciQ  = useMemo(()=>quantiles(sortedAds.map(a=>a._ci)),[sortedAds]);
  const csQ  = useMemo(()=>quantiles(sortedAds.map(a=>a._cs)),[sortedAds]);
  const cpmQ = useMemo(()=>quantiles(sortedAds.map(a=>a._cpm)),[sortedAds]);

  const totC=sortedAds.reduce((s,a)=>s+a._ct,0), totSU=sortedAds.reduce((s,a)=>s+a._su,0);
  const totIM=sortedAds.reduce((s,a)=>s+a._im,0), totCL=sortedAds.reduce((s,a)=>s+a._cl,0);
  const totINS=sortedAds.reduce((s,a)=>s+a._ins,0), totV2=sortedAds.reduce((s,a)=>s+a._v2,0);

  const doSort = k=>{if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir(["_cpa","_cpm","_cpc"].includes(k)?"asc":"desc");}};
  const Ar = ({k})=>sortKey===k?<span style={{marginLeft:2}}>{sortDir==="desc"?"▼":"▲"}</span>:null;

  const interval = Math.max(Math.floor(chartData.length/8),1);
  const CHART_OPTS=[{k:"cpa",l:"CPA SU"},{k:"cpc",l:"CPC"},{k:"cpm",l:"CPM"}];
  const ENG_OPTS=[{k:"hr",l:"Hook Rate"},{k:"ctr",l:"CTR"},{k:"cvrI",l:"CVR Inst"},{k:"cvrSU",l:"CVR SU/I"}];
  const RANK_OPTS=[{k:"ct",l:"Par Spend"},{k:"cpa",l:"Par CPA"},{k:"su",l:"Par Signup"}];

  const cs  ={padding:"5px 7px",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap",fontSize:11,fontVariantNumeric:"tabular-nums"};
  const ths ={...cs,fontWeight:700,position:"sticky",top:0,background:"#fafafa",zIndex:2,cursor:"pointer",userSelect:"none",fontSize:9,textTransform:"uppercase",letterSpacing:".04em",color:"#aaa",textAlign:"right"};
  const thsL={...ths,textAlign:"left"};

  const adDisplayName = a => {
    const base = a.v ? a.v : a.ad.slice(0,28);
    const prefix = (a.r&&a.r!=="N/A") ? `${a.r} – ` : "";
    return prefix+base;
  };

  return (
    <div style={{fontFamily:"'Inter',-apple-system,system-ui,sans-serif",color:"#222",background:"#f6f6f7",minHeight:"100vh",padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {LOGO_SRC && <img src={LOGO_SRC} alt="Ornikar" style={{height:"52px",width:"52px",borderRadius:12,flexShrink:0}}/>}
          <div>
            <h1 style={{fontSize:20,fontWeight:800,margin:0,letterSpacing:"-.03em",color:"#111",lineHeight:1.1}}>
              Scorecard Creative Paid Social
            </h1>
            <p style={{color:"#bbb",fontSize:10.5,margin:"4px 0 0"}}>
              TikTok Ads · {fDt(pStart)} → {fDt(pEnd)} · <b style={{color:"#888"}}>{totalAssets}</b> assets sur la période
            </p>
          </div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
          {PRESETS.map(p=>(
            <button key={p.d} onClick={()=>setPreset(p.d)}
              style={{padding:"5px 13px",borderRadius:8,border:preset===p.d?"2px solid #6366f1":"1px solid #ddd",background:preset===p.d?"#eef2ff":"#fff",color:preset===p.d?"#6366f1":"#888",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .1s"}}>
              {p.l}
            </button>
          ))}
          {onReset && (
            <button onClick={onReset}
              style={{padding:"5px 11px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#888",fontSize:11,fontWeight:600,cursor:"pointer",marginLeft:6}}>
              ↻ Nouveau dataset
            </button>
          )}
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        {["Driving","Theory","N/A"].map(p=>{
          const on=prodOn[p]; const t=prodTag(p);
          return (
            <button key={p} onClick={()=>setProdOn(s=>({...s,[p]:!s[p]}))}
              style={{padding:"4px 13px",borderRadius:20,border:on?`2px solid ${t.c}`:"1px solid #e0e0e0",background:on?t.bg:"#fff",color:on?t.c:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer",opacity:on?1:.5,transition:"all .15s"}}>
              {p==="N/A"?"Non classé":p}
            </button>
          );
        })}
        <div style={{flex:1}}/>
        {["an","r","f","co"].map(d=>(
          <select key={d} value={filters[d]||""} onChange={e=>setFilters(f=>({...f,[d]:e.target.value}))}
            style={{background:"#fff",color:"#555",border:"1px solid #ddd",borderRadius:8,padding:"4px 10px",fontSize:10.5,outline:"none"}}>
            <option value="">{{an:"Angle",r:"Réalisation",f:"Format",co:"Concept"}[d]}</option>
            {[...new Set(adsInPeriod.map(a=>a[d]).filter(x=>x&&x!=="N/A"))].sort().map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        {Object.values(filters).some(Boolean)&&(
          <button onClick={()=>setFilters({})} style={{background:"none",color:"#6366f1",border:"none",cursor:"pointer",fontSize:10.5,fontWeight:700}}>✕ Reset</button>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:12,padding:"13px 15px",border:"1px solid #e8e8e8"}}>
          <div style={{fontSize:9.5,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:4}}>Assets</div>
          <div style={{fontSize:22,fontWeight:800,color:"#111"}}>{totalAssets}</div>
        </div>
        <KPI label="Spend"    prevLabel={prevLabelFor("Spend")}    mainStr={fE(curTot.ct)}   mainRaw={curTot.ct}   prevStr={prevTot?fE(prevTot.ct):"–"}    prevRaw={prevTot?.ct||0}   inverse={false}/>
        <KPI label="Signups"  prevLabel={prevLabelFor("Signups")}  mainStr={fN(curTot.su)}   mainRaw={curTot.su}   prevStr={prevTot?fN(prevTot.su):"–"}    prevRaw={prevTot?.su||0}   inverse={false}/>
        <KPI label="CPA SU"   prevLabel={prevLabelFor("CPA SU")}   mainStr={fC1(curTot.cpa)} mainRaw={curTot.cpa}  prevStr={prevTot?fC1(prevTot.cpa):"–"} prevRaw={prevTot?.cpa||0}  inverse={true}/>
        <KPI label="Hook Rate" prevLabel={prevLabelFor("Hook Rate")} mainStr={fP(curTot.hr)}  mainRaw={curTot.hr}   prevStr={prevTot?fP(prevTot.hr):"–"}   prevRaw={prevTot?.hr||0}   inverse={false}/>
        <KPI label="CTR"      prevLabel={prevLabelFor("CTR")}      mainStr={fP2(curTot.ctr)} mainRaw={curTot.ctr}  prevStr={prevTot?fP2(prevTot.ctr):"–"} prevRaw={prevTot?.ctr||0}  inverse={false}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
        <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e8e8e8"}}>
          <ProdSplit data={filteredAds} metric="ct" fmt={fE} label="Spend"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,marginTop:10}}>
            <span style={{fontSize:10.5,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em"}}>Spend & Efficiency</span>
            <div style={{display:"flex",gap:3}}>
              {CHART_OPTS.map(o=>(
                <button key={o.k} onClick={()=>setChartM(o.k)}
                  style={{padding:"2px 7px",borderRadius:6,border:chartM===o.k?"1px solid #6366f1":"1px solid #e0e0e0",background:chartM===o.k?"#eef2ff":"#fff",color:chartM===o.k?"#6366f1":"#ccc",fontSize:9.5,fontWeight:600,cursor:"pointer"}}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:8.5,fill:"#ccc"}} interval={interval}/>
              <YAxis yAxisId="l" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v>=1000?(v/1000).toFixed(0)+"k":v}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v.toFixed(0)+"€"}/>
              <Tooltip contentStyle={{fontSize:10,borderRadius:8,border:"1px solid #eee"}} formatter={(v,n)=>[typeof v==="number"?(v>=100?fN(v):v.toFixed(2)):v,n]}/>
              <Bar yAxisId="l" dataKey="spend" name="Spend (€)" fill="#c7d2fe" radius={[2,2,0,0]}/>
              <Line yAxisId="r" dataKey={chartM} name={CHART_OPTS.find(o=>o.k===chartM)?.l} stroke="#6366f1" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e8e8e8"}}>
          <ProdSplit data={filteredAds} metric="im" fmt={fN} label="Impr."/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,marginTop:10}}>
            <span style={{fontSize:10.5,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em"}}>Impr. & Engagement</span>
            <div style={{display:"flex",gap:3}}>
              {ENG_OPTS.map(o=>(
                <button key={o.k} onClick={()=>setEngM(o.k)}
                  style={{padding:"2px 7px",borderRadius:6,border:engM===o.k?"1px solid #10b981":"1px solid #e0e0e0",background:engM===o.k?"#ecfdf5":"#fff",color:engM===o.k?"#10b981":"#ccc",fontSize:9.5,fontWeight:600,cursor:"pointer"}}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:8.5,fill:"#ccc"}} interval={interval}/>
              <YAxis yAxisId="l" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"k":v}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>(v*100).toFixed(1)+"%"}/>
              <Tooltip contentStyle={{fontSize:10,borderRadius:8,border:"1px solid #eee"}} formatter={(v,n)=>[typeof v==="number"?(v<1?(v*100).toFixed(2)+"%":fN(v)):v,n]}/>
              <Bar yAxisId="l" dataKey="impr" name="Impressions" fill="#d1fae5" radius={[2,2,0,0]}/>
              <Line yAxisId="r" dataKey={engM} name={ENG_OPTS.find(o=>o.k===engM)?.l} stroke="#10b981" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TopAdsGrid ads={filteredAds} cpaQ={cpaQ} hrQ={hrQ} csQ={csQ}/>

      <div style={{marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",margin:0}}>Top Performers par segment</h2>
          <div style={{display:"flex",gap:4}}>
            {RANK_OPTS.map(o=>(
              <button key={o.k} onClick={()=>setRankM(o.k)}
                style={{padding:"3px 10px",borderRadius:7,border:rankM===o.k?"1px solid #6366f1":"1px solid #ddd",background:rankM===o.k?"#eef2ff":"#fff",color:rankM===o.k?"#6366f1":"#aaa",fontSize:10,fontWeight:600,cursor:"pointer"}}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:8}}>
          {[
            {d:"p",  t:"Produit", big:true},
            {d:"ad2",t:"Angle"},
            {d:"co", t:"Concept"},
            {d:"f",  t:"Format"},
          ].map(({d,t,big})=>(
            <Rank key={d} title={t} dim={d} data={filteredAds}
              metric={rankM} mLabel={rankM==="ct"?"Spend":rankM==="cpa"?"CPA SU":"Signups"}
              mFmt={rankM==="ct"?fE:rankM==="cpa"?fC1:fN}
              higher={rankM!=="cpa"} color={rankM==="ct"?"#818cf8":rankM==="cpa"?"#f59e0b":"#10b981"}
              bigAssets={big}/>
          ))}
        </div>
      </div>

      <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Deep Dive Créas</h2>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e5e5e5",background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1050}}>
          <thead>
            <tr>
              <th style={{...thsL,minWidth:220}}>Créa / Segmentation</th>
              <th style={{...ths,textAlign:"center",minWidth:60}}>Produit</th>
              <th style={{...ths,textAlign:"center",minWidth:42}} onClick={()=>doSort("du")}>Diff<Ar k="du"/></th>
              <th style={{...thsL,minWidth:100,fontSize:9}}>Dates</th>
              <th style={{...ths,minWidth:90}} onClick={()=>doSort("_ct")}>Cost<Ar k="_ct"/></th>
              <th style={ths} onClick={()=>doSort("_su")}>SU<Ar k="_su"/></th>
              <th style={ths} onClick={()=>doSort("_cpa")}>CPA SU<Ar k="_cpa"/></th>
              <th style={ths} onClick={()=>doSort("_hr")}>Hook<Ar k="_hr"/></th>
              <th style={ths} onClick={()=>doSort("_ctr")}>CTR<Ar k="_ctr"/></th>
              <th style={ths} onClick={()=>doSort("_ci")}>CVR Inst<Ar k="_ci"/></th>
              <th style={ths} onClick={()=>doSort("_cs")}>CVR SU/I<Ar k="_cs"/></th>
              <th style={ths} onClick={()=>doSort("_cpm")}>CPM<Ar k="_cpm"/></th>
            </tr>
            <tr style={{background:"#f8f8fc",borderBottom:"2px solid #e5e5e5"}}>
              <td style={{...cs,fontWeight:700,fontSize:10,color:"#888"}}>TOTAL ({sortedAds.length} créas)</td>
              <td style={cs}/><td style={cs}/>
              <td style={cs}/>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{fE(totC)}</td>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{fN(totSU)}</td>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{totSU>0?fC1(totC/totSU):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fP(totV2/totIM):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fP2(totCL/totIM):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totCL>0?fP(totINS/totCL):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totINS>0?fP(totSU/totINS):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fC1(totC/totIM*1000):"–"}</td>
            </tr>
          </thead>
          <tbody>
            {sortedAds.map((d,i)=>{
              const isStatic=d.f==="Static";
              const ac=ageC(d.du); const pt=prodTag(d.p);
              const cc  =d._cpa>0?mfc(d._cpa,cpaQ[0],cpaQ[1],false):{};
              const hc  =!isStatic&&d._hr>0?mfc(d._hr,hrQ[0],hrQ[1],true):{};
              const tc  =!isStatic&&d._ctr>0?mfc(d._ctr,ctrQ[0],ctrQ[1],true):{};
              const ciC =d._ci>0?mfc(d._ci,ciQ[0],ciQ[1],true):{};
              const csC =d._cs>0?mfc(d._cs,csQ[0],csQ[1],true):{};
              const cpmC=d._cpm>0?mfc(d._cpm,cpmQ[0],cpmQ[1],false):{};
              const costPct=d._ct/maxCost*100;
              const rowOpen=expanded===i;
              return (
                <tr key={i} style={{cursor:"pointer",background:rowOpen?"#fafbff":"transparent"}}
                  onClick={()=>setExpanded(rowOpen?null:i)}
                  onMouseEnter={e=>{if(!rowOpen)e.currentTarget.style.background="#fafbff";}}
                  onMouseLeave={e=>{if(!rowOpen)e.currentTarget.style.background="transparent";}}>

                  <td style={{...cs,textAlign:"left",maxWidth:240}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:5}}>
                      <span style={{marginTop:"2px",fontSize:9,color:"#ccc",flexShrink:0,display:"inline-block",transition:"transform .15s",transform:rowOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:11.5,color:"#222",lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:205}}>
                          {adDisplayName(d)}
                        </div>
                        {rowOpen&&(
                          <div style={{marginTop:5,fontSize:9,lineHeight:1.9}}>
                            {d.ad2!=="N/A"&&<div><span style={{fontWeight:700,color:"#111"}}>Angle :</span><span style={{color:"#555"}}> {d.ad2}</span></div>}
                            {d.co!=="N/A"&&<div><span style={{fontWeight:700,color:"#111"}}>Concept :</span><span style={{color:"#555"}}> {d.co}</span></div>}
                            {d.f!=="N/A"&&<div><span style={{color:"#aaa"}}>Format :</span><span style={{color:"#bbb"}}> {d.f}</span></div>}
                            {d.r!=="N/A"&&<div><span style={{color:"#aaa"}}>Réal. :</span><span style={{color:"#bbb"}}> {d.r}</span></div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{...cs,textAlign:"center"}}>
                    <span style={{padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700,background:pt.bg,color:pt.c}}>
                      {d.p==="N/A"?"–":d.p}
                    </span>
                  </td>

                  <td style={{...cs,textAlign:"center"}}>
                    <span style={{padding:"2px 5px",borderRadius:5,fontSize:9.5,fontWeight:700,background:ac.bg,color:ac.c}}>{d.du}j</span>
                  </td>

                  <td style={{...cs,textAlign:"left",fontSize:9,color:"#bbb",whiteSpace:"nowrap"}}>
                    {fDt(d.dp)} → {fDt(d.dd)}
                  </td>

                  <td style={{...cs,textAlign:"right",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:costPct+"%",background:"#e0e7ff",opacity:.4,borderRadius:"0 3px 3px 0"}}/>
                    <span style={{position:"relative",fontWeight:600}}>{fE(d._ct)}</span>
                  </td>

                  <td style={{...cs,textAlign:"right",fontWeight:600}}>{fN(d._su)}</td>
                  <td style={{...cs,textAlign:"right",fontWeight:600,...cc}}>{d._cpa>0?fC1(d._cpa):"–"}</td>
                  <td style={{...cs,textAlign:"right",...(isStatic?{background:"#f9f9f9",color:"#ddd"}:hc)}}>{isStatic?"N/A":fP(d._hr)}</td>
                  <td style={{...cs,textAlign:"right",...(isStatic?{background:"#f9f9f9",color:"#ddd"}:tc)}}>{isStatic?"N/A":fP2(d._ctr)}</td>
                  <td style={{...cs,textAlign:"right",...ciC}}>{fP(d._ci)}</td>
                  <td style={{...cs,textAlign:"right",...csC}}>{fP(d._cs)}</td>
                  <td style={{...cs,textAlign:"right",...cpmC}}>{fC1(d._cpm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:8.5,color:"#ccc",marginTop:6,textAlign:"center"}}>
        ▶ cliquer pour détails · Vert = top perf · Rouge = sous-perf · Static: Hook/CTR grisé
      </p>
    </div>
  );
}
