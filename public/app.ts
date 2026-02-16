let leads = [];
let current = 0;

async function load() {
  const res = await fetch("/api/leads");
  leads = await res.json();
  render();
}

function render() {
  if (!leads.length) return;

  const l = leads[current];
  document.getElementById("card").innerHTML = `
    <h2>${l.name}</h2>
    <p>🌐 ${l.website}</p>
    <p>${l.issue}</p>
    <strong>${l.score}</strong>
  `;
}

document.getElementById("next").onclick = () => {
  current = (current + 1) % leads.length;
  render();
};

load();