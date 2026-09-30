# Polish tourists in Italy app

_Started 2026-09-30 16:04 UTC_

---

## User

Design a mobile app for volglio creare un sistema  per turiste polacci quando arrivano in italia   nelle grande capitale  in premise  roma  voglio el turista  non dovra trovare  in difeculta oh probleme  dalla  a  z  la aap  non vende  begliete  aiero     la app fa solo colaborazione  tra  polonia e italia   qualseiasi problema la app risolvere el problema   oviamente ce sempere una persona che da la mano    conseglio vero  trame la app   hotel bus  transporto aroporto   tour   quida musei  e vaticano tutto

## Assistant



## Assistant

_[tool: list_files]_

_[tool: ask_user]_

Ho preparato alcune domande su lingua, sezioni, come funziona l'aiuto umano, prenotazioni e flussi da rendere interattivi. Aspetto le tue risposte per iniziare. Nota: il design system collegato è vuoto, quindi lo stile visivo lo scelgo io.

## User

Answered — Asked for follow-up questions; lang: Polacco + switch IT/EN; sections: Transfer aeroporto, Hotel, Bus / metro / biglietti trasporto, Tour guidati, Musei, Vaticano, Assistente umano (chat/chiamata), SOS / emergenze, Consigli locali (ristoranti, sicurezza), Itinerario per…; help: Tutte e tre; booking: Consiglia e invia richiesta, l'assistente conferma; flow: Onboarding (arrivo, date, hotel), Arrivo in aeroporto → transfer, Prenotare un tour/museo, Chiedere aiuto per un problema, Giornata di oggi / itinerario; variations: Entrambi; brand: fai tu; platform: iPhone

## Assistant



## Assistant

_[tool: ask_user]_

_[tool: ask_user]_

Ho aggiunto qualche domanda in più: città, chi paga il servizio, tono dell'app ed eventuali tue idee. Aspetto le risposte.

## User

Answered — cities: Roma + città future (Milano, Firenze…); model: Incluso con agenzia di viaggio polacca; tone: Pratico e veloce, stile app di trasporti; q: 1. sistema ios e andriod tablet ipad per grati dammi un consglio meglio

## Assistant

_[tool: read_skill_prompt]_

_[tool: set_project_title]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Ho preparato **Razem**, un'app iPhone per turisti polacchi a Roma (interfaccia in polacco, con cambio lingua IT/EN).

- **1a – prototipo cliccabile:** si parte con il codice della prenotazione dell'agenzia (c'è un «codice demo» per provare). Poi trovi la home e il transfer dall'aeroporto, con le fasi che puoi far avanzare e il cartello con il nome. Ci sono tour, musei e Vaticano: la prenotazione parte come richiesta e Marta, l'assistente, la conferma in chat. Poi la sezione Aiuto, la chat e la chiamata/video con Marta, la pagina SOS (112 e Ambasciata polacca), hotel, trasporti, consigli, frasi utili e l'itinerario del viaggio.
- **1b e 1c – due idee diverse per la home:** una a «tabellone partenze», l'altra con l'assistente al centro.

**Consiglio sulla piattaforma:** una sola app per iPhone e Android insieme, perché molti turisti polacchi usano Android. Al turista il tablet non serve. Conviene invece un pannello web per gli assistenti a Roma, usabile anche su iPad.

Foto, nome e contenuti sono provvisori. Mandami le foto vere e dimmi se il nome «Razem» ti va bene.

## User

ok solo ios e andriod  vero   possiamo  agungere la mappa   die grande citta    con indicazione   ben peicesa  foto del documento in caso del furto   e la leger sul la pryvase  dela persona sempre    lamappa  dindica dove sts el turista   sempre   e perndere punto dalle hotel  in caso che si dioriantamento

## Assistant

_[tool: read_skill_prompt]_

_[tool: write_file]_

_[tool: read_file]_

Now the template edits.

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho aggiunto al prototipo 1a:

- **Mappa (nuova scheda):** mappa vera di Roma che mostra sempre dove si trova il turista. Il tasto «Wróć do hotelu» traccia il percorso a piedi fino all'hotel con le indicazioni passo per passo. C'è anche il tasto «mi sono persa», che manda la posizione a Marta.
- **Cassaforte documenti (DOC):** si apre con Face ID e permette di fotografare passaporto, carta d'identità, tessera sanitaria europea e assicurazione (sul telefono funziona davvero). Si possono condividere con Marta per 24 ore. C'è la procedura in caso di furto: denuncia, consolato, blocco delle carte.
- **Privacy (GDPR/RODO):** nell'onboarding c'è un passo di consenso obbligatorio e si sceglie la posizione: sempre durante il viaggio, solo SOS o spenta. In più una schermata PRV con i consensi, il download dei dati e la cancellazione dell'account.
- **Piattaforma:** ora solo iOS e Android.

Limiti:
- La posizione del turista (Fontana di Trevi) è simulata.
- Il percorso è tracciato a mano; nell'app vera lo calcoleranno le mappe native Apple o Google.
- Per ora la mappa copre solo Roma; le altre città sono segnate come «in arrivo».

## User

la app parla anche la lingua  polacca  italiana  inglese   e si qulecuno vole  capere come  foncsiona la  icona  per indicare dove tocca   per trovare   descrizione della app

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho corretto l'errore che lasciava vuoto il prototipo 1a. Adesso l'app si carica di nuovo; è in corso l'ultimo controllo di onboarding, home, guida «?» e schermata allarme.

## User

agungere qualque foto  belleissimi di roma e altre citta

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho aggiunto le foto nel prototipo 1a:

- **Onboarding:** apre con il Colosseo.
- **Home:** nuova sezione «Scopri Roma», un carosello con Fontana di Trevi, Piazza San Pietro, Pantheon, Cappella Sistina e Trastevere. Toccando una foto si apre la mappa o l'elenco dei tour.
- **Tour e musei:** ogni scheda e ogni dettaglio ha la sua foto (Vaticano, San Pietro, Colosseo, Trastevere, Borghese, Fori).
- **Città:** toccando «Rzym ▾» si vedono le foto di Roma, Firenze, Milano e Venezia (queste tre «in arrivo»).

Da sapere:
- Le foto vengono da Wikimedia Commons (licenze libere) e si caricano da internet: senza connessione non compaiono. Nell'app finale bisogna citare gli autori oppure usare foto vostre.
- Non ho potuto vedere le immagini in anteprima, quindi controlla che ti piacciano. Se ne vuoi cambiare qualcuna, mandami le tue e le sostituisco.
- La foto di Marta e quelle dei due design alternativi (1b, 1c) sono ancora segnaposto.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Ho corretto la testata della home: il pulsante «Rzym ▾» adesso resta su una sola riga. Il controllo ha confermato che le foto si caricano.

## User

adesso dimmi  come colegare  la agenziea   tutto come sifa  in pdf    la guida a codice  aparte   perche  tutti le chiamate oh messagie   arrivano a lui      avvisi sempere turista   telefono dove lomete  ziano  davante   aviaìsii per preveniere el furto   meglio   la app deve esere   al top   per turista se ai qulque idea falla bene

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Ho corretto l'errore che lasciava vuoto il prototipo 1a: i tre nuovi consigli antifurto erano caricati nel punto sbagliato. Adesso l'app si carica di nuovo. È in corso un ultimo controllo di benvenuto, avviso in home, notifica sulla mappa e scheda della capogruppo.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho corretto la notifica della mappa: la prima volta che apri la scheda «Mapa», dopo circa 1,5 secondi compare l'avviso «Tanta folla alla Fontana di Trevi». Dopo circa 8 secondi sparisce da sola. È in corso un ultimo controllo, compresa la scheda della capogruppo.

## User

in casso la app  non ce internet  come va

## Assistant

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Senza internet l'app continua a funzionare per le cose importanti, perché scarica tutto sul telefono prima della partenza.

**Cosa funziona:**
- mappa della città e percorso fino all'hotel (il GPS funziona senza internet);
- SOS, 112 e chiamata a Marta, che passano dalla normale rete telefonica;
- cassaforte documenti e allarme antifurto;
- indirizzo dell'hotel, biglietti, programma, frasi e consigli.

**Cosa cambia:**
- la chat con Marta parte via SMS in automatico;
- nuove prenotazioni e videochiamate aspettano che torni la connessione.

Nel prototipo 1a puoi provarlo: tocca **5G** in alto e diventa **OFFLINE**. In home compare il riquadro con l'elenco di cosa funziona e cosa no. Nella chat, i messaggi a Marta partono via SMS e lei risponde che richiama.

Nella guida PDF c'è già il numero d'emergenza italiano per chi non ha internet. Se vuoi, aggiungo alla guida anche un capitolo sull'uso senza internet.

## User

augengere el meteo   e avvisi in casso di scopero che in italia e posibele sempre  beglieto possono anche comprare con telefono in casso   anche begliete del musie tutti  anche  vaticano    inserisce  automatico    con telefono  qulsiase cosa per turismo

## Assistant

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Ho aggiunto al prototipo 1a:

- **Meteo:** in home ci sono le previsioni per tutti i 5 giorni del viaggio, con un consiglio (giovedì piove, quindi Marta propone Borghese e i musei).
- **Avviso sciopero:** in home e nella pagina Trasporti. Mostra le fasce garantite e le alternative, e che Marta ha già risolto il tour di quel giorno prenotando un minibus dall'hotel.
- **Biglietti col telefono:**
  - Trasporti: BIT e abbonamenti 24/48/72 h si comprano con Apple Pay o Google Pay.
  - Musei e Vaticano: la scheda di ogni tour ha «Compra col telefono» per il solo biglietto d'ingresso; il tour con guida polacca resta come richiesta a Marta.
- **«I miei biglietti» (dalla home):** i biglietti si aggiungono da soli. Ci trovi quelli comprati, quelli dell'agenzia (il transfer) e quelli dei tour confermati da Marta. Toccando un biglietto si apre il QR da mostrare all'ingresso, con il tasto per aggiungerlo al Wallet.

**Da sapere:**
- Prezzi, meteo e date dello sciopero sono esempi. Nell'app vera arriveranno in automatico da servizio meteo, avvisi scioperi, ATAC e musei.
- La vendita dei biglietti dei musei e del Vaticano richiede un accordo con loro o con un rivenditore autorizzato.
- Il QR è finto, solo per la demo.

## User

metere la disponibeleta per begliete  uquale in caso qulcuno vole comprare dasolo

## Assistant

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho aggiunto la disponibilità dei biglietti, così chi vuole comprare da solo vede subito se ci sono posti.

- **Elenco tour e musei:** ogni scheda indica i posti liberi e la prima data disponibile. Il pallino è verde se ci sono posti, arancione se sono gli ultimi.
- **Dettaglio del tour:**
  - Ogni data ha un pallino verde, arancione o rosso (molti, pochi posti o esaurito).
  - Ogni orario mostra i posti rimasti («14 wolnych», «ultimi 2»). Gli orari esauriti sono barrati e non si possono scegliere.
  - Una riga «in tempo reale» riassume la disponibilità della scelta fatta, per esempio «14 posti liberi · 13.10, 10:00».
  - Se i posti non bastano per il numero di persone scelto, i pulsanti «Compra col telefono» e «Invia richiesta» si bloccano e l'app dice perché.

I numeri dei posti sono finti, per la demo. Nell'app vera arriveranno in tempo reale dai sistemi di prenotazione dei musei e del Vaticano.

## User

avisisi dove ce  afolamento  avissi sempre

## Assistant

_[tool: str_replace_edit]_

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Ho aggiunto gli avvisi sull'affollamento, sempre attivi:

- **Home, riquadro «Folla adesso»:** livello alto, medio o basso per Trevi, Colosseo, Termini, San Pietro, Pantheon e Navona, con l'orario migliore per andarci (per esempio «Trevi: alle 7:00 o dopo le 22»).
- **Mappa:** cerchi rossi, arancioni e verdi sulle zone affollate. Il tasto «Tłum» in alto a sinistra li accende e li spegne.
- **Notifica automatica:** quando sei vicino a una zona affollata arriva l'avviso «Tanta folla, telefono davanti».

I livelli di affollamento sono esempi. Nell'app vera arriveranno in tempo reale da dati sui flussi di persone o dalle segnalazioni delle guide.

## User

adesso meterela in files per code

## Assistant

_[tool: read_skill_prompt]_

_[tool: write_file]_

_[tool: copy_files]_

_[tool: present_fs_item_for_download]_

Il pacchetto per gli sviluppatori è pronto da scaricare, in formato zip.

Contiene un README in inglese con tutte le schermate, i colori, i font, le interazioni e le integrazioni da fare. Dentro ci sono anche il prototipo, la mappa e la guida per l'agenzia.

Mancano ancora l'app Staff per le guide e il pannello web per l'agenzia: vuoi che li disegni? Se ti servono, aggiungo al pacchetto anche le immagini delle schermate.

