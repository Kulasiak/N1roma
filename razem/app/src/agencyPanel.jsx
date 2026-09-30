// Agency panel (backend version): bookings with flight / hotel / transfer / programme, invitation link + QR,
// connected phones (max 6), instant blocking and the real chat with travellers.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { rpc } from './api.js';
import { parseItems, itemsText } from './trip.js';

const S = {
  it: { login: 'Accesso agenzia', email: 'E-mail', pw: 'Password', enter: 'Entra', wrong: 'E-mail o password errati.', net: 'Errore di connessione. Riprova.', bookings: 'Prenotazioni', newB: '+ Nuova prenotazione', search: 'Cerca nome o codice', none: 'Nessuna prenotazione.', logout: 'Esci', back: '← Elenco',
    traveller: 'Viaggiatore / famiglia', lang: 'Lingua app', until: 'Accesso valido fino al', until_h: 'Automatico: 30 giorni dopo l’ultimo giorno del programma.', maxdev: 'Telefoni massimi',
    flight: 'VOLO', fno: 'Numero volo', fdate: 'Data arrivo', ftime: 'Ora arrivo', fair: 'Aeroporto / terminal',
    hotel: 'HOTEL', hname: 'Nome hotel', haddr: 'Indirizzo (per il tassista)', hin: 'Check-in', hout: 'Check-out', hinfo: 'Informazioni utili', hll: 'Coordinate (facoltative)', hll_h: 'Google Maps: tieni premuto sull’hotel e copia i numeri, es. 41.9013, 12.4938',
    trf: 'TRANSFER', ttime: 'Ora', tdriver: 'Autista', tphone: 'Telefono autista', tcar: 'Auto', tplate: 'Targa', tmeet: 'Punto d’incontro',
    people: 'PERSONE DI CONTATTO', aname: 'Assistente (chat)', aphone: 'Telefono assistente', lname: 'Accompagnatore del gruppo', lphone: 'Telefono accompagnatore', welcome: 'Messaggio di benvenuto dell’agenzia',
    prog: 'PROGRAMMA', addDay: '+ Aggiungi giorno', dtitle: 'Titolo del giorno', ditems: 'Attività: una per riga, es. «09:00 Musei Vaticani | ingresso 10:00»', del: 'Elimina',
    save: 'Salva prenotazione', saved: 'Salvato ✓', access: 'ACCESSO', code: 'Codice', copy: 'Copia link', copied: 'Copiato ✓', wa: 'WhatsApp', mail: 'E-mail', copyMsg: 'Copia messaggio',
    devices: 'TELEFONI COLLEGATI', nodev: 'Nessun telefono ancora.', remove: 'Scollega', blocked: 'ACCESSO BLOCCATO', block: 'Blocca accesso subito', unblock: 'Riattiva accesso',
    chat: 'CHAT CON IL VIAGGIATORE', write: 'Scrivi una risposta…', send: 'Invia', noMsg: 'Nessun messaggio.', you: 'Agenzia', pwChange: 'Cambia password', oldPw: 'Password attuale', newPw: 'Nuova password (min. 10 caratteri)', pwOk: 'Password cambiata ✓', pwBad: 'Password attuale errata o nuova troppo corta.', expired: 'SCADUTO', unread: 'nuovi' },
  pl: { login: 'Logowanie biura', email: 'E-mail', pw: 'Hasło', enter: 'Zaloguj', wrong: 'Błędny e-mail lub hasło.', net: 'Błąd połączenia. Spróbuj ponownie.', bookings: 'Rezerwacje', newB: '+ Nowa rezerwacja', search: 'Szukaj nazwiska lub kodu', none: 'Brak rezerwacji.', logout: 'Wyloguj', back: '← Lista',
    traveller: 'Podróżny / rodzina', lang: 'Język aplikacji', until: 'Dostęp ważny do', until_h: 'Automatycznie: 30 dni po ostatnim dniu programu.', maxdev: 'Maks. telefonów',
    flight: 'LOT', fno: 'Numer lotu', fdate: 'Data przylotu', ftime: 'Godzina przylotu', fair: 'Lotnisko / terminal',
    hotel: 'HOTEL', hname: 'Nazwa hotelu', haddr: 'Adres (dla taksówkarza)', hin: 'Zameldowanie', hout: 'Wymeldowanie', hinfo: 'Przydatne informacje', hll: 'Współrzędne (opcjonalnie)', hll_h: 'Google Maps: przytrzymaj hotel i skopiuj liczby, np. 41.9013, 12.4938',
    trf: 'TRANSFER', ttime: 'Godzina', tdriver: 'Kierowca', tphone: 'Telefon kierowcy', tcar: 'Samochód', tplate: 'Rejestracja', tmeet: 'Miejsce spotkania',
    people: 'OSOBY KONTAKTOWE', aname: 'Opiekunka (czat)', aphone: 'Telefon opiekunki', lname: 'Pilot grupy', lphone: 'Telefon pilota', welcome: 'Powitanie od biura',
    prog: 'PROGRAM', addDay: '+ Dodaj dzień', dtitle: 'Tytuł dnia', ditems: 'Punkty: jeden w linii, np. „09:00 Muzea Watykańskie | wejście 10:00”', del: 'Usuń',
    save: 'Zapisz rezerwację', saved: 'Zapisano ✓', access: 'DOSTĘP', code: 'Kod', copy: 'Kopiuj link', copied: 'Skopiowano ✓', wa: 'WhatsApp', mail: 'E-mail', copyMsg: 'Kopiuj wiadomość',
    devices: 'POŁĄCZONE TELEFONY', nodev: 'Brak telefonów.', remove: 'Odłącz', blocked: 'DOSTĘP ZABLOKOWANY', block: 'Zablokuj dostęp teraz', unblock: 'Przywróć dostęp',
    chat: 'CZAT Z PODRÓŻNYM', write: 'Napisz odpowiedź…', send: 'Wyślij', noMsg: 'Brak wiadomości.', you: 'Biuro', pwChange: 'Zmień hasło', oldPw: 'Obecne hasło', newPw: 'Nowe hasło (min. 10 znaków)', pwOk: 'Hasło zmienione ✓', pwBad: 'Błędne obecne hasło lub za krótkie nowe.', expired: 'WYGASŁ', unread: 'nowe' },
};
const TKEY = 'razem.agency.token';
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dmy = (iso) => iso ? iso.split('-').reverse().join('.') : '';
const inviteMsg = (link, code, until) => `Dzień dobry! Oto Twój dostęp do aplikacji Razem na podróż do Rzymu:\n${link}\n\nKod podróży: ${code}\n\n1. Otwórz link w telefonie.\n2. Dodaj aplikację do ekranu głównego (iPhone: Udostępnij → „Do ekranu początkowego”; Android: menu ⋮ → „Zainstaluj aplikację”).\n3. Jeśli aplikacja poprosi o kod, wpisz: ${code}\n\nKod działa na maks. 6 telefonach, do ${dmy(until)}. Miłej podróży!`;

const box = { background: '#fff', borderRadius: 20, padding: 18, border: '1px solid rgba(22,24,29,.08)', marginTop: 12 };
const lbl = { font: "700 11px 'JetBrains Mono',monospace", letterSpacing: '.08em', color: '#5E6068', margin: '12px 0 6px', display: 'block' };
const sec = { font: "700 11px 'JetBrains Mono',monospace", letterSpacing: '.08em', color: '#C8102E', margin: '0 0 2px' };
const inp = { boxSizing: 'border-box', width: '100%', minHeight: 46, borderRadius: 12, border: '1.5px solid #CFC9BC', background: '#fff', padding: '0 12px', font: "500 15px 'Onest'", color: '#16181D', outline: 'none' };
const ta = { ...inp, padding: '10px 12px', resize: 'vertical', lineHeight: 1.4 };
const btn = (bg, fg, extra) => ({ height: 46, padding: '0 16px', border: 0, borderRadius: 12, background: bg, color: fg, font: "700 14px 'Onest'", cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...extra });
const grid = (n) => ({ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0,1fr))`, gap: 10 });

function F({ label, hint, children }) { return <div><label style={lbl}>{label.toUpperCase()}</label>{children}{hint && <div style={{ fontSize: 12, color: '#5E6068', marginTop: 4 }}>{hint}</div>}</div>; }

const empty = () => ({ id: '', traveller: '', lang: 'pl', valid_until: '', max_devices: 6, trip: { flight: {}, hotel: {}, transfer: {}, assistant: { name: 'Marta Kowalska' }, leader: {}, welcome: '', days: [] } });

export default function Panel({ t, lang, setLang }) {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(TKEY) || ''; } catch { return ''; } });
  const [agency, setAgency] = useState(null);
  const [err, setErr] = useState('');
  const call = useCallback(async (fn, args) => {
    const r = await rpc(fn, { p_token: token, ...args });
    if (!r.ok && r.error === 'auth') { setToken(''); try { localStorage.removeItem(TKEY); } catch {} }
    return r;
  }, [token]);

  if (!token) return <Login t={t} onOk={(tok, ag) => { setToken(tok); setAgency(ag); try { localStorage.setItem(TKEY, tok); } catch {} }} />;
  return <Bookings t={t} call={call} agency={agency} logout={() => { rpc('agency_logout', { p_token: token }).catch(() => {}); setToken(''); try { localStorage.removeItem(TKEY); } catch {} }} />;
}

function Login({ t, onOk }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await rpc('agency_login', { p_email: email, p_password: pw }); if (r.ok) onOk(r.token, r.agency); else setErr(t.wrong); } catch { setErr(t.net); }
    setBusy(false);
  };
  return (
    <form onSubmit={go} style={box}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{t.login}</div>
      <F label={t.email}><input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={inp} /></F>
      <F label={t.pw}><input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} style={inp} /></F>
      {err && <div role="alert" style={{ marginTop: 10, background: '#FDECEF', color: '#8E0B21', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{err}</div>}
      <button disabled={busy || !email || !pw} style={btn('#16181D', '#fff', { width: '100%', marginTop: 14, opacity: busy || !email || !pw ? 0.5 : 1 })}>{busy ? '…' : t.enter}</button>
    </form>
  );
}

function Bookings({ t, call, logout }) {
  const [list, setList] = useState(null); const [q, setQ] = useState(''); const [open, setOpen] = useState(null); const [pwOpen, setPwOpen] = useState(false);
  const load = useCallback(() => call('agency_bookings', {}).then(r => r.ok && setList(r.bookings)).catch(() => {}), [call]);
  useEffect(() => { load(); const iv = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 15000); return () => clearInterval(iv); }, [load]);

  if (open) return <Editor t={t} call={call} initial={open === 'new' ? empty() : open} onBack={() => { setOpen(null); load(); }} />;
  const today = new Date().toISOString().slice(0, 10);
  const shown = (list || []).filter(b => !q || (b.traveller + ' ' + b.code).toLowerCase().includes(q.toLowerCase()));
  return (<>
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <input placeholder={t.search} value={q} onChange={e => setQ(e.target.value)} style={{ ...inp, flex: 1 }} />
      <button onClick={() => setOpen('new')} style={btn('#C8102E', '#fff')}>{t.newB}</button>
    </div>
    <div style={{ background: '#fff', borderRadius: 20, padding: '4px 16px', marginTop: 12 }}>
      {list && !shown.length && <div style={{ padding: '14px 0', color: '#5E6068', fontSize: 14 }}>{t.none}</div>}
      {shown.map(b => (
        <button key={b.id} onClick={() => setOpen(b)} style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', border: 0, borderBottom: '1px solid rgba(22,24,29,.07)', background: 'none', cursor: 'pointer', textAlign: 'left', font: "500 14px 'Onest'", color: '#16181D' }}>
          <span style={{ font: "700 12px 'JetBrains Mono',monospace", minWidth: 116 }}>{b.code}</span>
          <span style={{ flex: 1 }}><b>{b.traveller || '—'}</b><span style={{ display: 'block', fontSize: 12, color: '#5E6068' }}>{(b.trip.hotel && b.trip.hotel.name) || ''} · → {dmy(b.valid_until)} · {b.devices}/{b.max_devices} 📱</span></span>
          {b.revoked && <span style={{ font: "700 10px 'JetBrains Mono',monospace", color: '#fff', background: '#C8102E', borderRadius: 6, padding: '3px 6px' }}>{t.blocked}</span>}
          {!b.revoked && b.valid_until < today && <span style={{ font: "700 10px 'JetBrains Mono',monospace", color: '#5E6068', background: '#E4DFD4', borderRadius: 6, padding: '3px 6px' }}>{t.expired}</span>}
          {b.unread > 0 && <span style={{ minWidth: 24, height: 24, borderRadius: 12, background: '#C8102E', color: '#fff', font: "700 12px 'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 7px' }} title={t.unread}>{b.unread}</span>}
          <span style={{ color: '#5E6068' }}>→</span>
        </button>))}
    </div>
    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
      <button onClick={() => setPwOpen(!pwOpen)} style={{ border: 0, background: 'none', padding: 0, font: "600 13px 'Onest'", color: '#5E6068', cursor: 'pointer', textDecoration: 'underline' }}>{t.pwChange}</button>
      <button onClick={logout} style={{ border: 0, background: 'none', padding: 0, font: "600 13px 'Onest'", color: '#5E6068', cursor: 'pointer', textDecoration: 'underline' }}>{t.logout}</button>
    </div>
    {pwOpen && <PwChange t={t} call={call} />}
  </>);
}

function PwChange({ t, call }) {
  const [o, setO] = useState(''); const [n, setN] = useState(''); const [msg, setMsg] = useState('');
  return (<div style={box}>
    <F label={t.oldPw}><input type="password" value={o} onChange={e => setO(e.target.value)} style={inp} /></F>
    <F label={t.newPw}><input type="password" autoComplete="new-password" value={n} onChange={e => setN(e.target.value)} style={inp} /></F>
    <button onClick={async () => { const r = await call('agency_change_password', { p_old: o, p_new: n }); setMsg(r.ok ? t.pwOk : t.pwBad); if (r.ok) { setO(''); setN(''); } }} style={btn('#16181D', '#fff', { marginTop: 12 })}>{t.pwChange}</button>
    {msg && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>{msg}</div>}
  </div>);
}

function Editor({ t, call, initial, onBack }) {
  const [b, setB] = useState(() => {
    const n = JSON.parse(JSON.stringify(initial)); n.trip = n.trip || {};
    ['flight', 'hotel', 'transfer', 'assistant', 'leader'].forEach(k => { n.trip[k] = n.trip[k] || {}; });
    n.trip.days = n.trip.days || [];
    if (n.trip.hotel.lat && !n.trip.hotel.ll) n.trip.hotel.ll = n.trip.hotel.lat + ', ' + n.trip.hotel.lng;
    return n;
  });
  const [daysText, setDaysText] = useState(() => (initial.trip.days || []).map(d => itemsText(d.items)));
  const [saved, setSaved] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const tr = b.trip;
  const set = (path, val) => setB(prev => { const n = JSON.parse(JSON.stringify(prev)); let o = n; const p = path.split('.'); p.slice(0, -1).forEach(k => { o[k] = o[k] || {}; o = o[k]; }); o[p[p.length - 1]] = val; return n; });
  const inputFor = (path, props = {}) => { const val = path.split('.').reduce((o, k) => (o || {})[k], b) ?? ''; return <input value={val} onChange={e => set(path, e.target.value)} style={inp} {...props} />; };
  const lastDay = (tr.days || []).map(d => d.date).filter(Boolean).sort().pop();
  const autoUntil = lastDay ? addDays(lastDay, 30) : (tr.flight.date ? addDays(tr.flight.date, 37) : '');
  const until = b.valid_until || autoUntil;

  const save = async () => {
    setBusy(true); setErr('');
    const days = (tr.days || []).map((d, i) => ({ date: d.date || '', title: d.title || '', items: parseItems(daysText[i]) }));
    const ll = String(tr.hotel.ll || '').match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);
    const hotel = { ...tr.hotel, lat: ll ? ll[1] : '', lng: ll ? ll[2] : '' };
    try {
      const r = await call('agency_booking_save', { p_booking: { ...b, valid_until: until, trip: { ...tr, hotel, days } } });
      if (r.ok) { setB({ ...r.booking, trip: { ...r.booking.trip, hotel: { ...r.booking.trip.hotel, ll: r.booking.trip.hotel && r.booking.trip.hotel.lat ? r.booking.trip.hotel.lat + ', ' + r.booking.trip.hotel.lng : '' } } }); setSaved(t.saved); setTimeout(() => setSaved(''), 2000); }
      else setErr(r.error);
    } catch { setErr(t.net); }
    setBusy(false);
  };

  return (<>
    <button onClick={onBack} style={{ ...btn('#fff', '#16181D'), marginTop: 16, border: '1px solid rgba(22,24,29,.12)' }}>{t.back}</button>
    {b.id && <Access t={t} call={call} b={b} setB={setB} />}
    <div style={box}>
      <div style={grid(2)}>
        <F label={t.traveller}>{inputFor('traveller', { placeholder: 'Anna Nowak + 1' })}</F>
        <div style={grid(2)}>
          <F label={t.lang}><select value={b.lang} onChange={e => set('lang', e.target.value)} style={inp}><option value="pl">PL</option><option value="it">IT</option><option value="en">EN</option></select></F>
          <F label={t.maxdev}><select value={b.max_devices} onChange={e => set('max_devices', +e.target.value)} style={inp}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n}>{n}</option>)}</select></F>
        </div>
      </div>
      <F label={t.until} hint={t.until_h}><input type="date" value={until} onChange={e => set('valid_until', e.target.value)} style={inp} /></F>
    </div>

    <div style={box}><div style={sec}>{t.flight}</div>
      <div style={grid(2)}><F label={t.fno}>{inputFor('trip.flight.no', { placeholder: 'LO 319' })}</F><F label={t.fair}>{inputFor('trip.flight.airport', { placeholder: 'FCO · Fiumicino T3' })}</F></div>
      <div style={grid(2)}><F label={t.fdate}>{inputFor('trip.flight.date', { type: 'date' })}</F><F label={t.ftime}>{inputFor('trip.flight.time', { type: 'time' })}</F></div>
    </div>

    <div style={box}><div style={sec}>{t.hotel}</div>
      <F label={t.hname}>{inputFor('trip.hotel.name', { placeholder: 'Hotel Artemide' })}</F>
      <F label={t.haddr}><textarea rows={2} value={tr.hotel.address || ''} onChange={e => set('trip.hotel.address', e.target.value)} placeholder={'Via Nazionale, 22\n00184 Roma'} style={ta} /></F>
      <div style={grid(2)}><F label={t.hin}>{inputFor('trip.hotel.checkin', { type: 'time' })}</F><F label={t.hout}>{inputFor('trip.hotel.checkout', { type: 'time' })}</F></div>
      <F label={t.hinfo}><textarea rows={2} value={tr.hotel.info || ''} onChange={e => set('trip.hotel.info', e.target.value)} style={ta} /></F>
      <F label={t.hll} hint={t.hll_h}>{inputFor('trip.hotel.ll', { placeholder: '41.9013, 12.4938' })}</F>
    </div>

    <div style={box}><div style={sec}>{t.trf}</div>
      <div style={grid(3)}><F label={t.ttime}>{inputFor('trip.transfer.time', { type: 'time' })}</F><F label={t.tdriver}>{inputFor('trip.transfer.driver', { placeholder: 'Giorgio R.' })}</F><F label={t.tphone}>{inputFor('trip.transfer.phone', { type: 'tel', placeholder: '+39 …' })}</F></div>
      <div style={grid(2)}><F label={t.tcar}>{inputFor('trip.transfer.car', { placeholder: 'Mercedes V · nero' })}</F><F label={t.tplate}>{inputFor('trip.transfer.plate', { placeholder: 'AB 123 CD' })}</F></div>
      <F label={t.tmeet}>{inputFor('trip.transfer.meet')}</F>
    </div>

    <div style={box}><div style={sec}>{t.people}</div>
      <div style={grid(2)}><F label={t.aname}>{inputFor('trip.assistant.name')}</F><F label={t.aphone}>{inputFor('trip.assistant.phone', { type: 'tel', placeholder: '+39 …' })}</F></div>
      <div style={grid(2)}><F label={t.lname}>{inputFor('trip.leader.name')}</F><F label={t.lphone}>{inputFor('trip.leader.phone', { type: 'tel', placeholder: '+39 …' })}</F></div>
      <F label={t.welcome}><textarea rows={3} value={tr.welcome || ''} onChange={e => set('trip.welcome', e.target.value)} style={ta} /></F>
    </div>

    <div style={box}><div style={sec}>{t.prog}</div>
      {(tr.days || []).map((d, i) => (
        <div key={i} style={{ borderTop: i ? '1px dashed #E4DFD4' : 0, paddingTop: i ? 10 : 0, marginTop: i ? 12 : 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: 8, alignItems: 'end' }}>
            <F label={'#' + (i + 1)}><input type="date" value={d.date || ''} onChange={e => set(`trip.days.${i}.date`, e.target.value)} style={inp} /></F>
            <F label={t.dtitle}><input value={d.title || ''} onChange={e => set(`trip.days.${i}.title`, e.target.value)} placeholder="Dzień 2 · Watykan" style={inp} /></F>
            <button onClick={() => { setB(p => { const n = JSON.parse(JSON.stringify(p)); n.trip.days.splice(i, 1); return n; }); setDaysText(x => x.filter((_, j) => j !== i)); }} style={btn('#F4F1EA', '#8E0B21')}>{t.del}</button>
          </div>
          <F label={t.ditems}><textarea rows={4} value={daysText[i] || ''} onChange={e => setDaysText(x => { const n = [...x]; n[i] = e.target.value; return n; })} placeholder={'09:00 Muzea Watykańskie | wejście bez kolejki\n13:00 Obiad\n15:00 Bazylika św. Piotra'} style={ta} /></F>
        </div>))}
      <button onClick={() => { const prev = (tr.days || []).map(d => d.date).filter(Boolean).sort().pop(); set('trip.days', [...(tr.days || []), { date: prev ? addDays(prev, 1) : (tr.flight.date || ''), title: '', items: [] }]); setDaysText(x => [...x, '']); }} style={btn('#F4F1EA', '#16181D', { marginTop: 12 })}>{t.addDay}</button>
    </div>

    {err && <div role="alert" style={{ marginTop: 12, background: '#FDECEF', color: '#8E0B21', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{err}</div>}
    <button onClick={save} disabled={busy || !until} style={btn('#C8102E', '#fff', { width: '100%', height: 56, marginTop: 14, fontSize: 16, opacity: busy || !until ? 0.5 : 1, position: 'sticky', bottom: 12 })}>{saved || (busy ? '…' : t.save)}</button>
    {b.id && <Chat t={t} call={call} bookingId={b.id} />}
  </>);
}

function Access({ t, call, b, setB }) {
  const qr = useRef(null); const [copied, setCopied] = useState(''); const [devs, setDevs] = useState([]);
  const link = location.origin + '/#c=' + b.code;
  const loadDevs = useCallback(() => call('agency_devices', { p_booking: b.id }).then(r => r.ok && setDevs(r.devices)), [call, b.id]);
  useEffect(() => { loadDevs(); }, [loadDevs]);
  useEffect(() => { if (qr.current) QRCode.toCanvas(qr.current, link, { width: 180, margin: 1 }); }, [link]);
  const copy = (txt, w) => navigator.clipboard.writeText(txt).then(() => { setCopied(w); setTimeout(() => setCopied(''), 1500); });
  const msg = inviteMsg(link, b.code, b.valid_until);
  return (
    <div style={{ ...box, background: '#16181D', color: '#fff', border: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: "700 11px 'JetBrains Mono',monospace", letterSpacing: '.08em', color: '#F2B33D' }}><span>{t.access}</span><span>→ {dmy(b.valid_until)}</span></div>
      {b.revoked && <div style={{ marginTop: 10, background: '#C8102E', borderRadius: 10, padding: '8px 12px', font: "700 12px 'JetBrains Mono',monospace" }}>{t.blocked}</div>}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <canvas ref={qr} style={{ borderRadius: 10, background: '#fff', padding: 6 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: '#C9CBD1' }}>{t.code}</div>
          <div style={{ font: "700 26px 'JetBrains Mono',monospace", letterSpacing: '.04em' }}>{b.code}</div>
          <div style={{ font: "500 11px 'JetBrains Mono',monospace", color: '#C9CBD1', wordBreak: 'break-all', marginTop: 6 }}>{link}</div>
        </div>
      </div>
      <div style={{ ...grid(4), marginTop: 12 }}>
        <button onClick={() => copy(link, 'l')} style={btn('#F2B33D', '#16181D')}>{copied === 'l' ? t.copied : t.copy}</button>
        <a href={'https://wa.me/?text=' + encodeURIComponent(msg)} target="_blank" rel="noopener" style={btn('#1F8A5B', '#fff')}>{t.wa}</a>
        <a href={'mailto:?subject=' + encodeURIComponent('Razem — dostęp do aplikacji') + '&body=' + encodeURIComponent(msg)} style={btn('rgba(255,255,255,.12)', '#fff')}>{t.mail}</a>
        <button onClick={() => copy(msg, 'm')} style={btn('rgba(255,255,255,.12)', '#fff')}>{copied === 'm' ? t.copied : t.copyMsg}</button>
      </div>
      <div style={{ ...lbl, color: '#C9CBD1', marginTop: 18 }}>{t.devices} · {devs.length}/{b.max_devices}</div>
      {!devs.length && <div style={{ fontSize: 13, color: '#C9CBD1' }}>{t.nodev}</div>}
      {devs.map(d => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <span style={{ flex: 1, fontSize: 13 }}>{d.label || '—'}<span style={{ display: 'block', fontSize: 11, color: '#8A8D96' }}>{new Date(d.last_seen).toLocaleString()}</span></span>
          <button onClick={() => call('agency_device_remove', { p_device: d.id }).then(loadDevs)} style={btn('rgba(255,255,255,.12)', '#fff', { height: 34, font: "600 12px 'Onest'" })}>{t.remove}</button>
        </div>))}
      <button onClick={() => call('agency_booking_revoke', { p_id: b.id, p_revoked: !b.revoked }).then(r => r.ok && setB({ ...b, revoked: !b.revoked }))} style={btn(b.revoked ? '#1F8A5B' : '#C8102E', '#fff', { width: '100%', marginTop: 14 })}>{b.revoked ? t.unblock : t.block}</button>
    </div>
  );
}

function Chat({ t, call, bookingId }) {
  const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const last = useRef(0); const end = useRef(null);
  const load = useCallback(() => call('agency_messages', { p_booking: bookingId, p_after: last.current }).then(r => {
    if (r.ok && r.messages.length) { last.current = r.messages[r.messages.length - 1].id; setMsgs(m => [...m, ...r.messages]); }
  }).catch(() => {}), [call, bookingId]);
  useEffect(() => { load(); const iv = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 4000); return () => clearInterval(iv); }, [load]);
  useEffect(() => { end.current && end.current.scrollIntoView({ block: 'nearest' }); }, [msgs.length]);
  const send = async () => { const body = text.trim(); if (!body) return; setText(''); await call('agency_send', { p_booking: bookingId, p_body: body }); load(); };
  return (
    <div style={{ ...box, background: '#F4F1EA' }} id="chat">
      <div style={sec}>{t.chat}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, maxHeight: 420, overflowY: 'auto' }}>
        {!msgs.length && <div style={{ fontSize: 13, color: '#5E6068' }}>{t.noMsg}</div>}
        {msgs.map(m => (
          <div key={m.id} style={{ maxWidth: '80%', alignSelf: m.from === 'agency' ? 'flex-end' : 'flex-start', background: m.from === 'agency' ? '#16181D' : '#fff', color: m.from === 'agency' ? '#fff' : '#16181D', borderRadius: 16, padding: '9px 13px', fontSize: 14, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
            {m.text}<div style={{ font: "500 10px 'JetBrains Mono',monospace", opacity: 0.6, marginTop: 3, textAlign: 'right' }}>{new Date(m.at).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
          </div>))}
        <div ref={end} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.write} style={{ ...inp, flex: 1, borderRadius: 23 }} />
        <button onClick={send} style={btn('#16181D', '#fff', { borderRadius: 23 })}>{t.send}</button>
      </div>
    </div>
  );
}

export { S };
