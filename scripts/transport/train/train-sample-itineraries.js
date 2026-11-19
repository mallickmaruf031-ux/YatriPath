'use strict';
/* TRAIN SAMPLE ITINERARIES. Used only when there is no live or verified timetable.
   Every item is labelled src:'sample'. To change how sample train results look, edit this file. */
const CLS={'2S':['Second Sitting',.42,0],SL:['Sleeper',.62,0],CC:['AC Chair Car',1.55,1],'3A':['AC 3 Tier',1.65,1],'2A':['AC 2 Tier',2.35,1],'1A':['AC First Class',3.9,1]};
const tFare=(road,c,sf,seed)=>{const{rnd,r5}=YP.sampleUtil;const[,rt,ac]=CLS[c];return r5((Math.max(45,road*rt)+(ac?50:40)+sf)*(ac?1.05:1)*(.97+rnd(seed+c)*.06))};
YP.samplers.train=({q,A,B,d,key,vr,mk})=>{const out=[],{rnd,r10,r5}=YP.sampleUtil,m='train';const road=d*1.2;
  if(road<40){for(let i=0;i<5;i++)out.push(mk(i,{kind:'direct',stops:0,operator:'Suburban Service',dep:(6+i*3)*60+Math.floor(rnd(key+i)*6)*5,durMin:Math.max(12,Math.round(road/32*60+8)),cls:'Unreserved',classes:[{code:'2S',name:'Second (unreserved)',fare:Math.max(10,r5(road*.6+6))}],fare:Math.max(10,r5(road*.6+6))}));}
  else{const cl=road<250?['2S','CC','SL']:road<700?['SL','3A','2A','CC']:['SL','3A','2A','1A'],sv=[['Express',52,0],['Superfast Express',64,45],['Intercity Express',58,30]],H=[5,8,12,16,20];
   const classes=(r,sf,seed)=>cl.map(c=>({code:c,name:CLS[c][0],fare:tFare(r,c,sf,seed)}));
   for(let i=0;i<5;i++){const[nm,sp,sf]=sv[i%3],cs=classes(road,sf,key+i);out.push(mk(i,{kind:'direct',stops:0,operator:nm,dep:H[i]*60+Math.floor(rnd(key+i+'t')*4)*10,durMin:Math.round(road/sp*60+12),cls:cs[0].name,classes:cs,fare:cs[0].fare}))}
   if(road>=350){let n=0;for(const hc of ['NDLS','HWH','MAS','CSMT','SBC','SC','PUNE','NGP','BPL','ADI','LKO','PNBE','JP','BZA','GHY','BBS']){const Hh=YP.get('train',hc);if(!Hh||Hh.city===A.city||Hh.city===B.city)continue;const d1=YP.dist(A,Hh),d2=YP.dist(Hh,B);if(d1==null||d2==null||(d1+d2)/d>1.3||d1<100||d2<100)continue;
    const r1=d1*1.2,r2=d2*1.2,lay=90+Math.floor(rnd(key+hc)*90),cs=['SL','3A','2A'].map(c=>({code:c,name:CLS[c][0],fare:tFare(r1,c,0,key+hc)+tFare(r2,c,0,key+hc+'b')}));
    out.push(mk(n,{kind:'connecting',stops:1,via:Hh,operator:'Connecting journey (2 trains)',dep:(9+n*5)*60,durMin:Math.round((r1+r2)/55*60+24+lay),cls:cs[0].name,classes:cs,fare:cs[0].fare,layover:lay}));if(++n>=2)break}}}
 return out};
