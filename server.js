const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.FLIGHTLABS_API_KEY;
 
app.use(cors());

app.get("/api/flight/:flightNumber", async (req, res) => {
  const flightNum = req.params.flightNumber;

  try {
    const response = await fetch(
      `https://app.goflightlabs.com/flights?airline_iata=AA`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }
    );

    const result = await response.json();
    const match = result?.data?.find(f => f.flight_iata === `AA${flightNum}`);

    if (!match) return res.status(404).json({ error: "Flight not found" });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server live on port ${PORT}`);
});
