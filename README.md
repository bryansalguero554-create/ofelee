# Pasticceria & Caffetteria L'Ôfelee – sito web

Landing page one-page per la Pasticceria & Caffetteria L'Ôfelee di Merate (LC).
Sito statico in HTML, CSS e JavaScript, senza dipendenze né build: basta aprire `index.html`
o caricare la cartella su qualsiasi hosting (Netlify, GitHub Pages, hosting tradizionale).

## Sezioni
- **Hero** con payoff, pulsanti "Prenota una torta" / "Scopri le specialità", valutazione Google e stato "Aperto ora / Chiuso" in tempo reale (ora di Roma).
- **Specialità** a schede: Colazione, Pasticceria Mignon, Torte & Cerimonie, Grandi Lievitati.
  I lievitati si attivano da soli in base al periodo (Natale, Carnevale ambrosiano, Pasqua).
- **Ordina la tua torta**: modulo che apre WhatsApp con il messaggio già compilato (blocca il lunedì, avvisa sulle date troppo vicine).
- **Chi siamo**, servizi, **orari** con il giorno corrente evidenziato, **mappa** e indicazioni.
- Barra azioni rapide su smartphone (Chiama · Ordina · Mappa) e dati strutturati Schema.org per Google.

## Da completare prima della pubblicazione
1. **Foto**: inserire le immagini in `img/` (vedi sotto). Finché mancano si vede un segnaposto color caramello.
2. **WhatsApp**: in `js/main.js` (`CONFIG.whatsapp`) mettere il numero in formato internazionale senza "+" (es. `393XXXXXXXXX`).
   Per i test usare il proprio cellulare; dopo la demo il fisso del negozio (se attivo su WhatsApp Business) o un cellulare dedicato.
3. **P.IVA**: nel footer sostituire `[in aggiornamento]`.
4. **Facebook**: il link nel footer apre la ricerca della pagina; sostituirlo con l'URL diretto (`facebook.com/...`).

## Foto in `img/`
Bastano **5 foto** per avere il sito completo:

| File | Contenuto | Dove compare |
|---|---|---|
| `hero-bg.jpg` | Bancone o vetrina della pasticceria (orizzontale, ≥ 1920 px) | Copertina e "Chi siamo" |
| `colazione.jpg` | Croissant / brioche e caffè | Card della Colazione e galleria |
| `mignon.jpg` | Vassoio di cannoncini e bignè | Card Mignon e galleria |
| `torte.jpg` | Millefoglie o crostata di frutta | Card Torte e galleria |
| `lievitati.jpg` | Panettone o colomba a fette | Card Lievitati e galleria |

Quando arrivano le foto reali si può dare a ogni prodotto la sua immagine, che ha la precedenza su quella di categoria:
`laboratorio.jpg`, `croissant.jpg`, `brioche.jpg`, `caffe.jpg`, `cannoncini.jpg`, `bigne.jpg`, `tartellette.jpg`,
`millefoglie.jpg`, `saint-honore.jpg`, `crostata.jpg`, `torta-compleanno.jpg`, `panettone.jpg`, `chiacchiere.jpg`, `colomba.jpg`.

Le card ritagliano in 4:3: consigliati 800×600 px, JPG compressi (< 200 KB).
Se si usano foto stock (Unsplash/Pexels) per la demo, vanno sostituite con quelle reali prima della pubblicazione.

## Privacy e Cookie
Le informative si aprono in una finestra dal footer. I font sono ospitati in `fonts/` (licenza SIL OFL).
La mappa di Google si carica automaticamente quando si arriva alla sezione "Dove siamo" e Google può
impostare propri cookie: valutare con un consulente se serve un banner di consenso.

## Sicurezza
Il sito è statico: niente database, login, server o librerie di terze parti, quindi non c'è nulla da "bucare" lato server. In più:

- **Content Security Policy** (in `index.html` e in `_headers`): il browser esegue solo script e stili del sito stesso; l'unica risorsa esterna ammessa è la mappa Google. Blocca alla radice iniezioni di codice (XSS).
- **Nessuno stile o script inline**, nessun uso di `innerHTML`: i testi dinamici sono inseriti solo come testo.
- **Modulo ordini**: tipo di dolce verificato su una lista ammessa, numero di persone 1–500, data entro un anno, nome max 60 caratteri, note max 500; caratteri di controllo e invisibili rimossi; limite contro i doppi invii. I dati non vengono mai salvati: finiscono solo nel messaggio WhatsApp.
- **Link esterni** con `noopener noreferrer`; **mappa** in iframe isolato (`sandbox`), caricata solo quando si arriva alla sezione.
- **`_headers`**: su Netlify o Cloudflare Pages aggiunge HSTS, protezione dal clickjacking (`frame-ancestors`/`X-Frame-Options`), `nosniff`, `Permissions-Policy` e `Referrer-Policy`.

### Su GitHub Pages
GitHub Pages non permette intestazioni personalizzate: valgono le protezioni in `index.html`. Attivare in *Settings → Pages* l'opzione **Enforce HTTPS**.
Per la protezione completa (incluso il clickjacking) si consiglia la pubblicazione su Netlify o Cloudflare Pages, che leggono `_headers`.

### Account
Attivare la verifica in due passaggi (2FA) sull'account GitHub e su quello del dominio: è il punto più a rischio per un sito statico.
