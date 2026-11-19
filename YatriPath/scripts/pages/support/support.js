'use strict';
/* SUPPORT page (contact form + FAQ). This is an existing frontend-only form; it is kept separate so it is easy to change or remove later. */
const FAQ = [['How do I book a trip?', 'Search a route, select a trip, add passengers, pick seats, review the fare and confirm the demo booking.'], ['Is payment real?', 'No. Demo Mode – payment processing is not available in this academic prototype.'], ['Can I cancel or reschedule?', 'Yes. Open My Bookings and choose Cancel or Reschedule on an upcoming journey. Charges are shown before you confirm.'], ['How do I save a route?', 'On the results page choose Save this route. Manage saved routes in Profile.']];
function faqHtml() { return FAQ.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('') }
function support() {
  $('#app').innerHTML = `<div class="wrap"><div class="two"><section class="card pad"><h2>Customer Support</h2><form id="sp" novalidate><div class="f"><label for="sj">Subject</label><input id="sj"></div><div class="f"><label for="sr">Booking reference (optional)</label><input id="sr" placeholder="e.g. YP7K2A9"></div><div class="f"><label for="sd">Describe the problem</label><textarea id="sd" rows="5"></textarea></div><button class="btn">Submit</button></form><div id="ack"></div></section><aside class="card pad"><h3>Contact</h3><p>support@yatripath.example<br>+91 89104 66345 <br>Kolkata, West Bengal</p></aside></div><section class="sec"><h2>Frequently asked questions</h2>${faqHtml()}</section></div>`;
  $('#sp').onsubmit = e => {
    e.preventDefault(); const a = $('#sj'), d = $('#sd'); a.classList.toggle('bad', !a.value.trim()); d.classList.toggle('bad', d.value.trim().length < 10); if (!a.value.trim() || d.value.trim().length < 10) return toast('Add a subject and a description (10+ characters).', 'er');
    const n = 'YPT-' + Math.floor(10000 + Math.random() * 89999); ls.s('tickets', [...ls.g('tickets', []), { n, s: a.value }]); $('#ack').innerHTML = `<p class="note ok"><b>Ticket ${n} received.</b></p>`; e.target.reset(); toast('Support ticket submitted.', 'ok')
  }
}
function faqV() { $('#app').innerHTML = `<div class="wrap"><h2>FAQ</h2>${faqHtml()}</div>` }
