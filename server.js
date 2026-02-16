import express from "express";
import axios from "axios";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT || 3000;

let leads = [];

// ---------- AUTO SCAN ----------
async function scanLeads() {
  console.log("Scanning...");

  const query = `
[out:json];
area["name"="Bratislava"]->.a;
(
  node["shop"](area.a);
  node["tourism"](area.a);
  node["craft"](area.a);
  node["office"](area.a);
  way["shop"](area.a);
  way["tourism"](area.a);
  way["craft"](area.a);
  way["office"](area.a);
);
out tags;
`;

  try {
    const res = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    leads = res.data.elements
      .filter(x => x.tags?.name)
      .map(x => ({
        name: x.tags.name,
        website: x.tags.website || "bez webu",
        issue: "Možný starší web — skontrolovať",
        score: x.tags.website ? "🔥 HIGH" : "⭐ MEDIUM"
      }));

    console.log("Leads:", leads.length);
  } catch (e) {
    console.log("Scan error");
  }
}

// run on start
scanLeads();

// every day at 08:00
cron.schedule("0 8 * * *", scanLeads);

// ---------- API ----------
app.get("/api/leads", (req, res) => {
  res.json(leads);
});

// ---------- FRONTEND ----------
app.use(express.static("public"));

app.listen(PORT, () =>
  console.log("Running on port", PORT)
);
