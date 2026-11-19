'use strict';
/* START-UP. Runs last: opens the page that matches the address (#home, #search, ...). */
(()=>{const v=location.hash.slice(1);S.view=(v in INFO||['home','search','bookings','profile','support','faq'].includes(v))?v:'home';render()})();
