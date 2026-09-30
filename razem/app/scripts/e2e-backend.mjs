// End-to-end test of the backend version (agency panel + traveller app).
// 1) node scripts/dev-backend.mjs   2) npm run build, copy dist/ elsewhere with config.js pointing to http://localhost:54321, serve it on :4174
// 3) node scripts/e2e-backend.mjs <screenshot-dir>   (needs playwright-core + Chromium)
import { chromium } from 'playwright-core';
const SP = process.argv[2], APP = 'http://localhost:4174', DB = 'http://localhost:54321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = []; let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  [' + extra + ']' : '')); };
const watch = p => { p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errs.push(m.text()); }); };
const today = new Date().toISOString().slice(0, 10);
const admin = sql => fetch(DB + '/__admin_sql', { method: 'POST', body: sql }).then(r => r.text());

// ---------- 1. agency creates a booking ----------
const actx = await b.newContext({ viewport: { width: 1000, height: 1100 }, permissions: ['clipboard-read', 'clipboard-write'] });
const a = await actx.newPage(); watch(a);
await a.goto(APP + '/agenzia.html');
await a.locator('input[type=email]').fill('demo@razem.test'); await a.locator('input[type=password]').fill('wrong-password');
await a.getByRole('button', { name: 'Entra' }).click(); await a.waitForTimeout(1200);
ok('agency: wrong password rejected', (await a.getByRole('alert').textContent()).includes('errati'));
await a.locator('input[type=password]').fill('demo-password-123'); await a.getByRole('button', { name: 'Entra' }).click();
await a.getByRole('button', { name: '+ Nuova prenotazione' }).click();
const field = (label) => a.locator('label', { hasText: new RegExp('^' + label.toUpperCase().replace(/[()]/g, '.') + '$') }).locator('xpath=following-sibling::*[1]');
await field('Viaggiatore / famiglia').fill('Katarzyna Wiśniewska');
await field('Numero volo').fill('LO 331'); await field('Aeroporto / terminal').fill('FCO · Fiumicino T1');
await field('Data arrivo').fill(today); await field('Ora arrivo').fill('10:15');
await field('Nome hotel').fill('Hotel Quirinale'); await field('Indirizzo (per il tassista)').fill('Via Nazionale, 7\n00184 Roma');
await field('Check-in').fill('15:00'); await field('Check-out').fill('10:00'); await field('Coordinate (facoltative)').fill('41.9003, 12.4955');
await field('Autista').fill('Luca Bianchi'); await field('Telefono autista').fill('+39 333 1234567'); await field('Targa').fill('EF 456 GH'); await field('Auto').fill('Mercedes V · grigio');
await field('Telefono assistente').fill('+39 06 1234567'); await field('Accompagnatore del gruppo').fill('Piotr Zieliński');
await field('Messaggio di benvenuto dell’agenzia').fill('Witamy w Rzymie! Zespół Wakacje z Rzymem.');
await a.getByRole('button', { name: '+ Aggiungi giorno' }).click(); await a.getByRole('button', { name: '+ Aggiungi giorno' }).click();
await a.locator('input[placeholder="Dzień 2 · Watykan"]').nth(0).fill('Dzień 1 · Przyjazd');
await a.locator('textarea').nth(3).fill('00:01 Przylot LO 331 | Fiumicino T1\n23:58 Kolacja na Trastevere | stolik zarezerwowany');
await a.locator('input[placeholder="Dzień 2 · Watykan"]').nth(1).fill('Dzień 2 · Watykan');
await a.locator('textarea').nth(4).fill('09:00 Muzea Watykańskie');
await a.getByRole('button', { name: 'Salva prenotazione' }).click(); await a.waitForTimeout(1200);
const code = (await a.locator('div', { hasText: /^RZM-[A-Z0-9]{4}-[A-Z0-9]{4}$/ }).first().textContent()).trim();
ok('agency: booking saved, code created', /^RZM-/.test(code), code);
await a.screenshot({ path: SP + '/shots/50-agency-booking.png', fullPage: true });

// ---------- 2. traveller opens the invitation link ----------
const mk = async () => { const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 }); const p = await c.newPage(); watch(p); return p; };
const p = await mk();
await p.goto(APP + '/#c=' + code); await p.waitForTimeout(1500);
ok('traveller: link opens trip card with real data', (await p.getByText('Hotel Quirinale').count()) > 0 && (await p.getByText(/LO 331/).count()) > 0);
await p.screenshot({ path: SP + '/shots/51-trip-card.png' });
await p.getByRole('button', { name: 'Dalej' }).click(); await p.getByText('Akceptuję').click(); await p.getByRole('button', { name: 'Dalej' }).click();
ok('traveller: assistant card', (await p.getByText('Marta Kowalska').count()) > 0);
await p.getByText('Przejdź do aplikacji').click(); await p.waitForTimeout(400);
ok('traveller: agency welcome message', (await p.getByText('Witamy w Rzymie! Zespół Wakacje z Rzymem.').count()) > 0);
await p.getByText('Zaczynamy zwiedzanie').click(); await p.waitForTimeout(500);
ok('traveller: greeting with name', (await p.getByText('Cześć, Katarzyna').count()) > 0);
ok('traveller: day line from programme', (await p.getByText(/dzień 1 z 2/).count()) > 0);
ok('traveller: today plan from programme', (await p.getByText('Kolacja na Trastevere').count()) > 0);
await p.screenshot({ path: SP + '/shots/52-home.png' });
await p.getByRole('button', { name: /Transfer z lotniska/ }).last().click().catch(async () => { await p.getByText('Transfer z lotniska').first().click(); });
await p.waitForTimeout(300);
ok('traveller: transfer sign + driver + plate', (await p.getByText('RAZEM · K. WIŚNIEWSKA').count()) > 0 && (await p.getByText('Luca Bianchi').count()) > 0 && (await p.getByText('EF 456 GH').count()) > 0);
await p.screenshot({ path: SP + '/shots/53-transfer.png' });
await p.getByRole('button', { name: '←' }).click();
await p.getByRole('button', { name: /^HTL/ }).first().click(); await p.waitForTimeout(300);
ok('traveller: hotel address + check-in', (await p.getByText('Via Nazionale, 7').count()) > 0 && (await p.getByText('15:00').count()) > 0);
await p.getByRole('button', { name: '←' }).click();

// ---------- 3. real chat, both directions ----------
await p.getByRole('button', { name: /Czat/ }).last().click();
await p.locator('input[placeholder="Wiadomość"]').fill('Dzień dobry, gdzie jest kierowca?'); await p.getByRole('button', { name: 'Wyślij' }).click();
await p.waitForTimeout(1500);
await a.reload(); await a.waitForTimeout(800);
const row = a.getByRole('button', { name: new RegExp(code) });
ok('agency: unread badge for new message', (await row.textContent()).includes('1'));
await row.click(); await a.waitForTimeout(1500);
ok('agency: sees traveller message', (await a.getByText('Dzień dobry, gdzie jest kierowca?').count()) > 0);
ok('agency: 1 connected phone', (await a.getByText(/TELEFONI COLLEGATI · 1\/6/).count()) > 0);
await a.locator('input[placeholder="Scrivi una risposta…"]').fill('Luca czeka przy wyjściu B, tablica z Twoim nazwiskiem.'); await a.getByRole('button', { name: 'Invia' }).click();
await p.waitForTimeout(5000);
ok('traveller: receives agency reply', (await p.getByText('Luca czeka przy wyjściu B, tablica z Twoim nazwiskiem.').count()) > 0);
await p.screenshot({ path: SP + '/shots/54-chat.png' });

// ---------- 4. max 6 phones ----------
let last;
for (let i = 2; i <= 7; i++) {
  last = await mk(); await last.goto(APP + '/'); await last.waitForTimeout(400);
  await last.getByText('Zaczynamy').click(); await last.locator('input').fill(code); await last.getByRole('button', { name: 'Pobierz' }).click(); await last.waitForTimeout(900);
  if (i === 6) ok('phone 6 accepted', (await last.getByText('Hotel Quirinale').count()) > 0);
}
ok('phone 7 refused (max 6)', ((await last.getByRole('alert').textContent().catch(() => '')) || '').includes('6 telefonach'));
await last.screenshot({ path: SP + '/shots/55-seventh.png' });

// ---------- 5. instant block ----------
await a.getByRole('button', { name: 'Blocca accesso subito' }).click(); await a.waitForTimeout(600);
await p.reload(); await p.waitForTimeout(1500);
ok('blocked: traveller locked out', ((await p.getByRole('alert').textContent().catch(() => '')) || '').includes('zablokowany'));
await p.screenshot({ path: SP + '/shots/56-blocked.png' });
await a.getByRole('button', { name: 'Riattiva accesso' }).click(); await a.waitForTimeout(600);
await p.locator('input').fill(code); await p.getByRole('button', { name: 'Pobierz' }).click(); await p.waitForTimeout(1000);
ok('unblocked: same phone re-enters without using a new slot', (await p.getByText('Hotel Quirinale').count()) > 0);
await p.getByRole('button', { name: 'Dalej' }).click(); await p.getByRole('button', { name: 'Dalej' }).click(); await p.getByText('Przejdź do aplikacji').click(); await p.getByText('Zaczynamy zwiedzanie').click();
await p.getByRole('button', { name: /Czat/ }).last().click(); await p.waitForTimeout(2500);
ok('chat history kept after re-entry', (await p.getByText('Luca czeka przy wyjściu B, tablica z Twoim nazwiskiem.').count()) > 0 && (await p.getByText('Dzień dobry, gdzie jest kierowca?').count()) > 0);

// ---------- 6. agency disconnects a phone ----------
await a.reload(); await a.waitForTimeout(600); await a.getByRole('button', { name: new RegExp(code) }).click(); await a.waitForTimeout(800);
await a.getByRole('button', { name: 'Scollega' }).first().click(); await a.waitForTimeout(600);
await p.reload(); await p.waitForTimeout(1500);
{ const al = (await p.getByRole('alert').textContent().catch(() => '')) || ''; ok('removed phone is locked out', al.includes('odłączony'), al + ' / devices shown: ' + (await a.getByText(/TELEFONI COLLEGATI/).textContent().catch(()=>'?'))); await p.screenshot({ path: SP + '/shots/57-removed.png' }); }

// ---------- 7. expiry ----------
await p.locator('input').fill(code); await p.getByRole('button', { name: 'Pobierz' }).click(); await p.waitForTimeout(1000);
await admin(`update bookings set valid_until = current_date - 1 where code = '${code}'`);
await p.reload(); await p.waitForTimeout(1500);
ok('expired code locks the app', ((await p.getByRole('alert').textContent().catch(() => '')) || '').includes('wygasł'));

console.log(`\n${pass} passed, ${fail} failed`); console.log('page errors:', errs.join(' | ') || 'none');
await b.close();
