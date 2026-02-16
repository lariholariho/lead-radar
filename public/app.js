let leads = [];
let current = 0;

const card = document.getElementById("card");
const nextBtn = document.getElementById("next");
const openBtn = document.getElementById("openSite");

if (openBtn) {
  openBtn.onclick = () => {
    const lead = leads[current];
    if (lead.website && lead.website !== "bez webu") {
      let url = lead.website;
      if (!url.startsWith("http")) url = "https://" + url;
      window.open(url, "_blank");
    }
  };
}

async function loadLeads() {
  try {
    const res = await fetch("/api/leads");
    leads = await res.json();

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
  const lead = leads[current];

  card.innerHTML = `
    <h2>${lead.name}</h2>
    <p>🌐 ${lead.website}</p>
    <p>⚠️ ${lead.issue}</p>
    <strong>${lead.score}</strong>
  `;

  // disable button ak nie je web
  if (!lead.website || lead.website === "bez webu") {
    openBtn.disabled = true;
    openBtn.style.opacity = 0.5;
  } else {
    openBtn.disabled = false;
    openBtn.style.opacity = 1;
  }
}

nextBtn.onclick = () => {
  if (!leads.length) return;
  current = (current + 1) % leads.length;
  renderLead();
};

openBtn.onclick = () => {
  const lead = leads[current];
  if (lead.website && lead.website !== "bez webu") {
    let url = lead.website;
    if (!url.startsWith("http")) url = "https://" + url;
    window.open(url, "_blank");
  }
};

loadLeads();
