'use strict';
/* SEARCH RESULTS PAGE (same for all transport types). Gets live + verified + sample results, then sorts and filters them.
   Transport-specific parts of each card come from TRANSPORT[type] in scripts/transport/<type>/<type>-search-results.js */
async function search() {
   const q = S.q;
   if (!q.from || !q.to) return $('#app').innerHTML = `<div class="wrap"><div class="empty"><h2>Start a search</h2><p>Select a source and destination to see results.</p><button class="btn" data-v="home">Go to search</button></div></div>`;
   $('#app').innerHTML = '<div class="spin" role="status" aria-label="Loading"></div>';
   let R, SM; try { R = await YP.search(q); SM = R.live.length ? { items: [] } : await YP.sample(q) } catch (e) { return $('#app').innerHTML = `<div class="wrap"><div class="empty"><h2>We couldn't load results</h2><p>Keep the data folder next to index.html and reload the page.</p><button class="btn" data-v="home">Back to search</button></div></div>` }
   const m = R.m, a = q.from.id, b = q.to.id, D = R.db, N = q.pax, items = SM.items, F = S.rf; F.cat = F.cat || '';
   const T = TRANSPORT[m], cats = T.filterOptions(items); if (F.cat && !cats.includes(F.cat)) F.cat = '';
   const tm = (i) => { const h = i.dep / 60; return h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3 };
   const sources = ((YP.meta || {}).sources || []).filter(s => OFFRE[m] && OFFRE[m].test(s.name));
   const how = `<details class="card pad how"><summary>How these results were found</summary><ul><li class="${R.live.length ? 'y' : 'n'}"><span>${R.live.length ? '✓' : '–'}</span>Live providers: ${R.prov.configured ? `${R.live.length} result(s)` + (R.prov.failed.length ? `, no response from ${esc(R.prov.failed.join(', '))}` : '') : 'none connected'}</li><li class="${D.length ? 'y' : 'n'}"><span>${D.length ? '✓' : '–'}</span>Verified database routes: ${D.length}</li><li class="${items.length ? 'y' : 'n'}"><span>${items.length ? '✓' : '–'}</span>Sample itineraries: ${items.length}${SM.est ? ' (distance estimated)' : ''}</li></ul>${sources.length ? `<p class="sub">Official sources: ${sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(' · ')}</p>` : ''}</details>`;
   $('#app').innerHTML = `<div class="wrap"><div class="ph" style="height:110px;border-radius:16px;margin-bottom:16px;background-image:${pic(MPIC[m], 1, 1400, 300)}"></div><h2>${esc(q.from.short)} → ${esc(q.to.short)} <small style="font-weight:400;color:var(--mu)">${fdate(q.date)} · ${N} passenger(s)${SM.items.length ? ` · about ${SM.dist} km` : ''}</small></h2>
 ${R.live.length ? `<h3>Live results</h3>${R.live.map(x => liveCard(R, x, q)).join('')}` : ''}
 ${D.length ? D.map(x => routeCard(m, x.r, x.rev, '')).join('') : ''}
 ${R.connecting.length && !D.length ? `<h3>Verified connecting routes</h3>${R.connecting.slice(0, 2).map(([l1, l2]) => `<div class="conn"><span class="tag warn">Change at ${esc(l1.to.name)}, ${esc(l1.to.city)}</span>${routeCard(m, l1.r, l1.from.id !== l1.r.f)}${routeCard(m, l2.r, l2.from.id !== l2.r.f)}</div>`).join('')}` : ''}
 ${items.length ? `<div class="rhead"><div><h3 style="margin:0">${R.live.length ? '' : 'Available routes'}</h3>${R.live.length ? '' : '<p class="sub" style="margin:4px 0 0">No confirmed timetable for this route yet. Times and fares shown are indicative estimates.</p>'}</div>
 <div class="rctl"><label>Sort <select id="sort"><option value="fare">Lowest fare</option><option value="dur">Shortest duration</option><option value="dep">Departure time</option></select></label><label>Stops <select id="stp"><option value="">All</option><option value="0">Direct</option><option value="1">Connecting</option></select></label><label>Departure <select id="slot"><option value="">Any</option><option value="0">Before 6 AM</option><option value="1">6 AM – 12 PM</option><option value="2">12 – 6 PM</option><option value="3">After 6 PM</option></select></label>${cats.length ? `<label>${T.categoryLabel} <select id="cat"><option value="">All</option>${cats.map(c => `<option>${c}</option>`).join('')}</select></label>` : ''}</div></div><div id="list" aria-live="polite"></div>` : `<div class="empty"><h3>No itineraries could be built for these two locations</h3><p>Try a different pair.</p></div>`}
 <section class="sec" style="margin-top:26px"><h3>About these locations</h3><div class="grid2">${locInfo(m, q.from)}${locInfo(m, q.to)}</div></section>
 ${T.extraInfoPanel()}
 <div style="margin-top:18px">${how}</div><p style="margin-top:20px"><button class="btn ghost sm" id="sv">Save this route</button> <button class="btn ghost sm" data-v="home">New search</button></p></div>`;
   $('#sv').onclick = () => { const s = ls.g('saved2', []); if (s.some(x => x.mode === m && x.from.id === a && x.to.id === b)) return toast('Route already saved.'); s.push({ mode: m, from: q.from, to: q.to }); ls.s('saved2', s); toast('Route saved to your profile.', 'ok') };
   if (!items.length) return;
   const mkTrip = (it, cl) => ({ id: it.id, mode: m, prov: it.operator, from: q.from.short, to: q.to.short, date: q.date, dep: it.dep, dur: it.durMin, cls: cl ? cl.name : it.cls, fare: cl ? cl.fare : it.fare, seats: 6 + hash(it.id) % 34, src: it.src, via: it.via ? `${it.via.name} (${it.via.city})` : '', kind: it.kind, loc: { from: q.from, to: q.to }, seat: it.seat || '', bag: it.bag || '' });
   const draw = () => {
      let r = items.filter(i => (F.stp === '' || F.stp === undefined || String(i.stops) === F.stp) && (F.slot === '' || F.slot === undefined || tm(i) === +F.slot) && (!F.cat || T.matchesCategory(i, F.cat)));
      const k = { fare: i => i.fare, dur: i => i.durMin, dep: i => i.dep }[F.sort || 'fare']; r.sort((x, y) => k(x) - k(y));
      $('#list').innerHTML = r.length ? r.map((it, n) => `<article class="card res2"><div class="rmain"><div class="rtop"><b class="prov">${esc(it.operator)}</b><span class="tag">${it.kind === 'direct' ? 'Direct' : '1 change'}</span>${T.cardTags(it)}</div>
   <div class="tm"><div><b>${tf(it.dep)}</b><small>${esc(q.from.city)}</small></div><span class="l"><small>${df(it.durMin)}</small></span><div><b>${tf(it.arr)}</b><small>${esc(q.to.city)}</small></div></div>
   <small class="mut">${[it.via ? `Via ${esc(it.via.name)}, ${esc(it.via.city)} · layover ${df(it.layover)}` : '', ...T.cardDetails(it)].filter(Boolean).join(' · ')}</small>
   ${T.cardExtras(it, n)}</div>
   <div class="rside"><div class="price">${T.pricePrefix}${inr(it.fare)}<small>/person</small></div>${T.selectButton(n)}</div></article>`).join('') : '<div class="empty"><h3>No results match these filters</h3></div>';
      bind('[data-pk]', 'click', e => { const [n, c] = e.currentTarget.dataset.pk.split(':'), it = r[+n]; startBook(mkTrip(it, c ? it.classes.find(x => x.code === c) : null)) })
   };
   ['sort', 'stp', 'slot', 'cat'].forEach(id => { const el = $('#' + id); if (!el) return; const key = { sort: 'sort', stp: 'stp', slot: 'slot', cat: 'cat' }[id]; el.value = F[key] || ''; el.onchange = e => { F[key] = e.target.value; draw() } }); draw()
}
