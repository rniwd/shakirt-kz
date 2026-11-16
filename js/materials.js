// Материалдар қойындысы
const Materials = (() => {
  const ICON = { link: "🔗", note: "📝", image: "🖼" };
  const SUBJ = { math: "Математика", english: "Ағылшын тілі", kazakh: "Қазақ тілі мен әдебиеті" };
  const SICON = { math: "➗", english: "🔤", kazakh: "📖" };
  let filter = "all", teacher = false, query = "";

  function openModal(...kids) { $("#modalContent").replaceChildren(...kids); $("#modal").hidden = false; }

  // Қарапайым markdown: ## тақырып, - тізім, > формула, **қалың**, `код`
  function inline(text) {
    const frag = document.createDocumentFragment();
    text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(part => {
      if (part.startsWith("**")) frag.append(el("b", {}, part.slice(2, -2)));
      else if (part.startsWith("`")) frag.append(el("code", {}, part.slice(1, -1)));
      else frag.append(part);
    });
    return frag;
  }
  function render(text) {
    const root = el("div", { class: "note" });
    let ul = null;
    text.split("\n").forEach(line => {
      if (line.startsWith("- ")) { if (!ul) { ul = el("ul"); root.append(ul); } ul.append(el("li", {}, inline(line.slice(2)))); return; }
      ul = null;
      if (line.startsWith("## ")) root.append(el("h3", {}, line.slice(3)));
      else if (line.startsWith("> ")) root.append(el("span", { class: "formula" }, line.slice(2)));
      else if (line.trim()) root.append(el("p", {}, inline(line)));
    });
    return root;
  }

  function view(m) {
    if (m.kind === "link") return window.open(m.url, "_blank", "noopener");
    if (m.kind === "image") return openModal(el("h2", {}, m.title), el("img", { src: m.data, alt: m.title }));
    const test = (window.PUBLISHED_TESTS || []).find(t => t.mat === m.id);
    openModal(el("h2", {}, m.title), render(m.text),
      test ? el("div", { class: "mat-actions" }, el("button", { class: "primary", onclick: () => { $("#modal").hidden = true; go("tests"); Tests.start(test.id); } }, "📝 Тестпен тексер")) : "");
  }

  function renderList() {
    const q = query.trim().toLowerCase();
    const list = Store.materials().filter(m => (filter === "all" || m.subject === filter) && (!q || (m.title + " " + (m.text || "")).toLowerCase().includes(q)));
    $("#matList").replaceChildren(...(list.length ? list.map(m => {
      const card = el("div", { class: "mat " + m.subject, onclick: () => view(m) },
        el("div", { class: "ic" }, ICON[m.kind] || "📄"), el("b", {}, m.title),
        el("small", {}, SUBJ[m.subject] + (m.local ? " · менің" : "")),
        m.tag ? el("small", { class: "tag" }, m.tag) : "");
      if (teacher && m.local) card.append(el("button", { class: "del", title: "Жою", onclick: (e) => { e.stopPropagation(); if (confirm("Жоясыз ба?")) { Store.delMaterial(m.id); refresh(); } } }, "🗑"));
      return card;
    }) : [el("div", { class: "empty" }, "Ештеңе табылмады.")]));
  }
  function renderQ() {
    const l = Store.localQuestions();
    $("#qList").replaceChildren(...l.map(q => el("div", { class: "qitem" },
      el("span", {}, `${SICON[q.subject]} ${q.q} → ${q.a}`),
      el("button", { type: "button", onclick: () => { Store.delQuestion(q.id); refresh(); } }, "✕"))));
  }
  function renderMeter() {
    const u = Store.usedBytes();
    $("#meterFill").style.width = Math.min(100, u / Store.LIMIT * 100) + "%";
    $("#meterTxt").textContent = `Браузер жады: ${(u / 1024).toFixed(0)} КБ / ~${(Store.LIMIT / 1024).toFixed(0)} КБ`;
  }
  function refresh() { renderList(); renderQ(); renderMeter(); if (window.renderStats) renderStats(); }

  function init() {
    $$("#filters .chip").forEach(c => c.onclick = () => { filter = c.dataset.f; $$("#filters .chip").forEach(x => x.classList.toggle("active", x === c)); renderList(); });
    $("#search").oninput = (e) => { query = e.target.value; renderList(); };
    $("#teacherMode").onchange = (e) => { teacher = e.target.checked; $("#teacherPanel").hidden = !teacher; refresh(); };
    $("#modalClose").onclick = () => $("#modal").hidden = true;
    $("#modal").onclick = (e) => { if (e.target.id === "modal") $("#modal").hidden = true; };

    const kindSel = $("#kindSel");
    const syncKind = () => $$("#matForm [data-kind]").forEach(l => l.hidden = l.dataset.kind !== kindSel.value);
    kindSel.onchange = syncKind;

    $("#matForm").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target, d = Object.fromEntries(new FormData(f));
      const m = { title: d.title.trim(), subject: d.subject, kind: d.kind };
      const done = () => { if (Store.addMaterial(m)) { f.reset(); syncKind(); refresh(); } };
      if (d.kind === "link") { if (!d.url) return alert("Сілтемені енгізіңіз"); m.url = d.url; done(); }
      else if (d.kind === "note") { if (!d.text.trim()) return alert("Мәтін жазыңыз"); m.text = d.text; done(); }
      else {
        const file = f.file.files[0];
        if (!file) return alert("Сурет таңдаңыз");
        if (file.size > 300 * 1024) return alert("Сурет 300 КБ-тан үлкен. Кішірейтіңіз немесе Google Drive сілтемесін қолданыңыз.");
        const r = new FileReader(); r.onload = () => { m.data = r.result; done(); }; r.readAsDataURL(file);
      }
    };
    $("#qForm").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const w = [d.w1, d.w2, d.w3].map(x => x.trim()).filter(Boolean);
      if (Store.addQuestion({ subject: d.subject, q: d.q.trim(), a: d.a.trim(), w })) { e.target.reset(); refresh(); }
    };
    $("#exportBtn").onclick = () => {
      const a = el("a", { href: URL.createObjectURL(new Blob([Store.exportAll()], { type: "application/json" })), download: "shakirt-data.json" });
      a.click();
    };
    $("#importFile").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { try { Store.importAll(t); refresh(); alert("Жүктелді ✅"); } catch { alert("Файл дұрыс емес"); } });
      e.target.value = "";
    };
    $("#resetBtn").onclick = () => { if (confirm("Осы браузердегі барлық өз материалдарың мен тапсырмаларың өшеді. Жалғастырасыз ба?")) { Store.clear(); refresh(); } };
    syncKind(); refresh();
  }
  return { init };
})();
