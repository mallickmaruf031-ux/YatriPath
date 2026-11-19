'use strict';
/* BUS BOOKING rules: identity (operator may check ID; Aadhaar not required), seat map and charges. */
Object.assign(TRANSPORT.bus,{
 idList:['Aadhaar (e-Aadhaar / m-Aadhaar)','Driving licence','Voter ID','Passport','PAN card','Other government photo ID'],
 identityNote:X=>'The bus operator may ask for a photo ID at boarding. Aadhaar authentication is not required.',
 identityRules:B=>({k:'bus',intl:false,acct:'',tatkalOK:false,opening:false}),
 quotaBlock:(B,X)=>'',
 identityExtra:(B,X)=>'',
 passengerIdFields(p,i,X){return idSelectHtml(p,i,this.idList)},
 seatPlan:{rows:9,cols:4,fee:0,seatId:(r,l)=>l+r},
 extraCharge:B=>0,
 reviewNote:B=>'',
 bookingQuota:B=>''
});
