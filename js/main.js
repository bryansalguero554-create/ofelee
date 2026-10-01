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
  const minVisible = seen ? 300 : 1200; // ms dall'inizio della navigazione

  const finish = () => {
    const wait = Math.max(0, minVisible - performance.now());
    setTimeout(() => {
      loader.classList.add("is-loaded");
      setTimeout(() => {
        loader.classList.add("is-hidden");
        setTimeout(() => loader.remove(), 600);
      }, seen ? 350 : 950);
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

/* ---------- Animazioni all'ingresso delle sezioni ---------- */
if ("IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".strength, .section-head, .card, .order-text, .order-call, .about-media, .about-text, .hours-box, .where-box");
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => io.observe(el));
}

/* ---------- Anno nel footer ---------- */
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
