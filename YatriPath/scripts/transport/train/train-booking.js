'use strict';
/* TRAIN BOOKING rules: quota (General / Tatkal), IRCTC Aadhaar-authenticated account requirement (self-declaration only,
   YatriPath never authenticates Aadhaar), identity list, seat map, Tatkal charge. */
const ARP=60; /* IRCTC advance reservation period in days. Rules change: verify against current IRCTC notices. */
Object.assign(TRANSPORT.train,{
 idList:['Aadhaar (e-Aadhaar / m-Aadhaar)','Driving licence','Voter ID','Passport','PAN card','Student photo ID','Government employee photo ID','Other photo ID accepted by Indian Railways'],
 identityNote:X=>'Carry one original photo ID while travelling; the accepted list is set by Indian Railways. Aadhaar authentication of every passenger is not required.',
 identityRules(B){const t=B.trip,tatkalOK=t.date===day(1),opening=t.date===day(ARP);let acct='';
  if(B.quota==='Tatkal')acct='Online Tatkal booking on IRCTC requires an Aadhaar-authenticated IRCTC account.';else if(opening)acct='On the opening day of the advance reservation period, IRCTC limits online general reserved booking to Aadhaar-authenticated accounts (8:00 to midnight, as announced for 12 January 2026 onwards).';
  return{k:'train',intl:false,acct,tatkalOK,opening}},
 quotaBlock:(B,X)=>`<div class="idbox"><b>Booking quota</b><label><input type="radio" name="qt" value="General" ${B.quota==='General'?'checked':''}> General</label><label><input type="radio" name="qt" value="Tatkal" ${B.quota==='Tatkal'?'checked':''} ${X.tatkalOK?'':'disabled'}> Tatkal (+15% sample charge)</label>${X.tatkalOK?'':'<small>Tatkal is available only when travelling tomorrow.</small>'}</div>`,
 identityExtra:(B,X)=>'',
 passengerIdFields(p,i,X){return idSelectHtml(p,i,this.idList)},
 seatPlan:{rows:9,cols:4,fee:0,seatId:(r,l)=>l+r},
 extraCharge:B=>B.quota==='Tatkal'?Math.round(B.trip.fare*.15)*B.pax.length:0,
 reviewNote:B=>' · '+B.quota+' quota',
 bookingQuota:B=>B.quota
});
