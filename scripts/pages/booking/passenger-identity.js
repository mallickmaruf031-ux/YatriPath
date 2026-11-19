'use strict';
/* PASSENGER IDENTITY helpers shared by all transport types: blank passenger (newPax), the ID drop-down (idSelectHtml)
   and idCtx() which asks the chosen transport type for its identity rules. No Aadhaar number or OTP is ever collected. */
const newPax=()=>({name:'',age:'',gender:'',phone:'',email:'',idt:'',passport:'',nat:'Indian',pexp:'',visa:''});
const idSelectHtml=(p,i,list)=>`<div class="f"><label>Photo ID you will carry (optional)</label><select data-i="${i}" data-k="idt"><option value="">Select</option>${list.map(g=>`<option ${g===p.idt?'selected':''}>${g}</option>`).join('')}</select></div>`;
const idCtx=B=>TRANSPORT[B.trip.mode].identityRules(B);
