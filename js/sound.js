// Дыбыстар (WebAudio) — файл қажет емес
const Sound = (() => {
  let ctx, on = true;
  const beep = (f, d = .12, type = "sine", v = .15, t0 = 0) => {
    if (!on) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = v;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + t0;
      g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.start(t); o.stop(t + d);
    } catch {}
  };
  return {
    tap: () => beep(420, .05, "triangle"),
    good: () => { beep(523, .1, "triangle", .2); beep(784, .15, "triangle", .2, .09); },
    bad: () => beep(150, .25, "sawtooth", .12),
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => beep(f, .18, "triangle", .2, i * .13)),
    toggle() { on = !on; return on; }
  };
})();
