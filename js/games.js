// Ойындар: Арқан тарту, Кезекпен, Туды тап, Жұпты тап
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (k === "style") n.style.cssText = v;
    else n.setAttribute(k, v);
  }
  kids.flat().forEach(c => n.append(c instanceof Node ? c : document.createTextNode(c ?? "")));
  return n;
}
// «басу» — саусақ тиген сәтте іске қосылады (тақтада жылдам)
const press = (node, fn) => node.addEventListener("pointerdown", (e) => { e.preventDefault(); fn(e); });

const TEAM_COLORS = ["#e8505b", "#3b82f6", "#2fb36d", "#f59e0b"];
const TEAM_EMOJI = ["🦅", "🐎", "🐺", "🐪"];
const DEFAULT_NAMES = ["Қыран", "Тұлпар", "Бөрі", "Нар"];
const flagUrl = (c) => `https://flagcdn.com/w160/${c}.png`;

// Сұрақтың көрінісі (сурет/мәтін)
function qNode(q) {
  return el("div", { class: "q" }, q.img ? el("img", { class: "qflag", src: flagUrl(q.img), alt: "" }) : "", q.q, q.small ? el("small", {}, q.small) : "");
}
function optBtn(q, o) {
  const b = el("button", { class: "opt" + (q.optImg ? " flag" : ""), "data-v": o });
  if (q.optImg) b.append(el("img", { src: flagUrl(o), alt: "" })); else b.textContent = o;
  return b;
}

const Games = (() => {
  const menu = () => $("#menu"), setup = () => $("#setup"), stage = () => $("#stage");
  let stopFn = null;
  const TITLES = { tug: "🪢 Арқан тарту", turn: "🎯 Кезекпен", flag: "🚩 Туды тап", pairs: "🃏 Жұпты тап", drum: "🥁 Барабан" };

  function show(which) { menu().hidden = which !== "menu"; setup().hidden = which !== "setup"; stage().hidden = which !== "stage"; Music.sync(); }
  function toMenu() { if (stopFn) stopFn(); stopFn = null; stage().replaceChildren(); show("menu"); }

  // ---------- Баптау экраны ----------
  function openSetup(game) {
    const cfg = { subject: game === "flag" ? "flags" : "math", level: 1, source: "auto", win: 5, teams: game === "tug" ? 2 : 3, rounds: 5, pairs: 6, names: [...DEFAULT_NAMES], remove: "yes", list: (() => { try { return localStorage.getItem("bo_class") || ""; } catch { return ""; } })() };
    const box = el("div", { class: "setup-box" });
    const render = () => {
      const seg = (key, items) => el("div", { class: "seg" }, items.map(([v, label]) =>
        el("button", { class: cfg[key] === v ? "on" : "", onclick: () => { cfg[key] = v; Sound.tap(); render(); } }, label)));
      const g = (title, node) => el("div", { class: "opt-group" }, el("b", {}, title), node);
      const groups = [el("button", { class: "back", onclick: toMenu }, "← Артқа"), el("h1", {}, TITLES[game])];
      if (game === "tug" || game === "turn" || game === "drum") {
        groups.push(g("Пән", seg("subject", [["math", "➗ Математика"], ["english", "🔤 Ағылшын тілі"], ["kazakh", "📖 Қазақ тілі мен әдебиеті"], ...(game === "drum" ? [["mix", "🔀 Аралас"]] : [["flags", "🚩 Туларды"]])])));
        if (cfg.subject === "math") groups.push(g("Деңгей", seg("level", [[1, "1–20 дейін қосу/азайту"], [2, "100 дейін"], [3, "Көбейту кестесі"], [4, "Бөлу + аралас"]])));
        if (game !== "drum" && cfg.subject !== "flags" && cfg.subject !== "kazakh") {
          groups.push(g("Сұрақ көзі", seg("source", [["auto", "🎲 Автоматты"], ["custom", "✍️ Менің тапсырмаларым"], ["mix", "🔀 Аралас"]])));
          if (cfg.source !== "auto" && !Q.hasCustom(cfg.subject)) groups.push(el("p", { class: "hint" }, "⚠️ Бұл пән бойынша өз тапсырмаларың жоқ — автоматты сұрақтар қолданылады."));
        }
      }
      if (game === "tug") groups.push(g("Жеңіс үшін неше қадам тарту керек?", seg("win", [[3, "3"], [5, "5"], [7, "7"], [10, "10"]])));
      else if (game === "drum") {
        const ta = el("textarea", { rows: "8", placeholder: "Әр жолға бір оқушының аты:\nАйдос\nӘлия\nНұрлан", oninput: (e) => { cfg.list = e.target.value; try { localStorage.setItem("bo_class", cfg.list); } catch {} } });
        ta.value = cfg.list;
        groups.push(g("Сынып тізімі (әр жолға бір есім)", ta),
          el("button", { class: "ghost-b", onclick: () => { cfg.list = ["Айдос", "Әлия", "Нұрлан", "Дана", "Ерлан", "Аружан", "Санжар", "Томирис", "Бекзат", "Айгерім"].join("\n"); try { localStorage.setItem("bo_class", cfg.list); } catch {} render(); } }, "✨ Үлгі тізім"),
          g("Жауап бергеннен кейін оқушыны барабаннан алу", seg("remove", [["yes", "Иә"], ["no", "Жоқ"]])));
      } else groups.push(g("Команда саны", seg("teams", [[2, "2"], [3, "3"], [4, "4"]])));
      if (game === "turn" || game === "flag") groups.push(g("Әр команда неше сұраққа жауап береді", seg("rounds", [[3, "3"], [5, "5"], [8, "8"]])));
      if (game === "pairs") groups.push(g("Жұп саны", seg("pairs", [[4, "4 (жеңіл)"], [6, "6"], [8, "8"], [10, "10"]])));
      const n = game === "tug" ? 2 : cfg.teams;
      if (game !== "drum") groups.push(g("Команда аттары", el("div", { class: "teamnames" }, Array.from({ length: n }, (_, i) =>
        el("input", { value: cfg.names[i], style: `border-color:${TEAM_COLORS[i]}`, oninput: (e) => cfg.names[i] = e.target.value })))));
      const go = { tug: startTug, turn: startTurn, flag: startTurn, pairs: startPairs, drum: startDrum }[game];
      groups.push(el("button", { class: "big", onclick: () => { Sound.tap(); go({ ...cfg }); } }, "▶ Бастау"));
      box.replaceChildren(...groups);
    };
    render();
    setup().replaceChildren(box);
    show("setup");
  }

  // ---------- Конфетти / жеңіс ----------
  function confetti() {
    const fx = $("#fx");
    for (let i = 0; i < 60; i++) {
      const c = el("span", { class: "conf", style: `left:${Math.random() * 100}%;animation-duration:${2 + Math.random() * 2}s;animation-delay:${Math.random() * .6}s` }, ["🎉", "⭐", "🎊", "🌟"][i % 4]);
      fx.append(c); setTimeout(() => c.remove(), 5000);
    }
  }
  function winOverlay(title, sub, again) {
    Sound.win(); confetti();
    const o = el("div", { class: "win" }, el("div", { class: "win-box" },
      el("div", { class: "trophy" }, "🏆"), el("h2", {}, title), sub,
      el("div", { class: "row" },
        el("button", { class: "big", onclick: () => { o.remove(); again(); } }, "🔁 Қайта"),
        el("button", { class: "ghost-b", onclick: () => { o.remove(); toMenu(); } }, "Мәзір"))));
    document.body.append(o);
  }

  // ---------- Арқан тарту ----------
  function startTug(cfg) {
    const N = cfg.win, next = [Q.source(cfg.subject, cfg.source, cfg.level), Q.source(cfg.subject, cfg.source, cfg.level)];
    let pos = 0, over = false; // pos<0 → A жеңуде, pos>0 → B
    const names = [cfg.names[0] || "A", cfg.names[1] || "B"];

    const figL = el("div", { class: "fig l" }), figR = el("div", { class: "fig r" });
    figL.innerHTML = Kids.team("#ef4444", "#ffc83d"); figR.innerHTML = Kids.team("#2563eb", "#ffc83d");
    const ropeWrap = el("div", { class: "rope-wrap" }, el("div", { class: "rope-mid" }), figL, figR, el("div", { class: "knot" }));
    const scene = el("div", { class: "scene" }, el("div", { class: "ground" }), el("div", { class: "mid" }),
      el("div", { class: "tag-team l" }, `${TEAM_EMOJI[0]} ${names[0]}`), el("div", { class: "tag-team r" }, `${TEAM_EMOJI[1]} ${names[1]}`), ropeWrap);
    const prog = el("div", { class: "progress" });
    const teams = [0, 1].map(i => makeTeam(i));
    function makeTeam(i) {
      const t = { i, el: el("div", { class: "team " + "ab"[i] }), locked: false };
      t.render = () => {
        const q = t.q = next[i]();
        t.el.replaceChildren(
          el("h3", {}, `${TEAM_EMOJI[i]} ${names[i]}`), qNode(q),
          el("div", { class: "opts" }, q.opts.map(o => { const b = optBtn(q, o); press(b, () => answer(t, b, o)); return b; })));
      };
      return t;
    }
    function answer(t, btn, val) {
      if (over || t.locked) return;
      if (val === t.q.a) {
        Sound.good(); btn.classList.add("right");
        pos += t.i === 0 ? -1 : 1; update(t.i);
        if (Math.abs(pos) >= N) return finish(t.i);
        setTimeout(t.render, 250);
      } else {
        Sound.bad(); btn.classList.add("wrong"); t.locked = true; t.el.classList.add("locked");
        setTimeout(() => { t.locked = false; t.el.classList.remove("locked"); t.render(); }, 1400);
      }
    }
    function update(who) {
      const unit = (scene.clientWidth * 0.08) / N;
      ropeWrap.style.transform = `translateX(${pos * unit}px)`;
      const p = who === 0 ? figL : figR; p.classList.remove("pull"); void p.offsetWidth; p.classList.add("pull");
      drawProg();
    }
    function drawProg() {
      prog.replaceChildren(...Array.from({ length: N * 2 + 1 }, (_, k) => {
        const idx = k - N;
        let cls = idx === 0 ? "c" : "";
        if (pos < 0 && idx <= 0 && idx >= pos) cls = "a";
        if (pos > 0 && idx >= 0 && idx <= pos) cls = "b";
        return el("i", { class: cls });
      }));
    }
    function finish(i) {
      over = true;
      winOverlay(`${TEAM_EMOJI[i]} ${names[i]} жеңді!`, el("p", {}, "Тамаша! Арқанды өз жағына тартты."), () => startTug(cfg));
    }
    stage().replaceChildren(
      el("div", { class: "stage-bar" }, el("button", { class: "back", onclick: toMenu }, "← Мәзір"), el("b", {}, `${N} қадам тартқан жеңеді`),
        el("button", { class: "back", onclick: () => startTug(cfg) }, "↺ Қайта")),
      scene, prog, el("div", { class: "duel" }, teams.map(t => t.el)));
    teams.forEach(t => t.render()); drawProg(); show("stage");
    stopFn = () => { over = true; };
  }

  // ---------- Кезекпен (және Туды тап) ----------
  function startTurn(cfg) {
    const n = cfg.teams, names = Array.from({ length: n }, (_, i) => cfg.names[i] || DEFAULT_NAMES[i]);
    const src = Q.source(cfg.subject, cfg.source, cfg.level);
    const scores = Array(n).fill(0), total = n * cfg.rounds;
    let step = 0, busy = false;
    const scoreEls = names.map((nm, i) => el("div", { class: "score", style: `--c:${TEAM_COLORS[i]}` }, el("b", {}, `${TEAM_EMOJI[i]} ${nm}`), el("span", {}, "0")));
    const card = el("div", { class: "turn-card" });
    const info = el("b", {});

    function render() {
      const t = step % n, q = src();
      scoreEls.forEach((s, i) => s.classList.toggle("now", i === t));
      card.style.setProperty("--c", TEAM_COLORS[t]);
      info.textContent = `Кезек: ${TEAM_EMOJI[t]} ${names[t]} · сұрақ ${step + 1}/${total}`;
      card.replaceChildren(qNode(q), el("div", { class: "opts" }, q.opts.map(o => {
        const b = optBtn(q, o);
        press(b, () => {
          if (busy) return; busy = true;
          const ok = o === q.a;
          if (ok) { scores[t]++; scoreEls[t].lastChild.textContent = scores[t]; Sound.good(); b.classList.add("right"); }
          else { Sound.bad(); b.classList.add("wrong"); $$(".opt", card).forEach(x => x.dataset.v === q.a && x.classList.add("right")); }
          $$(".opt", card).forEach(x => !x.classList.contains("right") && !x.classList.contains("wrong") && x.classList.add("dim"));
          setTimeout(() => { busy = false; step++; step >= total ? finish() : render(); }, ok ? 700 : 1500);
        });
        return b;
      })));
    }
    function finish() {
      const max = Math.max(...scores), winners = names.filter((_, i) => scores[i] === max);
      winOverlay(winners.length > 1 ? "Тең ойын! 🤝" : `${winners[0]} жеңді!`,
        el("p", {}, names.map((nm, i) => `${nm}: ${scores[i]}`).join("  ·  ")), () => startTurn(cfg));
    }
    stage().replaceChildren(
      el("div", { class: "stage-bar" }, el("button", { class: "back", onclick: toMenu }, "← Мәзір"), info,
        el("button", { class: "back", onclick: () => startTurn(cfg) }, "↺ Қайта")),
      el("div", { class: "turn-wrap" }, el("div", { class: "scores" }, scoreEls), card));
    render(); show("stage");
    stopFn = () => { busy = true; };
  }

  // ---------- Жұпты тап (ағылшын ↔ қазақша) ----------
  function startPairs(cfg) {
    const n = cfg.teams, names = Array.from({ length: n }, (_, i) => cfg.names[i] || DEFAULT_NAMES[i]);
    const chosen = Q.shuffle(Q.words()).slice(0, cfg.pairs);
    const cards = Q.shuffle(chosen.flatMap(([em, kk, en], id) => [{ id, lang: "en", text: en }, { id, lang: "kk", text: `${em} ${kk}` }]));
    const scores = Array(n).fill(0);
    let turn = 0, open = [], busy = false, found = 0, dead = false;
    const scoreEls = names.map((nm, i) => el("div", { class: "score", style: `--c:${TEAM_COLORS[i]}` }, el("b", {}, `${TEAM_EMOJI[i]} ${nm}`), el("span", {}, "0")));
    const info = el("b", {});
    const mark = () => { scoreEls.forEach((s, i) => s.classList.toggle("now", i === turn)); info.textContent = `Кезек: ${TEAM_EMOJI[turn]} ${names[turn]} · екі карточка аш`; };

    const nodes = cards.map(c => {
      const b = el("button", { class: "pcard " + c.lang }, el("div", { class: "in" }, el("div", { class: "f" }, "?"), el("div", { class: "b" }, c.text)));
      press(b, () => flip(b, c));
      return b;
    });
    function flip(b, c) {
      if (dead || busy || b.classList.contains("open") || b.classList.contains("done")) return;
      Sound.tap(); b.classList.add("open"); open.push([b, c]);
      if (open.length < 2) return;
      busy = true;
      const [[b1, c1], [b2, c2]] = open; open = [];
      if (c1.id === c2.id && c1.lang !== c2.lang) {
        setTimeout(() => {
          Sound.good(); [b1, b2].forEach(x => { x.classList.remove("open"); x.classList.add("done"); });
          scores[turn]++; scoreEls[turn].lastChild.textContent = scores[turn]; found++; busy = false;
          if (found === chosen.length) finish();
        }, 600);
      } else {
        setTimeout(() => { Sound.bad(); [b1, b2].forEach(x => x.classList.remove("open")); turn = (turn + 1) % n; mark(); busy = false; }, 1500);
      }
    }
    function finish() {
      const max = Math.max(...scores), winners = names.filter((_, i) => scores[i] === max);
      winOverlay(winners.length > 1 ? "Тең ойын! 🤝" : `${winners[0]} жеңді!`,
        el("p", {}, names.map((nm, i) => `${nm}: ${scores[i]}`).join("  ·  ")), () => startPairs(cfg));
    }
    stage().replaceChildren(
      el("div", { class: "stage-bar" }, el("button", { class: "back", onclick: toMenu }, "← Мәзір"), info,
        el("button", { class: "back", onclick: () => startPairs(cfg) }, "↺ Қайта")),
      el("div", { class: "turn-wrap" }, el("div", { class: "scores" }, scoreEls)),
      el("div", { class: "pairs-grid" }, nodes));
    mark(); show("stage");
    stopFn = () => { dead = true; };
  }

  // ---------- Барабан: оқушыны кездейсоқ таңдау + сұрақ ----------
  function startDrum(cfg) {
    const names = [...new Set((cfg.list || "").split(/\n|,/).map(x => x.trim()).filter(Boolean))];
    if (names.length < 2) return alert("Кемінде 2 оқушының атын жазыңыз");
    const srcs = (cfg.subject === "mix" ? ["math", "english", "kazakh"] : [cfg.subject]).map(sub => Q.source(sub, "auto", cfg.level));
    let pool = [...names], right = 0, wrong = 0, used = 0, current = null, busy = false, dead = false;
    const cnt = (icon, v) => { const n = el("b", {}, v); return [el("span", { class: "dstat" }, icon, " ", n), n]; };
    const [sRem, nRem] = cnt("👥", pool.length), [sRight, nRight] = cnt("✅", 0), [sWrong, nWrong] = cnt("❌", 0), [sUsed, nUsed] = cnt("❓", 0);
    const nameEl = el("div", { class: "drum-name" }, "?");
    const drumEl = el("div", { class: "drum" }, el("div", { class: "drum-label" }, "🥁 БАРАБАН"), nameEl);
    const chips = el("div", { class: "chips" });
    const panel = el("div", { class: "drum-panel" });
    const paint = (hl) => {
      nRem.textContent = pool.length; nRight.textContent = right; nWrong.textContent = wrong; nUsed.textContent = used;
      chips.replaceChildren(...names.map(n => el("span", { class: "chip2" + (pool.includes(n) ? "" : " gone") + (n === hl ? " hl" : "") }, n)));
    };
    const idle = () => {
      current = null; paint();
      panel.replaceChildren(el("div", { class: "row", style: "justify-content:center" },
        el("button", { class: "big", onclick: spin }, "🎲 Айналдыру"),
        el("button", { class: "ghost-b", onclick: () => { Q.shuffle(names).forEach((n, i) => names[i] = n); Sound.tap(); paint(); } }, "🔀 Араластыру"),
        el("button", { class: "ghost-b", onclick: groups }, "👥 Топқа бөлу")));
    };
    function spin() {
      if (busy || dead || !pool.length) return;
      busy = true; const winner = Q.pick(pool), total = 22 + Q.rnd(0, 6); let i = 0;
      drumEl.classList.add("spinning"); panel.replaceChildren();
      const tick = () => {
        if (dead) return;
        const show = i < total ? Q.pick(pool) : winner;
        nameEl.textContent = show; paint(show); Sound.tap(); i++;
        if (i <= total) setTimeout(tick, 55 + i * i * 0.4); else picked(winner);
      };
      tick();
    }
    function picked(w) {
      busy = false; current = w; drumEl.classList.remove("spinning"); Sound.good();
      panel.replaceChildren(el("h2", { class: "picked" }, `🎉 ${w}`),
        el("div", { class: "row", style: "justify-content:center" },
          el("button", { class: "big", onclick: ask }, "❓ Сұрақты ашу"),
          el("button", { class: "ghost-b", onclick: () => { pool = pool.filter(n => n !== w); pool.length ? idle() : finish(); } }, "Алып тастау")));
    }
    function ask() {
      const q = Q.pick(srcs)(); let done = false; used++; paint(current);
      const card = el("div", { class: "turn-card", style: "--c:var(--sky)" });
      card.append(el("h3", { style: "margin:0;text-align:center" }, current), qNode(q), el("div", { class: "opts" }, q.opts.map(o => {
        const b = optBtn(q, o);
        press(b, () => {
          if (done) return; done = true;
          const ok = o === q.a;
          if (ok) { right++; Sound.good(); b.classList.add("right"); } else { wrong++; Sound.bad(); b.classList.add("wrong"); $$(".opt", card).forEach(x => x.dataset.v === q.a && x.classList.add("right")); }
          $$(".opt", card).forEach(x => !x.classList.contains("right") && !x.classList.contains("wrong") && x.classList.add("dim"));
          paint(current);
          card.append(el("div", { class: "row", style: "justify-content:center;margin-top:14px" }, el("button", { class: "primary", onclick: () => {
            if (cfg.remove === "yes") pool = pool.filter(n => n !== current);
            pool.length ? idle() : finish();
          } }, "Жалғастыру →")));
        });
        return b;
      })));
      panel.replaceChildren(card);
    }
    function groups() {
      let n = Math.min(3, Math.max(2, Math.floor(pool.length / 2)));
      const body = el("div"), render = () => {
        const mix = Q.shuffle(pool), gs = Array.from({ length: n }, () => []);
        mix.forEach((nm, i) => gs[i % n].push(nm));
        body.replaceChildren(
          el("h2", {}, "👥 Топқа бөлу"),
          el("div", { class: "seg" }, [2, 3, 4, 5].filter(k => k <= pool.length).map(k => el("button", { class: k === n ? "on" : "", onclick: () => { n = k; render(); } }, `${k} топ`))),
          el("div", { class: "group-grid" }, gs.map((g, i) => el("div", { class: "grp", style: `--c:${TEAM_COLORS[i % 4]}` }, el("b", {}, `${TEAM_EMOJI[i % 4]} ${i + 1}-топ`), g.map(x => el("div", {}, x))))),
          el("div", { class: "row", style: "margin-top:12px" }, el("button", { class: "ghost-b", onclick: render }, "🔀 Қайта араластыру")));
      };
      render(); $("#modalContent").replaceChildren(body); $("#modal").hidden = false;
    }
    function finish() {
      paint(); nameEl.textContent = "🏁";
      winOverlay("Барлығы жауап берді!", el("p", {}, `✅ ${right}  ·  ❌ ${wrong}`), () => startDrum(cfg));
    }
    stage().replaceChildren(
      el("div", { class: "stage-bar" }, el("button", { class: "back", onclick: toMenu }, "← Мәзір"), el("div", { class: "dstats" }, sRem, sRight, sWrong, sUsed),
        el("button", { class: "back", onclick: () => startDrum(cfg) }, "↺ Қайта")),
      el("div", { class: "turn-wrap" }, drumEl, chips, panel));
    idle(); show("stage");
    stopFn = () => { dead = true; };
  }

  return { openSetup, toMenu };
})();
