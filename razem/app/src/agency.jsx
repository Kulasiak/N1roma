// Agency page (/agenzia.html): unlock with the agency password, create signed invitation links + QR for travellers.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import '@fontsource/onest/500.css';
import '@fontsource/onest/700.css';
import '@fontsource/onest/800.css';
import '@fontsource/jetbrains-mono/700.css';
import keys from './access-keys.json';
import { signCode, unlockPrivateKey } from './signedCode.js';
import { BACKEND } from './api.js';
import Panel, { S as PS } from './agencyPanel.jsx';

const S = {
  it: { title: 'Accessi viaggiatori', sub: 'Crea il link personale che sblocca l’app Razem per un viaggiatore o una famiglia.', pw: 'Password agenzia', open: 'Entra', wrong: 'Password errata.', who: 'Nome viaggiatore / gruppo (solo per il vostro archivio)', ret: 'Data di rientro', until: 'Accesso valido fino al', hint: 'Di default 30 giorni dopo il rientro.', gen: 'Crea link di accesso', link: 'LINK PERSONALE', copy: 'Copia link', copyCode: 'Copia codice', copied: 'Copiato ✓', wa: 'Invia su WhatsApp', mail: 'Invia per e-mail', msgLbl: 'MESSAGGIO PRONTO (IN POLACCO)', copyMsg: 'Copia messaggio', hist: 'CREATI SU QUESTO COMPUTER', none: 'Nessun link ancora.', revoke: 'Per bloccare un accesso prima della scadenza: comunicate il codice (es. RZM-AB12CD) allo sviluppatore.', lock: 'Esci' },
  pl: { title: 'Dostępy podróżnych', sub: 'Utwórz osobisty link, który odblokowuje aplikację Razem dla podróżnego lub rodziny.', pw: 'Hasło biura', open: 'Wejdź', wrong: 'Błędne hasło.', who: 'Imię podróżnego / grupa (tylko do Waszej ewidencji)', ret: 'Data powrotu', until: 'Dostęp ważny do', hint: 'Domyślnie 30 dni po powrocie.', gen: 'Utwórz link dostępu', link: 'LINK OSOBISTY', copy: 'Kopiuj link', copyCode: 'Kopiuj kod', copied: 'Skopiowano ✓', wa: 'Wyślij przez WhatsApp', mail: 'Wyślij e-mailem', msgLbl: 'GOTOWA WIADOMOŚĆ', copyMsg: 'Kopiuj wiadomość', hist: 'UTWORZONE NA TYM KOMPUTERZE', none: 'Brak linków.', revoke: 'Aby zablokować dostęp przed terminem: przekażcie kod (np. RZM-AB12CD) programiście.', lock: 'Wyloguj' },
};
// Hosted build without deep links (VITE_APP_URL set): the traveller opens the app and pastes the code.
const APP_URL = import.meta.env.VITE_APP_URL || '';
const msgPaste = (code, until) => `Dzień dobry! Oto Twój dostęp do aplikacji Razem na podróż do Rzymu.\n\n1. Otwórz aplikację: ${APP_URL}\n2. Dotknij „Zaczynamy”, potem wklej ten kod w polu „KOD REZERWACJI” i dotknij „Pobierz”:\n\n${code}\n\nDostęp ważny do ${until.split('-').reverse().join('.')}. Miłej podróży!`;
const msg = (link, until, code) => APP_URL ? msgPaste(code, until) : `Dzień dobry! Oto Twój dostęp do aplikacji Razem na podróż do Rzymu:\n${link}\n\n1. Otwórz link w telefonie.\n2. Dodaj aplikację do ekranu głównego (iPhone: Udostępnij → „Do ekranu początkowego”; Android: menu ⋮ → „Zainstaluj aplikację”).\n3. Jeśli aplikacja poprosi o kod, dotknij „Wklej link od biura podróży”.\n\nDostęp ważny do ${until.split('-').reverse().join('.')}. Miłej podróży!`;
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const HKEY = 'razem.agency.history';
const loadH = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch { return []; } };

const box = { background: '#fff', borderRadius: 20, padding: 18, border: '1px solid rgba(22,24,29,.08)', marginTop: 12 };
const lbl = { font: "700 11px 'JetBrains Mono',monospace", letterSpacing: '.08em', color: '#5E6068', margin: '14px 0 6px', display: 'block' };
const inp = { boxSizing: 'border-box', width: '100%', height: 50, borderRadius: 14, border: '1.5px solid #CFC9BC', background: '#fff', padding: '0 14px', font: "500 16px 'Onest'", color: '#16181D', outline: 'none' };
const btn = (bg, fg) => ({ height: 48, padding: '0 16px', border: 0, borderRadius: 14, background: bg, color: fg, font: "700 15px 'Onest'", cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });

function Agency() {
  const [lang, setLang] = useState('it'); const t = S[lang];
  const [pw, setPw] = useState(''); const [key, setKey] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [who, setWho] = useState(''); const [ret, setRet] = useState(''); const [until, setUntil] = useState('');
  const [res, setRes] = useState(null); const [copied, setCopied] = useState(''); const [hist, setHist] = useState(loadH);
  const qr = useRef(null);

  useEffect(() => { if (ret) setUntil(addDays(ret, 30)); }, [ret]);
  useEffect(() => { if (res && qr.current) QRCode.toCanvas(qr.current, res.link, { width: 220, margin: 1, color: { dark: '#16181D', light: '#ffffff' } }); }, [res]);

  const unlock = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { setKey(await unlockPrivateKey(keys.encPrivateKey, pw)); setPw(''); } catch { setErr(t.wrong); } setBusy(false); };
  const generate = async () => {
    const r = await signCode(key, until);
    const link = APP_URL || (location.origin + '/#k=' + r.code);
    const item = { label: r.label, who, until, link, code: r.code, at: new Date().toISOString().slice(0, 10) };
    setRes(item); const h = [item, ...hist].slice(0, 300); setHist(h); try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch {}
  };
  const copy = (txt, what) => { try { navigator.clipboard.writeText(txt).then(() => { setCopied(what); setTimeout(() => setCopied(''), 1500); }).catch(() => {}); } catch {} };

  return (
    <div style={{ maxWidth: BACKEND ? 820 : 560, margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.03em' }}>razem<span style={{ color: '#C8102E' }}>.</span> <span style={{ font: "700 11px 'JetBrains Mono',monospace", color: '#5E6068', letterSpacing: '.08em' }}>AGENZIA</span></div>
        <div style={{ display: 'flex', gap: 2, background: '#E4DFD4', borderRadius: 9, padding: 3 }}>
          {['it', 'pl'].map(c => <button key={c} onClick={() => setLang(c)} style={{ border: 0, borderRadius: 7, padding: '5px 9px', font: "700 11px 'JetBrains Mono',monospace", cursor: 'pointer', background: c === lang ? '#16181D' : 'transparent', color: c === lang ? '#fff' : '#5E6068' }}>{c.toUpperCase()}</button>)}
        </div>
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', margin: '24px 0 6px' }}>{BACKEND ? PS[lang].bookings : t.title}</h1>
      <div style={{ fontSize: 15, color: '#4A4C54', lineHeight: 1.45 }}>{t.sub}</div>

      {BACKEND ? <Panel t={PS[lang]} /> : !key ? (
        <form onSubmit={unlock} style={box}>
          <label style={{ ...lbl, marginTop: 0 }}>{t.pw.toUpperCase()}</label>
          <input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} style={inp} />
          {err && <div role="alert" style={{ marginTop: 10, background: '#FDECEF', color: '#8E0B21', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{err}</div>}
          <button disabled={busy || !pw} style={{ ...btn('#16181D', '#fff'), width: '100%', marginTop: 14, opacity: busy || !pw ? 0.5 : 1 }}>{busy ? '…' : t.open}</button>
        </form>
      ) : (<>
        <div style={box}>
          <label style={{ ...lbl, marginTop: 0 }}>{t.who.toUpperCase()}</label>
          <input value={who} onChange={e => setWho(e.target.value)} placeholder="Anna Nowak + 1" style={inp} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>{t.ret.toUpperCase()}</label><input type="date" value={ret} onChange={e => setRet(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>{t.until.toUpperCase()}</label><input type="date" value={until} onChange={e => setUntil(e.target.value)} style={inp} /></div>
          </div>
          <div style={{ fontSize: 12, color: '#5E6068', marginTop: 6 }}>{t.hint}</div>
          <button onClick={generate} disabled={!until} style={{ ...btn('#C8102E', '#fff'), width: '100%', marginTop: 16, height: 54, opacity: until ? 1 : 0.4 }}>{t.gen}</button>
        </div>

        {res && (
          <div style={{ ...box, background: '#16181D', color: '#fff', border: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: "700 11px 'JetBrains Mono',monospace", letterSpacing: '.08em', color: '#F2B33D' }}><span>{t.link}</span><span>{res.label} · {res.until.split('-').reverse().join('.')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}><canvas ref={qr} style={{ borderRadius: 12, background: '#fff', padding: 8 }} /></div>
            <div style={{ font: "500 11px 'JetBrains Mono',monospace", color: '#C9CBD1', wordBreak: 'break-all', marginTop: 12, userSelect: 'all' }}>{APP_URL ? res.code : res.link}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <button onClick={() => copy(APP_URL ? res.code : res.link, 'l')} style={btn('#F2B33D', '#16181D')}>{copied === 'l' ? t.copied : (APP_URL ? t.copyCode : t.copy)}</button>
              <a href={'https://wa.me/?text=' + encodeURIComponent(msg(res.link, res.until, res.code))} target="_blank" rel="noopener" style={btn('#1F8A5B', '#fff')}>{t.wa}</a>
              <a href={'mailto:?subject=' + encodeURIComponent('Razem — dostęp do aplikacji') + '&body=' + encodeURIComponent(msg(res.link, res.until, res.code))} style={btn('rgba(255,255,255,.12)', '#fff')}>{t.mail}</a>
              <button onClick={() => copy(msg(res.link, res.until, res.code), 'm')} style={btn('rgba(255,255,255,.12)', '#fff')}>{copied === 'm' ? t.copied : t.copyMsg}</button>
            </div>
          </div>
        )}

        <div style={{ ...lbl, margin: '26px 0 8px' }}>{t.hist}</div>
        <div style={{ background: '#fff', borderRadius: 20, padding: '4px 16px' }}>
          {hist.length === 0 ? <div style={{ padding: '14px 0', fontSize: 14, color: '#5E6068' }}>{t.none}</div> : hist.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(22,24,29,.07)' }}>
              <span style={{ font: "700 12px 'JetBrains Mono',monospace", minWidth: 96 }}>{h.label}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{h.who || '—'}<span style={{ display: 'block', fontSize: 12, color: '#5E6068', fontWeight: 400 }}>→ {h.until.split('-').reverse().join('.')}</span></span>
              <button onClick={() => copy(APP_URL && h.code ? h.code : h.link, 'h' + i)} style={{ ...btn('#F4F1EA', '#16181D'), height: 36, font: "600 13px 'Onest'" }}>{copied === 'h' + i ? '✓' : t.copy}</button>
            </div>))}
        </div>
        <div style={{ fontSize: 12, color: '#5E6068', lineHeight: 1.5, marginTop: 12 }}>{t.revoke}</div>
        <button onClick={() => setKey(null)} style={{ marginTop: 16, border: 0, background: 'none', padding: 0, font: "600 13px 'Onest'", color: '#5E6068', cursor: 'pointer', textDecoration: 'underline' }}>{t.lock}</button>
      </>)}
    </div>
  );
}

export default Agency;
if (!window.__RAZEM_EMBED) {
  document.body.style.cssText = "margin:0;background:#F4F1EA;font-family:'Onest',system-ui,sans-serif;color:#16181D;-webkit-font-smoothing:antialiased";
  createRoot(document.getElementById('root')).render(<Agency />);
}
