/* Assistant d'aide Cotescope : répond tout de suite aux questions fréquentes et, si besoin,
   transmet le message à l'équipe (Telegram du propriétaire). Aucun service payant, aucune donnée revendue. */
(function () {
  "use strict";
  if (window.__cotescopeAide) return;
  window.__cotescopeAide = true;

  var API = "https://cotescope-api.cotescope.workers.dev";
  var inApp = /\/app\//.test(location.pathname);
  var APP = inApp ? "#/" : "/app/#/";

  // ---------- base de réponses ----------
  var A = [
    { k: ["prix", "tarif", "forfait", "abonnement", "combien", "coute", "payer", "essentiel", "pro ", "offre"], q: "Combien ça coûte ?",
      a: "Il y a 3 formules :<br>• <b>Gratuit</b> (sans limite de durée) : Ligue 1, Premier League et Liga, pari « résultat du match », forme, classement, face-à-face, 1 ticket Objectif par jour.<br>• <b>Essentiel, 9,99 €/mois</b> : tous les championnats, la NBA, le tennis, tous les types de paris, Objectif illimité, absents, compos, cartons, cotes boostées, Loto Foot.<br>• <b>Pro, 19,99 €/mois</b> : tout Essentiel + alertes Telegram, paris value, simulateur de stratégies, gestion du capital, mouvements de cotes et actus de dernière minute.<br>Sans engagement, résiliable en 2 clics." },
    { k: ["resili", "annul", "desabonn", "arreter mon abonnement", "stop abonnement", "engagement"], q: "Comment résilier ?",
      a: "Va dans <b>Mon compte</b> (le rond avec ton initiale, en haut à droite) puis <b>Gérer mon abonnement</b>. Tu résilies en 2 clics, sans justificatif. Ton forfait reste actif jusqu'à la fin de la période déjà payée, puis ton compte repasse en gratuit." },
    { k: ["rembours", "remboursement", "argent", "debit", "prelev", "facture", "carte"], q: "Paiement, facture, remboursement",
      a: "Les paiements sont gérés par Whop (paiement sécurisé, Cotescope ne voit jamais ta carte). Ta facture et l'historique sont dans <b>Mon compte → Gérer mon abonnement</b>. Pour un souci de débit ou une demande de remboursement, écris-nous ci-dessous en donnant l'e-mail de ton compte : on répond vite." },
    { k: ["bookmaker", "betclic", "winamax", "unibet", "fdj", "parions", "bet365", "pinnacle", "site de pari"], q: "Quels bookmakers ?",
      a: "Cotescope suit les vraies cotes de <b>Betclic, Winamax, Unibet (groupe FDJ, Parions Sport en fait partie) et Bet365</b>, tous agréés ANJ en France. Pinnacle sert seulement de référence pour calculer les vraies chances. Coche ceux où tu as un compte dans <b>Mon compte → Mes bookmakers</b> : chaque pari prend la meilleure cote parmi eux." },
    { k: ["cote fausse", "pas la bonne cote", "cote differente", "cote pas bonne", "pas la meme cote", "cote a change", "mauvaise cote", "cote"], q: "La cote n'est pas la même chez mon bookmaker",
      a: "Les cotes bougent en permanence. Cotescope les relève plusieurs fois par jour (l'heure du relevé et le bookmaker sont écrits sous chaque cote, avec « à vérifier » au-delà de 6 h). Avant de parier, ouvre le match et <b>tape la cote que tu vois chez ton bookmaker</b> : le verdict est recalculé avec la vraie cote." },
    { k: ["objectif", "ticket", "combine", "combiné", "cote visee", "propositions"], q: "Comment marche l'Objectif ?",
      a: "Dans <b>Objectif</b>, tu indiques ta mise et ce que tu veux gagner (par exemple 10 € pour viser 40 €). Cotescope cherche parmi tous les matchs les combinaisons qui atteignent cette cote <b>avec le plus de chances de passer</b>, uniquement avec de vraies cotes. Tu peux filtrer par jour, championnat, type de pari et nombre de matchs, et trier par chances, cote ou fiabilité." },
    { k: ["value", "valeur", "pari value", "rentable", "gagner a long terme"], q: "C'est quoi un pari value ?",
      a: "Un pari est « value » quand la cote proposée est plus haute que ce que valent vraiment les chances (par exemple 55 % de chances payé comme s'il n'y en avait que 45 %). Un seul pari peut perdre, mais répétés, ces paris sont les seuls rentables en moyenne. Ils sont signalés dans le forfait Pro, avec une alerte Telegram." },
    { k: ["telegram", "alerte", "notification", "notif"], q: "Les alertes Telegram",
      a: "Forfait Pro : dans <b>Mon compte → Alertes Telegram</b>, touche « Relier Telegram », ouvre le bot et appuie sur Démarrer. Tu reçois alors les paris value, les grosses chutes de cotes et les compos officielles. Le bouton « Envoyer une alerte test » permet de vérifier que tout arrive bien." },
    { k: ["mot de passe", "mdp", "oublie", "connecter", "connexion", "login", "identifiant"], q: "Je n'arrive pas à me connecter",
      a: "Sur l'écran de connexion, touche <b>Mot de passe oublié ?</b> : tu reçois un lien pour en choisir un nouveau (regarde aussi dans les spams). Après plusieurs essais ratés, le compte est bloqué quelques minutes par sécurité : patiente un peu puis réessaie. Si ça ne passe toujours pas, écris-nous ci-dessous." },
    { k: ["confirm", "mail", "e-mail", "email", "recu", "spam"], q: "Je n'ai pas reçu l'e-mail",
      a: "Regarde dans les <b>spams / courriers indésirables</b> et l'onglet « Promotions ». Dans l'appli, la bannière en haut permet de <b>renvoyer l'e-mail de confirmation</b>. Vérifie aussi que l'adresse du compte est la bonne (Mon compte). Toujours rien ? Écris-nous ci-dessous." },
    { k: ["appareil", "bloque", "deconnect", "session", "telephone", "autre ordinateur"], q: "Connexion sur plusieurs appareils",
      a: "Ton compte marche sur 5 appareils maximum. Dans <b>Mon compte → Appareils</b>, tu vois où tu es connecté et tu peux déconnecter un appareil. Si tu as reçu une alerte de connexion depuis un nouveau pays que tu ne reconnais pas, change ton mot de passe tout de suite." },
    { k: ["supprim", "effacer mon compte", "rgpd", "donnees personnelles", "vie privee"], q: "Supprimer mon compte / mes données",
      a: "Tes données ne sont jamais revendues. Pour supprimer ton compte et toutes tes données, écris-nous ci-dessous avec l'e-mail du compte : c'est fait sous 72 h. Détails dans la <a href=\"/confidentialite.html\">politique de confidentialité</a>." },
    { k: ["analyse", "stat", "manque", "vide", "indisponible", "forme", "face a face", "buteur", "compo", "absent"], q: "Des stats manquent sur un match",
      a: "Les analyses (forme, classement, buteurs, absents, compos, face-à-face) sont mises à jour à chaque collecte, plusieurs fois par jour. Pour un petit club ou un match de coupe contre une équipe peu suivie, certaines infos peuvent manquer. Les compos officielles arrivent environ 1 h avant le coup d'envoi. Si un grand match est vide, signale-le ci-dessous." },
    { k: ["nba", "basket", "tennis", "atp", "wta", "sport"], q: "NBA et tennis",
      a: "En haut de l'appli, choisis ton sport : <b>Football</b>, <b>Basket · NBA</b> ou <b>Tennis</b> (avec Hommes · ATP et Femmes · WTA séparés). NBA : vainqueur et total de points, blessés, classement, derniers matchs. Tennis : vainqueur et nombre de jeux, classement, 10 derniers matchs, série, fatigue, tie-breaks. Inclus dans Essentiel et Pro." },
    { k: ["fiable", "marche vraiment", "arnaque", "garanti", "sur a 100", "resultat", "bilan", "registre"], q: "Est-ce que c'est fiable ?",
      a: "Aucun outil ne gagne à tous les coups, et personne d'honnête ne le promet. Cotescope calcule des probabilités à partir des cotes de plusieurs bookmakers et des statistiques, sans cœur ni intuition. Tous les pronostics sont enregistrés et horodatés dans le <a href=\"/registre.html\">registre certifié</a> : impossible de les modifier après coup. Le bilan réel est consultable par tout le monde." },
    { k: ["addict", "dependance", "trop parier", "perdu beaucoup", "dette", "pause", "arreter de parier", "jeu responsable"], q: "Je joue trop / jeu responsable",
      a: "Merci d'en parler, c'est important. Dans l'appli, <b>Mon compte → Faire une pause</b> bloque les pronostics pendant la durée que tu choisis. Tu peux aussi demander l'interdiction de jeu auprès de l'ANJ. Aide gratuite et anonyme : <b>Joueurs Info Service, 09 74 75 13 13</b> (appel non surtaxé, 7j/7) ou joueurs-info-service.fr." },
    { k: ["humain", "contact", "parler", "support", "equipe", "quelqu'un", "conseiller", "probleme", "bug", "marche pas", "erreur"], q: "Parler à quelqu'un",
      a: "Pas de souci : écris ton message juste en dessous (avec l'e-mail de ton compte si tu en as un) et il part directement à l'équipe. On répond par e-mail, en général dans la journée.", contact: true },
  ];
  var QUICK = [0, 5, 4, 7, 9, 16];

  function norm(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9' ]/g, " ");
  }
  function answer(q) {
    var t = " " + norm(q) + " ", best = null, score = 0;
    A.forEach(function (x) {
      var s = 0;
      x.k.forEach(function (k) { if (t.indexOf(norm(k)) >= 0) s += k.length > 6 ? 2 : 1; });
      if (s > score) { score = s; best = x; }
    });
    return score ? best : null;
  }

  // ---------- interface ----------
  var css = "" +
    ".cz-btn{position:fixed;z-index:60;bottom:22px;" + (inApp ? "left" : "right") + ":22px;display:flex;align-items:center;gap:9px;padding:12px 16px 12px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:#111A2C;color:#E8EEF8;font:600 14px/1 Inter,system-ui,sans-serif;box-shadow:0 14px 40px -12px rgba(0,0,0,.8);cursor:pointer}" +
    ".cz-btn:hover{border-color:#26E0B8}" +
    ".cz-btn i{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#26E0B8;color:#06101A;font-style:normal;font-weight:800}" +
    ".cz-panel{position:fixed;z-index:61;bottom:84px;" + (inApp ? "left" : "right") + ":22px;width:370px;max-width:calc(100vw - 24px);height:540px;max-height:calc(100vh - 120px);display:none;flex-direction:column;border-radius:18px;border:1px solid #1B2740;background:#0C1220;color:#E8EEF8;font:14.5px/1.5 Inter,system-ui,sans-serif;box-shadow:0 30px 80px -20px rgba(0,0,0,.85);overflow:hidden}" +
    ".cz-panel.open{display:flex}" +
    ".cz-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #1B2740;background:linear-gradient(135deg,rgba(38,224,184,.14),transparent)}" +
    ".cz-h b{font-size:15px}.cz-h small{display:block;color:#8B97AE;font-size:12px}" +
    ".cz-h .dot{width:9px;height:9px;border-radius:50%;background:#26E0B8;box-shadow:0 0 10px #26E0B8}" +
    ".cz-x{margin-left:auto;background:none;border:0;color:#8B97AE;font-size:22px;cursor:pointer;line-height:1}" +
    ".cz-m{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}" +
    ".cz-b{max-width:88%;padding:10px 13px;border-radius:14px;background:#111A2C;border:1px solid #1B2740}" +
    ".cz-b a{color:#26E0B8}" +
    ".cz-b.me{align-self:flex-end;background:#26E0B8;color:#06101A;border-color:#26E0B8}" +
    ".cz-q{display:flex;flex-wrap:wrap;gap:6px}" +
    ".cz-q button{padding:7px 11px;border-radius:999px;border:1px solid #26355A;background:transparent;color:#C9D3E3;font:inherit;font-size:13px;cursor:pointer}" +
    ".cz-q button:hover{border-color:#26E0B8;color:#fff}" +
    ".cz-f{display:flex;gap:8px;padding:12px;border-top:1px solid #1B2740}" +
    ".cz-f input,.cz-c input,.cz-c textarea{flex:1;min-width:0;padding:11px 12px;border-radius:11px;border:1px solid #26355A;background:#060A12;color:#E8EEF8;font:inherit}" +
    ".cz-f button,.cz-c button{padding:0 15px;border-radius:11px;border:0;background:#26E0B8;color:#06101A;font:inherit;font-weight:800;cursor:pointer}" +
    ".cz-c{display:flex;flex-direction:column;gap:8px}.cz-c textarea{min-height:80px;resize:vertical}.cz-c button{padding:11px}" +
    "@media (max-width:900px){.cz-btn{bottom:" + (inApp ? "84px" : "16px") + ";" + (inApp ? "left" : "right") + ":14px;padding:10px}.cz-btn span{display:none}.cz-panel{bottom:" + (inApp ? "140px" : "76px") + ";" + (inApp ? "left" : "right") + ":12px}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var btn = document.createElement("button");
  btn.className = "cz-btn";
  btn.setAttribute("aria-label", "Besoin d'aide ?");
  btn.innerHTML = "<i>?</i><span>Besoin d'aide ?</span>";
  var panel = document.createElement("div");
  panel.className = "cz-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Assistant Cotescope");
  panel.innerHTML = '<div class="cz-h"><span class="dot"></span><div><b>Assistant Cotescope</b><small>Réponse immédiate · ou message à l\'équipe</small></div><button class="cz-x" aria-label="Fermer">×</button></div>' +
    '<div class="cz-m"></div><form class="cz-f"><input placeholder="Pose ta question…" maxlength="400" aria-label="Ta question"><button type="submit">Envoyer</button></form>';
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  var M = panel.querySelector(".cz-m"), F = panel.querySelector(".cz-f"), I = F.querySelector("input");

  function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
  function bubble(html, me) {
    var b = document.createElement("div");
    b.className = "cz-b" + (me ? " me" : "");
    b.innerHTML = html;
    M.appendChild(b);
    M.scrollTop = M.scrollHeight;
    return b;
  }
  function quick(list) {
    var q = document.createElement("div");
    q.className = "cz-q";
    list.forEach(function (i) {
      var x = document.createElement("button");
      x.type = "button";
      x.textContent = A[i].q;
      x.onclick = function () { ask(A[i].q, A[i]); };
      q.appendChild(x);
    });
    M.appendChild(q);
    M.scrollTop = M.scrollHeight;
  }
  function myEmail() {
    return window.__czEmail || "";
  }
  function contactForm(prefill) {
    var c = document.createElement("form");
    c.className = "cz-b cz-c";
    c.innerHTML = '<b>Message à l\'équipe</b><input type="email" required placeholder="Ton e-mail (pour te répondre)" maxlength="120">' +
      '<textarea required maxlength="1500" placeholder="Explique ton problème…"></textarea><button type="submit">Envoyer à l\'équipe</button>';
    var em = c.querySelector("input"), tx = c.querySelector("textarea");
    em.value = myEmail();
    tx.value = prefill || "";
    c.onsubmit = function (e) {
      e.preventDefault();
      var bt = c.querySelector("button");
      bt.disabled = true;
      bt.textContent = "Envoi…";
      fetch(API + "/api/support", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em.value, message: tx.value, page: location.pathname + location.hash }) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          c.remove();
          bubble(r.ok ? "✅ Message envoyé à l'équipe. On te répond par e-mail à <b>" + esc(em.value) + "</b>, en général dans la journée."
            : r.reason === "too_many" ? "Tu as envoyé beaucoup de messages : réessaie dans un quart d'heure."
            : "L'envoi a échoué. Réessaie dans un instant.");
        })
        .catch(function () { bt.disabled = false; bt.textContent = "Réessayer"; });
    };
    M.appendChild(c);
    M.scrollTop = M.scrollHeight;
    tx.focus();
  }
  var misses = 0, lastQ = "";
  function ask(q, forced) {
    bubble(esc(q), true);
    lastQ = q;
    var r = forced || answer(q);
    setTimeout(function () {
      if (r) {
        misses = 0;
        bubble(r.a);
        if (r.contact) contactForm(q === r.q ? "" : q);
        else bubble('Ça répond à ta question ? Sinon, <a href="#" data-cz="contact">écris à l\'équipe</a>.');
      } else {
        misses++;
        bubble(misses > 1 ? "Je n'ai pas la réponse, mais l'équipe oui. Écris-lui ici :" : "Je n'ai pas bien compris. Essaie avec d'autres mots, ou choisis un sujet :");
        if (misses > 1) contactForm(q); else quick(QUICK);
      }
    }, 250);
  }
  M.addEventListener("click", function (e) {
    var a = e.target.closest("[data-cz]");
    if (a) { e.preventDefault(); contactForm(lastQ); }
  });
  F.onsubmit = function (e) { e.preventDefault(); var q = I.value.trim(); if (!q) return; I.value = ""; ask(q); };
  var started = false;
  function toggle() {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      if (!started) {
        started = true;
        bubble("Salut 👋 Je réponds tout de suite aux questions sur Cotescope : forfaits, cotes, Objectif, compte, Telegram… Pose ta question ou choisis un sujet.");
        quick(QUICK);
      }
      setTimeout(function () { I.focus(); }, 50);
    }
  }
  btn.onclick = toggle;
  panel.querySelector(".cz-x").onclick = toggle;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) toggle(); });
})();
