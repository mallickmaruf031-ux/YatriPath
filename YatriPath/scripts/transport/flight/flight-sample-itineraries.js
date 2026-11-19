'use strict';
/* FLIGHT SAMPLE ITINERARIES. Used only when there is no live or verified timetable.
   Every item is labelled src:'sample'. To change how sample flight results look, edit this file. */
YP.samplers.flight=({q,A,B,d,key,vr,mk})=>{const out=[],{rnd,r10,r5}=YP.sampleUtil,m='flight';const intl=A.country!=='India'||B.country!=='India',cab=q.cabin||'Economy',cm={Economy:1,'Premium Economy':1.45,Business:2.7,First:4.2}[cab]||1,base=intl?5200+d*3.9:1700+d*3.3,air=['Flight Option A','Flight Option B','Flight Option C'],H=[6,9,13,17,20],bag=cab==='Economy'?'Cabin 7 kg · check-in 15 kg (typical)':'Cabin 7 kg · check-in 30 kg (typical)';
  for(let i=0;i<5;i++)out.push(mk(i,{kind:'direct',stops:0,operator:air[i%3],dep:H[i]*60+Math.floor(rnd(key+i+'t')*4)*10,durMin:Math.round(d/(intl?820:760)*60+(intl?55:45))+Math.floor(rnd(key+i+'d')*18),fare:r10(base*(.88+rnd(key+i)*.4)*(i%3===2?1.18:1)*cm),cls:cab,bag}));
  if(d>500){let n=0;for(const hc of intl?['DXB','DOH','SIN','DEL','BOM']:['DEL','BOM','BLR','HYD','MAA','CCU']){const Hh=YP.get('flight',hc);if(!Hh||Hh.id===A.id||Hh.id===B.id)continue;const d1=YP.dist(A,Hh),d2=YP.dist(Hh,B);if(d1==null||d2==null||(d1+d2)/d>1.4||d1<150||d2<150)continue;
   const sp=intl?820:760,lay=75+Math.floor(rnd(key+hc)*80);out.push(mk(n,{kind:'connecting',stops:1,via:Hh,operator:air[(n+1)%3],dep:(7+n*6)*60,durMin:Math.round((d1+d2)/sp*60+90+lay),fare:r10(base*(.74+rnd(key+hc+'f')*.14)*cm),cls:cab,bag,layover:lay}));if(++n>=2)break}}
 return out};
