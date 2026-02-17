import express from "express";
import axios from "axios";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT || 3000;

let leads = [];

// ---------- AUTO SCAN ----------
async function scanLeads() {
  console.log("Scanning REAL leads...");

  const query = `
[out:json];
area["name"="Bratislava"]->.a;
(
  node["shop"](area.a);
  node["craft"](area.a);
  node["office"](area.a);
  way["shop"](area.a);
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

      // musí mať názov + web
    .filter(x => x.tags?.name && x.tags?.website)

// vyhoď veľké reťazce
.filter(x => {
  const n = x.tags.name.toLowerCase();

  return ![
    "tesco",
    "billa",
    "lidl",
    "kaufland",
    "shell",
    "omv",
    "slovnaft",
    "mcdonald",
    "kfc",
    "burger king",
    "ikea"
  ].some(big => n.includes(big));
})

      // vyhodíme nezmysly
      .filter(x =>
        !x.tags.name.toLowerCase().includes("cemetery") &&
        !x.tags.name.toLowerCase().includes("street") &&
        !x.tags.name.toLowerCase().includes("park")
      )

      .map(x => ({
        name: x.tags.name,
        website: x.tags.website,
        issue: "Web má potenciál na redesign",
        score: "🔥 HIGH"
      }));

    console.log("REAL leads:", leads.length);

  } catch (e) {
    console.log("Scan error", e.message);
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
