#!/usr/bin/env python3
"""YatriPath transport-data importer (reusable, idempotent).

Usage:  python3 tools/import_data.py [--input data_in] [--out data]

Reads the CSV files (and cross-checks the .xlsx workbook) in --input, validates and
de-duplicates them, rebuilds the SQLite database data/yatripath.db (tables + indexes),
and writes browser-ready data files data/{meta,rail,air,bus,routes}.js plus
data/import_report.json. Re-running with the same input gives the same result.

Optional extra route files (same folder) switch on direct train / flight results:
  train_routes.csv : train_no,train_name,src_station_code,dst_station_code,dep_time,arr_time,runs_on,distance_km
  flight_routes.csv: origin_iata,dest_iata,airline_iata,is_direct,stops,status,valid_from,valid_to,source_ref
Rows whose codes are not in the imported station/airport tables are rejected and counted.
Nothing is invented: a route exists only if it is in a source file.
"""
import argparse, csv, json, os, re, sqlite3, unicodedata, datetime, collections, glob

ap = argparse.ArgumentParser(); ap.add_argument('--input', default='data_in'); ap.add_argument('--out', default='data')
A = ap.parse_args(); IN, OUT = A.input, A.out; os.makedirs(OUT, exist_ok=True)

def rd(name, required=True):
    p = os.path.join(IN, name)
    if not os.path.exists(p):
        if required: raise SystemExit('missing ' + p)
        return []
    with open(p, encoding='utf-8-sig', newline='') as f:
        return [{k.strip(): (v or '').strip() for k, v in r.items()} for r in csv.DictReader(f)]
def slug(s): return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')

rep = collections.OrderedDict(); issues = []
def issue(kind, detail): issues.append({'type': kind, 'detail': detail})

# ---------- read sources ----------
S = {n: rd(n + '.csv') for n in ['states_ut', 'railway_stations', 'airports_india', 'intl_dest_airports', 'bus_stations', 'bus_routes', 'intl_railway_services', 'airlines', 'train_services', 'ticket_classes']}
for n, r in S.items(): rep['source_rows_' + n] = len(r)

# ---------- cross-check workbook (all sheets, visible or hidden) ----------
xl = [f for f in glob.glob(os.path.join(IN, '*.xlsx'))]
SHEETMAP = {'States_UTs': 'states_ut', 'Bus_Terminals': 'bus_stations', 'Bus_Routes': 'bus_routes', 'Railway_Stations': 'railway_stations', 'Train_Services': 'train_services', 'Ticket_Classes': 'ticket_classes', 'Intl_Trains': 'intl_railway_services', 'Indian_Airports': 'airports_india', 'Intl_Dest_Airports': 'intl_dest_airports', 'Airlines': 'airlines'}
sources_rows = []; xl_report = {}
if xl:
    try:
        import openpyxl
        wb = openpyxl.load_workbook(xl[0], read_only=False)
        for ws in wb.worksheets:
            rows = [[('' if c is None else str(c).strip()) for c in r] for r in ws.iter_rows(values_only=True)]
            info = {'state': ws.sheet_state, 'rows': max(len(rows) - 1, 0)}
            if ws.title in SHEETMAP:
                csvr = S[SHEETMAP[ws.title]]; cols = list(csvr[0].keys()) if csvr else []
                same = rows[1:] == [[r[c] for c in cols] for r in csvr]
                info['matches_csv'] = same
                if not same: issue('workbook_differs_from_csv', ws.title)
            if ws.title == 'Sources': sources_rows = rows[1:]
            xl_report[ws.title] = info
    except Exception as e:
        issue('workbook_unreadable', str(e))
rep['workbook_sheets'] = xl_report

# ---------- states / countries / cities ----------
ISO = {'India': 'IN', 'United Arab Emirates': 'AE', 'Saudi Arabia': 'SA', 'Qatar': 'QA', 'Oman': 'OM', 'Kuwait': 'KW', 'Bahrain': 'BH', 'Singapore': 'SG', 'Thailand': 'TH', 'Malaysia': 'MY', 'Indonesia': 'ID', 'Vietnam': 'VN', 'Myanmar': 'MM', 'Sri Lanka': 'LK', 'Maldives': 'MV', 'Nepal': 'NP', 'Bhutan': 'BT', 'Bangladesh': 'BD', 'Hong Kong SAR': 'HK', 'China': 'CN', 'Japan': 'JP', 'South Korea': 'KR', 'United Kingdom': 'GB', 'France': 'FR', 'Germany': 'DE', 'Netherlands': 'NL', 'Italy': 'IT', 'Switzerland': 'CH', 'Denmark': 'DK', 'Turkey': 'TR', 'Uzbekistan': 'UZ', 'Kazakhstan': 'KZ', 'United States': 'US', 'Canada': 'CA', 'Ethiopia': 'ET', 'Kenya': 'KE', 'South Africa': 'ZA', 'Egypt': 'EG', 'Mauritius': 'MU', 'Australia': 'AU', 'Pakistan': 'PK'}
REGION = {'AE': 'Middle East', 'SA': 'Middle East', 'QA': 'Middle East', 'OM': 'Middle East', 'KW': 'Middle East', 'BH': 'Middle East', 'IN': 'South Asia', 'LK': 'South Asia', 'MV': 'South Asia', 'NP': 'South Asia', 'BT': 'South Asia', 'BD': 'South Asia', 'PK': 'South Asia', 'SG': 'Southeast Asia', 'TH': 'Southeast Asia', 'MY': 'Southeast Asia', 'ID': 'Southeast Asia', 'VN': 'Southeast Asia', 'MM': 'Southeast Asia', 'HK': 'East Asia', 'CN': 'East Asia', 'JP': 'East Asia', 'KR': 'East Asia', 'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'NL': 'Europe', 'IT': 'Europe', 'CH': 'Europe', 'DK': 'Europe', 'TR': 'Europe', 'UZ': 'Central Asia', 'KZ': 'Central Asia', 'US': 'North America', 'CA': 'North America', 'ET': 'Africa', 'KE': 'Africa', 'ZA': 'Africa', 'EG': 'Africa', 'MU': 'Africa', 'AU': 'Oceania'}
countries = {}
def country(name):
    if name not in ISO: issue('country_without_iso_code', name); return None
    cc = ISO[name]; countries[cc] = (cc, name, REGION.get(cc, '')); return cc
country('India')
states = {r['state_name']: r for r in S['states_ut']}
cities = {}
def city(name, state_name=None, cc='IN'):
    sc = states[state_name]['state_code'] if state_name in states else None
    if cc == 'IN' and state_name and state_name not in states: issue('unknown_state', state_name)
    cid = '%s-%s-%s' % (cc, sc or '', slug(name)); cities.setdefault(cid, (cid, name, sc, cc)); return cid, sc

# ---------- railway stations ----------
rail = {}
for r in S['railway_stations']:
    code = r['station_code'].upper()
    if not code or not r['station_name']: issue('rail_missing_field', r); continue
    if code in rail: issue('rail_duplicate_code', code); continue
    cid, sc = city(r['city'], r['state_ut']); rail[code] = dict(code=code, name=r['station_name'], city_id=cid, city=r['city'], state_code=sc, state=r['state_ut'], zone=r['zone'], division=r['division'], role=r['role'])
    if '(verify' in (r['division'] + r['zone']).lower() or not r['division']: issue('rail_division_unverified_or_blank', code)
# ---------- airports ----------
air = {}
for r in S['airports_india']:
    i = r['iata'].upper()
    if i in air: issue('airport_duplicate_iata', i); continue
    cid, sc = city(r['city'], r['state_ut']); icao = '' if r['icao'] in ('', '-') else r['icao']
    if not icao: issue('airport_missing_icao', i)
    air[i] = dict(iata=i, icao=icao, name=r['airport_name'], city_id=cid, city=r['city'], state_code=sc, state=r['state_ut'], country_code='IN', country='India', category=r['category'], status=r['status'], scope='IN', confidence=r['confidence'])
for r in S['intl_dest_airports']:
    i = r['iata'].upper()
    if i in air: issue('airport_duplicate_iata', i); continue
    cc = country(r['country']);
    if not cc: continue
    cid, _ = city(r['city'], None, cc)
    air[i] = dict(iata=i, icao='', name=r['airport_name'], city_id=cid, city=r['city'], state_code=None, state='', country_code=cc, country=r['country'], category='INTL', status='Destination reference (verify live)', scope='INTL', confidence='C')
# ---------- bus terminals ----------
bus = {}
for r in S['bus_stations']:
    cid, sc = city(r['city'], r['state']); bid = 'BS-%s-%s' % (slug(r['city']), slug(r['terminal_name'])[:28])
    if bid in bus: issue('bus_duplicate', bid); continue
    bus[bid] = dict(id=bid, name=r['terminal_name'], city_id=cid, city=r['city'], state_code=sc, state=r['state'], category=r['category'], area=r['area'], notes=r['notes'], kind='terminal', confidence=r['confidence'], source='bus_stations.csv')
# ---------- bus routes: resolve terminal names to records (never invent) ----------
STOP = {'bus', 'station', 'terminus', 'terminal', 'stand', 'depot', 'st', 'central', 'operator', 'specific', 'area', 'city'}
def toks(s): return set(re.sub(r'[^a-z0-9 ]', ' ', s.lower()).split()) - STOP
def resolve(city_name, text):
    cand = [b for b in bus.values() if b['city'] == city_name]
    m = re.findall(r'\(([A-Z]{3,6})\)', ' '.join(b['name'] for b in cand))
    for b in cand:
        if slug(b['name']) == slug(text): return b['id']
    for b in cand:  # acronym match e.g. MGBS / CMBT
        ab = re.findall(r'\(([A-Z]{3,6})\)', b['name'])
        if any(a in text.split() or a == text for a in ab): return b['id']
    best, bs = None, 0
    for b in cand:
        a, c = toks(text), toks(b['name']); 
        if not a or not c: continue
        sc = len(a & c) / min(len(a), len(c))
        if sc > bs: best, bs = b, sc
    return best['id'] if best and bs >= 0.99 else None
def km(s):
    n = [int(x) for x in re.findall(r'\d+', s)]; return (n[0], n[-1]) if n else (None, None)
broutes = []; unresolved = []
for r in S['bus_routes']:
    ends = []
    for side in ('source', 'dest'):
        cname, text = r[side + '_city'], r[side + '_terminal']
        sid = resolve(cname, text)
        if not sid:  # terminal only named in the route file -> boarding point record (operator-specific, not permanent)
            st = next((b['state'] for b in list(bus.values()) + [dict(city=x['city'], state=x['state']) for x in list(rail.values()) + list(air.values())] if b['city'] == cname or cname in b['city']), None)
            cid, sc = city(cname, st); sid = 'BP-%s-%s' % (slug(cname), slug(text)[:28])
            clean = re.sub(r'\s*\(operator-specific\)', '', text)
            bus[sid] = dict(id=sid, name=clean, city_id=cid, city=cname, state_code=sc, state=st or '', category='Boarding point', area='', notes='Named only in bus_routes.csv; operator-specific, not a permanent terminal', kind='boarding', confidence=r['confidence'], source='bus_routes.csv')
            unresolved.append(text)
        ends.append(sid)
    lo, hi = km(r['approx_km']); key = (ends[0], ends[1])
    if ends[0] == ends[1]: issue('bus_route_same_endpoints', r); continue
    if any(x['f'] == key[0] and x['t'] == key[1] for x in broutes): issue('bus_route_duplicate', key); continue
    broutes.append(dict(id='BR-%d' % (len(broutes) + 1), f=ends[0], t=ends[1], fc=r['source_city'], tc=r['dest_city'], km=[lo, hi], cats=r['typical_categories'], conf=r['confidence']))
# ---------- optional route files ----------
rroutes, froutes, bad_rr, bad_fr = [], [], 0, 0
for r in rd('train_routes.csv', False):
    if r.get('src_station_code') in rail and r.get('dst_station_code') in rail and r['src_station_code'] != r['dst_station_code']:
        rroutes.append(dict(id='RR-%d' % (len(rroutes) + 1), train_no=r.get('train_no', ''), name=r.get('train_name', ''), f=r['src_station_code'], t=r['dst_station_code'], dep=r.get('dep_time', ''), arr=r.get('arr_time', ''), runs=r.get('runs_on', ''), km=r.get('distance_km', '')))
    else: bad_rr += 1
for r in rd('flight_routes.csv', False):
    if r.get('origin_iata') in air and r.get('dest_iata') in air and r['origin_iata'] != r['dest_iata']:
        froutes.append(dict(id='FR-%d' % (len(froutes) + 1), f=r['origin_iata'], t=r['dest_iata'], airline=r.get('airline_iata', ''), direct=r.get('is_direct', ''), stops=r.get('stops', ''), status=r.get('status', ''), vf=r.get('valid_from', ''), vt=r.get('valid_to', '')))
    else: bad_fr += 1
# ---------- optional reference fares (indicative only; never presented as booking prices) ----------
# fare_reference.csv: mode,src_id,dst_id,fare_min,fare_max,currency,class,source,as_of   (mode = flight|train|bus; ids = IATA / station code / bus id)
fares, bad_fare = [], 0
IDS = {'flight': set(air), 'train': set(rail), 'bus': set(bus)}
for r in rd('fare_reference.csv', False):
    try:
        lo = float(r['fare_min']); hi = float(r.get('fare_max') or lo)
        ok = r['mode'] in IDS and r['src_id'] in IDS[r['mode']] and r['dst_id'] in IDS[r['mode']] and r['src_id'] != r['dst_id'] and 0 < lo <= hi and r.get('source')
    except Exception: ok = False
    if ok: fares.append(dict(m=r['mode'], f=r['src_id'], t=r['dst_id'], lo=lo, hi=hi, cur=r.get('currency') or 'INR', cls=r.get('class', ''), src=r['source'], asof=r.get('as_of', '')))
    else: bad_fare += 1
# ---------- intl rail services ----------
irs = []
for r in S['intl_railway_services']:
    m = re.search(r'\b([A-Z]{2,5})\s*$', r['india_station']); code = m.group(1) if m else ''
    irs.append(dict(name=r['train_name'], train_no=r['train_no'], india_station=r['india_station'], in_code=code if code in rail else '', border=r['border_station'], foreign=r['foreign_station'], country=r['country'], route=r['route'], detail=r['status_detail'], bookable=r['bookable'], source=r['official_source'], status=r['status'], verified=r['verified']))
    country(r['country'])
for a in S['airlines']: country(a['country'])

# ---------- approximate coordinates (optional geo_reference.csv: level,name,lat,lon) ----------
def nrm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]+', ' ', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())).strip()
geo_c, geo_s = {}, {}
for r in rd('geo_reference.csv', False):
    try: (geo_c if r['level'] == 'city' else geo_s)[nrm(r['name']) if r['level'] == 'city' else r['name']] = [float(r['lat']), float(r['lon'])]
    except Exception: issue('geo_row_invalid', r)
def city_ll(name):
    base = nrm(re.sub(r'\(.*?\)', '', name)); m = re.search(r'\((.*?)\)', name)
    return geo_c.get(base) or (geo_c.get(nrm(m.group(1))) if m else None)
# ---------- write SQLite ----------
db = os.path.join(OUT, 'yatripath.db')
if os.path.exists(db): os.remove(db)
c = sqlite3.connect(db); x = c.executescript
x('''
CREATE TABLE countries(country_code TEXT PRIMARY KEY,country_name TEXT UNIQUE,region TEXT);
CREATE TABLE states_ut(state_code TEXT PRIMARY KEY,state_name TEXT UNIQUE,type TEXT,capital TEXT);
CREATE TABLE cities(city_id TEXT PRIMARY KEY,city_name TEXT,state_code TEXT REFERENCES states_ut,country_code TEXT REFERENCES countries,lat REAL,lon REAL,UNIQUE(city_name,state_code,country_code));
CREATE TABLE railway_stations(station_code TEXT PRIMARY KEY,station_name TEXT,city_id TEXT REFERENCES cities,state_code TEXT,zone_code TEXT,division TEXT,role TEXT,data_source TEXT);
CREATE TABLE airports(iata_code TEXT PRIMARY KEY,icao_code TEXT,airport_name TEXT,city_id TEXT REFERENCES cities,state_code TEXT,country_code TEXT REFERENCES countries,category TEXT,status TEXT,scope TEXT,confidence TEXT,data_source TEXT);
CREATE TABLE bus_stations(bus_station_id TEXT PRIMARY KEY,name TEXT,city_id TEXT REFERENCES cities,category TEXT,area TEXT,notes TEXT,confidence TEXT,data_source TEXT);
CREATE TABLE bus_boarding_points(boarding_point_id TEXT PRIMARY KEY,bus_station_id TEXT,operator_id TEXT,city_id TEXT REFERENCES cities,point_name TEXT,landmark TEXT,is_permanent INTEGER,valid_from TEXT,valid_to TEXT,data_source TEXT);
CREATE TABLE bus_routes(bus_route_id TEXT PRIMARY KEY,src_city_id TEXT,dst_city_id TEXT,src_station_id TEXT,dst_boarding_or_station_id TEXT,km_min INTEGER,km_max INTEGER,typical_categories TEXT,confidence TEXT,data_source TEXT,UNIQUE(src_station_id,dst_boarding_or_station_id));
CREATE TABLE train_service_types(service_type TEXT PRIMARY KEY,description TEXT,booking_type TEXT,operator TEXT);
CREATE TABLE railway_routes(route_id TEXT PRIMARY KEY,train_no TEXT,train_name TEXT,src_station_code TEXT REFERENCES railway_stations,dst_station_code TEXT REFERENCES railway_stations,dep_time TEXT,arr_time TEXT,runs_on TEXT,distance_km TEXT);
CREATE TABLE intl_railway_services(intl_service_id INTEGER PRIMARY KEY,train_name TEXT,train_no TEXT,in_station TEXT,in_station_code TEXT,border_station TEXT,foreign_station TEXT,country TEXT,route TEXT,status TEXT,bookable TEXT,status_detail TEXT,source TEXT,verified TEXT);
CREATE TABLE airlines(iata_code TEXT PRIMARY KEY,icao_code TEXT,name TEXT,country TEXT,type TEXT);
CREATE TABLE flight_routes(route_id TEXT PRIMARY KEY,origin_iata TEXT REFERENCES airports,dest_iata TEXT REFERENCES airports,airline_iata TEXT,is_direct TEXT,stops TEXT,status TEXT,valid_from TEXT,valid_to TEXT);
CREATE TABLE transport_operators(operator_id TEXT PRIMARY KEY,name TEXT,mode TEXT,country TEXT,detail TEXT);
CREATE TABLE ticket_classes(code TEXT PRIMARY KEY,name TEXT,description TEXT,booking_channel TEXT);
CREATE TABLE fare_reference(mode TEXT,src_id TEXT,dst_id TEXT,fare_min REAL,fare_max REAL,currency TEXT,class TEXT,source TEXT,as_of TEXT);
CREATE TABLE data_sources(name TEXT,url TEXT,used_for TEXT,note TEXT);
CREATE TABLE import_log(run_at TEXT,input_dir TEXT,summary TEXT);
CREATE INDEX ix_city_name ON cities(city_name);CREATE INDEX ix_rail_name ON railway_stations(station_name);CREATE INDEX ix_rail_city ON railway_stations(city_id);
CREATE INDEX ix_air_name ON airports(airport_name);CREATE INDEX ix_air_city ON airports(city_id);CREATE INDEX ix_bus_name ON bus_stations(name);CREATE INDEX ix_bus_city ON bus_stations(city_id);
CREATE INDEX ix_brt_src ON bus_routes(src_station_id);CREATE INDEX ix_brt_dst ON bus_routes(dst_boarding_or_station_id);CREATE INDEX ix_rr ON railway_routes(src_station_code,dst_station_code);CREATE INDEX ix_fr ON flight_routes(origin_iata,dest_iata);
''')
ins = lambda t, rows: rows and c.executemany('INSERT INTO %s VALUES(%s)' % (t, ','.join('?' * len(rows[0]))), rows)
ins('countries', list(countries.values())); ins('states_ut', [(r['state_code'], r['state_name'], r['type'], r['capital']) for r in S['states_ut']])
ins('cities', [v + tuple(city_ll(v[1]) or (None, None)) for v in cities.values()])
ins('railway_stations', [(r['code'], r['name'], r['city_id'], r['state_code'], r['zone'], r['division'], r['role'], 'railway_stations.csv') for r in rail.values()])
ins('airports', [(a['iata'], a['icao'], a['name'], a['city_id'], a['state_code'], a['country_code'], a['category'], a['status'], a['scope'], a['confidence'], 'airports_india.csv' if a['scope'] == 'IN' else 'intl_dest_airports.csv') for a in air.values()])
ins('bus_stations', [(b['id'], b['name'], b['city_id'], b['category'], b['area'], b['notes'], b['confidence'], b['source']) for b in bus.values() if b['kind'] == 'terminal'])
ins('bus_boarding_points', [(b['id'], None, None, b['city_id'], b['name'], b['notes'], 0, None, None, b['source']) for b in bus.values() if b['kind'] == 'boarding'])
ins('bus_routes', [(r['id'], bus[r['f']]['city_id'], bus[r['t']]['city_id'], r['f'], r['t'], r['km'][0], r['km'][1], r['cats'], r['conf'], 'bus_routes.csv') for r in broutes])
ins('train_service_types', [(r['service_type'], r['description'], r['booking_type'], r['operator']) for r in S['train_services']])
ins('railway_routes', [(r['id'], r['train_no'], r['name'], r['f'], r['t'], r['dep'], r['arr'], r['runs'], r['km']) for r in rroutes])
ins('intl_railway_services', [(i + 1, r['name'], r['train_no'], r['india_station'], r['in_code'], r['border'], r['foreign'], r['country'], r['route'], r['status'], r['bookable'], r['detail'], r['source'], r['verified']) for i, r in enumerate(irs)])
ins('airlines', [(a['iata'], a['icao'], a['name'], a['country'], a['type']) for a in S['airlines']])
ins('flight_routes', [(r['id'], r['f'], r['t'], r['airline'], r['direct'], r['stops'], r['status'], r['vf'], r['vt']) for r in froutes])
ops = [('OP-AL-' + a['iata'], a['name'], 'flight', a['country'], a['type']) for a in S['airlines']] + [('OP-TR-' + slug(o)[:20], o, 'train', 'India', 'from train_services.csv') for o in sorted({r['operator'] for r in S['train_services']})]
ins('transport_operators', ops); ins('ticket_classes', [(r['code'], r['name'], r['description'], r['booking_channel']) for r in S['ticket_classes']])
ins('fare_reference', [(f['m'], f['f'], f['t'], f['lo'], f['hi'], f['cur'], f['cls'], f['src'], f['asof']) for f in fares])
ins('data_sources', [tuple((r + ['', '', '', ''])[:4]) for r in sources_rows])
dup = {k: sum(1 for i in issues if i['type'] == k) for k in {i['type'] for i in issues}}
summary = {'railway_stations': len(rail), 'airports_india': sum(a['scope'] == 'IN' for a in air.values()), 'airports_international_destinations': sum(a['scope'] == 'INTL' for a in air.values()), 'airports_total': len(air), 'bus_terminals': sum(b['kind'] == 'terminal' for b in bus.values()), 'bus_boarding_points': sum(b['kind'] == 'boarding' for b in bus.values()), 'cities': len(cities), 'states_ut': len(S['states_ut']), 'countries': len(countries), 'airlines': len(S['airlines']), 'verified_bus_routes': len(broutes), 'verified_rail_routes': len(rroutes), 'verified_flight_routes': len(froutes), 'intl_rail_service_records': len(irs), 'intl_rail_bookable': sum(1 for r in irs if r['bookable'].lower().startswith('yes') or r['bookable'].lower() == 'bookable'), 'reference_fares': len(fares), 'cities_with_coordinates': sum(1 for v in cities.values() if city_ll(v[1])), 'rejected_fare_rows': bad_fare, 'rejected_rail_route_rows': bad_rr, 'rejected_flight_route_rows': bad_fr, 'issues_by_type': dup}
c.execute('INSERT INTO import_log VALUES(?,?,?)', (datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds') + "Z", IN, json.dumps(summary))); c.commit(); c.close()

# ---------- browser data files (loaded per transport type; no database server needed) ----------
def js(name, body): open(os.path.join(OUT, name), 'w', encoding='utf-8').write('window.YP=window.YP||{};' + body + '\n')
dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
js('rail.js', 'YP.rail=' + dump([[r['code'], r['name'], r['city'], r['state'], r['zone'], r['role'], r['division']] for r in sorted(rail.values(), key=lambda r: (r['state'], r['city'], r['name']))]) + ';')
js('air.js', 'YP.air=' + dump([[a['iata'], a['name'], a['city'], a['state'] or a['country'], a['category'], a['status'], a['icao'], a['scope'], a['country']] for a in sorted(air.values(), key=lambda a: (a['scope'] != 'IN', a['country'], a['city'], a['name']))]) + ';')
js('bus.js', 'YP.bus=' + dump([[b['id'], b['name'], b['city'], b['state'], b['category'], b['kind'], b['area'], b['notes']] for b in sorted(bus.values(), key=lambda b: (b['state'], b['city'], b['kind'], b['name']))]) + ';')
js('routes.js', 'YP.routes=' + dump({'bus': broutes, 'rail': rroutes, 'flight': froutes}) + ';YP.intlRail=' + dump(irs) + ';YP.fares=' + dump(fares) + ';')
js('geo.js', 'YP.geo=' + dump({'c': geo_c, 's': geo_s}) + ';')
js('meta.js', 'YP.meta=' + dump({'counts': summary, 'sources': [{'name': r[0], 'url': r[1], 'use': r[2]} for r in sources_rows if len(r) > 2 and r[1].startswith('http')], 'built': datetime.date.today().isoformat(), 'source': 'YatriPath_Transport_Database (xlsx/csv/pdf), data as of 11 Nov 2026'}) + ';')
rep.update({'summary': summary, 'issues': issues, 'unresolved_bus_terminal_names_stored_as_boarding_points': unresolved, 'bus_route_resolution': [dict(id=r['id'], src=bus[r['f']]['name'], dst=bus[r['t']]['name'], km=r['km']) for r in broutes]})
json.dump(rep, open(os.path.join(OUT, 'import_report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(summary, indent=1)); print('issues:', len(issues))
