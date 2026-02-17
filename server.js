import express from "express";
import axios from "axios";
import cron from "node-cron";
import cheerio from "cheerio";

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
      .filter(x => x.tags?.name && x.tags?.website)
      .map(x => ({
        name: x.tags.name,
        website: x.tags.website,
        issue: "Web má potenciál na redesign",
        score: "🔥 HIGH"
      }));

    console.log("Leads:", leads.length);

  } catch (e) {
    console.log("Scan error", e.message);
  }
}

scanLeads();
cron.schedule("0 8 * * *", scanLeads);

// ---------- API LEADS ----------
app.get("/api/leads", (req, res) => {
  res.json(leads);
});

// ---------- SNIPER IMPORT ----------
app.get("/api/import", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "missing url" });

  try {
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);

    const title = $("title").text() || url;

    const body = $("body").text();
    const emailMatch =
      body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    const lead = {
      name: title.substring(0, 60),
      website: url,
      issue: "Imported sniper lead",
      score: "🔥 SNIPER",
      email: emailMatch ? emailMatch[0] : "nenájdený"
    };

    leads.unshift(lead);

    res.json(lead);

  } catch (e) {
    res.json({ error: "cannot load site" });
  }
});

// ---------- FRONTEND ----------
app.use(express.static("public"));

app.listen(PORT, () =>
  console.log("Running on port", PORT)
);
