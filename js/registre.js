"use strict";
if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = "none"; } }
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fr = (x, d = 2) => x == null ? "–" : Number(x).toFixed(d).replace(".", ",");
const dt = s => { const d = new Date(s); return isNaN(d) ? "" : d.toLocaleString("fr-FR", {day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit"}); };
// même calcul que le serveur : SHA-256(hash précédent + JSON trié des champs du pronostic)
const FIELDS = ["match", "odds", "p", "recorded", "selection", "start", "uid"];
function pyJson(o){ // reproduit json.dumps(sort_keys=True, ensure_ascii=False) de Python
  return "{" + FIELDS.map(k => JSON.stringify(k) + ": " + pyVal(o[k])).join(", ") + "}";
}
function pyVal(v){
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return Number.isInteger(v) ? v + ".0" : String(v); // Python écrit 2.0, JavaScript écrirait 2
  return JSON.stringify(v);
}
async function sha(t){ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
(async () => {
  let led;
  try { led = await (await fetch("bilan/registre.json", {cache: "no-store"})).json(); }
  catch (e) { document.getElementById("rows").innerHTML = '<tr><td colspan="8">Le registre démarre : les premiers pronostics arrivent avec la prochaine sélection.</td></tr>'; document.getElementById("chain").textContent = "Registre pas encore publié."; return; }
  const E = led.entries || [];
  let prev = "0".repeat(64), bad = 0;
  for (const e of E) { const h = await sha(prev + pyJson(e)); if (h !== e.hash) bad++; prev = e.hash; }
  const ch = document.getElementById("chain");
  ch.className = "chain " + (bad ? "ko" : "ok");
  ch.innerHTML = bad ? `⚠️ ${bad} empreinte(s) ne correspondent pas au calcul de ton navigateur.` : `✓ Chaîne d'empreintes vérifiée par ton navigateur : ${E.length} pronostic(s), aucune ligne modifiée.`;
  const s = led.summary || {};
  document.getElementById("k-n").textContent = s.n ?? 0;
  document.getElementById("k-w").textContent = s.n ? Math.round(100 * s.wins / s.n) + " %" : "–";
  document.getElementById("k-roi").textContent = s.roi == null ? "–" : (s.roi >= 0 ? "+" : "−") + fr(Math.abs(s.roi * 100), 1) + " %";
  document.getElementById("k-p").textContent = s.pending ?? 0;
  document.getElementById("rows").innerHTML = E.slice().reverse().map(e => `<tr><td>${e.n}</td><td>${dt(e.recorded)}</td><td>${esc(e.match)}<br><small>${dt(e.start)}</small></td><td>${esc(e.selection)}</td><td class="r">${fr(e.odds)}</td><td class="r">${Math.round((e.p || 0) * 100)} %</td><td class="${e.status === "won" ? "won" : e.status === "lost" ? "lost" : "pend"}">${e.status === "won" ? "Gagné" : e.status === "lost" ? "Perdu" : e.status === "void" ? "Annulé" : "En attente"}${e.score ? " · " + esc(e.score) : ""}</td><td class="hide"><code>${esc(e.hash.slice(0, 16))}…</code></td></tr>`).join("") || '<tr><td colspan="8">Aucun pronostic pour l\'instant.</td></tr>';
})();
