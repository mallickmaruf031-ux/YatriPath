'use strict';
/* LOCATION AUTOCOMPLETE (From / To boxes). cbHtml() builds the box, wireCombo() makes it search the transport data. */
const PHT={flight:['Search airport, IATA code or city','airport'],train:['Search railway station, code or city','station'],bus:['Search bus terminal, boarding point or city','terminal'],multi:['Search city, state or region in India','location']};
const cbHtml=(role,label)=>{const l=S.q[role];return `<div class="fld cb" data-role="${role}"><label for="${role}">${ic('pin')} ${label}</label><input id="${role}" autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="${role}-l" placeholder="${PHT[S.q.mode][0]}" value="${l?esc(l.short):''}"><button type="button" class="clr" aria-label="Clear ${label}" ${l?'':'hidden'}>×</button><ul id="${role}-l" class="sug" role="listbox" hidden></ul><small class="cerr" hidden></small></div>`};
/* Autocomplete combobox backed by the imported database */
function wireCombo(role){const box=$(`.cb[data-role="${role}"]`),inp=$('input',box),ul=$('.sug',box),clr=$('.clr',box),err=$('.cerr',box),other=role==='from'?'to':'from';let items=[],act=-1,seq=0;
 const close=()=>{ul.hidden=true;inp.setAttribute('aria-expanded','false')},mark=()=>$$('li[data-i]',ul).forEach((li,i)=>{li.classList.toggle('on',i===act);li.setAttribute('aria-selected',i===act)});
 const show=async()=>{const my=++seq;ul.hidden=false;inp.setAttribute('aria-expanded','true');ul.innerHTML='<li class="msg">Loading…</li>';
  try{await YP.load(S.q.mode)}catch(e){ul.innerHTML='<li class="msg">Location data could not be loaded. Open the site from its project folder so the data folder is available.</li>';return}
  if(my!==seq)return;items=YP.find(S.q.mode,inp.value,8,S.q[other]&&S.q[other].id);act=items.length?0:-1;
  ul.innerHTML=items.length?items.map((l,i)=>`<li role="option" data-i="${i}"><b>${esc(l.name)}</b>${l.code?` <span class="cd">${l.code}</span>`:''}<small>${esc(l.city)}${l.region?', '+esc(l.region):''} · ${esc(l.type)}</small></li>`).join(''):`<li class="msg">No matching ${PHT[S.q.mode][1]} found. Try its name, code or city.</li>`;mark()};
 const pick=l=>{S.q[role]=l;inp.value=l.short;err.hidden=true;clr.hidden=false;close()};
 inp.addEventListener('input',()=>{if(S.q[role]&&inp.value!==S.q[role].short)S.q[role]=null;clr.hidden=!inp.value;err.hidden=true;show()});
 inp.addEventListener('focus',()=>{inp.select();show()});
 inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();if(ul.hidden)show();else{act=Math.min(act+1,items.length-1);mark()}}else if(e.key==='ArrowUp'){e.preventDefault();act=Math.max(act-1,0);mark()}else if(e.key==='Enter'&&!ul.hidden&&items[act]){e.preventDefault();pick(items[act])}else if(e.key==='Escape')close()});
 ul.addEventListener('mousedown',e=>{const li=e.target.closest('li[data-i]');if(li){e.preventDefault();pick(items[+li.dataset.i])}});
 inp.addEventListener('blur',()=>setTimeout(()=>{close();if(inp.value&&!S.q[role]){err.textContent='Choose a location from the list.';err.hidden=false}},120));
 clr.onclick=()=>{S.q[role]=null;inp.value='';clr.hidden=true;err.hidden=true;inp.focus()}}
