// Конструктор: мұғалім бір рет тапсырма жазады — платформа одан тест және ойындарды жасайды (Wordwall сияқты)
const Builder = (() => {
  const SUBJ = { math: "➗ Математика", english: "🔤 Ағылшын тілі", kazakh: "📖 Қазақ тілі мен әдебиеті", other: "🧩 Басқа пән" };
  const EXAMPLE = "apple | алма\nbook | кітап\nschool | мектеп\ncat | мысық\ndog | ит\nwater | су\nhouse | үй\nbread | нан";
  let editing = null;

  const b64 = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const unb64 = (t) => JSON.parse(decodeURIComponent(escape(atob(t))));

  function launch(set, game) {
    const n = Store.parseItems(set.text).length;
    Games.toMenu();
    go("games");
    Games.openSetup(game, { subject: "set:" + set.id, title: set.title, count: n });
  }
  function share(set) {
    const url = location.origin + location.pathname + "#set=" + b64({ t: set.title, s: set.subject, x: set.text });
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => alert("Сілтеме көшірілді ✅\nМұғалімдерге жіберіңіз: ашқанда жиынтық өзінен-өзі қосылады."), () => prompt("Сілтемені көшіріңіз:", url));
    else prompt("Сілтемені көшіріңіз:", url);
  }

  function list() {
    const sets = Store.sets();
    $("#setList").replaceChildren(...(sets.length ? sets.map(set => {
      const n = Store.parseItems(set.text).length, ok = n >= 4;
      const act = (label, title, fn, dis) => el("button", { class: "mini", title, ...(dis ? { disabled: "" } : {}), onclick: fn }, label);
      return el("div", { class: "set-card" },
        el("b", {}, set.title), el("small", {}, `${SUBJ[set.subject] || ""} · ${n} жол${set.local ? "" : " · жарияланған"}`),
        el("div", { class: "set-actions" },
          act("📝 Тест", "Тест", () => { go("tests"); Tests.startSet(set); }, !ok),
          act("🪢", "Арқан тарту", () => launch(set, "tug"), !ok),
          act("🎯", "Кезекпен", () => launch(set, "turn"), !ok),
          act("🥁", "Барабан", () => launch(set, "drum"), !ok),
          act("🃏", "Жұпты тап", () => launch(set, "pairs"), n < 3)),
        el("div", { class: "set-actions" },
          set.local ? act("✏️ Өзгерту", "Өзгерту", () => fill(set)) : "",
          act("🔗 Бөлісу", "Сілтеме жасау", () => share(set)),
          set.local ? act("🗑", "Жою", () => { if (confirm("Жиынтықты жоясыз ба?")) { Store.delSet(set.id); list(); renderStats(); } }) : ""));
    }) : [el("div", { class: "empty" }, "Әзірге жиынтық жоқ. Төменнен жасаңыз — мысалы, «Үлгі» батырмасын басыңыз.")]));
  }

  function count() {
    const f = $("#setForm"), items = Store.parseItems(f.text.value), bad = f.text.value.split("\n").filter(l => l.trim()).length - items.length;
    $("#setCount").textContent = `✔ ${items.length} жол танылды` + (bad ? ` · ⚠️ ${bad} жолда жауап жоқ` : "") + (items.length && items.length < 4 ? " · кемінде 4 жол керек" : "");
  }
  function fill(set) {
    editing = set ? set.id : null;
    const f = $("#setForm");
    f.title.value = set ? set.title : ""; f.subject.value = set ? set.subject : "english"; f.text.value = set ? set.text : "";
    $("#setFormTitle").textContent = set ? "✏️ Жиынтықты өзгерту" : "➕ Жаңа жиынтық";
    count(); f.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function init() {
    const f = $("#setForm");
    f.text.oninput = count;
    $("#setExample").onclick = () => { f.title.value = f.title.value || "Ағылшын сөздері"; f.text.value = EXAMPLE; count(); };
    f.onsubmit = (e) => {
      e.preventDefault();
      const text = f.text.value, items = Store.parseItems(text), answers = new Set(items.map(i => i.a));
      if (items.length < 4) return alert("Кемінде 4 жол жазыңыз (сұрақ | жауап).");
      if (items.some(i => !i.w.length) && answers.size < 4) return alert("Әртүрлі жауаптар кемінде 4 болуы керек — сонда қате нұсқалар автоматты жасалады.");
      if (Store.saveSet({ id: editing || undefined, title: f.title.value.trim(), subject: f.subject.value, text })) {
        editing = null; f.reset(); fill(null); list(); renderStats();
      }
    };
    // Бөліскен сілтеме арқылы келгенде
    const m = location.hash.match(/^#set=(.+)$/);
    if (m) {
      try {
        const d = unb64(m[1]);
        history.replaceState(null, "", location.pathname);
        if (confirm(`«${d.t}» жиынтығын қосасыз ба?`)) { Store.saveSet({ title: d.t, subject: d.s, text: d.x }); go("builder"); }
      } catch { alert("Сілтеме бұзылған"); }
    }
    fill(null); list();
  }
  return { init, list };
})();
