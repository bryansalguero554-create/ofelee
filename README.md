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
1. **Foto**: inserire in `img/` i file elencati sotto (finché mancano si vede un segnaposto color caramello).
2. **WhatsApp**: verificare il numero in `js/main.js` (`CONFIG.whatsapp`). Ora è impostato il fisso 039 990 0514, che funziona solo se registrato su WhatsApp Business.
3. **Facebook**: sostituire il link generico nel footer (`data-facebook-link`) con quello della pagina reale.
4. **Footer**: P.IVA, pagine Privacy e Cookie.

## Foto attese in `img/`
| File | Contenuto |
|---|---|
| `hero.jpg` | Banco dolci o torta d'autore (orizzontale, almeno 1920 px) |
| `laboratorio.jpg` | Laboratorio o interno del locale (verticale) |
| `croissant.jpg`, `brioche.jpg`, `caffe.jpg` | Colazione |
| `cannoncini.jpg`, `bigne.jpg`, `tartellette.jpg` | Pasticceria mignon |
| `millefoglie.jpg`, `saint-honore.jpg`, `crostata.jpg`, `torta-compleanno.jpg` | Torte |
| `panettone.jpg`, `chiacchiere.jpg`, `colomba.jpg` | Grandi lievitati |

Le foto delle card vengono ritagliate in 4:3; consigliati 800×600 px, JPG compressi (< 200 KB).
