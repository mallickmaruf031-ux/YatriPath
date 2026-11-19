'use strict';
/* HELPERS used everywhere: $, $$, localStorage (ls), esc, inr, day, tf, df, hash, fdate,
   toast, modal, closeM, confirmM, loading, bind. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ls={g:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('yp_'+k));return v==null?d:v}catch(e){return d}},s:(k,v)=>{try{localStorage.setItem('yp_'+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const day=(n=0)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const tf=m=>{m=Math.round(m);const d=m>=1440;m%=1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+(d?' +1d':'')};
const df=m=>Math.floor(m/60)+'h '+String(Math.round(m%60)).padStart(2,'0')+'m';
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const fdate=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',weekday:'short'});
function toast(m,t=''){const e=document.createElement('div');e.className='toast '+t;const i=t==='ok'?ic('check'):t==='er'?ic('alert'):'';e.innerHTML=(i?`<span class="t-ic">${i}</span>`:'')+`<span>${esc(m)}</span>`;$('#toasts').append(e);setTimeout(()=>e.remove(),3200)}
function modal(h,c=''){$('.mbox').className='mbox '+c;$('#mbody').innerHTML=h;$('#modal').hidden=false;const f=$('#mbody input,#mbody button');f&&f.focus()}
const closeM=()=>{$('#modal').hidden=true};
function confirmM(title,msg,yes,fn,cls=''){modal(`<h3>${title}</h3><p>${msg}</p><div class="pay"><button class="btn ghost" id="no">Keep as is</button><button class="btn ${cls}" id="yes">${yes}</button></div>`);$('#no').onclick=closeM;$('#yes').onclick=()=>{closeM();fn()}}
function loading(then,ms=700){$('#app').innerHTML='<div class="spin" role="status" aria-label="Loading"></div>';setTimeout(then,ms)}
const bind=(sel,ev,fn)=>$$(sel).forEach(e=>e.addEventListener(ev,fn));
