'use strict';
/* BUS SAMPLE ITINERARIES. Used only when there is no live or verified timetable.
   Every item is labelled src:'sample'. To change how sample bus results look, edit this file. */
YP.samplers.bus=({q,A,B,d,key,vr,mk})=>{const out=[],{rnd,r10,r5}=YP.sampleUtil,m='bus';const road=Math.max(15,vr&&vr.r.km&&vr.r.km[0]?(vr.r.km[0]+vr.r.km[1])/2:d*1.25),cats=[['Non-AC Seater','Seater',1.1],['AC Seater','Seater',1.6],['Non-AC Sleeper','Sleeper',1.7],['AC Sleeper','Sleeper',2.2],['Premium AC Coach','Seater',2.8]],H=road>500?[17,19,20,21,22]:[6,8,11,15,19];
  cats.forEach((c,i)=>out.push(mk(i,{kind:'direct',stops:0,operator:'Bus Service '+'ABCDE'[i],cls:c[0],seat:c[1],board:A.name,drop:B.name,dep:H[i]*60+Math.floor(rnd(key+i+'t')*4)*10,durMin:Math.round(road/46*60+Math.floor(road/200)*20)+Math.floor(rnd(key+i+'d')*20),fare:r5((40+road*c[2])*(.92+rnd(key+i)*.16))})))
 return out};
