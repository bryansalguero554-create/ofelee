/* =========================================================
   L'Ôfelee – script del sito
   ========================================================= */

const CONFIG = {
  // Numero WhatsApp in formato internazionale, senza "+" né spazi.
  // Per i test: mettere qui il proprio cellulare (es. "393XXXXXXXXX").
  // Dopo la demo: fisso del negozio se attivo su WhatsApp Business, oppure il cellulare dedicato.
  whatsapp: "390399900514",
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
  minDaysCustomCake: 3,
};

const DAY_NAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

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

/* ---------- Immagini mancanti ----------
   Se manca la foto del singolo prodotto si usa quella della categoria
   (data-fallback, es. img/colazione.jpg); se manca anche quella resta
   il segnaposto. */
document.querySelectorAll(".hero-media img, .about-media img, .card-img img, .gallery-item img").forEach((img) => {
  const onFail = () => {
    const fallback = img.dataset.fallback;
    if (fallback && !img.src.endsWith(fallback)) {
      img.src = fallback;
    } else {
      img.classList.add("img-missing");
    }
  };
  img.addEventListener("error", onFail);
  if (img.complete && img.naturalWidth === 0) onFail();
});

/* ---------- Mappa interattiva (caricata solo su consenso) ----------
   Nessun contatto con Google finché il visitatore non clicca; con la
   spunta "Mostra sempre" la scelta viene ricordata su questo dispositivo. */
const MAP_PREF_KEY = "ofelee-map-consent";
const mapBox = document.getElementById("map");

function loadMap() {
  const iframe = document.createElement("iframe");
  iframe.title = "Mappa: Pasticceria L'Ôfelee, Via Padre Paolo Arlati 2, Merate";
  iframe.src = "https://maps.google.com/maps?q=Via%20Padre%20Paolo%20Arlati%202%2C%2023807%20Merate%20LC&z=16&output=embed";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  mapBox.replaceChildren(iframe);
}

const readPref = () => { try { return localStorage.getItem(MAP_PREF_KEY) === "1"; } catch { return false; } };
const savePref = () => { try { localStorage.setItem(MAP_PREF_KEY, "1"); } catch { /* storage non disponibile */ } };

document.querySelector("[data-load-map]")?.addEventListener("click", () => {
  if (document.querySelector("[data-map-remember]")?.checked) savePref();
  loadMap();
});

if (mapBox && readPref()) {
  // Consenso già dato: carica la mappa quando la sezione si avvicina.
  if ("IntersectionObserver" in window) {
    const mapIo = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { mapIo.disconnect(); loadMap(); }
    }, { rootMargin: "300px" });
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

/* ---------- Modulo ordine → WhatsApp ---------- */
const form = document.getElementById("order-form");
const dateInput = document.getElementById("f-data");
const tipoSelect = document.getElementById("f-tipo");
const dateHint = document.querySelector("[data-date-hint]");
const formError = document.querySelector("[data-form-error]");

const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

(function setMinDate() {
  const now = nowInRome();
  const tomorrow = new Date(now.year, now.month - 1, now.day + 1);
  dateInput.min = isoDate(tomorrow);
})();

function parseInputDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function checkDate() {
  dateHint.textContent = "";
  if (!dateInput.value) return;
  const chosen = parseInputDate(dateInput.value);
  const now = nowInRome();
  const today = new Date(now.year, now.month - 1, now.day);
  const daysAhead = Math.round((chosen - today) / 86400000);
  const isCustom = /Torta|Rinfresco/.test(tipoSelect.value);

  if (chosen.getDay() === 1) {
    dateHint.textContent = "Il lunedì siamo chiusi: scegli un altro giorno.";
  } else if (isCustom && daysAhead < CONFIG.minDaysCustomCake) {
    dateHint.textContent = "Data ravvicinata: ti confermeremo noi la disponibilità.";
  }
}
dateInput.addEventListener("change", checkDate);
tipoSelect.addEventListener("change", checkDate);

// Link "Prenota" dalle specialità: preseleziona il prodotto nel modulo.
document.querySelectorAll("[data-preset]").forEach((link) => {
  link.addEventListener("click", () => {
    tipoSelect.value = link.dataset.preset;
    checkDate();
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.hidden = true;

  const fields = ["f-persone", "f-data", "f-nome"].map((id) => document.getElementById(id));
  let firstInvalid = null;
  fields.forEach((f) => {
    const valid = f.checkValidity() && f.value.trim() !== "";
    f.classList.toggle("is-invalid", !valid);
    if (!valid && !firstInvalid) firstInvalid = f;
  });

  if (!firstInvalid && parseInputDate(dateInput.value).getDay() === 1) firstInvalid = dateInput;

  if (firstInvalid) {
    formError.textContent = firstInvalid === dateInput && dateInput.value
      ? "Il lunedì siamo chiusi: scegli un'altra data di ritiro."
      : "Compila i campi evidenziati: tipo di dolce, numero di persone, data di ritiro e nome.";
    formError.hidden = false;
    firstInvalid.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const dateLabel = parseInputDate(data.data).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const lines = [
    "Buongiorno Pasticceria L'Ôfelee,",
    "vorrei richiedere la disponibilità per una torta/ordine:",
    "",
    `🎂 Prodotto: ${data.tipo}`,
    `👥 Per quante persone: ${data.persone}`,
    `📅 Data di ritiro richiesta: ${dateLabel}`,
    `👤 Nome: ${data.nome.trim()}`,
    data.note.trim() ? `📝 Note/Dettagli: ${data.note.trim()}` : null,
  ].filter((l) => l !== null);

  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");
});

form.querySelectorAll("input").forEach((input) =>
  input.addEventListener("input", () => input.classList.remove("is-invalid"))
);

/* ---------- Animazioni all'ingresso delle sezioni ---------- */
if ("IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".strength, .section-head, .card, .order-text, .order-form, .about-media, .about-text, .hours-box, .where-box");
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
