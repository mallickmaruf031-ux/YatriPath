'use strict';
/* TRANSPORT SEARCH SERVICE (window.YP). Loads the data/ files per transport type, autocomplete search (YP.find),
   verified route checks, the 4-step search pipeline (YP.search) and the sample itinerary dispatcher (YP.sample).
   Sample itineraries for each transport type are built in scripts/transport/<type>/<type>-sample-itineraries.js */
/* YatriPath location & route engine. Reads the imported transport database (data/*.js, built by
   tools/import_data.py). Data is loaded per transport type, on demand. Routes exist ONLY if they are
   in the imported route tables; nothing is inferred or invented. */
window.YP=window.YP||{};
(function(){
const FILES={rail:'data/rail.js',air:'data/air.js',bus:'data/bus.js',routes:'data/routes.js',meta:'data/meta.js',geo:'data/geo.js'},KEY={flight:'air',train:'rail',bus:'bus'},got={},IDX={};
const inject=k=>got[k]||(got[k]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=FILES[k];s.onload=ok;s.onerror=()=>{delete got[k];no(new Error('Could not load '+FILES[k]))};document.head.append(s)}));
YP.load=m=>Promise.all([inject(KEY[m]),inject('routes'),inject('meta'),inject('geo')]).then(()=>idx(m));
YP.loadMeta=()=>inject('meta');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
function loc(m,r){
 if(m==='train')return{country:'India',x:{Zone:r[4],Division:r[6],Role:r[5]},id:r[0],mode:m,name:r[1],code:r[0],city:r[2],region:r[3],type:r[5]||'Station',label:`${r[1]} (${r[0]}) — ${r[2]}, ${r[3]}`,short:`${r[1]} (${r[0]})`,hay:norm([r[1],r[0],r[2],r[3]].join(' ')),pri:/major/i.test(r[5])?1:0};
 if(m==='flight')return{country:r[8]||'India',x:{ICAO:r[6],Status:r[5]},id:r[0],mode:m,name:r[1],code:r[0],city:r[2],region:r[3],type:r[4]==='INTL'?'International airport':r[4]==='UDAN'?'Regional airport':'Domestic airport',label:`${r[1]} (${r[0]}) — ${r[2]}, ${r[3]}`,short:`${r[1]} (${r[0]})`,hay:norm([r[1],r[0],r[2],r[3],r[6]].join(' ')),pri:r[4]==='INTL'&&r[7]==='IN'?1:0};
 return{country:'India',x:{Area:r[6],Notes:r[7]},id:r[0],mode:m,name:r[1],code:'',city:r[2],region:r[3],type:r[5]==='boarding'?'Boarding point':r[4],label:`${r[1]} — ${r[2]}${r[3]?', '+r[3]:''}`,short:r[1]+', '+r[2],hay:norm([r[1],r[2],r[3],r[6]].join(' ')),pri:r[4]==='ISBT'?1:0}}
function idx(m){if(IDX[m])return IDX[m];const rows=YP[KEY[m]];if(!rows)return{list:[],byId:{}};const list=rows.map(r=>loc(m,r)),byId={};list.forEach(l=>byId[l.id]=l);return IDX[m]={list,byId}}
YP.get=(m,id)=>idx(m).byId[id]||null;
const lev=(a,b)=>{if(Math.abs(a.length-b.length)>1)return 9;const d=[];for(let i=0;i<=a.length;i++)d[i]=[i];for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
/* autocomplete: code, name, city, state; partial words; one-letter spelling slips; limited result count */
YP.find=(m,q,limit=8,skip)=>{const{list}=idx(m),n=norm(q);if(!n)return list.filter(l=>l.pri&&l.id!==skip).slice(0,limit);
 const t=n.split(' '),out=[];
 for(const l of list){if(l.id===skip||!t.every(x=>l.hay.includes(x)))continue;let s=0;const c=norm(l.code),nm=norm(l.name);
  if(c&&c===n)s+=100;else if(c&&c.startsWith(n))s+=60;
  if(nm.startsWith(n))s+=50;else if(l.hay.split(' ').some(w=>w.startsWith(t[0])))s+=30;else s+=10;
  if(norm(l.city)===n)s+=40;out.push([s+l.pri*3,l])}
 if(!out.length&&n.length>=4)for(const l of list){if(l.id===skip)continue;const ws=l.hay.split(' ');if(t.every(x=>ws.some(w=>w.length>=3&&lev(w,x)<=1)))out.push([1,l])}
 return out.sort((a,b)=>b[0]-a[0]||a[1].name.localeCompare(b[1].name)).slice(0,limit).map(x=>x[1])};
const RT=m=>(YP.routes||{})[m==='flight'?'flight':m==='train'?'rail':'bus']||[];
YP.routesBetween=(m,a,b)=>RT(m).flatMap(r=>r.f===a&&r.t===b?[{r,rev:false}]:r.f===b&&r.t===a?[{r,rev:true}]:[]);
YP.routesFrom=(m,id)=>RT(m).filter(r=>r.f===id||r.t===id).map(r=>({r,rev:r.t===id}));
/* same two cities, different terminals/stations than the ones chosen */
YP.cityLevel=(m,a,b)=>{const A=YP.get(m,a),B=YP.get(m,b);if(!A||!B)return[];return RT(m).filter(r=>{const f=YP.get(m,r.f),t=YP.get(m,r.t);return f&&t&&((f.city===A.city&&t.city===B.city)||(f.city===B.city&&t.city===A.city))&&!(r.f===a&&r.t===b)&&!(r.f===b&&r.t===a)}).map(r=>({r,rev:YP.get(m,r.f).city===B.city}))};
/* two verified legs that meet in the same city */
YP.connecting=(m,a,b)=>{const out=[],all=RT(m).flatMap(r=>{const f=YP.get(m,r.f),t=YP.get(m,r.t);return f&&t?[{r,from:f,to:t},{r,from:t,to:f}]:[]});
 for(const l1 of all.filter(l=>l.from.id===a))for(const l2 of all.filter(l=>l.to.id===b))if(l1.r!==l2.r&&l1.to.city===l2.from.city&&l1.to.id!==b&&l2.from.id!==a)out.push([l1,l2]);return out};
const inCity=(m,city)=>{const y=norm(city);return idx(m).list.filter(l=>{const x=norm(l.city);return x===y||x.includes(y)||y.includes(x)})};
YP.inCity=inCity;YP.sameCity=(m,l)=>inCity(m,l.city).filter(x=>x.id!==l.id);
YP.nearby=(m,l,n=4)=>idx(m).list.filter(x=>x.id!==l.id&&x.region===l.region&&x.city!==l.city).sort((a,b)=>b.pri-a.pri).slice(0,n);
YP.fareRef=(m,a,b)=>(YP.fares||[]).filter(f=>f.m===m&&((f.f===a&&f.t===b)||(f.f===b&&f.t===a)));
const tmo=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);
/* Search pipeline. 1 database routes -> 2 live providers (window.YP_PROVIDERS, see scripts/services/live-providers.js) -> 3 connecting routes
   from verified legs -> 4 reference fares (only if a fare file was imported). Failing step 1 never stops the others. */
YP.search=async q=>{const m=q.mode,a=q.from.id,b=q.to.id;await YP.load(m);
 const out={m,db:YP.routesBetween(m,a,b),live:[],prov:{configured:0,ok:0,failed:[]},connecting:[],cityLevel:[],fares:YP.fareRef(m,a,b),alts:[],nearFrom:[],nearTo:[]};
 const P=(window.YP_PROVIDERS||[]).filter(p=>p.modes&&p.modes.includes(m));out.prov.configured=P.length;
 await Promise.all(P.map(p=>tmo((async()=>p.search({mode:m,from:q.from,to:q.to,date:q.date,pax:q.pax,cabin:q.cabin}))(),8000).then(r=>{out.prov.ok++;(r||[]).forEach(x=>out.live.push({...x,provider:p.name}))}).catch(()=>out.prov.failed.push(p.name))));
 if(!out.db.length&&!out.live.length){out.connecting=YP.connecting(m,a,b);out.cityLevel=YP.cityLevel(m,a,b)}
 if(!out.db.length&&!out.live.length&&!out.connecting.length){
  for(const m2 of ['flight','train','bus'].filter(x=>x!==m)){try{await YP.load(m2)}catch(e){continue}const A=inCity(m2,q.from.city),B=inCity(m2,q.to.city);
   if(A.length&&B.length){const sc=l=>l.pri*2+(norm(l.name).includes(norm(l.city))?1:0)+(/terminal/i.test(l.type)?1:0),best=l=>l.slice().sort((x,y)=>sc(y)-sc(x))[0],f=best(A),t=best(B);out.alts.push({mode:m2,from:f,to:t,verified:YP.routesBetween(m2,f.id,t.id).length>0})}}
  out.nearFrom=[...YP.sameCity(m,q.from),...YP.nearby(m,q.from)].slice(0,4);out.nearTo=[...YP.sameCity(m,q.to),...YP.nearby(m,q.to)].slice(0,4)}
 return out};

/* ---------- Sample itinerary engine (shared parts) ----------
   Used only when no live provider or verified timetable exists. Everything it returns is labelled src:'sample'.
   Distances come from approximate reference coordinates (data/geo.js). Fares and times follow fixed rules and a
   seeded variation, so the same search always gives the same sample results. No flight/train numbers are generated. */
const hsh=s=>{let x=2166136261;for(const c of String(s))x=Math.imul(x^c.charCodeAt(0),16777619);x^=x>>>16;x=Math.imul(x,2246822507);x^=x>>>13;x=Math.imul(x,3266489909);x^=x>>>16;return x>>>0},rnd=s=>hsh(s)/4294967296,r10=n=>Math.round(n/10)*10,r5=n=>Math.round(n/5)*5;
const hv=(a,b)=>{const r=Math.PI/180,h=Math.sin((b[0]-a[0])*r/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin((b[1]-a[1])*r/2)**2;return 12742*Math.asin(Math.sqrt(h))};
YP.coord=l=>{const g=YP.geo||{c:{},s:{}},n=norm(l.city.replace(/\(.*?\)/g,'')),m=(l.city.match(/\((.*?)\)/)||[])[1];return g.c[n]||(m&&g.c[norm(m)])||g.s[l.region]||null};
YP.dist=(A,B)=>{const a=YP.coord(A),b=YP.coord(B);return a&&b?hv(a,b):null};
YP.samplers={};   /* each transport type registers its own builder: scripts/transport/<type>/<type>-sample-itineraries.js */
YP.sampleUtil={rnd,r10,r5};
YP.sample=async q=>{const m=q.mode,A=q.from,B=q.to;await YP.load(m);const key=[m,A.id,B.id,q.date].join('|'),vr=YP.routesBetween(m,A.id,B.id)[0];
 let d=YP.dist(A,B),est=d==null;if(est)d={flight:1200,train:600,bus:250}[m];
 const mk=(i,o)=>({id:key+'|'+o.kind[0]+i,src:'sample',mode:m,arr:o.dep+o.durMin,...o});
 const out=YP.samplers[m]({q,A,B,m,d,key,vr,mk});
 return{items:out,dist:Math.round(d),est}};
YP.km=r=>r.km&&r.km[0]?(r.km[0]===r.km[1]?'~'+r.km[0]:'~'+r.km[0]+'–'+r.km[1])+' km':'';
})();
