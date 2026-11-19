'use strict';
/* BOOKING FARES: promo codes (PROMOS), booking step names and the fare breakdown (fees).
   Seat charges and the Tatkal charge come from scripts/transport/<type>/<type>-booking.js */
const PROMOS={YATRI10:{t:'10% off (max ₹300)',calc:b=>Math.min(Math.round(b*.1),300)},WELCOME200:{t:'Flat ₹200 off',calc:()=>200},FLY15:{t:'15% off flights (max ₹500)',calc:(b,m)=>m==='flight'?Math.min(Math.round(b*.15),500):0}};
const fees=(base,promo)=>{const B=S.bk,n=B.pax.length,conv=49*n,T=TRANSPORT[B.trip.mode],seat=T.seatPlan.fee*B.seats.length,tk=T.extraCharge(B),gst=Math.round((base+tk+seat+conv)*.05),disc=promo?promo.calc(base,B.trip.mode):0;return{base,tk,seat,conv,gst,disc,total:base+tk+seat+conv+gst-disc}};
const STEPS=['Select Journey','Passenger Details','Select Seats','Review & Pay','Confirm'];
