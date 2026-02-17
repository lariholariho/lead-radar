let leads = [];
let current = 0;

const card = document.getElementById("card");
const nextBtn = document.getElementById("next");
const openBtn = document.getElementById("openSite");

const importBtn = document.getElementById("importLead");
const leadUrlInput = document.getElementById("leadUrl");

// ---------- LOAD EXISTING LEADS ----------
async function loadLeads() {
  try {
    const res = await fetch("/api/leads");
    leads = await res.json();

    // local manual leads
    const saved = JSON.parse(localStorage.getItem("manualLeads") || "[]");
    leads = [...saved, ...leads];

    if (!leads.length) {
      card.innerHTML = "<p>Žiadne leady zatiaľ 😕</p>";
      return;
    }

    renderLead();
  } catch (e) {
    card.innerHTML = "<p>Chyba načítania leadov</p>";
  }
}

function renderLead() {
  if (!leads.length) return;

  const lead = leads[current];

  card.innerHTML = `
    <h2>${lead.name}</h2>
    <p>🌐 ${lead.website}</p>
    <p>⚠️ ${lead.issue}</p>
    <strong>${lead.score}</strong>
  `;
}

// ---------- NEXT ----------
nextBtn.onclick = () => {
  if (!leads.length) return;
  current = (current + 1) % leads.length;
  renderLead();
};

// ---------- OPEN WEBSITE ----------
if (openBtn) {
  openBtn.onclick = () => {
    const lead = leads[current];
    if (!lead.website) return;

    let url = lead.website;
    if (!url.startsWith("http")) url = "https://" + url;

    window.open(url, "_blank");
  };
}

// ---------- SNIPER IMPORT ----------
importBtn.onclick = () => {
  const url = leadUrlInput.value.trim();
  if (!url) return;

  const domain = url
    .replace("https://", "")
    .replace("http://", "")
    .split("/")[0];

  const newLead = {
    name: domain,
    website: url,
    issue: "Manual sniper lead — skontroluj web",
    score: "🔥 SNIPER"
  };

  // save locally
  const saved = JSON.parse(localStorage.getItem("manualLeads") || "[]");
  saved.unshift(newLead);
  localStorage.setItem("manualLeads", JSON.stringify(saved));

  leads.unshift(newLead);
  current = 0;
  renderLead();

  leadUrlInput.value = "";
};

loadLeads();
