'use strict';
/* FLIGHT BOOKING rules: domestic (photo ID, optional DigiYatra) vs international (passport required), seat map and seat charge. */
const fresh=(m,l)=>YP.get(m,l.id)||l;
Object.assign(TRANSPORT.flight,{
 idList:['Aadhaar (e-Aadhaar / m-Aadhaar)','Passport','Driving licence','Voter ID','PAN card','Other government photo ID'],
 identityNote:X=>X.k==='flight-intl'?'International flight: a valid passport is required. A visa or entry permit depends on your destination. Aadhaar cannot replace a passport.':'Domestic flight: carry a valid government photo ID, such as Aadhaar, passport, driving licence, voter ID or PAN. Aadhaar authentication is not required to book.',
 identityRules(B){const t=B.trip,l=t.loc||{},fa=l.from&&fresh('flight',l.from),fb=l.to&&fresh('flight',l.to),intl=!!(fa&&fb&&(fa.country!=='India'||fb.country!=='India'));
  return{k:intl?'flight-intl':'flight',intl,acct:'',tatkalOK:false,opening:false}},
 quotaBlock:(B,X)=>'',
 identityExtra:(B,X)=>X.k==='flight'?`<label><input type="checkbox" id="dg" ${B.digi?'checked':''}> I would like to use DigiYatra at supported airports (optional)</label>`:'',
 passengerIdFields(p,i,X){return X.k==='flight-intl'?`<div class="row"><div class="f"><label>Passport number</label><input data-i="${i}" data-k="passport" value="${esc(p.passport)}"></div><div class="f"><label>Nationality</label><input data-i="${i}" data-k="nat" value="${esc(p.nat)}"></div><div class="f"><label>Passport expiry</label><input type="date" data-i="${i}" data-k="pexp" value="${esc(p.pexp)}"></div></div><div class="f"><label>Visa or entry permit, if required (optional)</label><input data-i="${i}" data-k="visa" value="${esc(p.visa)}"></div>`:idSelectHtml(p,i,this.idList)},
 seatPlan:{rows:10,cols:6,fee:250,seatId:(r,l)=>r+l},
 extraCharge:B=>0,
 reviewNote:B=>'',
 bookingQuota:B=>''
});
