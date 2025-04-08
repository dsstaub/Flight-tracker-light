const form = document.getElementById("flight-form");
const input = document.getElementById("flight-input");
const list = document.getElementById("flight-list");
const sortSelect = document.getElementById("sort-select");
const hamburger = document.getElementById("hamburger");
const filterPanel = document.getElementById("filter-panel");

let flights = [];

hamburger.addEventListener("click", () => {
  filterPanel.classList.toggle("open");
});

input.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
  if (e.target.value.length === 4) {
    form.requestSubmit();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const flightNum = input.value.trim();
  if (flightNum && /^\d{4}$/.test(flightNum)) {
    addFlight(flightNum);
    input.value = "";
  }
});

sortSelect.addEventListener("change", () => renderFlightList());

function addFlight(flightNum) {
  const now = new Date();
  const eta = new Date(now.getTime() + Math.floor(Math.random() * 60 + 5) * 60000);
  const flight = {
    flightNumber: flightNum,
    tailNumber: "N844NN",
    origin: "DFW",
    aircraftType: "A319",
    status: "En Route",
    eta,
    gate: "B24",
    isMainline: isMainlineFlight(flightNum),
    collapsed: true
  };

  flights.push(flight);
  renderFlightList();
  setInterval(() => updateCountdown(flight), 1000);
}

function renderFlightList() {
  const sortBy = sortSelect.value;
  flights.sort((a, b) => {
    if (sortBy === "eta") return a.eta - b.eta;
    return (a[sortBy] || "").localeCompare(b[sortBy] || "");
  });

  list.innerHTML = "";
  flights.forEach((flight) => {
    const card = document.createElement("div");
    card.className = `flight-card ${flight.isMainline ? "mainline" : "regional"}`;
    card.id = `card-${flight.flightNumber}`;

    const bar = document.createElement("div");
    bar.className = "flight-bar";
    bar.style.backgroundColor = flight.isMainline ? "#007aff" : "#ff3b30";

    const content = document.createElement("div");
    content.className = "flight-content";

    const flightLabel = flight.collapsed
      ? flight.flightNumber
      : `${flight.flightNumber} [${flight.tailNumber}] (${flight.aircraftType})`;

    const topRow = `
      <div class="flight-row flight-row-main">
        <div>${flightLabel}</div>
        <div>${flight.collapsed ? `Gate ${flight.gate}` : flight.gate}</div>
        <div class="fixed-timer"><span id="timer-${flight.flightNumber}">--:--</span></div>
      </div>`;

    const midRows = flight.collapsed ? "" : `
      <div class="flight-row">
        <div>Origin: ${flight.origin}</div>
        <div>${flight.status}</div>
        <div>ETA: <span id="eta-${flight.flightNumber}">${formatTime(flight.eta)}</span></div>
      </div>`;

    content.innerHTML = topRow + midRows;

    content.addEventListener("click", () => {
      flight.collapsed = !flight.collapsed;
      renderFlightList();
    });

    if (flight.collapsed) card.classList.add("collapsed");

    card.appendChild(bar);
    card.appendChild(content);
    list.appendChild(card);

    updateCountdown(flight);
  });
}

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function updateCountdown(flight) {
  const now = new Date();
  let diff = Math.floor((flight.eta - now) / 1000);
  const timer = document.getElementById(`timer-${flight.flightNumber}`);
  const eta = document.getElementById(`eta-${flight.flightNumber}`);
  if (!timer) return;

  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60).toString().padStart(2, "0");
  const seconds = (absDiff % 60).toString().padStart(2, "0");
  const prefix = diff < 0 ? "-" : "";

  timer.textContent = `${prefix}${minutes}:${seconds}`;
  if (eta) eta.textContent = formatTime(flight.eta);

  const card = document.getElementById(`card-${flight.flightNumber}`);
  card.className = `flight-card ${flight.isMainline ? "mainline" : "regional"}`;

  if (diff <= 0) {
    card.classList.add("expired");
  } else if (diff <= 300) {
    card.classList.add("urgent", flight.isMainline ? "mainline" : "regional");
  } else if (diff <= 900) {
    card.classList.add(flight.isMainline ? "warning-mainline" : "warning-regional");
  } else {
    card.classList.add("on-time");
  }

  if (flight.collapsed) card.classList.add("collapsed");
}

function isMainlineFlight(flightNum) {
  const num = parseInt(flightNum);
  return (num >= 1 && num <= 2949) || (num >= 6300 && num <= 6349);
}
