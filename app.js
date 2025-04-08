const form = document.getElementById("flight-form");
const input = document.getElementById("flight-input");
const list = document.getElementById("flight-list");
const sortSelect = document.getElementById("sort-select");
const hamburger = document.getElementById("hamburger");
const filterPanel = document.getElementById("filter-panel");

let flights = [];
let swipeSetting = localStorage.getItem("swipeSetting") || "left-service";

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  filterPanel.classList.toggle("open");
});

document.querySelectorAll('input[name="swipe"]').forEach(input => {
  input.onclick = () => {
    swipeSetting = input.value;
    localStorage.setItem("swipeSetting", swipeSetting);
  };
  if (input.value === swipeSetting) input.checked = true;
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

    const actions = document.createElement("div");
    actions.className = "card-actions";
    ["NW", "NL", "NS"].forEach(code => {
      const btn = document.createElement("button");
      btn.textContent = code;
      btn.onclick = () => {
        card.classList.remove("swipe-NW", "swipe-NL", "swipe-NS");
        card.classList.add(`swipe-${code}`);
        card.style.transform = "translateX(0)";
      };
      actions.appendChild(btn);
    });

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

    card.appendChild(actions);
    card.appendChild(bar);
    card.appendChild(content);
    list.appendChild(card);

    updateCountdown(flight);
    enableSwipeDrawer(card);
  });
}

function enableSwipeDrawer(card) {
  let startX = 0;
  let currentX = 0;
  let threshold = 50;
  let fullSwipe = 120;
  let active = false;

  card.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    active = true;
  });

  card.addEventListener("touchmove", (e) => {
    if (!active) return;
    currentX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${currentX}px)`;
  });

  card.addEventListener("touchend", () => {
    if (!active) return;
    active = false;

    if (currentX > threshold) {
      card.style.transform = "translateX(100%)";
      setTimeout(() => card.remove(), 250);
    } else if (currentX < -fullSwipe) {
      card.classList.remove("swipe-NW", "swipe-NL", "swipe-NS");
      card.classList.add("swipe-NS");
      card.style.transform = "translateX(0)";
    } else if (currentX < -threshold) {
      card.style.transform = "translateX(-100px)";
    } else {
      card.style.transform = "translateX(0)";
    }

    currentX = 0;
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
}

function isMainlineFlight(flightNum) {
  const num = parseInt(flightNum);
  return (num >= 1 && num <= 2949) || (num >= 6300 && num <= 6349);
}
