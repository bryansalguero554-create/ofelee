"use strict";

/* =========================================================
   L'Ôfelee – script del sito
   ========================================================= */

const CONFIG = {
  timeZone: "Europe/Rome",
  // Orari per giorno della settimana (0 = domenica). Formato "HH:MM".
  hours: {
    0: [["07:30", "13:00"]],
    1: [],
    2: [["07:00", "12:30"], ["15:00", "19:30"]],
    3: [["07:00", "12:30"], ["15:00", "19:30"]],
    4: [["07:00", "12:30"], ["15:00", "19:30"]],
    5: [["07:00", "12:30"], ["15:00", "19:30"]],
    6: [["07:00", "12:30"], ["15:00", "19:30"]],
  },
};

const DAY_NAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

/* ---------- Animazione di caricamento ----------
   Quando la pagina ha finito di caricare (e la panna ha riempito il
   cupcake) cade la ciliegina, poi il velo si alza. Dalla seconda pagina
   vista nella stessa sessione l'animazione è più breve. */
(function pageLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  let seen = false;
  try { seen = sessionStorage.getItem("ofelee-loader") === "1"; } catch { /* storage non disponibile */ }
  const minVisible = seen ? 250 : 750; // ms dall'inizio della navigazione

  const finish = () => {
    const wait = Math.max(0, minVisible - performance.now());
    setTimeout(() => {
      loader.classList.add("is-loaded");
      setTimeout(() => {
        loader.classList.add("is-hidden");
        setTimeout(() => loader.remove(), 600);
      }, seen ? 300 : 700);
      try { sessionStorage.setItem("ofelee-loader", "1"); } catch { /* storage non disponibile */ }
    }, wait);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
})();

/* ---------- Utility ---------- */

// Data/ora correnti a Merate, indipendentemente dal fuso del visitatore.
function nowInRome() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CONFIG.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: +get("year"),
    month: +get("month"),
    day: +get("day"),
    weekday: weekdays[get("weekday")],
    minutes: +get("hour") * 60 + +get("minute"),
  };
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Domenica di Pasqua (algoritmo di Meeus/Butcher).
function easterDate(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

/* ---------- Menu mobile ---------- */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("main-nav");

function closeNav() {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Apri il menu");
}

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

/* ---------- Header con ombra allo scroll ---------- */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Immagini ----------
   Ordine di ricerca per ogni foto:
   1. foto del singolo prodotto (es. img/croissant.jpg)
   2. foto della categoria (data-fallback, es. img/colazione.jpg)
   3. foto stock temporanea di Unsplash per la demo (STOCK_PHOTOS)
   4. segnaposto color caramello.
   Appena le foto reali vengono messe in img/, sostituiscono da sole quelle stock. */
const STOCK_PHOTOS = {
  "img/hero-bg.jpg": "https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=1920&q=80",
  "img/colazione.jpg": "https://images.unsplash.com/photo-1495474472201-4966687eb190?w=800&q=80",
  "img/mignon.jpg": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800&q=80",
  "img/torte.jpg": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  "img/lievitati.jpg": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
};

document.querySelectorAll(".hero-media img, .about-media img, .card-img img, .gallery-item img").forEach((img) => {
  const local = img.getAttribute("src");
  const fallback = img.dataset.fallback;
  // In coda anche tutte le altre foto stock: se un link non funziona,
  // il riquadro prende la prima foto disponibile invece di restare vuoto.
  const queue = [fallback, STOCK_PHOTOS[local], STOCK_PHOTOS[fallback], ...Object.values(STOCK_PHOTOS)]
    .filter((src, i, all) => src && src !== local && all.indexOf(src) === i);

  const onFail = () => {
    const next = queue.shift();
    if (next) img.src = next;
    else img.classList.add("img-missing");
  };
  img.addEventListener("error", onFail);
  if (img.complete && img.naturalWidth === 0) onFail();
});

/* ---------- Mappa interattiva ----------
   Si carica da sola quando la sezione "Dove siamo" si avvicina, così
   non rallenta l'apertura della pagina. Il riquadro sotto (indirizzo e
   pulsante indicazioni) resta visibile durante il caricamento. */
const mapBox = document.getElementById("map");

function loadMap() {
  if (mapBox.querySelector("iframe")) return;
  const iframe = document.createElement("iframe");
  iframe.title = "Mappa: Pasticceria L'Ôfelee, Via Padre Paolo Arlati 2, Merate";
  iframe.src = "https://maps.google.com/maps?q=Via%20Padre%20Paolo%20Arlati%202%2C%2023807%20Merate%20LC&z=16&output=embed";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  // La mappa gira isolata: non può accedere alla pagina né navigarla.
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  mapBox.append(iframe);
}

if (mapBox) {
  if ("IntersectionObserver" in window) {
    const mapIo = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { mapIo.disconnect(); loadMap(); }
    }, { rootMargin: "600px" });
    mapIo.observe(mapBox);
  } else {
    loadMap();
  }
}

/* ---------- Indicazioni: scelta dell'app di navigazione ---------- */
const directionsDialog = document.getElementById("directions-dialog");
const ADDRESS = "Via Padre Paolo Arlati, 2, 23807 Merate (LC)";

if (/Android/i.test(navigator.userAgent)) {
  directionsDialog.querySelector("[data-android-only]").hidden = false;
}

document.querySelectorAll("[data-directions]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    directionsDialog.showModal();
  });
});

directionsDialog.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => directionsDialog.close()));
directionsDialog.addEventListener("click", (e) => { if (e.target === directionsDialog) directionsDialog.close(); });

document.querySelector("[data-copy-address]").addEventListener("click", async () => {
  const label = document.querySelector("[data-copy-label]");
  try {
    await navigator.clipboard.writeText(ADDRESS);
    label.textContent = "Indirizzo copiato ✓";
  } catch {
    label.textContent = ADDRESS;
  }
  setTimeout(() => { label.textContent = "Copia indirizzo"; }, 2500);
});

/* ---------- Informative Privacy e Cookie ---------- */
document.querySelectorAll("[data-open-dialog]").forEach((btn) => {
  const dialog = document.getElementById(btn.dataset.openDialog);
  btn.addEventListener("click", () => dialog.showModal());
  // Chiusura cliccando fuori dal riquadro.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
});

/* ---------- Tabs specialità ---------- */
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

function selectTab(tab, focus = true) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  });
  if (focus) tab.focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    let next = null;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === "Home") next = tabs[0];
    if (e.key === "End") next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); selectTab(next); }
  });
});

/* ---------- Stagionalità dei grandi lievitati ---------- */
(function seasonalProducts() {
  const now = nowInRome();
  const today = new Date(now.year, now.month - 1, now.day);
  const easter = easterDate(now.year);

  const seasons = {
    // 1 novembre → 6 gennaio
    natale: (d) => d.getMonth() >= 10 || (d.getMonth() === 0 && d.getDate() <= 6),
    // 7 gennaio → fine Carnevale ambrosiano (sabato dopo le Ceneri)
    carnevale: (d) => d >= new Date(d.getFullYear(), 0, 7) && d <= addDays(easter, -43),
    // dalla prima domenica di Quaresima a Pasquetta
    pasqua: (d) => d > addDays(easter, -43) && d <= addDays(easter, 1),
  };
  const messages = {
    natale: "🎄 È tempo di panettone! Prenota il tuo panettone artigianale: le quantità sono limitate.",
    carnevale: "🎭 Sono arrivate le chiacchiere di Carnevale, fresche ogni giorno al banco.",
    pasqua: "🕊️ Prenota la tua colomba artigianale per Pasqua: le quantità sono limitate.",
  };

  let active = null;
  document.querySelectorAll("[data-season]").forEach((card) => {
    const key = card.dataset.season;
    if (seasons[key] && seasons[key](today)) {
      active = key;
      card.querySelector("[data-badge]").classList.add("is-active");
      card.querySelector("[data-badge]").textContent = "Disponibile ora";
    }
  });

  const bar = document.querySelector("[data-season-bar]");
  const barCopy = {
    natale: ["È tempo di panettone artigianale: le quantità sono limitate.", "Prenota il tuo panettone"],
    carnevale: ["Sono arrivate le chiacchiere di Carnevale, fresche ogni giorno.", "Ordina un vassoio"],
    pasqua: ["Colombe artigianali per Pasqua: le quantità sono limitate.", "Prenota la tua colomba"],
  };
  if (active && bar) {
    bar.querySelector("[data-season-bar-text]").textContent = barCopy[active][0];
    bar.querySelector("[data-season-bar-link]").textContent = barCopy[active][1];
    bar.hidden = false;
  }

  const banner = document.querySelector("[data-season-banner]");
  if (active && banner) {
    banner.textContent = messages[active];
    banner.hidden = false;
    // In stagione, la sezione lievitati viene mostrata per prima nell'elenco.
    const panel = document.getElementById("tab-lievitati");
    const card = panel.querySelector(`[data-season="${active}"]`);
    card.parentElement.prepend(card);
  }
})();

/* ---------- Prepara la telefonata ----------
   Compone un promemoria da leggere al telefono. Niente viene inviato
   né salvato: tutto resta nella pagina. */
(function planner() {
  const form = document.querySelector("[data-planner]");
  if (!form) return;
  const memo = form.querySelector("[data-memo]");
  const people = form.querySelector("#pl-persone");
  const date = form.querySelector("#pl-data");
  const hint = form.querySelector("[data-date-hint]");
  const note = form.querySelector("#pl-note");
  const defaultHint = hint.textContent;
  const MIN_DAYS = 3;

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fromIso = (v) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };
  const isOpen = (d) => CONFIG.hours[d.getDay()].length > 0;

  // primo giorno utile: oggi + 3, saltando i giorni di chiusura
  const now = nowInRome();
  let first = addDays(new Date(now.year, now.month - 1, now.day), MIN_DAYS);
  while (!isOpen(first)) first = addDays(first, 1);
  date.min = iso(first);

  const longDate = (d) => new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(d);

  function checkDate() {
    date.removeAttribute("aria-invalid");
    hint.classList.remove("is-error");
    hint.textContent = defaultHint;
    if (!date.value) return null;
    const d = fromIso(date.value);
    let problem = "";
    if (d < first) problem = `Per preparare tutto con cura servono almeno 3 giorni: il primo giorno utile è ${longDate(first)}.`;
    else if (!isOpen(d)) problem = "Il lunedì siamo chiusi: scegli un altro giorno.";
    if (problem) {
      date.setAttribute("aria-invalid", "true");
      hint.classList.add("is-error");
      hint.textContent = problem;
      return null;
    }
    const slots = CONFIG.hours[d.getDay()];
    hint.textContent = `Ritiro ${longDate(d)}: ${slots.map(([a, b]) => `${a}–${b}`).join(" oppure ")}.`;
    return d;
  }

  function update() {
    const data = new FormData(form);
    const occasione = data.get("occasione");
    const dolce = data.get("dolce");
    const n = Math.max(2, Math.min(200, parseInt(people.value, 10) || 0));
    const d = checkDate();
    if (!occasione && !dolce) {
      memo.textContent = "Scegli l'occasione e il dolce: qui compare cosa dirci al telefono.";
      memo.classList.remove("is-filled");
      return;
    }
    let text = `Buongiorno, vorrei ordinare ${dolce || "un dolce"}`;
    if (occasione) text += ` per ${occasione}`;
    text += `, per ${n} persone`;
    if (d) text += `, con ritiro ${longDate(d)}`;
    text += ".";
    const extra = note.value.trim();
    if (extra) text += ` Note: ${extra}.`;
    memo.textContent = text;
    memo.classList.add("is-filled");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = (parseInt(people.value, 10) || 0) + Number(btn.dataset.step);
      people.value = Math.max(2, Math.min(200, v));
      update();
    });
  });

  const copyBtn = form.querySelector("[data-copy-memo]");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(memo.textContent);
      copyBtn.textContent = "Promemoria copiato";
    } catch {
      copyBtn.textContent = "Copia non riuscita: tieni aperta questa pagina";
    }
    setTimeout(() => { copyBtn.textContent = "Copia il promemoria"; }, 2500);
  });
})();

/* ---------- Stato aperto/chiuso e giorno corrente ---------- */
function describeOpenStatus() {
  const now = nowInRome();
  const todaySlots = CONFIG.hours[now.weekday];

  for (const [open, close] of todaySlots) {
    if (now.minutes >= toMinutes(open) && now.minutes < toMinutes(close)) {
      return { open: true, text: `Aperto ora · chiude alle ${close}` };
    }
  }

  const laterToday = todaySlots.find(([open]) => toMinutes(open) > now.minutes);
  if (laterToday) return { open: false, text: `Chiuso ora · riapre oggi alle ${laterToday[0]}` };

  for (let i = 1; i <= 7; i++) {
    const day = (now.weekday + i) % 7;
    const slots = CONFIG.hours[day];
    if (slots.length) {
      const when = i === 1 ? "domani" : DAY_NAMES[day];
      return { open: false, text: `Chiuso ora · riapre ${when} alle ${slots[0][0]}` };
    }
  }
  return { open: false, text: "Chiuso" };
}

function updateOpenStatus() {
  const status = describeOpenStatus();
  document.querySelectorAll("[data-open-status]").forEach((el) => {
    el.textContent = status.text;
    el.classList.toggle("is-open", status.open);
    el.classList.toggle("is-closed", !status.open);
  });
  const weekday = nowInRome().weekday;
  document.querySelectorAll(".hours-table tr").forEach((tr) => {
    tr.classList.toggle("is-today", Number(tr.dataset.day) === weekday);
  });
}
updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

/* ---------- Ingresso della copertina ----------
   Un solo momento animato: parte quando il velo di caricamento si alza. */
document.documentElement.classList.add("js");
(function heroIntro() {
  const start = () => document.body.classList.add("is-ready");
  const loader = document.getElementById("loader");
  if (!loader) { start(); return; }
  new MutationObserver((_, obs) => {
    if (loader.classList.contains("is-hidden") || !loader.isConnected) { obs.disconnect(); start(); }
  }).observe(loader, { attributes: true });
  setTimeout(start, 6200); // stessa rete di sicurezza del velo
})();

/* =========================================================
   Effetti 3D e schede prodotto
   ========================================================= */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Dati delle schede prodotto ----------
   Ingredienti indicativi (ricette tipiche): da far confermare al titolare. */
const PRODUCTS = {
  croissant: { kicker: "La Colazione", title: "Croissant farciti", img: "img/colazione.jpg",
    desc: "Sfoglia al burro bicolore, al pistacchio o al lampone, farcita al momento con creme generose.",
    ingredients: ["Farina", "Burro", "Latte", "Uova", "Zucchero", "Lievito", "Crema al pistacchio", "Granella di pistacchio"] },
  brioche: { kicker: "La Colazione", title: "Brioche artigianali", img: "img/brioche.jpg",
    desc: "Impasti a lunga lievitazione sfornati ogni mattina: alla crema, alle nocciole, girelle e danesi alla frutta.",
    ingredients: ["Farina", "Burro", "Uova", "Zucchero", "Latte", "Lievito", "Crema pasticcera", "Nocciole"] },
  caffe: { kicker: "La Colazione", title: "Caffetteria", img: "img/caffe.jpg",
    desc: "Espresso, cappuccino e cioccolata calda con panna, da gustare al banco o ai tavolini.",
    ingredients: ["Caffè espresso", "Latte fresco", "Cacao", "Cioccolato", "Panna montata"] },
  cannoncini: { kicker: "Pasticceria Mignon", title: "Cannoncini", img: "img/cannoncini.jpg",
    desc: "Sfoglia croccante riempita al momento con la nostra crema pasticcera.",
    ingredients: ["Pasta sfoglia", "Burro", "Crema pasticcera", "Latte", "Uova", "Zucchero", "Vaniglia", "Granella di pistacchio", "Zucchero a velo"] },
  bigne: { kicker: "Pasticceria Mignon", title: "Bignè", img: "img/bigne.jpg",
    desc: "Pasta choux leggera, ripiena di chantilly o ricoperta di cioccolato fondente.",
    ingredients: ["Farina", "Burro", "Uova", "Panna", "Crema pasticcera", "Cioccolato fondente", "Zucchero a velo"] },
  tartellette: { kicker: "Pasticceria Mignon", title: "Tartellette alla frutta", img: "img/tartellette.jpg",
    desc: "Frolla friabile, crema pasticcera e frutti di bosco freschi.",
    ingredients: ["Pasta frolla", "Burro", "Crema pasticcera", "Lamponi", "Mirtilli", "More", "Zucchero a velo"] },
  millefoglie: { kicker: "Torte & Cerimonie", title: "Millefoglie", img: "img/torte.jpg",
    desc: "Strati di sfoglia caramellata, ciuffi di chantilly, fragole fresche e cialda di caramello.",
    ingredients: ["Pasta sfoglia", "Burro", "Crema chantilly", "Panna", "Fragole", "Caramello", "Zucchero a velo"] },
  "saint-honore": { kicker: "Torte & Cerimonie", title: "Saint Honoré", img: "img/saint-honore.jpg",
    desc: "Base di sfoglia, corona di bignè caramellati e chantilly a ciuffi.",
    ingredients: ["Pasta sfoglia", "Pasta choux", "Crema pasticcera", "Panna", "Caramello", "Uova", "Zucchero"] },
  crostata: { kicker: "Torte & Cerimonie", title: "Crostate di frutta fresca", img: "img/crostata.jpg",
    desc: "Frolla artigianale, crema pasticcera e fragole fresche lucidate a mano.",
    ingredients: ["Pasta frolla", "Burro", "Uova", "Crema pasticcera", "Fragole fresche", "Gelatina", "Zucchero a velo"] },
  "torta-compleanno": { kicker: "Torte & Cerimonie", title: "Torte personalizzate", img: "img/torta-compleanno.jpg",
    desc: "Pan di Spagna, creme e decorazioni su misura per compleanni, battesimi e cerimonie.",
    ingredients: ["Pan di Spagna", "Panna", "Crema pasticcera", "Frutta fresca", "Pasta di zucchero", "Uova", "Zucchero"] },
  panettone: { kicker: "I Grandi Lievitati", title: "Panettone artigianale", img: "img/panettone.jpg",
    desc: "Lievito madre e lunga lievitazione, anche nella versione con gocce di cioccolato fondente.",
    ingredients: ["Farina", "Burro", "Uova", "Zucchero", "Lievito madre", "Gocce di cioccolato", "Vaniglia"] },
  chiacchiere: { kicker: "I Grandi Lievitati", title: "Chiacchiere", img: "img/chiacchiere.jpg",
    desc: "Sfoglie sottili e croccanti di Carnevale, con tanto zucchero a velo.",
    ingredients: ["Farina", "Uova", "Zucchero", "Burro", "Vino bianco", "Olio per frittura", "Zucchero a velo"] },
  colomba: { kicker: "I Grandi Lievitati", title: "Colomba artigianale", img: "img/colomba.jpg",
    desc: "Soffice impasto a lievito madre con canditi d'arancia e glassa alle mandorle.",
    ingredients: ["Farina", "Burro", "Uova", "Zucchero", "Lievito madre", "Canditi d'arancia", "Glassa alle mandorle", "Mandorle"] },
  "creazione-numero": { kicker: "Le nostre creazioni", title: "Torte a numero", img: "img/creazione-numero.jpg",
    desc: "Il numero della festa in frolla, crema e frutta fresca: si ordina su richiesta.",
    ingredients: ["Pasta frolla", "Crema pasticcera", "Fragole", "Kiwi", "Mango", "Frutti di bosco", "Zucchero a velo"] },
  "creazione-cornetti": { kicker: "Le nostre creazioni", title: "Cornetti bicolore", img: "img/creazione-cornetti.jpg",
    desc: "La nostra sfoglia a strisce: verde al pistacchio e rosa al lampone.",
    ingredients: ["Farina", "Burro", "Latte", "Zucchero", "Pistacchio", "Lampone", "Lievito"] },
  "creazione-cioccolato": { kicker: "Le nostre creazioni", title: "Cupole al cioccolato", img: "img/creazione-cioccolato.jpg",
    desc: "Mousse al cioccolato al latte, glassa fondente e nocciole caramellate.",
    ingredients: ["Cioccolato al latte", "Cioccolato fondente", "Panna", "Nocciole", "Zucchero", "Base di biscotto"] },
  "creazione-frutta": { kicker: "Le nostre creazioni", title: "Scrigno di frutta", img: "img/creazione-frutta.jpg",
    desc: "Pareti di cioccolato decorato a venature di legno, piene di frutta fresca.",
    ingredients: ["Cioccolato fondente", "Pan di Spagna", "Crema", "Fragole", "Frutti di bosco", "Kiwi"] },
};

/* ---------- Scheda prodotto: si apre in 3D partendo dal dolce toccato ---------- */
const productDialog = document.getElementById("product-dialog");
const pdCard = productDialog.querySelector(".pd-card");
const pdImg = productDialog.querySelector("[data-pd-img]");
let openedFrom = null;

function fillProduct(key) {
  const p = PRODUCTS[key];
  if (!p) return false;
  pdImg.src = p.img.replace(/\.jpg$/, ".webp");
  pdImg.alt = p.title;
  productDialog.querySelector("[data-pd-kicker]").textContent = p.kicker;
  productDialog.querySelector("[data-pd-title]").textContent = p.title;
  productDialog.querySelector("[data-pd-desc]").textContent = p.desc;
  const list = productDialog.querySelector("[data-pd-ingredients]");
  list.replaceChildren(...p.ingredients.map((name, i) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.style.setProperty("--i", i);
    return li;
  }));
  return true;
}

// Trasformazione che porta la scheda aperta sopra al dolce di partenza.
function fromCardTransform(cardEl) {
  const from = cardEl.getBoundingClientRect();
  const to = pdCard.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const s = Math.max(.2, Math.min(from.width / to.width, 1));
  return `perspective(1400px) translate(${dx}px, ${dy}px) scale(${s}) rotateY(-28deg) rotateX(12deg)`;
}

function openProduct(key, cardEl) {
  if (!fillProduct(key)) return;
  openedFrom = cardEl;
  productDialog.showModal();
  productDialog.classList.add("is-open");
  if (reduceMotion || !pdCard.animate) return;
  pdCard.animate([
    { transform: fromCardTransform(cardEl), opacity: .4, borderRadius: "14px" },
    { transform: "perspective(1400px) translate(0, 0) scale(1) rotateY(0) rotateX(0)", opacity: 1 },
  ], { duration: 620, easing: "cubic-bezier(.2,.9,.25,1.05)" });
}

function closeProduct() {
  if (!productDialog.open) return;
  productDialog.classList.remove("is-open");
  if (reduceMotion || !openedFrom || !pdCard.animate) { productDialog.close(); return; }
  const anim = pdCard.animate([
    { transform: "perspective(1400px) translate(0, 0) scale(1)", opacity: 1 },
    { transform: fromCardTransform(openedFrom), opacity: 0 },
  ], { duration: 380, easing: "cubic-bezier(.5,0,.75,0)" });
  anim.onfinish = () => productDialog.close();
}

document.querySelectorAll("[data-open-product]").forEach((btn) => {
  btn.addEventListener("click", () => openProduct(btn.dataset.openProduct, btn.closest("[data-product]")));
});
// Chiusura animata: pulsante ×, tasto Esc, clic fuori dalla scheda.
productDialog.querySelector(".pd-close").addEventListener("click", (e) => { e.preventDefault(); closeProduct(); });
productDialog.addEventListener("cancel", (e) => { e.preventDefault(); closeProduct(); });
productDialog.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); closeProduct(); } });
productDialog.addEventListener("click", (e) => { if (e.target === productDialog) closeProduct(); });
productDialog.addEventListener("close", () => { openedFrom?.querySelector("[data-open-product]")?.focus({ preventScroll: true }); });

/* ---------- Inclinazione 3D seguendo il puntatore ---------- */
function addTilt(el, max = 10) {
  let frame = 0;
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
      el.classList.add("is-tilting");
    });
  });
  el.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
}

if (!reduceMotion && finePointer) {
  document.querySelectorAll(".card, .gallery-item").forEach((el) => addTilt(el, 8));
  addTilt(pdCard.querySelector(".pd-media"), 8);

  // Copertina: la foto si sposta in profondità seguendo il mouse.
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    hero.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  hero.addEventListener("pointerleave", () => { hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0); });
}

/* ---------- Copertina: profondità durante lo scroll ---------- */
if (!reduceMotion) {
  const heroEl = document.querySelector(".hero");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = Math.min(window.scrollY / heroEl.offsetHeight, 1);
      heroEl.style.setProperty("--scroll", p.toFixed(3));
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Anno nel footer ---------- */
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
