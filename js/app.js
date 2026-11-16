// Навигация және іске қосу
function go(tab) {
  $$(".tab").forEach(x => x.classList.toggle("active", x.dataset.tab === tab));
  $$(".panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + tab));
  window.scrollTo({ top: 0 });
  Music.sync();
}
function renderStats() {
  const mats = Store.materials(), tests = window.PUBLISHED_TESTS || [];
  const st = [[mats.length, "материал"], [tests.length, "тест"], [tests.reduce((s, t) => s + t.qs.length, 0), "тест сұрағы"], [5, "ойын"], [3, "пән"]];
  $("#stats").replaceChildren(...st.map(([n, l]) => el("div", { class: "stat" }, el("b", {}, n), l)));
}
$$(".tab").forEach(t => t.onclick = () => { Sound.tap(); go(t.dataset.tab); });
$$("[data-go]").forEach(b => b.onclick = () => { Sound.tap(); go(b.dataset.go); });
$$(".game-card[data-game]").forEach(c => c.onclick = () => { Sound.tap(); Games.openSetup(c.dataset.game); });
$("#fsBtn").onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
Materials.init();
Tests.init();
Builder.init();
Cloud.init();
renderStats();
$("#musicBtn").onclick = () => Music.toggle();
Music.sync();
