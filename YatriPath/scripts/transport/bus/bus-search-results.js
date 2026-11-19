'use strict';
/* BUS: what a bus result card shows (category tag, seat type, boarding and dropping points) and the Category filter. */
Object.assign(TRANSPORT.bus,{
 categoryLabel:'Category',
 filterOptions:items=>[...new Set(items.map(i=>i.cls))],
 matchesCategory:(it,cat)=>it.cls===cat,
 cardTags:it=>`<span class="tag">${it.cls}</span>`,
 cardDetails:it=>[`${it.seat} · Board: ${esc(it.board)} · Drop: ${esc(it.drop)}`],
 cardExtras:(it,n)=>'',
 pricePrefix:'',
 selectButton:n=>`<button class="btn sm" data-pk="${n}">Select</button>`,
 extraInfoPanel:()=>''
});
