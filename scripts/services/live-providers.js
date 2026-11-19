'use strict';
/* LIVE PROVIDERS (none connected yet).
   Add an authorised flight, train or bus provider here and its results appear on the search page as "Live result"
   with the provider's own price. Nothing is shown as live unless a provider returns it.

   window.YP_PROVIDERS.push({
     name: 'Provider name',
     modes: ['flight'],                      // 'flight' | 'train' | 'bus'
     async search({mode, from, to, date, pax, cabin}) {
       // call the provider's API (keys must stay on a server, never in this file), then return:
       return [{ operator:'', number:'', dep:'10:30', arr:'13:05', durationMin:155, stops:0,
                 classes:['Economy'], price:{amount:5400, currency:'INR', updated:'11:42'},
                 availability:'', bookUrl:'https://...', fromName:'', toName:'' }];
     }
   });
*/
window.YP_PROVIDERS=window.YP_PROVIDERS||[];
