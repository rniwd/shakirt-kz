// Мұғалімнің деректері: localStorage + data/*.js (жарияланған)
const Store = (() => {
  const K = { m: "bo_materials", q: "bo_questions" };
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
    exportAll: () => JSON.stringify({ materials: read(K.m), questions: read(K.q) }, null, 2),
    importAll(txt) {
      const d = JSON.parse(txt);
      write(K.m, [...read(K.m), ...(d.materials || [])]);
      write(K.q, [...read(K.q), ...(d.questions || [])]);
    },
    clear() { localStorage.removeItem(K.m); localStorage.removeItem(K.q); },
    usedBytes() { return (localStorage.getItem(K.m) || "").length + (localStorage.getItem(K.q) || "").length; },
    LIMIT: 4_500_000
  };
})();
