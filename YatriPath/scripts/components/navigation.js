'use strict';
/* NAVIGATION and global page events: menu links ([data-v]), Login/Sign Up buttons, mobile menu,
   notification bell, closing popups, browser back/forward (hashchange). */
document.addEventListener('click',e=>{const a=e.target.closest('[data-v]');if(a){e.preventDefault();go(a.dataset.v)}const u=e.target.closest('[data-au]');if(u){e.preventDefault();auth(u.dataset.au)}});
$('#loginBtn').onclick=()=>auth('login');$('#signBtn').onclick=()=>auth('signup');
$('#burger').onclick=e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
$('#bell').innerHTML=ic('bell')+'<i></i>';$('#bell').onclick=()=>{const n=$('#notif');n.innerHTML='<b>Notifications</b>'+NOTIFS.map(x=>`<p>${x}</p>`).join('');n.hidden=!n.hidden};
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('.mclose'))closeM()});
$('.mclose').onclick=e=>{e.stopPropagation();closeM()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&v!==S.view&&(v in INFO||['home','search','bookings','profile','support','faq'].includes(v))){S.view=v;render()}});
