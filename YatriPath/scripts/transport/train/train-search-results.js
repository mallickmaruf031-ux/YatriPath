'use strict';
/* TRAIN: what a train result card shows (class buttons with fares), the Class filter and the international rail panel. */
Object.assign(TRANSPORT.train,{
 categoryLabel:'Class',
 filterOptions:items=>[...new Set(items.flatMap(i=>(i.classes||[]).map(c=>c.code)))],
 matchesCategory:(it,cat)=>(it.classes||[]).some(c=>c.code===cat),
 cardTags:it=>'',
 cardDetails:it=>[],
 cardExtras:(it,n)=>`<div class="clsrow">${it.classes.map(c=>`<button class="clsb" data-pk="${n}:${c.code}"><b>${c.code}</b><small>${c.name}</small><span>${inr(c.fare)}</span></button>`).join('')}</div>`,
 pricePrefix:'from ',
 selectButton:n=>'',          /* trains are selected through the class buttons */
 extraInfoPanel:()=>`<details class="irs"><summary>International rail services from India (information only)</summary>${intlPanel()}</details>`
});
