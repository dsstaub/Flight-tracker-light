
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
  const mockData = {
    flightNumber: flightNum,
    origin: "DFW",
    aircraftType: "A319",
    status: "En Route",
    eta: "16:45",
    gate: "B24"
  };

  const card = document.createElement("div");
  card.className = "flight-card";
  card.innerHTML = `
    <h2>Flight ${mockData.flightNumber}</h2>
    <div class="flight-info"><strong>Origin:</strong> ${mockData.origin}</div>
    <div class="flight-info"><strong>Aircraft:</strong> ${mockData.aircraftType}</div>
    <div class="flight-info"><strong>Status:</strong> ${mockData.status}</div>
    <div class="flight-info"><strong>ETA:</strong> ${mockData.eta}</div>
    <div class="flight-info"><strong>Gate:</strong> ${mockData.gate}</div>
  `;
  list.appendChild(card);
}
