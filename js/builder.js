// Конструктор: мұғалім бір рет тапсырма жазады — платформа одан тест және ойындарды жасайды (Wordwall сияқты).
// Жиынтықтар: жергілікті (браузерде), бұлттағы (Supabase, кіргенде) және ашық (барлығына көрінетін).
const Builder = (() => {
  const SUBJ = { math: "➗ Математика", english: "🔤 Ағылшын тілі", kazakh: "📖 Қазақ тілі мен әдебиеті", other: "🧩 Басқа пән" };
  const EXAMPLE = "apple | алма\nbook | кітап\nschool | мектеп\ncat | мысық\ndog | ит\nwater | су\nhouse | үй\nbread | нан";
  let editing = null, focusId = null; // editing: { id, cloud }

  const b64 = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const unb64 = (t) => JSON.parse(decodeURIComponent(escape(atob(t))));
  const base = () => location.origin + location.pathname;

  function launch(set, game) {
    Games.toMenu(); go("games");
    Games.openSetup(game, { subject: "set:" + set.id, title: set.title, count: Store.parseItems(set.text).length });
  }
  function copyLink(url) {
    const ok = () => alert("Сілтеме көшірілді ✅\nМұғалімдерге жіберіңіз.");
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, () => prompt("Сілтемені көшіріңіз:", url));
    else prompt("Сілтемені көшіріңіз:", url);
  }
  async function share(set) {
    if (set.cloud) {
      if (!set.isPublic) {
        if (!set.mine || !confirm("Сілтеме жұмыс істеуі үшін жиынтық «ашық» болуы керек (барлық мұғалім көреді). Ашамыз ба?")) return;
        if (!(await Cloud.setPublic(set.id, true))) return;
      }
      return copyLink(`${base()}#s=${set.id}`);
    }
    copyLink(`${base()}#set=${b64({ t: set.title, s: set.subject, x: set.text })}`);
  }

  // ---- Тіркелгі жолағы ----
  function authModal() {
    if (!Cloud.available) return alert("Бұлт қолжетімсіз (интернет жоқ па?). Сайт жергілікті режимде жұмыс істейді.");
    let signup = false;
    const body = el("div", { class: "authbox" });
    const render = () => {
      const f = el("form", { onsubmit: async (e) => {
        e.preventDefault();
        const ok = await (signup ? Cloud.signUp(f.email.value.trim(), f.password.value) : Cloud.signIn(f.email.value.trim(), f.password.value));
        if (ok && Cloud.user) $("#modal").hidden = true;
        else if (ok && signup) $("#modal").hidden = true;
      } },
        el("h2", {}, signup ? "Тіркелу" : "Мұғалім ретінде кіру"),
        el("label", {}, "Email", el("input", { name: "email", type: "email", required: "", autocomplete: "email" })),
        el("label", {}, "Құпиясөз (кемінде 6 таңба)", el("input", { name: "password", type: "password", required: "", minlength: "6", autocomplete: signup ? "new-password" : "current-password" })),
        el("div", { class: "row" }, el("button", { class: "primary" }, signup ? "Тіркелу" : "Кіру"),
          el("button", { type: "button", class: "ghost-b", onclick: () => { signup = !signup; render(); } }, signup ? "Менде аккаунт бар" : "Жаңа аккаунт")));
      body.replaceChildren(f);
    };
    render();
    $("#modalContent").replaceChildren(body); $("#modal").hidden = false;
  }
  function paintAcct() {
    const u = Cloud.user, box = $("#acct"), btn = $("#acctBtn");
    if (btn) btn.textContent = u ? "👤 " + (u.email || "").split("@")[0] : "👤 Кіру";
    if (!box) return;
    if (!Cloud.available) box.replaceChildren(el("span", { class: "hint" }, "☁️ Бұлт қолжетімсіз — жиынтықтар осы браузерде сақталады."));
    else if (u) box.replaceChildren(el("span", {}, "☁️ Кірдіңіз: ", el("b", {}, u.email), " — жиынтықтар бұлтта сақталады"), el("button", { class: "ghost-b", onclick: () => Cloud.signOut() }, "Шығу"));
    else box.replaceChildren(el("span", {}, "☁️ Кіріңіз — жиынтықтарыңыз бұлтқа сақталып, кез келген компьютерден ашылады."), el("button", { class: "primary", onclick: authModal }, "Кіру / Тіркелу"));
  }

  // ---- Тізім ----
  function card(set) {
    const n = Store.parseItems(set.text).length, ok = n >= 4;
    const act = (label, title, fn, dis) => el("button", { class: "mini", title, ...(dis ? { disabled: "" } : {}), onclick: fn }, label);
    const where = set.cloud ? (set.mine ? (set.isPublic ? "☁️ бұлтта" : "☁️ бұлтта") : `👤 ${set.author || "мұғалім"}`) : set.local ? "💻 осы браузерде" : "жарияланған";
    const second = [];
    if (set.cloud && set.mine) second.push(
      act("✏️ Өзгерту", "Өзгерту", () => fill(set)),
      act(set.isPublic ? "🔒 Жабу" : "🌐 Ашу", "Ашық/жабық", () => Cloud.setPublic(set.id, !set.isPublic)),
      act("🔗", "Сілтеме", () => share(set)),
      act("🗑", "Жою", () => { if (confirm("Жиынтықты жоясыз ба?")) Cloud.remove(set.id); }));
    else if (set.local) second.push(
      act("✏️ Өзгерту", "Өзгерту", () => fill(set)),
      ...(Cloud.user ? [act("☁️ Бұлтқа", "Бұлтқа жүктеу", async () => { if (await Cloud.save({ title: set.title, subject: set.subject, text: set.text })) { Store.delSet(set.id); list(); } })] : []),
      act("🔗", "Сілтеме", () => share(set)),
      act("🗑", "Жою", () => { if (confirm("Жиынтықты жоясыз ба?")) { Store.delSet(set.id); list(); renderStats(); } }));
    else second.push(
      act("📥 Өзіме көшіру", "Көшіру", async () => {
        const copy = { title: set.title, subject: set.subject, text: set.text };
        if (Cloud.user) await Cloud.save(copy); else Store.saveSet(copy);
        list(); alert("Көшірілді ✅ «Менің жиынтықтарым» бөлімінен табасыз.");
      }),
      act("🔗", "Сілтеме", () => share(set)));
    return el("div", { class: "set-card" + (set.id === focusId ? " focus" : ""), "data-id": set.id },
      el("b", {}, set.title),
      el("small", {}, `${SUBJ[set.subject] || ""} · ${n} жол · ${where}`, " ", set.cloud && set.mine ? el("span", { class: "badge" + (set.isPublic ? "" : " priv") }, set.isPublic ? "ашық" : "жабық") : ""),
      el("div", { class: "set-actions" },
        act("📝 Тест", "Тест", () => { go("tests"); Tests.startSet(set); }, !ok),
        act("🪢", "Арқан тарту", () => launch(set, "tug"), !ok),
        act("🎯", "Кезекпен", () => launch(set, "turn"), !ok),
        act("🥁", "Барабан", () => launch(set, "drum"), !ok),
        act("🃏", "Жұпты тап", () => launch(set, "pairs"), n < 3)),
      el("div", { class: "set-actions" }, second));
  }
  function list() {
    paintAcct();
    const all = Store.sets(), mine = all.filter(s => s.local || (s.cloud && s.mine)), pub = all.filter(s => !s.local && !(s.cloud && s.mine) && (!s.cloud || s.isPublic));
    const empty = (t) => el("div", { class: "empty" }, t);
    $("#setList").replaceChildren(...(mine.length ? mine.map(card) : [empty("Әзірге жиынтық жоқ. Төменнен жасаңыз — мысалы, «Үлгі» батырмасын басыңыз.")]));
    $("#pubList").replaceChildren(...(pub.length ? pub.map(card) : [empty(Cloud.tableMissing ? "Бұлттық база әлі дайын емес." : "Әзірге ашық жиынтық жоқ. Біріншілердің бірі болыңыз!")]));
    if (focusId) { const n = $(`.set-card[data-id="${focusId}"]`); if (n) { n.scrollIntoView({ block: "center" }); focusId = null; } }
  }

  // ---- Форма ----
  function count() {
    const f = $("#setForm"), items = Store.parseItems(f.text.value), bad = f.text.value.split("\n").filter(l => l.trim()).length - items.length;
    $("#setCount").textContent = `✔ ${items.length} жол танылды` + (bad ? ` · ⚠️ ${bad} жолда жауап жоқ` : "") + (items.length && items.length < 4 ? " · кемінде 4 жол керек" : "");
  }
  function fill(set) {
    editing = set ? { id: set.id, cloud: !!set.cloud } : null;
    const f = $("#setForm");
    f.title.value = set ? set.title : ""; f.subject.value = set ? set.subject : "english"; f.text.value = set ? set.text : "";
    $("#setFormTitle").textContent = set ? "✏️ Жиынтықты өзгерту" : "➕ Жаңа жиынтық";
    count(); if (set) f.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function init() {
    const f = $("#setForm");
    f.text.oninput = count;
    $("#setExample").onclick = () => { f.title.value = f.title.value || "Ағылшын сөздері"; f.text.value = EXAMPLE; count(); };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const text = f.text.value, items = Store.parseItems(text), answers = new Set(items.map(i => i.a));
      if (items.length < 4) return alert("Кемінде 4 жол жазыңыз (сұрақ | жауап).");
      if (items.some(i => !i.w.length) && answers.size < 4) return alert("Әртүрлі жауаптар кемінде 4 болуы керек — сонда қате нұсқалар автоматты жасалады.");
      const set = { id: editing ? editing.id : undefined, title: f.title.value.trim(), subject: f.subject.value, text };
      let ok;
      if (Cloud.user && (!editing || editing.cloud)) ok = await Cloud.save(set);
      else ok = Store.saveSet(set);
      if (ok) { editing = null; f.reset(); fill(null); list(); renderStats(); }
    };
    $("#acctBtn").onclick = () => Cloud.user ? go("builder") : authModal();
    Cloud.onChange(list);

    // Бөліскен сілтемелер: #set=... (деректер сілтемеде) немесе #s=<id> (бұлттағы ашық жиынтық)
    const m = location.hash.match(/^#set=(.+)$/), m2 = location.hash.match(/^#s=([0-9a-f-]{36})$/i);
    if (m) {
      try {
        const d = unb64(m[1]); history.replaceState(null, "", location.pathname);
        if (confirm(`«${d.t}» жиынтығын қосасыз ба?`)) { Store.saveSet({ title: d.t, subject: d.s, text: d.x }); go("builder"); }
      } catch { alert("Сілтеме бұзылған"); }
    } else if (m2) { focusId = m2[1]; history.replaceState(null, "", location.pathname); go("builder"); }
    fill(null); list();
  }
  return { init, list };
})();
