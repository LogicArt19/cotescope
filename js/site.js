"use strict";
// protège contre l'affichage du site dans un cadre d'un autre site (clickjacking)
if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = "none"; } }
/* Les barres de probabilités se remplissent une fois, au chargement */
requestAnimationFrame(() => setTimeout(() => {
  document.querySelectorAll(".spec[data-p]").forEach(s => {
    const p = s.dataset.p.split(",").map(Number), t = p.reduce((a, b) => a + b, 0);
    s.querySelectorAll("i").forEach((i, k) => { i.style.width = (p[k] / t * 100) + "%"; });
  });
}, 150));

/* Bilan public, en direct depuis le serveur */
const pc = x => x == null ? "–" : (x * 100).toFixed(0) + " %";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
fetch("config.json", {cache: "no-store"}).then(r => r.json()).then(c => c.api ? fetch(c.api + "/api/public/stats") : null)
  .then(r => r && r.ok ? r.json() : null).then(d => {
    if (!d) return;
    document.getElementById("k-n").textContent = d.n || 0;
    document.getElementById("k-rate").textContent = d.n ? pc(d.rate) : "–";
    const roi = document.getElementById("k-roi");
    roi.textContent = d.n ? (d.roi >= 0 ? "+" : "") + (d.roi * 100).toFixed(1).replace(".", ",") + " %" : "–";
    if (d.n) roi.style.color = d.roi >= 0 ? "var(--home)" : "var(--bad)";
    document.getElementById("k-p").textContent = d.pending || 0;
    const rows = [...(d.upcoming || []).slice(0, 4).map(e => ({...e, status: "pending"})), ...(d.last || []).slice(0, 8)];
    if (!rows.length) return;
    const lab = {won: "Gagné", lost: "Perdu", pending: "À venir"};
    document.getElementById("k-list").innerHTML = rows.map(e => `<div><span>${esc(e.selection)}<small>${esc(e.match)} · ${pc(e.p)} de chances</small></span><b class="num">${String(Number(e.odds).toFixed(2)).replace(".", ",")}</b><span class="st ${e.status}">${lab[e.status] || ""}</span></div>`).join("");
  }).catch(() => {});
