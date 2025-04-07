const form = document.getElementById("flight-form");
const input = document.getElementById("flight-input");
const list = document.getElementById("flight-list");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const flightNum = input.value.trim();
  if (flightNum) {
    addFlightCard(flightNum);
    input.value = "";
  }
});

function addFlightCard(flightNum) {
  // Mock data
  const now = new Date();
  const eta = new Date(now.getTime() + Math.floor(Math.random() * 60 + 5) * 60000); // ETA 5–65 minutes from now

  const mockData = {
    flightNumber: flightNum,
    origin: "DFW",
    aircraftType: "A319",
    status: "En Route",
    eta,
    gate: "B24"
  };

  const card = document.createElement("div");
  card.className = "flight-card";

  const isMainline = isMainlineFlight(flightNum);
  const color = isMainline ? "#007aff" : "#ff3b30";
  const bar = document.createElement("div");
  bar.className = "flight-bar";
  bar.style.backgroundColor = color;

  const content = document.createElement("div");
  content.className = "flight-content";
  content.innerHTML = `
    <div class="flight-row bold">
      <div>Flight ${mockData.flightNumber}</div>
      <div id="timer-${flightNum}">--:--</div>
    </div>
    <div class="flight-row">
      <div>Origin: ${mockData.origin}</div>
      <div>Aircraft: ${mockData.aircraftType}</div>
    </div>
    <div class="flight-row bold">
      <div>Gate: ${mockData.gate}</div>
      <div>ETA: ${formatTime(mockData.eta)}</div>
    </div>
  `;

  card.appendChild(bar);
  card.appendChild(content);
  list.appendChild(card);

  updateCountdown(card, flightNum, mockData.eta, isMainline);
  setInterval(() => updateCountdown(card, flightNum, mockData.eta, isMainline), 1000);
}

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function updateCountdown(card, flightNum, eta, isMainline) {
  const now = new Date();
  let diff = Math.floor((eta - now) / 1000);
  const timer = document.getElementById(`timer-${flightNum}`);

  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60).toString().padStart(2, '0');
  const seconds = (absDiff % 60).toString().padStart(2, '0');
  const prefix = diff < 0 ? "-" : "";

  timer.textContent = `${prefix}${minutes}:${seconds}`;

  // Update background based on timing
  if (diff <= 0) {
    card.className = "flight-card expired";
  } else if (diff <= 300) {
    card.className = "flight-card urgent";
  } else if (diff <= 900) {
    card.className = "flight-card warning";
  } else {
    card.className = "flight-card on-time";
  }

  // Keep the left color bar consistent
  const bar = card.querySelector(".flight-bar");
  bar.style.backgroundColor = isMainline ? "#007aff" : "#ff3b30";
}

function isMainlineFlight(flightNum) {
  const num = parseInt(flightNum);
  return (num >= 1 && num <= 2949) || (num >= 6300 && num <= 6349);
}
