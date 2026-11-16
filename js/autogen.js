// Мәтіннен автоматты сұрақ жасау (жасанды интеллектсіз, қарапайым ережелермен):
//  1) анықтама ("X — бұл ..." ) → «X дегеніміз не?»
//  2) басқа сөйлемдерден негізгі сөзді (жыл/сан, атау, ұзын сөз) жасырып, «бос орынды толтыр» сұрағы.
// Нәтиже — «сұрақ | жауап | қате1 | қате2 | қате3» жолдары; мұғалім оларды түзете алады.
const Autogen = (() => {
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (s) => s.replace(/[|\t]/g, " ").replace(/\s+/g, " ").trim();
  const words = (s) => s.split(" ").filter(Boolean);
  const strip = (w) => w.replace(/^[«"“(\[]+|[»"”)\],.;:!?…]+$/gu, "");
  const STOP = new Set(["және", "бірақ", "сонымен", "себебі", "сондықтан", "осындай", "болып", "болады", "болған", "үшін", "және", "және", "the", "and", "that", "with", "this", "from", "which", "также", "который", "потому", "когда", "этого"]);
  const DEF = /^(.{2,60}?)\s+(—|–|-|деп аталады|is called|means)\s+(.{12,})$/u;

  function sentences(text) {
    return text.replace(/\r/g, "").split(/\n+/).flatMap(p => p.split(/(?<=[.!?…])\s+(?=[\p{Lu}\d«"])/u))
      .map(clean).filter(s => words(s).length >= 5 && words(s).length <= 32);
  }

  // Сөйлемнен жасырылатын сөзді таңдау: жыл/сан → атау → ұзын сөз
  function target(sent) {
    const ws = words(sent);
    const num = ws.findIndex(w => /^\d{2,4}$/.test(strip(w)));
    if (num >= 0) return { i: num, kind: "num" };
    const cap = ws.findIndex((w, i) => i > 0 && /^\p{Lu}\p{Ll}{2,}/u.test(strip(w)));
    if (cap >= 0) return { i: cap, kind: "name" };
    let best = -1, len = 5;
    ws.forEach((w, i) => { const s = strip(w); if (i > 0 && s.length > len && !STOP.has(s.toLowerCase()) && /^\p{L}+$/u.test(s)) { best = i; len = s.length; } });
    return best >= 0 ? { i: best, kind: "word" } : null;
  }

  function numWrong(a) {
    const n = +a, steps = shuffle([1, 2, 3, 5, 10, 20, 50, 100]), out = [];
    for (const d of steps) { const v = String(Math.random() < 0.5 ? n + d : n - d); if (+v > 0 && v !== a && !out.includes(v)) out.push(v); if (out.length === 3) break; }
    return out;
  }

  function generate(text, max = 12) {
    const sents = sentences(text), defs = [], cloze = [];
    sents.forEach(s => {
      const m = s.match(DEF);
      if (m && words(m[1]).length <= 6) {
        let ans = words(m[3]).slice(0, 9).join(" ").replace(/[.,;:!?…]+$/, "");
        defs.push({ q: `«${strip(m[1])}» дегеніміз не?`, a: ans });
        return;
      }
      const t = target(s); if (!t) return;
      const ws = words(s), a = strip(ws[t.i]);
      ws[t.i] = ws[t.i].replace(a, "_____");
      cloze.push({ q: ws.join(" "), a, kind: t.kind });
    });
    const poolOf = (kind) => cloze.filter(c => c.kind === kind).map(c => c.a);
    const out = [];
    defs.forEach(d => out.push({ q: d.q, a: d.a, w: shuffle(defs.filter(x => x.a !== d.a).map(x => x.a)).slice(0, 3) }));
    cloze.forEach(c => {
      let w = shuffle([...new Set(poolOf(c.kind).filter(x => x !== c.a))]).slice(0, 3);
      if (c.kind === "num" && w.length < 3) w = numWrong(c.a);
      else if (w.length < 3) w = shuffle([...new Set(cloze.map(x => x.a).filter(x => x !== c.a && !w.includes(x)))]).slice(0, 3 - w.length).concat(w);
      out.push({ q: c.q, a: c.a, w });
    });
    return shuffle(out).slice(0, max);
  }

  const toLines = (items) => items.map(i => [i.q, i.a, ...i.w].join(" | ")).join("\n");
  return { generate, toLines };
})();
