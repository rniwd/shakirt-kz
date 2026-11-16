// Бұлт (Supabase): кіру, жиынтықтарды сақтау және ашық жиынтықтар.
// Supabase қолжетімсіз болса, сайт бұрынғыдай жергілікті режимде жұмыс істейді.
const Cloud = (() => {
  let sb = null, user = null, ready = false, tableMissing = false;
  const subs = [];
  const cfg = window.SUPABASE_CONFIG;

  const emit = () => subs.forEach(f => { try { f(); } catch {} });
  const toSet = (r) => ({ id: r.id, title: r.title, subject: r.subject, text: r.body, cloud: true, mine: !!user && r.owner === user.id, isPublic: r.is_public, author: r.author });
  function fail(e) {
    const msg = e && (e.message || String(e));
    if (e && (e.code === "PGRST205" || /schema cache|does not exist/i.test(msg || ""))) { tableMissing = true; alert("Бұлттық база әлі дайын емес: supabase/schema.sql файлын SQL Editor-да бір рет іске қосу керек."); }
    else alert("Қате: " + (/Invalid login/i.test(msg) ? "email немесе құпиясөз қате" : /already registered/i.test(msg) ? "бұл email тіркелген, «Кіру» таңдаңыз" : /Email not confirmed/i.test(msg) ? "email әлі расталмаған — поштаңызды тексеріңіз" : msg));
    return false;
  }

  function init() {
    if (!cfg || !window.supabase) return;
    try { sb = window.supabase.createClient(cfg.url, cfg.key); } catch { return; }
    sb.auth.onAuthStateChange((_e, session) => { user = session ? session.user : null; emit(); refresh(); });
    sb.auth.getSession().then(({ data }) => { user = data.session ? data.session.user : null; ready = true; emit(); refresh(); });
  }

  async function refresh() {
    if (!sb) return;
    const { data, error } = await sb.from("sets").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) { tableMissing = error.code === "PGRST205"; Store.setCloud([]); emit(); return; }
    tableMissing = false;
    Store.setCloud(data.map(toSet)); emit();
  }

  const authOk = (r) => r.error ? fail(r.error) : true;
  async function signIn(email, password) { return authOk(await sb.auth.signInWithPassword({ email, password })); }
  async function signUp(email, password) {
    const r = await sb.auth.signUp({ email, password });
    if (r.error) return fail(r.error);
    if (!r.data.session) { alert("Тіркелдіңіз! Поштаңызға келген хаттағы сілтемені басыңыз, содан кейін «Кіру» арқылы кіріңіз."); }
    return true;
  }
  async function signOut() { await sb.auth.signOut(); }

  const author = () => user ? (user.email || "").split("@")[0] : "";
  async function save(set) {
    const row = { title: set.title, subject: set.subject, body: set.text, author: author() };
    const q = set.id ? sb.from("sets").update(row).eq("id", set.id) : sb.from("sets").insert(row);
    const { error } = await q; if (error) return fail(error);
    await refresh(); return true;
  }
  async function setPublic(id, v) { const { error } = await sb.from("sets").update({ is_public: v }).eq("id", id); if (error) return fail(error); await refresh(); return true; }
  async function remove(id) { const { error } = await sb.from("sets").delete().eq("id", id); if (error) return fail(error); await refresh(); return true; }

  return {
    init, refresh, signIn, signUp, signOut, save, setPublic, remove,
    onChange: (f) => subs.push(f),
    get available() { return !!sb; },
    get user() { return user; },
    get tableMissing() { return tableMissing; }
  };
})();
