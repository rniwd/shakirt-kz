// Тесттер қойындысы
const Tests = (() => {
  let filter = "all";
  const all = () => window.PUBLISHED_TESTS || [];

  function list() {
    const items = all().filter(t => filter === "all" || t.subject === filter);
    $("#testList").replaceChildren(...items.map(t => el("div", { class: "mat " + t.subject, onclick: () => start(t.id) },
      el("div", { class: "ic" }, t.subject === "math" ? "➗" : "🔤"), el("b", {}, t.title),
      el("small", { class: "cnt" }, `${t.qs.length} сұрақ · ${t.subject === "math" ? "Математика" : "Ағылшын тілі"}`),
      best(t.id) != null ? el("small", { class: "tag" }, `Үздік нәтиже: ${best(t.id)}/${t.qs.length}`) : "")));
  }
  function best(id) { try { const v = localStorage.getItem("bo_best_" + id); return v == null ? null : +v; } catch { return null; } }
  function saveBest(id, s) { try { if (best(id) == null || s > best(id)) localStorage.setItem("bo_best_" + id, s); } catch {} }

  function showRun(node) { $("#testsHome").hidden = !!node; $("#testRun").hidden = !node; if (node) $("#testRun").replaceChildren(node); else list(); }

  function start(id) {
    const t = all().find(x => x.id === id); if (!t) return;
    let i = 0, score = 0; const wrong = [];
    const step = () => {
      const [q, opts, ai, why] = t.qs[i];
      // жауаптарды араластырамыз, дұрысын бақылаймыз
      const order = Q.shuffle(opts.map((o, k) => [o, k]));
      const bar = el("div", { class: "tbar" }, el("i", { style: `width:${i / t.qs.length * 100}%` }));
      const box = el("div", { class: "tq" });
      const buttons = order.map(([o, k]) => {
        const b = el("button", { class: "opt" }, o);
        press(b, () => {
          if (b.disabled) return;
          buttons.forEach(x => x.disabled = true);
          const ok = k === ai;
          if (ok) { score++; Sound.good(); b.classList.add("right"); } else { Sound.bad(); b.classList.add("wrong"); wrong.push([q, opts[ai], why]); buttons[order.findIndex(([, kk]) => kk === ai)].classList.add("right"); }
          box.append(el("div", { class: "why" }, (ok ? "✅ Дұрыс! " : "❌ Қате. ") + why),
            el("div", { class: "row", style: "margin-top:14px" }, el("button", { class: "primary", onclick: () => { i++; i < t.qs.length ? step() : finish(); } }, i + 1 < t.qs.length ? "Келесі →" : "Нәтиже")));
        });
        return b;
      });
      box.append(el("h2", {}, q), el("div", { class: "opts" }, buttons));
      showRun(el("div", {},
        el("div", { class: "test-top" }, el("button", { class: "back", onclick: () => showRun(null) }, "← Тесттер"), el("b", {}, `${t.title} · ${i + 1}/${t.qs.length}`), el("span", {}, `⭐ ${score}`)),
        bar, box));
    };
    function finish() {
      saveBest(t.id, score);
      const pct = score / t.qs.length, stars = pct === 1 ? "⭐⭐⭐" : pct >= .6 ? "⭐⭐" : pct >= .4 ? "⭐" : "💪";
      if (pct >= .6) { Sound.win(); }
      const mat = Store.materials().find(m => m.id === t.mat);
      showRun(el("div", { class: "tq res" },
        el("div", { class: "stars" }, stars), el("div", { class: "big-score" }, `${score} / ${t.qs.length}`),
        el("p", {}, pct === 1 ? "Керемет! Барлығы дұрыс!" : pct >= .6 ? "Жарайсың! Қателермен жұмыс істейік." : "Тақырыпты қайта оқып, тағы көр!"),
        wrong.length ? el("div", { class: "mist" }, el("b", {}, "Қателермен жұмыс:"), wrong.map(([q, a, why]) => el("div", {}, `${q} → `, el("b", {}, a), ` — ${why}`))) : "",
        el("div", { class: "row", style: "justify-content:center;margin-top:18px" },
          el("button", { class: "primary", onclick: () => start(id) }, "🔁 Қайта"),
          mat ? el("button", { class: "ghost-b", onclick: () => { showRun(null); go("materials"); } }, "📚 Материалға") : "",
          el("button", { class: "ghost-b", onclick: () => showRun(null) }, "Тесттер тізімі"))));
    }
    step();
  }

  function init() {
    $$("#tFilters .chip").forEach(c => c.onclick = () => { filter = c.dataset.f; $$("#tFilters .chip").forEach(x => x.classList.toggle("active", x === c)); list(); });
    list();
  }
  return { init, start };
})();
