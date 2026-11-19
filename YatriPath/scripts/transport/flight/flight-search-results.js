'use strict';
/* FLIGHT: what a flight result card shows (cabin and baggage). Flights have no extra filter. */
Object.assign(TRANSPORT.flight,{
 categoryLabel:'Class',
 filterOptions:items=>[],
 matchesCategory:(it,cat)=>it.cls===cat,
 cardTags:it=>'',
 cardDetails:it=>[`${it.cls} · ${it.bag}`],
 cardExtras:(it,n)=>'',
 pricePrefix:'',
 selectButton:n=>`<button class="btn sm" data-pk="${n}">Select</button>`,
 extraInfoPanel:()=>''
});
