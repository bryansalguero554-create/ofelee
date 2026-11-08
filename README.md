# Pasticceria & Caffetteria L'Ôfelee – sito web

Landing page one-page per la Pasticceria & Caffetteria L'Ôfelee di Merate (LC).
Sito statico in HTML, CSS e JavaScript, senza dipendenze né build: basta aprire `index.html`
o caricare la cartella su qualsiasi hosting (Netlify, GitHub Pages, hosting tradizionale).

## Sezioni
- **Copertina**: la parola *ôfelee* scavata nel laccato oliva; scorrendo ci si entra e il bancone riempie lo schermo,
  poi compaiono titolo, definizioni e pulsanti. Con "riduci movimento" si vede subito la versione statica.
- **Una giornata al banco**: i momenti (colazione, mignon, torte, lievitati) scorrono in orizzontale mentre si scende
  con la rotella; su smartphone si sfogliano col dito.
- **Hero** con payoff, pulsanti "Prenota una torta" / "Scopri le specialità", valutazione Google e stato "Aperto ora / Chiuso" in tempo reale (ora di Roma).
- **La vetrina** (specialità) a schede, con i dolci sotto campane di vetro e cartellini: Colazione, Pasticceria Mignon, Torte & Cerimonie, Grandi Lievitati.
  I lievitati si attivano da soli in base al periodo (Natale, Carnevale ambrosiano, Pasqua).
- **Ordina la tua torta**: prenotazione telefonica con stato aperto/chiuso in tempo reale e **"Prepara la telefonata"**:
  occasione, dolce, persone e giorno di ritiro (minimo 3 giorni, lunedì escluso) compongono un promemoria da leggere al telefono.
  Nulla viene inviato o salvato.
- **Barra stagionale** in cima alla pagina (panettone, chiacchiere, colomba), attiva solo nei periodi giusti.
- **Chi siamo**, servizi, **orari** con il giorno corrente evidenziato, **mappa** e indicazioni.
- **Animazione di caricamento**: un cupcake si riempie di panna, arriva la ciliegina e il sito si apre (più breve dalla seconda pagina; disattivata con "riduci movimento").
- **Pagina 404** (`404.html`) con il cupcake morsicato, autonoma e funzionante a qualsiasi percorso.
- **Domande frequenti** (ordini, anticipo, stagionalità, orari, allergie, parcheggio, pagamenti), anche come dati strutturati `FAQPage`.
- Barra azioni rapide su smartphone (Chiama · Ordina · Mappa) e dati strutturati Schema.org per Google (`Bakery` con catalogo prodotti e `FAQPage`).

## SEO e condivisione
- **Indirizzo del sito**: `https://bryansalguero554-create.github.io/ofelee/` (GitHub Pages). Se si passa a un dominio proprio,
  sostituirlo in `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `sitemap.xml` e `robots.txt`.
- **Anteprima social** `img/og-image.jpg` (1200×630): quella che compare quando il link viene condiviso su WhatsApp, Facebook, ecc.
- `sitemap.xml` e `robots.txt` pronti da inviare a Google Search Console.
- Icone del marchio (`favicon.svg`, `icon-192/512.png`, `apple-touch-icon.png`) e `site.webmanifest`.
- Attivare il **Profilo dell'attività su Google** e collegare il sito: per la ricerca locale conta più del sito stesso.

## Da completare prima della pubblicazione
1. **Foto**: inserire le immagini in `img/` (vedi sotto). Finché mancano si vede un segnaposto color caramello.
2. **Ordini online** (facoltativo): oggi si prenota solo per telefono; il modulo WhatsApp è recuperabile dalla cronologia git.
3. **P.IVA**: nel footer sostituire `[in aggiornamento]`.
4. **Facebook**: il link nel footer apre la ricerca della pagina; sostituirlo con l'URL diretto (`facebook.com/...`).

## Foto in `img/`
Ogni foto `.jpg` ha due copie WebP (`nome.webp` e `nome-sm.webp` per smartphone), usate automaticamente dal browser.
Quando si sostituisce una foto, rigenerarle (ad es. con `cwebp -q 78`), altrimenti resta visibile la versione vecchia.

Bastano **5 foto** per avere il sito completo:

| File | Contenuto | Dove compare |
|---|---|---|
| `hero-bg.jpg` | Bancone o vetrina della pasticceria (orizzontale, ≥ 1920 px) | Copertina e "Chi siamo" |
| `colazione.jpg` | Croissant / brioche e caffè | Card della Colazione e galleria |
| `mignon.jpg` | Vassoio di cannoncini e bignè | Card Mignon e galleria |
| `torte.jpg` | Millefoglie o crostata di frutta | Card Torte e galleria |
| `lievitati.jpg` | Panettone o colomba a fette | Card Lievitati e galleria |

Quando arrivano le foto reali si può dare a ogni prodotto la sua immagine, che ha la precedenza su quella di categoria
(per croissant e millefoglie, che oggi usano la foto di categoria, va anche aggiornato lo `src` in `index.html`):
`laboratorio.jpg`, `croissant.jpg`, `brioche.jpg`, `caffe.jpg`, `cannoncini.jpg`, `bigne.jpg`, `tartellette.jpg`,
`millefoglie.jpg`, `saint-honore.jpg`, `crostata.jpg`, `torta-compleanno.jpg`, `panettone.jpg`, `chiacchiere.jpg`, `colomba.jpg`.

Le foto dei dolci compaiono dentro cornici ad arco (campane di vetro) inquadrate sul basso: consigliati 800×600 px, JPG compressi (< 200 KB).
Se si usano foto stock (Unsplash/Pexels) per la demo, vanno sostituite con quelle reali prima della pubblicazione.

## Privacy e Cookie
Le informative si aprono in una finestra dal footer. I font sono ospitati in `fonts/` (licenza SIL OFL).
La mappa di Google si carica automaticamente quando si arriva alla sezione "Dove siamo" e Google può
impostare propri cookie: valutare con un consulente se serve un banner di consenso.

## Sicurezza
Il sito è statico: niente database, login, server o librerie di terze parti, quindi non c'è nulla da "bucare" lato server. In più:

- **Content Security Policy** (in `index.html` e in `_headers`): il browser esegue solo script e stili del sito stesso; l'unica risorsa esterna ammessa è la mappa Google. Blocca alla radice iniezioni di codice (XSS).
- **Nessuno stile o script inline**, nessun uso di `innerHTML`: i testi dinamici sono inseriti solo come testo.
- **Nessun modulo né raccolta di dati**: gli ordini avvengono per telefono.
- **Link esterni** con `noopener noreferrer`; **mappa** in iframe isolato (`sandbox`), caricata solo quando si arriva alla sezione.
- **`_headers`**: su Netlify o Cloudflare Pages aggiunge HSTS, protezione dal clickjacking (`frame-ancestors`/`X-Frame-Options`), `nosniff`, `Permissions-Policy` e `Referrer-Policy`.

### Su GitHub Pages
GitHub Pages non permette intestazioni personalizzate: valgono le protezioni in `index.html`. Attivare in *Settings → Pages* l'opzione **Enforce HTTPS**.
Per la protezione completa (incluso il clickjacking) si consiglia la pubblicazione su Netlify o Cloudflare Pages, che leggono `_headers`.

### Account
Attivare la verifica in due passaggi (2FA) sull'account GitHub e su quello del dominio: è il punto più a rischio per un sito statico.

## Aggiornamenti e cache
GitHub Pages fa conservare i file ai browser per 10 minuti. In `index.html` fogli di stile e script hanno un numero
di versione (`style.css?v=...`): a ogni modifica di CSS o JS aggiornarlo, così i visitatori scaricano subito la versione nuova.
