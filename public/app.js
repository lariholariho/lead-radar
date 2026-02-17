let leads = [];
let current = 0;

const card = document.getElementById("card");
const nextBtn = document.getElementById("next");
const openBtn = document.getElementById("openSite");

const importBtn = document.getElementById("importLead");
const leadUrlInput = document.getElementById("leadUrl");

// ---------- LOAD ----------
async function loadLeads() {
  try {
    const res = await fetch("/api/leads");
    leads = await res.json();

    if (!leads.length) {
      card.innerHTML = "<p>Žiadne leady zatiaľ 😕</p>";
      return;
    }

    renderLead();
  } catch {
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
    <p><strong>${lead.score}</strong></p>
    ${lead.email ? `<p>✉️ ${lead.email}</p>` : ""}
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

// ---------- SNIPER IMPORT REAL ----------
importBtn.onclick = async () => {
  const url = leadUrlInput.value.trim();
  if (!url) return;

  try {
    const res = await fetch(`/api/import?url=${encodeURIComponent(url)}`);
    const newLead = await res.json();

    if (newLead.error) {
      alert("Nepodarilo sa načítať stránku");
      return;
    }

    leads.unshift(newLead);
    current = 0;
    renderLead();

    leadUrlInput.value = "";
  } catch {
    alert("Import error");
  }
};

loadLeads();
