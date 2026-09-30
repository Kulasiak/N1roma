import React from 'react';
import View from './View.jsx';
import { DEMO_POS, HOTEL } from './MapView.jsx';
import { loadState, saveState, saveDoc, loadDocs, wipeAll } from './storage.js';
import { T, ROUTE_STEPS, PH, IMGS, GUIDE_DEST, L, TOURS, CATS, PHRASES, TIPS, DATES, TIMES, avail, fmt, CROWD, WEATHER, qrFor, PLAN, DAYS, now } from './data.js';

// Extra strings for PWA-only features (live GPS + hand-off to native navigation).
Object.assign(T.pl, { gpsHere:'Twoja pozycja (GPS)', navOpen:'Nawigacja krok po kroku', fromHotel:'{d} od hotelu' });
Object.assign(T.it, { gpsHere:'La tua posizione (GPS)', navOpen:'Navigazione passo passo', fromHotel:"{d} dall'hotel" });
Object.assign(T.en, { gpsHere:'Your position (GPS)', navOpen:'Turn-by-turn navigation', fromHotel:'{d} from the hotel' });

// State that survives app restarts (everything else is per-session UI state).
const KEEP = ['lang','onbDone','code','tripLoaded','rodo','locMode','tickets','bStatus','msgs','stage','strikeHidden','safetyHidden','shareDocs','autoDel','agencyShare','alarmMode','alarmDist','groupAlert','groupRadius','crowdOff','people','docIds','filter'];
function restore(){
  const p = loadState(); if (!p) return {};
  const o = {}; KEEP.forEach(k => { if (k in p) o[k] = p[k]; });
  if (o.onbDone) { o.screen = 'home'; o.history = []; }
  return o;
}
let saveT = null;
function persist(st){ clearTimeout(saveT); saveT = setTimeout(() => { const o = {}; KEEP.forEach(k => { o[k] = st[k]; }); saveState(o); }, 250); }
function setThemeColor(c){ const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', c); }
function exportJson(st){
  const o = { exportedAt:new Date().toISOString() }; KEEP.forEach(k => { o[k] = st[k]; });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type:'application/json' }));
  a.download = 'razem-moje-dane.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const dist = (a, b) => { const R = 6371000, r = Math.PI/180, dLa = (b[0]-a[0])*r, dLo = (b[1]-a[1])*r; const h = Math.sin(dLa/2)**2 + Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
const inRome = (ll) => ll[0] > 41.75 && ll[0] < 42.05 && ll[1] > 12.30 && ll[1] < 12.70;

export default class App extends React.Component {
  siren(on){
    if (on) {
      try {
        const ctx = this.actx || (this.actx = new (window.AudioContext || window.webkitAudioContext)());
        ctx.resume && ctx.resume();
        const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        o.type = 'square'; o.frequency.value = 1000; lfo.frequency.value = 3; lg.gain.value = 450;
        lfo.connect(lg); lg.connect(o.frequency); g.gain.value = 0.12; o.connect(g); g.connect(ctx.destination);
        o.start(); lfo.start(); this.sirenNodes = [o, lfo];
      } catch(e) {}
    } else if (this.sirenNodes) { this.sirenNodes.forEach(n => { try { n.stop(); } catch(e) {} }); this.sirenNodes = null; }
  }
  addTicket(tk){ this.setState(st => ({ tickets:[tk, ...st.tickets], toastOn:true })); this.later(() => this.setState({ toastOn:false }), 2600); }
  state = { tickets:[{ id:'trf', kind:'TRF', t:{pl:'Transfer FCO → Hotel Artemide',it:'Transfer FCO → Hotel Artemide',en:'Transfer FCO → Hotel Artemide'}, sub:'12.10 · 12:30 · Giorgio · AB 123 CD', code:'RZM-T-2481', auto:true }], openTicket:null, pay:null, paying:false, toastOn:false, strikeHidden:false, safetyHidden:false, pushOn:false, armed:false, alarmMode:'motion', alarmDist:10, alarmOn:false, groupAlert:true, groupRadius:100, groupOn:false, guide:false, tour:null, hl:null, locMode:'always', rodo:false, routeOn:false, vault:'locked', docs:{}, shareDocs:false, autoDel:true, agencyShare:true, exported:false, delAsk:false, lang:'pl', screen:'onb', onb:0, code:'', tripLoaded:false, history:[], stage:0, tourId:'vat', filter:'all', bDate:'13.10', bTime:'10:00', people:2, bStatus:{}, helpCat:null, helpText:'', draft:'', typing:false, calling:null, callUp:false, citySheet:false, locShared:false, bigPhrase:null,
    offline:typeof navigator!=='undefined' && navigator.onLine===false, gps:null,
    msgs:[{from:'m',text:'Dzień dobry, Anna! Jestem Marta, Twoja opiekunka w Rzymie. Giorgio będzie czekał przy wyjściu B. Pisz o każdej porze 🙂'.replace(' 🙂',''),time:'10:05'}] , ...restore() };
  scrollRef = React.createRef();
  mapRef = React.createRef();
  screenRef = React.createRef();
  measure(){
    requestAnimationFrame(() => {
      const root = this.screenRef.current, sc = this.scrollRef.current; if (!root || this.state.tour === null) return;
      const key = T.pl.tour[this.state.tour][0];
      const el = root.querySelector('[data-guide="' + (key === '?' ? 'help' : key) + '"]'); if (!el) return;
      const k = 1;
      if (sc && sc.contains(el)) {
        const r0 = el.getBoundingClientRect(), s0 = sc.getBoundingClientRect();
        const top = (r0.top - s0.top) / k, bot = (r0.bottom - s0.top) / k;
        if (top < 0 || bot > sc.clientHeight) sc.scrollTop += top - 90;
      }
      const rr = root.getBoundingClientRect(), r = el.getBoundingClientRect();
      this.setState({ hl:{ x:(r.left-rr.left)/k - 6, y:(r.top-rr.top)/k - 6, w:r.width/k + 12, h:r.height/k + 12 } });
    });
  }
  postMap(msg){ const m = this.mapRef.current; if (m && msg.recenter) m.recenter(); }
  timers = [];
  componentWillUnmount(){ this.timers.forEach(clearTimeout); this.siren(false); this.cleanup.forEach(f => f()); }
  later(fn, ms){ this.timers.push(setTimeout(fn, ms)); }
  componentDidUpdate(pp, ps){
    persist(this.state);
    if (ps.locMode !== this.state.locMode && this.state.locMode !== 'off') this.watchGps();
    if (ps.screen !== this.state.screen) setThemeColor(this.state.screen === 'sos' ? '#C8102E' : '#F4F1EA');

    if (this.state.tour !== null && (ps.tour !== this.state.tour || ps.screen !== this.state.screen || ps.lang !== this.state.lang)) this.measure();
    const el = this.scrollRef.current; if (!el) return;
    if (ps.screen !== this.state.screen) el.scrollTop = this.state.screen === 'chat' ? el.scrollHeight : 0;
    else if (this.state.screen === 'chat' && (ps.msgs.length !== this.state.msgs.length || ps.typing !== this.state.typing)) el.scrollTop = el.scrollHeight;
  }
  mapPush(s){ if (s === 'map' && !this.pushShown) { this.pushShown = true; this.later(() => this.setState({ pushOn:true }), 1500); this.later(() => this.setState({ pushOn:false }), 8000); } }
  go = (s) => this.mapPush(s) || this.setState(st => st.screen === s ? null : ({ screen:s, history:[...st.history, st.screen], citySheet:false }));
  tab = (s) => this.mapPush(s) || this.setState({ screen:s, history:[] });
  back = () => this.setState(st => { const h = [...st.history]; const p = h.pop() || 'home'; return { screen:p, history:h }; });
  martaReply(text, delay=1600, extra){
    this.later(() => this.setState({ typing:true }), 500);
    this.later(() => this.setState(st => ({ typing:false, msgs:[...st.msgs, { from:'m', text, time:now() }], ...(extra ? extra(st) : {}) })), delay);
  }
  send(text){
    if (!text.trim()) return;
    this.setState(st => ({ msgs:[...st.msgs, { from:'u', text, time:now() }], draft:'' }));
    this.martaReply(this.state.offline ? 'Dostałam Twój SMS. Nie masz internetu — zadzwonię do Ciebie za minutę na zwykły numer.' : 'Rozumiem, już się tym zajmuję. Odezwę się za 2 minuty — jeśli wolisz, mogę też zadzwonić.');
  }
  startCall(name, initials, video){
    this.setState({ calling:{ name, initials, video }, callUp:false });
    this.later(() => this.setState(st => st.calling ? { callUp:true } : null), 1800);
  }
  cleanup = [];
  H(){ const r = this.screenRef.current; return r ? r.clientHeight : window.innerHeight; }
  componentDidMount(){
    const net = () => this.setState({ offline: navigator.onLine === false });
    window.addEventListener('online', net); window.addEventListener('offline', net);
    this.cleanup.push(() => { window.removeEventListener('online', net); window.removeEventListener('offline', net); });
    const onResize = () => { if (this.state.tour !== null) this.measure(); };
    window.addEventListener('resize', onResize); this.cleanup.push(() => window.removeEventListener('resize', onResize));
    this.watchGps();
    setThemeColor(this.state.screen === 'sos' ? '#C8102E' : '#F4F1EA');
  }
  watchGps(){
    if (this.gpsId != null || !navigator.geolocation || this.state.locMode === 'off') return;
    this.gpsId = navigator.geolocation.watchPosition(
      p => this.setState({ gps:{ ll:[p.coords.latitude, p.coords.longitude], acc:Math.max(5, Math.round(p.coords.accuracy)) } }),
      () => {}, { enableHighAccuracy:true, maximumAge:10000, timeout:20000 });
    this.cleanup.push(() => navigator.geolocation.clearWatch(this.gpsId));
  }
  mapVals(t){
    const g = this.state.gps, real = !!(g && this.state.locMode !== 'off' && inRome(g.ll));
    const ll = real ? g.ll : DEMO_POS, d = dist(ll, HOTEL);
    const km = d < 1000 ? Math.round(d/10)*10 + ' m' : (d/1000).toFixed(1).replace('.', this.state.lang==='en' ? '.' : ',') + ' km';
    return {
      mapPos: { ll, acc: real ? g.acc : 35, real },
      placeName: real ? t.gpsHere : 'Fontanna di Trevi',
      placeSub: real ? fmt(t.fromHotel, { d:km }) : 'Piazza di Trevi · ' + t.toHotel,
      routeHead: real ? Math.max(1, Math.round(d * 1.3 / 80)) + ' min · ' + km : '14 min · 1,1 km',
      demoRoute: !real,
      navHref: 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + HOTEL.join(',') + (real ? '&origin=' + ll.join(',') : ''),
    };
  }
  armMotion(){
    if (this.state.alarmMode !== 'motion' || this.motionOn) return;
    const start = () => {
      let base = null;
      const h = (e) => {
        if (!this.state.armed || this.state.alarmOn || this.state.alarmMode !== 'motion') return;
        const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
        const v = [a.x, a.y, a.z];
        if (!base) { base = v; return; }
        const delta = Math.abs(v[0]-base[0]) + Math.abs(v[1]-base[1]) + Math.abs(v[2]-base[2]);
        base = v.map((x, i) => base[i] * 0.9 + x * 0.1);
        if (delta > 6) { this.setState({ alarmOn:true }); this.siren(true); }
      };
      window.addEventListener('devicemotion', h); this.motionOn = true;
      this.cleanup.push(() => window.removeEventListener('devicemotion', h));
    };
    const D = window.DeviceMotionEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().then(r => { if (r === 'granted') start(); }).catch(() => {});
    else if (D) start();
  }
  render(){ return <View v={this.renderVals()} />; }
  renderVals(){
    const s = this.state, lang = s.lang, t = T[lang];
    const sc = s.screen;
    const dark = sc === 'sos';
    const subTitles = { transfer:t.transfer, tour:t.tabExplore, sos:t.sosT, hotel:t.hotel, transport:t.transport, tips:t.tips, phrases:t.phrases, trip:t.trip, docs:t.vaultT, privacy:t.privacy, protect:t.protect, tickets:t.tickets };
    const tabOf = { home:'home', transfer:'home', hotel:'home', transport:'home', tips:'home', phrases:'home', trip:'home', privacy:'home', tickets:'home', protect:'help', docs:'help', map:'map', explore:'explore', tour:'explore', help:'help', sos:'help', chat:'chat' };
    const activeTab = tabOf[sc];
    const tabDefs = [['home','',t.tabToday],['map','',t.tabMap],['explore','',t.tabExplore],['help','',t.tabHelp],['chat','',t.tabChat]];
    const icons = { home:'●', map:'◇', explore:'◎', help:'!', chat:'···' };
    const tabs = tabDefs.map(([id,code,label]) => ({ code: icons[id], label, onClick:()=>this.tab(id), fg: activeTab===id ? '#16181D' : '#8A8D96', bg: activeTab===id ? (id==='help' ? '#C8102E' : '#16181D') : 'transparent', iconFg: activeTab===id ? '#fff' : (id==='help' ? '#C8102E' : '#8A8D96') }));
    const langs = ['pl','it','en'].map(c => ({ code:c.toUpperCase(), onClick:()=>this.setState({lang:c}), bg: c===lang ? '#16181D' : 'transparent', fg: c===lang ? '#fff' : '#5E6068' }));
    const stageDefs = [[t.st0,t.st0s],[t.st1,t.st1s],[t.st2,t.st2s],[t.st3,t.st3s]];
    const stages = stageDefs.map(([label,sub],i) => { const done = i < s.stage, cur = i === s.stage; return { label, sub, mark: done ? '✓' : String(i+1), dotBg: done ? '#1F8A5B' : cur ? '#F2B33D' : '#E4DFD4', dotFg: done ? '#fff' : '#16181D', lineBg: i===3 ? 'transparent' : done ? '#1F8A5B' : '#E4DFD4', color: done ? '#5E6068' : '#16181D', weight: cur ? 700 : 500 }; });
    const stageLabel = s.stage >= 4 ? t.st4 : stageDefs[s.stage][0] + ' · ' + stageDefs[s.stage][1];
    const tiles = [['TRF',t.transfer,'transfer'],['HTL',t.hotel,'hotel'],['BUS',t.transport,'transport'],['TUR',t.tours,'x:tours'],['MUZ',t.museums,'x:museums'],['VAT',t.vatican,'x:vatican'],['MAP',t.map,'map'],['DOC',t.docs,'docs'],['TIP',t.tips,'tips'],['ABC',t.phrases,'phrases'],['PRV',t.privacy,'privacy'],['ALR',t.protect,'protect']].map(([code,label,dest]) => ({ code, label, fg: code==='VAT' ? '#C8102E' : code==='MAP' ? '#1C5FB8' : '#16181D', onClick:()=>{ if (dest.startsWith('x:')) { this.setState({ filter:dest.slice(2) }); this.go('explore'); } else this.go(dest); } }));
    const planToday = PLAN.map((p,i) => { const done = i===0 || (i===1 && s.stage>=4); const now_ = i===1 && s.stage<4; return { time:p.time, title:L(p.t,lang), sub:p.s, color: done ? '#8A8D96' : '#16181D', timeColor: now_ ? '#C8102E' : done ? '#8A8D96' : '#16181D', badge: done ? 'OK' : now_ ? '●' : '', badgeColor: done ? '#1F8A5B' : '#C8102E' }; });
    const filters = [['all',t.all],['tours',t.tours],['museums',t.museums],['vatican',t.vatican]].map(([id,label]) => ({ label, onClick:()=>this.setState({filter:id}), bg: s.filter===id ? '#16181D' : '#fff', fg: s.filter===id ? '#fff' : '#16181D', border: s.filter===id ? '1px solid #16181D' : '1px solid rgba(22,24,29,.12)' }));
    const statusOf = (id) => s.bStatus[id];
    const tourList = TOURS.filter(x => s.filter==='all' || x.cat===s.filter).map(x => { const st = statusOf(x.id); const first = DATES.map(d => [d, TIMES.reduce((a,tm)=>a+avail(x.id,d,tm),0)]).find(([,n]) => n>0) || ['—',0]; const low = first[1] < 10;
      return { ...x, availText: fmt(low ? t.cardLow : t.cardAvail, { n:first[1], d:first[0] }), availDot: low ? '#E0A21F' : '#3DBE7A', availFg: low ? '#8A5A00' : '#1F8A5B', title:L(x.t,lang), desc:L(x.d,lang), img:PH(IMGS[x.id]), onClick:()=>{ this.setState({ tourId:x.id }); this.go('tour'); }, status: st==='confirmed' ? '✓ '+t.okStatus : st==='pending' ? t.reqStatus : '', statusBg: st==='confirmed' ? '#1F8A5B' : st==='pending' ? '#F2B33D' : 'transparent', statusFg: st==='confirmed' ? '#fff' : '#16181D' }; });
    const tx = TOURS.find(x => x.id===s.tourId);
    const tour = { ...tx, title:L(tx.t,lang), desc:L(tx.d,lang), img:PH(IMGS[tx.id]) };
    const tst = statusOf(s.tourId);
    const opt = (v, cur, key) => ({ label:v, onClick:()=>this.setState({[key]:v}), bg: v===cur ? '#16181D' : '#fff', fg: v===cur ? '#fff' : '#16181D', border: v===cur ? '1px solid #16181D' : '1px solid rgba(22,24,29,.12)' });
    const priceNum = parseInt(tx.price);
    const cats = CATS.map(c => { const on = s.helpCat===c.id; return { code:c.code, label:L(c.t,lang), onClick:()=>this.setState({helpCat:c.id}), bg: on ? '#16181D' : '#fff', fg: on ? '#fff' : '#16181D', border: on ? '1.5px solid #16181D' : '1.5px solid rgba(22,24,29,.1)' }; });
    const msgs = s.msgs.map(m => ({ ...m, align: m.from==='u' ? 'flex-end' : 'flex-start', bg: m.from==='u' ? '#16181D' : '#fff', fg: m.from==='u' ? '#fff' : '#16181D' }));
    const phraseList = PHRASES.map(([pl,it,say],i) => { const big = s.bigPhrase===i; return { pl: lang==='pl' ? pl : (lang==='en' ? ['Good morning','Thank you','How much is it?','Where is the toilet?','The bill, please','I need help',"I don't speak Italian"][i] : pl), it, say, size: big ? '32px' : '19px', bg: big ? '#16181D' : '#fff', fg: big ? '#fff' : '#16181D', onClick:()=>this.setState({ bigPhrase: big ? null : i }) }; });
    return {
      t, langs, tabs, tiles, planToday, stages, stageLabel, filters, tourList, tour, cats, msgs, phraseList,
      scrollRef:this.scrollRef,
      statusBg: dark ? '#C8102E' : '#F4F1EA', statusFg: dark ? '#fff' : '#16181D',
      contentBottom: sc==='onb' || sc==='welcome' ? '0px' : 'calc(64px + var(--sab))',
      isOnb: sc==='onb', onb0: s.onb===0, onb1: s.onb===1, onb2: s.onb===2, onb3: s.onb===3,
      onbDots: [0,1,2,3].map(i => ({ bg: i<=s.onb ? '#C8102E' : '#DCD6C9' })),
      code: s.code, tripLoaded: s.tripLoaded, notLoaded: !s.tripLoaded, onbBtnBg: s.tripLoaded ? '#16181D' : '#B9B2A3',
      onCode: (e)=>this.setState({ code:e.target.value.toUpperCase(), tripLoaded:false }),
      useDemo: ()=>this.setState({ code:'RZM-2481', tripLoaded:true }),
      fetchTrip: ()=>this.setState(st => st.code.trim().length>=4 ? { tripLoaded:true } : { code:'RZM-2481', tripLoaded:true }),
      onbNext: ()=>this.setState(st => st.onb<3 ? { onb:st.onb+1 } : { screen:'welcome', history:[] }),
      isWelcome: sc==='welcome', welcomeImg: 'linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 45%),url("https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent("St_Peter's_Square,_Vatican_City_-_April_2007.jpg") + '?width=1000") center/cover',
      goMapTab: ()=>this.tab('map'),
      crowdList: CROWD.map(([k,name,lvl]) => ({ name, level:t.lvl[lvl], color: lvl==='high' ? '#C8102E' : lvl==='mid' ? '#B37A00' : '#1F8A5B', best: t.best+': '+t.bestTimes[k] })),
      toggleCrowd: ()=>{ const v = !(this.state.crowdOff); this.setState({ crowdOff:v }); this.postMap({ crowd:!v }); },
      crowdBtnBg: s.crowdOff ? '#fff' : '#16181D', crowdBtnFg: s.crowdOff ? '#16181D' : '#fff',
      weather: WEATHER.map(([hi,lo,k],i) => ({ day:t.days[i], hi, lo, cardBg: i===0 ? '#F4F1EA' : 'transparent', iconBg: k==='sun' ? '#F2B33D' : k==='part' ? 'linear-gradient(135deg,#F2B33D 45%,#CFC9BC 45%)' : '#8FA8C8', iconH: k==='sun' ? '20px' : '14px', iconR: k==='sun' ? '50%' : '8px', iconShadow: k==='rain' ? '0 5px 0 -3px #1C5FB8' : 'none' })),
      showStrike: !s.strikeHidden, hideStrike: ()=>this.setState({strikeHidden:true}), goTransport: ()=>this.go('transport'),
      goTickets: ()=>{ this.setState({toastOn:false}); this.go('tickets'); }, isTickets: sc==='tickets',
      ticketCount: s.tickets.length, ticketsLine: t.ticketsLine,
      ticketList: s.tickets.map(tk => { const open = s.openTicket===tk.id; return { kind:tk.kind, title:L(tk.t,lang), sub:tk.sub, code:tk.code, badge: tk.auto ? t.auto : t.bought, badgeBg: tk.auto ? '#F2B33D' : '#6FD39F', open, toggle: open ? t.qrClose : t.qrOpen, onClick:()=>this.setState({ openTicket: open ? null : tk.id }) }; }),
      qrCells: s.openTicket ? qrFor(s.openTicket) : [],
      tourHasTicket: !!tx.tprice && !tst, ticketTotal: tx.tprice ? (parseInt(tx.tprice)*s.people)+' €' : '',
      buyTourTicket: ()=>this.setState({ pay:{ kind:tx.code, t:tx.t, sub:s.bDate+' · '+s.bTime+' · '+s.people+' '+t.persons, price:(parseInt(tx.tprice)*s.people)+' €' } }),
      transitTickets: [['BIT','1,50 €',t.t100],['ROMA 24H','9,30 €',t.t24],['ROMA 48H','12,50 €',t.t48],['ROMA 72H','18,00 €',t.t72]].map(([name,price,valid]) => ({ name, price, valid, onClick:()=>this.setState({ pay:{ kind:'BUS', t:{pl:'ATAC · '+name,it:'ATAC · '+name,en:'ATAC · '+name}, sub:valid, price } }) })),
      payOpen: !!s.pay, payTitle: s.pay ? L(s.pay.t,lang) : '', payPrice: s.pay ? s.pay.price : '', paySub: s.pay ? s.pay.sub : '', payBtn: s.paying ? t.paying : t.pay + (s.pay ? ' · '+s.pay.price : ''),
      closePay: ()=>this.setState({ pay:null, paying:false }),
      confirmPay: ()=>{ if (s.paying || !s.pay) return; const p = s.pay; this.setState({ paying:true }); this.later(()=>{ this.setState({ pay:null, paying:false }); this.addTicket({ id:'RZM-B-'+Date.now().toString().slice(-5), kind:p.kind, t:p.t, sub:p.sub, code:'RZM-B-'+Date.now().toString().slice(-5), auto:false }); }, 1100); },
      toastOn: s.toastOn,
      offline: !!s.offline, toggleNet: ()=>this.setState({ offline: navigator.onLine===false }),
      netLabel: s.offline ? 'OFFLINE' : '5G ▮▮▮', netBg: s.offline ? '#F2B33D' : 'transparent',
      offList: t.off.map(([icon,label]) => ({ icon, label, mark: icon==='✓' ? '#6FD39F' : icon==='SMS' ? '#F2B33D' : '#8A8D96', fg: icon==='—' ? '#8A8D96' : '#E3E4E8' })),
      mapLine: s.offline ? t.offMap : (s.locMode==='always' ? t.gpsOn : s.locMode==='sos' ? t.gpsSos : t.gpsOff),
      enterHome: ()=>this.setState({ screen:'home', history:[], onbDone:true }),
      showSafety: !s.safetyHidden, hideSafety: ()=>this.setState({safetyHidden:true}), goTips: ()=>this.go('tips'),
      pushOn: s.pushOn, hidePush: ()=>this.setState({pushOn:false}),
      isHome: sc==='home', isTransfer: sc==='transfer', isExplore: sc==='explore', isTour: sc==='tour', isHelp: sc==='help', isChat: sc==='chat', isSos: sc==='sos', isHotel: sc==='hotel', isTransport: sc==='transport', isTips: sc==='tips', isPhrases: sc==='phrases', isTrip: sc==='trip',
      hasSubHeader: !!subTitles[sc], subTitle: subTitles[sc], subHeaderBg: dark ? '#C8102E' : '#F4F1EA', subHeaderFg: dark ? '#fff' : '#16181D', backBg: dark ? 'rgba(255,255,255,.16)' : '#fff',
      showTabs: sc!=='onb' && sc!=='welcome',
      back:this.back, goSos:()=>this.go('sos'), goTransfer:()=>this.go('transfer'), goChat:()=>this.tab('chat'), goTrip:()=>this.go('trip'),
      openCity:()=>this.setState({citySheet:true}), closeCity:()=>this.setState({citySheet:false}), citySheet:s.citySheet,
      futureCities: lang==='it' ? ['Firenze','Milano','Venezia'] : lang==='en' ? ['Florence','Milan','Venice'] : ['Florencja','Mediolan','Wenecja'],
      nextStage: ()=>this.setState(st => ({ stage: st.stage>=4 ? 0 : st.stage+1 })),
      stageBars: [0,1,2,3].map(i => ({ bg: i < s.stage ? '#3DBE7A' : i===s.stage ? '#F2B33D' : 'rgba(255,255,255,.18)' })),
      callMarta: ()=>this.startCall('Marta Kowalska','MK',false), videoMarta: ()=>this.startCall('Marta Kowalska','MK',true), callDriver: ()=>this.startCall('Giorgio R.','GR',false),
      isCalling: !!s.calling, callName: s.calling ? s.calling.name : '', callInitials: s.calling ? s.calling.initials : '',
      callStatus: s.calling ? (s.callUp ? (s.calling.video ? t.videoCall+' · ' : '') + t.connected : t.calling) : '',
      endCall: ()=>this.setState({ calling:null, callUp:false }),
      pulseEl: React.createElement('div', { style:{ position:'absolute', inset:0, borderRadius:'50%', background:'#F2B33D', animation:'pulse 1.6s ease-out infinite' } }),
      dateOpts: DATES.map(v => { const o = opt(v, s.bDate, 'bDate'); const sum = TIMES.reduce((a,tm)=>a+avail(tx.id,v,tm),0); const sel = v===s.bDate; return { ...o, sub: sum>=30 ? t.many : sum>0 ? t.few : t.soldOut, dot: sum>=30 ? '#3DBE7A' : sum>0 ? '#E0A21F' : '#C8102E', subFg: sel ? '#C9CBD1' : '#5E6068' }; }),
      timeOpts: TIMES.map(v => { const n = avail(tx.id, s.bDate, v), sel = v===s.bTime, none = n===0; return { label:v, disabled:none, onClick:()=>{ if (!none) this.setState({bTime:v}); }, bg: none ? '#EEEAE2' : sel ? '#16181D' : '#fff', fg: none ? '#9A9CA3' : sel ? '#fff' : '#16181D', border: sel ? '1px solid #16181D' : '1px solid rgba(22,24,29,.12)', cursor: none ? 'not-allowed' : 'pointer', strike: none ? 'line-through' : 'none', sub: none ? t.soldOut : n<=3 ? t.lastSeats+' '+n : n+' '+t.seats, subFg: none ? '#C8102E' : sel ? '#F2B33D' : n<=3 ? '#C8102E' : '#1F8A5B' }; }),
      ...(()=>{ const n = avail(tx.id, s.bDate, s.bTime), o = { n, d:s.bDate, t:s.bTime, p:s.people }; const state = n===0 ? 'none' : n < s.people ? 'short' : n<=3 ? 'low' : 'ok';
        return { availLine: fmt(state==='none' ? t.availNone : state==='short' ? t.availShort : state==='low' ? t.availLow : t.availOk, o),
          availBg: state==='ok' ? '#E4F4EB' : state==='low' ? '#FFF6DF' : '#FDECEF', availFg: state==='ok' ? '#1E4D35' : state==='low' ? '#4A3B12' : '#8E0B21', availDot: state==='ok' ? '#3DBE7A' : state==='low' ? '#E0A21F' : '#C8102E',
          cantBook: state==='none' || state==='short', bookOpacity: state==='none' || state==='short' ? 0.4 : 1 }; })(),
      people: s.people, incP: ()=>this.setState(st=>({people:Math.min(10,st.people+1)})), decP: ()=>this.setState(st=>({people:Math.max(1,st.people-1)})),
      total: (priceNum*s.people)+' €',
      tourIdle: !tst, tourPending: tst==='pending', tourConfirmed: tst==='confirmed',
      bookingLine: s.bDate+' · '+s.bTime+' · '+s.people+' × '+tx.price,
      sendRequest: ()=>{
        const id = s.tourId, title = L(tx.t,'pl');
        this.setState(st => ({ bStatus:{ ...st.bStatus, [id]:'pending' }, msgs:[...st.msgs, { from:'u', text:'Prośba: '+title+' · '+st.bDate+' '+st.bTime+' · '+st.people+' os.', time:now() }] }));
        const vcode = 'RZM-V-'+(4000+Math.floor(Math.random()*900));
        this.martaReply('Potwierdzone! '+title+', '+s.bDate+' o '+s.bTime+'. Voucher: '+vcode+' — jest już w „Moje bilety”. Przewodniczka Ewa będzie czekać 15 min wcześniej.', 3200, st => ({ bStatus:{ ...st.bStatus, [id]:'confirmed' }, tickets:[{ id:vcode, kind:tx.code, t:tx.t, sub:s.bDate+' · '+s.bTime+' · '+s.people+' × PL', code:vcode, auto:true }, ...st.tickets] }));
      },
      helpText: s.helpText, onHelpText: (e)=>this.setState({helpText:e.target.value}), noCat: !s.helpCat, helpBtnBg: s.helpCat ? '#16181D' : '#B9B2A3',
      sendHelp: ()=>{ if (!s.helpCat) return; const c = CATS.find(x=>x.id===s.helpCat); const txt = L(c.t,'pl') + (s.helpText.trim() ? ': '+s.helpText.trim() : ''); this.setState({ helpCat:null, helpText:'', screen:'chat', history:[] }); this.send(txt); },
      hotelProblem: ()=>{ this.setState({ helpCat:'htl', screen:'help', history:[] }); },
      chatStatus: s.typing ? 'Marta '+t.typing : t.online, typing: s.typing,
      draft: s.draft, onDraft: (e)=>this.setState({draft:e.target.value}), onDraftKey: (e)=>{ if (e.key==='Enter') this.send(this.state.draft); }, sendDraft: ()=>this.send(this.state.draft),
      locLabel: s.locShared ? t.shared : t.share, shareLoc: ()=>this.setState({locShared:true}),
      lines: [
        {code:'A',color:'#E8601C',route:'Termini · Spagna · Ottaviano',use: lang==='pl' ? 'Watykan (Ottaviano), Schody Hiszpańskie' : lang==='it' ? 'Vaticano (Ottaviano), Piazza di Spagna' : 'Vatican (Ottaviano), Spanish Steps'},
        {code:'B',color:'#1C5FB8',route:'Termini · Colosseo · Circo Massimo',use: lang==='pl' ? 'Koloseum, Forum Romanum' : lang==='it' ? 'Colosseo, Foro Romano' : 'Colosseum, Roman Forum'},
        {code:'40',color:'#16181D',route:'Termini → Borgo Sant\u2019Angelo',use: lang==='pl' ? 'Szybki autobus pod Watykan' : lang==='it' ? 'Bus veloce verso il Vaticano' : 'Express bus towards the Vatican'},
        {code:'FL1',color:'#1F8A5B',route:'Fiumicino → Trastevere · Tiburtina',use: lang==='pl' ? 'Pociąg z lotniska, 8 €' : lang==='it' ? "Treno dall'aeroporto, 8 €" : 'Airport train, €8'}
      ],
      locOpts: [['always',t.locAlways],['sos',t.locSosOnly],['off',t.locNone]].map(([id,label]) => ({ label, onClick:()=>this.setState({locMode:id}), bg: s.locMode===id ? '#16181D' : 'transparent', fg: s.locMode===id ? '#fff' : '#33353C' })),
      locDot: s.locMode==='always' ? '#3DBE7A' : s.locMode==='sos' ? '#E0A21F' : '#B9B2A3',
      locLine: s.locMode==='always' ? t.locLineOn : s.locMode==='sos' ? t.locLineSos : t.locLineOff,
      gpsLine: s.locMode==='always' ? t.gpsOn : s.locMode==='sos' ? t.gpsSos : t.gpsOff,
      toggleRodo: ()=>this.setState(st=>({rodo:!st.rodo})), noRodo: !s.rodo, rodoBg: s.rodo ? '#1F8A5B' : '#fff', rodoBorder: s.rodo ? '2px solid #1F8A5B' : '2px solid #B9B2A3', rodoMark: s.rodo ? '✓' : '', rodoBtnBg: s.rodo ? '#16181D' : '#B9B2A3',
      isMap: sc==='map', isDocs: sc==='docs', isPrivacy: sc==='privacy',
      goPrivacy: ()=>this.go('privacy'), goDocs: ()=>this.go('docs'), goHotel: ()=>this.go('hotel'),
      mapRef: this.mapRef, onMapLoad: ()=>this.postMap({ route:this.state.routeOn, crowd:!this.state.crowdOff }), recenter: ()=>this.postMap({ recenter:true }),
      routeOn: s.routeOn, noRoute: !s.routeOn, ...this.mapVals(t), startRoute: ()=>this.setState({routeOn:true}), endRoute: ()=>this.setState({routeOn:false}),
      routeSteps: ROUTE_STEPS[lang].map(([arrow,text,dist],i) => ({ arrow, text, dist, bg: i===0 ? '#16181D' : '#F4F1EA', fg: i===0 ? '#fff' : '#16181D', weight: i===0 ? 700 : 500 })),
      lostHelp: ()=>{ this.setState({ screen:'chat', history:[] }); this.send('Zgubiłam się. Jestem przy Fontannie di Trevi — widzisz moją lokalizację?'); },
      vaultLocked: s.vault!=='open', vaultOpen: s.vault==='open', unlockLabel: s.vault==='checking' ? t.unlocking : t.unlock,
      unlockVault: ()=>{ this.setState({vault:'checking'}); Promise.all([loadDocs(this.state.docIds||[]).catch(()=>({})), new Promise(r=>setTimeout(r, 900))]).then(([docs])=>this.setState(st=>({ vault:'open', docs:{ ...docs, ...st.docs } }))); },
      lockVault: ()=>this.setState({vault:'locked', docs:{}}),
      docList: [['passport',t.passport],['idcard',t.idcard],['ekuz',t.ekuz],['insurance',t.insurance]].map(([id,label]) => { const url = s.docs[id]; return { label, hint: url ? '' : t.tapPhoto, st: url ? t.saved : t.addPhoto, stColor: url ? '#1F8A5B' : '#C8102E', bg: url ? 'url('+url+')' : 'repeating-linear-gradient(135deg,#EFEBE3 0 8px,#E6E1D6 8px 16px)', onFile:(e)=>{ const f = e.target.files && e.target.files[0]; if (f) saveDoc(id, f).then(url => this.setState(st=>({ docs:{ ...st.docs, [id]:url }, docIds:[...new Set([...(st.docIds||[]), id])] }))); } }; }),
      toggleShareDocs: ()=>this.setState(st=>({shareDocs:!st.shareDocs})), shareDocsBg: s.shareDocs ? '#1F8A5B' : '#CFC9BC', shareDocsJust: s.shareDocs ? 'flex-end' : 'flex-start', shareDocsSub: s.shareDocs ? t.shareOnTxt : t.shareOff,
      theftSteps: [t.theft1,t.theft2,t.theft3].map((text,i)=>({ n:String(i+1).padStart(2,'0'), text })),
      reportTheft: ()=>{ this.setState({ screen:'chat', history:[], shareDocs:true }); this.send('Skradziono mi dokumenty. Udostępniam Ci zdjęcie paszportu na 24 h.'); },
      privRows: [['locMode',t.pShareLoc,t.pShareLocSub],['autoDel',t.pAuto,t.pAutoSub],['agencyShare',t.pAgency,t.pAgencySub]].map(([k,title,sub]) => { const on = k==='locMode' ? s.locMode!=='off' : s[k]; return { title, sub, bg: on ? '#1F8A5B' : '#CFC9BC', just: on ? 'flex-end' : 'flex-start', onClick:()=>this.setState(st => k==='locMode' ? { locMode: st.locMode==='off' ? 'always' : 'off' } : { [k]: !st[k] }) }; }),
      exportData: ()=>{ exportJson(this.state); this.setState({exported:true}); }, exportLabel: s.exported ? t.downloaded : 'JSON · PDF',
      askDelete: ()=>{ if (this.state.delAsk) { wipeAll().then(()=>location.reload()); } else this.setState({delAsk:true}); }, deleteLabel: s.delAsk ? t.deleteConfirm : t.deleteAcc,
      heroImg: PH('Colosseo_2020.jpg'),
      cityCards: [[t.cityRome,'Colosseum_in_Rome,_Italy_-_April_2007.jpg',true],[lang==='pl'?'Florencja':lang==='it'?'Firenze':'Florence','Florence_Duomo_from_Michelangelo_hill.jpg'],[lang==='pl'?'Mediolan':lang==='it'?'Milano':'Milan','Milan_Cathedral_from_Piazza_del_Duomo.jpg'],[lang==='pl'?'Wenecja':lang==='it'?'Venezia':'Venice','Canal_Grande_Chiesa_della_Salute_e_Dogana_dal_ponte_dell_Accademia.jpg']].map(([name,f,on]) => ({ name, img:PH(f), badge: on ? '● '+t.active : t.soon, badgeBg: on ? '#F2B33D' : 'rgba(255,255,255,.9)', badgeFg:'#16181D' })),
      inspo: [['Fontana di Trevi','Trevi_Fountain,_Rome,_Italy_2_-_May_2007.jpg','15 MIN · HTL','map'],['Piazza San Pietro',"St_Peter's_Square,_Vatican_City_-_April_2007.jpg",'VAT','vatican'],['Pantheon','Pantheon_Rome.jpg','20 MIN · HTL','map'],['Cappella Sistina','Sistine_Chapel_ceiling_02.jpg','VAT','vatican'],['Santa Maria in Trastevere','Santa_Maria_in_Trastevere.jpg','TUR','tours']].map(([name,f,sub,dest]) => ({ name, sub, img:PH(f), onClick:()=>{ if (dest==='map') this.tab('map'); else { this.setState({ filter:dest }); this.tab('explore'); } } })),
      isProtect: sc==='protect', goProtect: ()=>this.go('protect'),
      alarmModes: [['motion',t.modeMotion],['watch',t.modeWatch]].map(([id,label]) => ({ label, onClick:()=>this.setState({alarmMode:id}), bg: s.alarmMode===id ? '#fff' : 'transparent', fg: s.alarmMode===id ? '#16181D' : '#C9CBD1' })),
      alarmModeText: s.alarmMode==='motion' ? t.motionText : t.watchText, watchMode: s.alarmMode==='watch',
      distOpts: [5,10,20].map(v => ({ label:v+' m', onClick:()=>this.setState({alarmDist:v}), bg: s.alarmDist===v ? '#F2B33D' : 'transparent', fg: s.alarmDist===v ? '#16181D' : '#fff', border: s.alarmDist===v ? '1px solid #F2B33D' : '1px solid rgba(255,255,255,.25)' })),
      armState: s.armed ? '● '+t.armed : t.disarmed, armColor: s.armed ? '#6FD39F' : '#8A8D96',
      armBtnBg: s.armed ? '#1F8A5B' : '#F2B33D', armBtnFg: s.armed ? '#fff' : '#16181D', armBtnLabel: s.armed ? t.armedBtn : t.arm,
      toggleArm: ()=>{ const on = !this.state.armed; this.setState({armed:on}); if (on) this.armMotion(); },
      simTheft: ()=>{ this.setState({ armed:true, alarmOn:true }); this.siren(true); },
      alarmOn: s.alarmOn, disarm: ()=>{ this.siren(false); this.setState({ alarmOn:false, armed:false }); },
      flashEl: React.createElement('div', { style:{ position:'absolute', inset:0, animation:'flash .5s steps(1) infinite' } }),
      toggleGroup: ()=>this.setState(st=>({groupAlert:!st.groupAlert})), groupBg: s.groupAlert ? '#1F8A5B' : '#CFC9BC', groupJust: s.groupAlert ? 'flex-end' : 'flex-start',
      radiusOpts: [50,100,200].map(v => ({ label:v+' m', onClick:()=>this.setState({groupRadius:v}), bg: s.groupRadius===v ? '#16181D' : '#fff', fg: s.groupRadius===v ? '#fff' : '#16181D', border: s.groupRadius===v ? '1px solid #16181D' : '1px solid rgba(22,24,29,.12)' })),
      groupMembers: [
        { ini:'EW', name:'Ewa Zielińska', role:t.guideRole, dist:'12 m', bg:'#1C5FB8', fg:'#fff', distColor:'#1F8A5B' },
        { ini:'AN', name:t.you+' · Anna', role:t.youRole, dist:t.inGroup, bg:'#16181D', fg:'#fff', distColor:'#1F8A5B' },
        { ini:'PN', name:'Piotr Nowak', role:t.youRole, dist:'8 m', bg:'#E4DFD4', fg:'#16181D', distColor:'#1F8A5B' }
      ],
      simGroup: ()=>this.setState({ groupOn:true }), groupOn: s.groupOn,
      callGuide: ()=>{ this.setState({ groupOn:false }); this.startCall('Ewa Zielińska','EW',false); },
      groupToMap: ()=>this.setState({ groupOn:false, screen:'map', history:[] }),
      groupOk: ()=>this.setState({ groupOn:false }),
      screenRef: this.screenRef,
      guide: s.guide, openGuide: ()=>this.setState({guide:true, citySheet:false}), closeGuide: ()=>this.setState({guide:false}),
      bigLangs: [['pl','Polski'],['it','Italiano'],['en','English']].map(([c,name]) => ({ code:c.toUpperCase(), name, onClick:()=>this.setState({lang:c}), bg: c===lang ? '#16181D' : '#fff', fg: c===lang ? '#fff' : '#16181D', border: c===lang ? '1.5px solid #16181D' : '1.5px solid rgba(22,24,29,.12)' })),
      guideItems: Object.keys(t.g).map(code => ({ code, title:t.gt[code], desc:t.g[code], fg: code==='SOS' ? '#C8102E' : code==='MAP' ? '#1C5FB8' : '#16181D', onClick:()=>{ const d = GUIDE_DEST[code]; this.setState({ guide:false, filter:'all', screen:d, history: d==='chat'||d==='explore' ? [] : ['home'] }); } })),
      startTour: ()=>{ this.setState({ guide:false, screen:'home', history:[], tour:0, hl:null }); if (this.state.tour===0) this.measure(); },
      touring: s.tour!==null && !!s.hl,
      endTour: ()=>{ this.setState({ tour:null, hl:null }); if (this.scrollRef.current) this.scrollRef.current.scrollTop = 0; },
      nextTour: ()=>{ if (s.tour >= t.tour.length-1) { this.setState({ tour:null, hl:null }); if (this.scrollRef.current) this.scrollRef.current.scrollTop = 0; } else this.setState({ tour:s.tour+1 }); },
      nextTourLabel: s.tour!==null && s.tour >= t.tour.length-1 ? t.doneG : t.nextG,
      tourCount: s.tour!==null ? String(s.tour+1).padStart(2,'0') + ' / ' + String(t.tour.length).padStart(2,'0') : '',
      tourTitle: s.tour!==null ? t.tour[s.tour][1] : '', tourText: s.tour!==null ? t.tour[s.tour][2] : '',
      hlX: s.hl ? s.hl.x+'px' : '0px', hlY: s.hl ? s.hl.y+'px' : '0px', hlW: s.hl ? s.hl.w+'px' : '0px', hlH: s.hl ? s.hl.h+'px' : '0px',
      tipTop: !s.hl ? 'auto' : (s.hl.y + s.hl.h + 200 < this.H() ? (s.hl.y + s.hl.h + 14)+'px' : 'auto'),
      tipBottom: !s.hl ? 'auto' : (s.hl.y + s.hl.h + 200 < this.H() ? 'auto' : (this.H() - s.hl.y + 14)+'px'),
      tapEl: s.hl ? React.createElement('div', { key:'tap'+s.tour, style:{ position:'absolute', left:s.hl.x + s.hl.w/2 - 18, top:s.hl.y + s.hl.h/2 - 18, width:36, height:36, pointerEvents:'none', transition:'all .3s ease' } },
        React.createElement('div', { style:{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(242,179,61,.55)', animation:'pulse 1.4s ease-out infinite' } }),
        React.createElement('div', { style:{ position:'absolute', inset:10, borderRadius:'50%', background:'#F2B33D', border:'2px solid #fff' } })) : null,
      tipList: TIPS[lang].map(([title,body],i) => ({ n:String(i+1).padStart(2,'0'), title, body })),
      days: DAYS[lang].map(([title,date,items]) => ({ title, date, items }))
    };
  }
}
