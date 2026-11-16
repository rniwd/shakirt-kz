// Фондық музыка: домбыра үнін еске түсіретін авторлық қысқа күй (6/8 шабыс ырғағы).
// Ешқандай аудио файл жоқ — дыбыс WebAudio арқылы сайттың өзінде жасалады.
const Music = (() => {
  const F = { D3: 146.83, A3: 220, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, Bb4: 466.16, C5: 523.25, D5: 587.33 };
  // Әр такт = 6 сегізден бір; "-" — үзіліс
  const A = [["A4", "-", "A4", "Bb4", "A4", "G4"], ["A4", "-", "D5", "-", "C5", "Bb4"], ["A4", "G4", "A4", "Bb4", "A4", "G4"], ["F4", "-", "E4", "-", "D4", "-"]];
  const B = [["D5", "-", "D5", "C5", "Bb4", "A4"], ["Bb4", "-", "C5", "-", "D5", "-"], ["C5", "Bb4", "A4", "G4", "A4", "Bb4"], ["A4", "-", "F4", "E4", "D4", "-"]];
  const SONG = [...A, ...B];
  const STEP = 0.19; // сегізден бір ұзақтығы (с)

  let ctx, master, timer, nextT = 0, idx = 0, playing = false;
  let enabled = true;
  try { enabled = localStorage.getItem("bo_music") !== "off"; } catch {}

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.16;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
    master.connect(lp); lp.connect(ctx.destination);
  }
  function pluck(freq, t, dur, vol = 1) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    const o1 = ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = freq * 2.004;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function drum(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(55, t + .12);
    g.gain.setValueAtTime(.7, t); g.gain.exponentialRampToValueAtTime(.001, t + .16);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .2);
  }
  function bar(i, t0) {
    const notes = SONG[i % SONG.length];
    // бас-ішек (домбыра): D мен A кезектесіп, шабыс ырғағы
    pluck(F.D3, t0, 0.5, .8); pluck(F.A3, t0 + STEP, 0.3, .5); pluck(F.A3, t0 + STEP * 2, 0.3, .5);
    pluck(F.D3, t0 + STEP * 3, 0.5, .7); pluck(F.A3, t0 + STEP * 4, 0.3, .5); pluck(F.A3, t0 + STEP * 5, 0.3, .5);
    drum(t0); drum(t0 + STEP * 3);
    notes.forEach((n, k) => {
      if (n === "-") return;
      let len = 1; while (k + len < 6 && notes[k + len] === "-") len++;
      pluck(F[n], t0 + STEP * k, STEP * len * 1.8 + .15, 1);
    });
  }
  function schedule() {
    while (nextT < ctx.currentTime + 0.5) { bar(idx++, nextT); nextT += STEP * 6; }
  }
  function play() {
    if (playing || !enabled) return;
    try { init(); ctx.resume(); } catch { return; }
    playing = true; nextT = ctx.currentTime + 0.08; idx = 0;
    schedule(); timer = setInterval(schedule, 120);
  }
  function pause() { if (!playing) return; playing = false; clearInterval(timer); if (ctx) { ctx.suspend(); } }
  function resumeCtx() { if (ctx && ctx.state === "suspended") ctx.resume(); }

  function inGame() { return !$("#stage").hidden && $("#tab-games").classList.contains("active"); }
  function paintBtn() { const b = $("#musicBtn"); if (b) { b.classList.toggle("off", !enabled); b.title = enabled ? "Музыканы өшіру" : "Музыканы қосу"; } }
  function sync() { paintBtn(); if (enabled && inGame()) { if (!playing) play(); else resumeCtx(); } else pause(); }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem("bo_music", enabled ? "on" : "off"); } catch {}
    sync();
  }
  return { sync, toggle };
})();
