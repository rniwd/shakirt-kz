// Сұрақ көздері: автоматты генератор / мұғалімнің тапсырмалары
const Q = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (arr) => arr[rnd(0, arr.length - 1)];

  // ---- Математика ----
  function distractors(ans, count = 3) {
    const set = new Set();
    let guard = 0;
    while (set.size < count && guard++ < 60) {
      const d = ans + pick([-10, -2, -1, 1, 2, 10, rnd(-5, 5)]) ;
      if (d !== ans && d >= 0) set.add(d);
    }
    let n = 1; while (set.size < count) { if (ans + n !== ans) set.add(ans + n); n++; }
    return [...set].map(String);
  }
  const mathLevels = {
    1: () => { const a = rnd(1, 12), b = rnd(1, 20 - a); return rnd(0, 1) ? [`${a} + ${b}`, a + b] : [`${a + b} − ${b}`, a]; },
    2: () => { const a = rnd(10, 60), b = rnd(5, 39); return rnd(0, 1) ? [`${a} + ${b}`, a + b] : [`${a + b} − ${b}`, a]; },
    3: () => { const a = rnd(2, 9), b = rnd(2, 9); return [`${a} × ${b}`, a * b]; },
    4: () => { const t = rnd(0, 2); if (t === 0) { const a = rnd(2, 9), b = rnd(2, 9); return [`${a * b} ÷ ${a}`, b]; } if (t === 1) { const a = rnd(11, 25), b = rnd(3, 9); return [`${a} × ${b}`, a * b]; } const a = rnd(100, 500), b = rnd(20, 300); return [`${a} + ${b}`, a + b]; }
  };
  const mathGen = (level) => () => {
    const [expr, ans] = mathLevels[level]();
    return { q: `${expr} = ?`, a: String(ans), w: distractors(ans) };
  };

  // ---- Ағылшын ----
  const WORDS = [
    ["🍎", "алма", "apple"], ["🐱", "мысық", "cat"], ["🐶", "ит", "dog"], ["📘", "кітап", "book"], ["🏠", "үй", "house"],
    ["🌞", "күн", "sun"], ["🌙", "ай", "moon"], ["💧", "су", "water"], ["🍞", "нан", "bread"], ["🐴", "жылқы", "horse"],
    ["🚌", "автобус", "bus"], ["🌳", "ағаш", "tree"], ["✏️", "қарындаш", "pencil"], ["🎒", "рюкзак", "bag"], ["🏫", "мектеп", "school"],
    ["🐟", "балық", "fish"], ["🐦", "құс", "bird"], ["🌸", "гүл", "flower"], ["🥛", "сүт", "milk"], ["⚽", "доп", "ball"],
    ["🔴", "қызыл", "red"], ["🔵", "көк", "blue"], ["🟢", "жасыл", "green"], ["🟡", "сары", "yellow"], ["👩‍🏫", "мұғалім", "teacher"],
    ["🐪", "түйе", "camel"], ["🍌", "банан", "banana"], ["🪑", "орындық", "chair"], ["👧", "қыз", "girl"], ["👦", "ұл", "boy"]
  ];
  const GRAMMAR = [
    ["I ___ a student.", "am", ["is", "are"]], ["She ___ a teacher.", "is", ["am", "are"]], ["They ___ friends.", "are", ["is", "am"]],
    ["He ___ a dog.", "has", ["have", "haves"]], ["We ___ books.", "have", ["has", "is"]], ["This is ___ apple.", "an", ["a", "the"]],
    ["This is ___ cat.", "a", ["an", "two"]], ["Two ___", "cats", ["cat", "cates"]], ["I ___ milk every day.", "drink", ["drinks", "drinking"]],
    ["What ___ your name?", "is", ["are", "am"]]
  ];
  const wordGen = () => {
    const [em, kk, en] = pick(WORDS);
    const others = shuffle(WORDS.filter(w => w[2] !== en)).slice(0, 3).map(w => w[2]);
    return rnd(0, 3) === 0
      ? (() => { const [s, a, w] = pick(GRAMMAR); return { q: s, a, w, small: "Қайсысы дұрыс?" }; })()
      : { q: `${em}`, small: `«${kk}» ағылшынша?`, a: en, w: others };
  };


  // ---- Туларды тап ----
  const FLAGS = [
    ["kz", "Қазақстан"], ["ru", "Ресей"], ["cn", "Қытай"], ["uz", "Өзбекстан"], ["kg", "Қырғызстан"], ["tm", "Түркменстан"],
    ["tj", "Тәжікстан"], ["az", "Әзірбайжан"], ["tr", "Түркия"], ["us", "АҚШ"], ["gb", "Ұлыбритания"], ["fr", "Франция"],
    ["de", "Германия"], ["it", "Италия"], ["es", "Испания"], ["jp", "Жапония"], ["kr", "Оңтүстік Корея"], ["in", "Үндістан"],
    ["br", "Бразилия"], ["ca", "Канада"], ["au", "Австралия"], ["eg", "Мысыр"], ["ua", "Украина"], ["by", "Беларусь"],
    ["pl", "Польша"], ["se", "Швеция"], ["mx", "Мексика"], ["ar", "Аргентина"], ["gr", "Грекия"], ["nl", "Нидерланды"]
  ];
  const flagGen = () => {
    const [code, name] = pick(FLAGS);
    const others = shuffle(FLAGS.filter(f => f[0] !== code)).slice(0, 3);
    return rnd(0, 1)
      ? { q: `${name} туы қайсы?`, a: code, w: others.map(f => f[0]), optImg: true }
      : { q: "Бұл қай елдің туы?", img: code, a: name, w: others.map(f => f[1]) };
  };

  // ---- Қазақ тілі мен әдебиеті: тесттер қорынан ----
  const kzBank = () => (window.PUBLISHED_TESTS || []).filter(t => t.subject === "kazakh").flatMap(t =>
    t.qs.map(([q, opts, ai]) => ({ q, a: opts[ai], w: opts.filter((_, i) => i !== ai) })));

  // ---- Мұғалімнің жиынтығы (конструктор) ----
  const getSet = (subject) => Store.sets().find(x => "set:" + x.id === subject);
  const setGen = (subject) => {
    const items = Store.parseItems((getSet(subject) || {}).text);
    return () => {
      const it = pick(items);
      let w = it.w;
      if (!w.length) w = shuffle([...new Set(items.map(x => x.a).filter(a => a !== it.a))]).slice(0, 3);
      return { q: it.q, a: it.a, w };
    };
  };
  const pairsFor = (subject) => {
    const set = getSet(subject);
    return set ? Store.parseItems(set.text).map(i => [i.q, i.a]) : WORDS.map(([em, kk, en]) => [en, `${em} ${kk}`]);
  };

  // ---- Көз таңдау ----
  // source: "auto" | "custom" | "mix"; level 1–4 (математика)
  function source(subject, src, level) {
    const auto = subject.startsWith("set:") ? setGen(subject) : subject === "math" ? mathGen(level || 1) : subject === "flags" ? flagGen : subject === "kazakh" ? (() => pick(kzBank())) : wordGen;
    const custom = subject === "flags" || subject.startsWith("set:") ? [] : Store.questions(subject);
    let last = null;
    return () => {
      let item;
      for (let t = 0; t < 5; t++) {
        const useCustom = src === "custom" || (src === "mix" && custom.length && rnd(0, 1));
        item = useCustom && custom.length ? pick(custom) : auto();
        const raw = item.q + "|" + item.a;
        if (raw !== last) { last = raw; break; }
      }
      const wrong = (item.w || []).filter(Boolean).slice(0, 3);
      return { q: item.q, small: item.small, img: item.img, optImg: item.optImg, a: item.a, opts: shuffle([item.a, ...wrong]) };
    };
  }
  return { source, shuffle, rnd, pick, words: () => WORDS, pairs: pairsFor, setGen, hasCustom: (s) => Store.questions(s).length > 0 };
})();
