// Мұғалімнің деректері: localStorage + data/*.js (жарияланған)
const Store = (() => {
  const K = { m: "bo_materials", q: "bo_questions", s: "bo_sets" };
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { alert("Жад толды! Кішірек файл таңдаңыз немесе ескі материалды жойыңыз."); return false; } };
  const uid = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  return {
    materials: () => [...(window.PUBLISHED_MATERIALS || []), ...read(K.m).map(m => ({ ...m, local: true }))],
    questions: (subject) => [...(window.PUBLISHED_QUESTIONS || []), ...read(K.q)].filter(q => !subject || q.subject === subject),
    localQuestions: () => read(K.q),
    addMaterial(m) { const l = read(K.m); l.push({ ...m, id: uid() }); return write(K.m, l); },
    delMaterial(id) { write(K.m, read(K.m).filter(m => m.id !== id)); },
    addQuestion(q) { const l = read(K.q); l.push({ ...q, id: uid() }); return write(K.q, l); },
    delQuestion(id) { write(K.q, read(K.q).filter(q => q.id !== id)); },
    // Жиынтықтар (конструктор): { id, title, subject, text } — text: әр жолда «сұрақ | жауап | қате1 | қате2»
    sets: () => [...(window.PUBLISHED_SETS || []), ...read(K.s).map(x => ({ ...x, local: true }))],
    localSets: () => read(K.s),
    saveSet(set) {
      const l = read(K.s), i = l.findIndex(x => x.id === set.id);
      if (i >= 0) l[i] = set; else l.push({ ...set, id: set.id || uid() });
      return write(K.s, l);
    },
    delSet(id) { write(K.s, read(K.s).filter(x => x.id !== id)); },
    // «сұрақ | жауап | қате...» немесе Excel/Google Sheets-тен көшірілген (табуляция) жолдар
    parseItems(text) {
      return String(text || "").split(/\n/).map(l => l.split(/\t|\|/).map(x => x.trim()).filter(x => x !== ""))
        .filter(f => f.length >= 2).map(f => ({ q: f[0], a: f[1], w: f.slice(2, 5) }));
    },
    exportAll: () => JSON.stringify({ materials: read(K.m), questions: read(K.q), sets: read(K.s) }, null, 2),
    importAll(txt) {
      const d = JSON.parse(txt);
      write(K.m, [...read(K.m), ...(d.materials || [])]);
      write(K.q, [...read(K.q), ...(d.questions || [])]);
      write(K.s, [...read(K.s), ...(d.sets || [])]);
    },
    clear() { localStorage.removeItem(K.m); localStorage.removeItem(K.q); localStorage.removeItem(K.s); },
    usedBytes() { return [K.m, K.q, K.s].reduce((n, k) => n + (localStorage.getItem(k) || "").length, 0); },
    LIMIT: 4_500_000
  };
})();
