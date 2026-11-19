'use strict';
/* ROUTER. go(view) changes the page, render() draws it. Add a new page by adding it to the list in render(). */
function go(v,a){S.view=v;S.arg=a;location.hash=v;render()}
function render(){window.scrollTo(0,0);const v=S.view;$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));$('#nav').classList.remove('open');$('#notif').hidden=true;
 ({home:home,search:search,book:book,bookings:bookings,ticket:ticket,profile:profile,support:support,faq:faqV}[v]||info)()}
