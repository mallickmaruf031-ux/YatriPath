'use strict';
/* APP STATE. S (current search, filters, booking in progress), sample notifications,
   sample bookings (SEED) and the localStorage readers for bookings, profile and co-passengers. */
const S={rf:{sort:'fare',stp:'',slot:'',cat:''},q:{from:null,to:null,date:'',mode:'flight',pax:1,ret:'',cabin:'Economy'},f:{modes:['flight'],sort:'price',slot:'',max:300000},bk:null,view:'home',arg:null};
S.q.date=day(1);
const NOTIFS=['Welcome to YatriPath! Explore routes across India.','Promo YATRI10 is active.','Your booking YP7K2A9 departs soon.'];
const SEED=[{ref:'YP7K2A9',mode:'train',prov:'Rajdhani Express',from:'Kolkata',to:'Delhi',date:day(6),dep:1005,dur:1020,fare:2450,pax:[{name:'Traveller',age:30,gender:'Male'}],seats:['B2'],status:'Upcoming'},
 {ref:'YP3M8Q1',mode:'flight',prov:'IndiGo',from:'Mumbai',to:'Bengaluru',date:day(-20),dep:480,dur:105,fare:3890,pax:[{name:'Traveller',age:30,gender:'Male'}],seats:['12C'],status:'Completed'},
 {ref:'YP9X4L6',mode:'bus',prov:'Orange Tours',from:'Siliguri',to:'Kolkata',date:day(-5),dep:1260,dur:690,fare:1150,pax:[{name:'Traveller',age:30,gender:'Male'}],seats:['A4'],status:'Cancelled'}];
const getB=()=>ls.g('bookings',null)||(ls.s('bookings',SEED),SEED);
const prof=()=>ls.g('profile',{name:'Traveller',email:'traveller@example.com',phone:'9800000000',city:'Kolkata',dob:'1996-05-12'});
const cops=()=>ls.g('cops',[{name:'Riya Sen',age:28,gender:'Female'},{name:'Amit Das',age:55,gender:'Male'}]);
