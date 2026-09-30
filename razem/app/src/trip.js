// Turns a booking from the backend into the values the screens show.
// Without a booking (stand-alone version) every field falls back to the design's demo trip.
const MONTHS = { pl: ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'], it: ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'], en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] };
const dm = (iso) => iso ? iso.slice(8, 10) + '.' + iso.slice(5, 7) : '';
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const initials = (n) => (n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'MK';
const v = (x, d) => (x === undefined || x === null || String(x).trim() === '') ? d : x;

// Program text lines "09:00 Title | subtitle" <-> items
export function parseItems(text) {
  return (text || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/); const rest = m ? m[2] : l; const [title, sub] = rest.split('|').map(s => s.trim());
    return { time: m ? m[1].replace('.', ':').padStart(5, '0') : '', title: title || '', sub: sub || '' };
  });
}
export const itemsText = (items) => (items || []).map(i => [i.time, i.title].filter(Boolean).join(' ') + (i.sub ? ' | ' + i.sub : '')).join('\n');

export function tripView(booking, lang, t) {
  const b = booking || null, tr = (b && b.trip) || {};
  const f = tr.flight || {}, h = tr.hotel || {}, x = tr.transfer || {}, a = tr.assistant || {}, ld = tr.leader || {};
  const days = Array.isArray(tr.days) ? tr.days.filter(d => d && (d.date || d.title)) : [];
  const traveller = b ? v(b.traveller, '') : 'Anna Nowak';
  const first = traveller.split(/[\s+,]+/)[0] || '';
  const parts = traveller.split(/\s+/).filter(w => /^[\p{L}-]+$/u.test(w));
  const sign = parts.length >= 2 ? 'RAZEM · ' + parts[0][0].toUpperCase() + '. ' + parts[parts.length - 1].toUpperCase() : 'RAZEM · ' + (traveller || '').toUpperCase();
  const agency = b ? v(b.agency, '') : 'Wakacje z Rzymem';
  const hotelName = v(h.name, 'Hotel Artemide');
  const hotelAddr = v(h.address, 'Via Nazionale, 22\n00184 Roma');
  const flightNo = v(f.no, 'LO 319'), fTime = v(f.time, '11:40'), fDate = f.date ? dm(f.date) : '12.10', airport = v(f.airport, 'FCO · Fiumicino T3');
  const driver = v(x.driver, 'Giorgio R.'), plate = v(x.plate, 'AB 123 CD');
  const hotelLL = (h.lat && h.lng && !isNaN(+h.lat) && !isNaN(+h.lng)) ? [+h.lat, +h.lng] : null;

  // today's plan: the program day matching today, else the first day
  const td = today();
  const day = days.find(d => d.date === td) || days[0];
  const isToday = !!(day && day.date === td);
  const plan = day ? (day.items || []).map(i => ({ time: i.time || '', t: { pl: i.title, it: i.title, en: i.title }, s: i.sub || '' })) : null;
  let planDone = null;
  if (plan) { const n = nowHM(); planDone = plan.map(p => isToday && p.time && p.time < n); }

  let dayOf = null;
  if (days.length && days[0].date) {
    const ds = days.map(d => d.date).filter(Boolean).sort(), first_ = ds[0], last = ds[ds.length - 1];
    const idx = Math.max(1, Math.min(days.length, ds.indexOf(td) + 1 || (td < first_ ? 1 : days.length)));
    const M = MONTHS[lang] || MONTHS.pl, mon = M[+last.slice(5, 7) - 1];
    const city = { pl: 'Rzym', it: 'Roma', en: 'Rome' }[lang];
    const range = first_.slice(5, 7) === last.slice(5, 7) ? `${+first_.slice(8)}–${+last.slice(8)} ${mon}` : `${+first_.slice(8)} ${M[+first_.slice(5, 7) - 1]} – ${+last.slice(8)} ${mon}`;
    dayOf = { pl: `${city} · dzień ${idx} z ${days.length} · ${range}`, it: `${city} · giorno ${idx} di ${days.length} · ${range}`, en: `${city} · day ${idx} of ${days.length} · ${range}` }[lang];
  }

  // text overrides for strings that embed trip data
  const tt = { ...t };
  if (b) {
    tt.greet = first ? t.greet.replace(/Anna/, first) : t.greet.replace(/,\s*Anna/, '');
    tt.wSub = first ? t.wSub.replace(/Anno|Anna/, first) : t.wSub;
    tt.wLanded = t.wLanded.replace('LO 319', flightNo);
    tt.st0s = `${flightNo} · ${airport} · ${fTime}`;
    tt.st3s = t.st3s.replace('Hotel Artemide', hotelName);
    if (x.meet) tt.meetAt = x.meet;
    if (h.info) tt.hotelInfo = h.info;
    if (tr.welcome) tt.wThanks = tr.welcome;
    if (dayOf) tt.dayOf = dayOf;
  }

  return {
    t: tt, custom: !!b,
    agency, traveller, sign,
    arrival: `${fDate} · ${fTime} · ${flightNo}`, airport, flightNo,
    hotelName, hotelAddr, hotelAddrLine: hotelAddr.replace(/\n+/g, ' · '), hotelShort: hotelName.replace(/^Hotel\s+/i, ''),
    checkin: v(h.checkin, '14:00'), checkout: v(h.checkout, '11:00'), hotelLL,
    driver, driverShort: driver.split(/\s+/)[0], plate, car: b ? v(x.car, '') : null, driverPhone: v(x.phone, ''), transferTime: v(x.time, '12:30'),
    assistantName: v(a.name, 'Marta Kowalska'), assistantIni: initials(v(a.name, 'Marta Kowalska')), assistantPhone: v(a.phone, ''),
    leaderName: v(ld.name, 'Ewa Zielińska'), leaderIni: initials(v(ld.name, 'Ewa Zielińska')), leaderPhone: v(ld.phone, ''),
    plan, planDone,
    days: days.length ? days.map(d => [d.title || dm(d.date), dm(d.date), (d.items || []).map(i => [i.time, i.title].filter(Boolean).join(' ')).join(' · ')]) : null,
  };
}
