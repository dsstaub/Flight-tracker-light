const form = document.getElementById("flight-form");
const input = document.getElementById("flight-input");
const list = document.getElementById("flight-list");
const sortSelect = document.getElementById("sort-select");

let flights = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const flightNum = input.value.trim();
  if (flightNum) {
    addFlight(flightNum);
    input.value = "";
  }
});

sortSelect.addEventListener("change", renderFlightList);

function addFlight(flightNum) {
  const now = new Date();
  const eta = new Date(now.getTime() + Math.floor(Math.random() * 60 + 5) * 60000);

  const flight = {
    flightNumber: flightNum,
    origin: "DFW",
    aircraftType: "A319",
    status: "En Route",
    eta,
    gate: "B24",
    isMainline: isMainlineFlight(flightNum),
    collapsed: false
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
    if (flight.collapsed) card.classList.add("collapsed");

    content.innerHTML = `
      <div class="flight-row flight-row-main bold">
        <div>${flight.collapsed ? `${flight.flightNumber}` : `Flight ${flight.flightNumber}`}</div>
        <div class="fixed-timer">
          ${flight.collapsed ? '' : `(<span id="eta-${flight.flightNumber}">${formatTime(flight.eta)}</span>)`} 
          <span id="timer-${flight.flightNumber}">--:--</span>
        </div>
      </div>
      ${!flight.collapsed ? `
        <div class="flight-row">
          <div>Origin: ${flight.origin}</div>
          <div>Aircraft: ${flight.aircraftType}</div>
          <div>Gate: ${flight.gate}</div>
        </div>
        <div class="flight-row">
          <div>Status: ${flight.status}</div>
        </div>
      ` : ''}
    `;

    content.addEventListener("click", () => {
      flight.collapsed = !flight.collapsed;
      renderFlightList();
    });

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
  card.classList.remove(
    "on-time",
    "warning-mainline",
    "warning-regional",
    "urgent",
    "expired",
    "mainline",
    "regional"
  );

  card.classList.add(flight.isMainline ? "mainline" : "regional");

  if (diff <= 0) {
    card.classList.add("expired");
  } else if (diff <= 300) {
    card.classList.add("urgent");
    card.classList.add(flight.isMainline ? "mainline" : "regional");
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
