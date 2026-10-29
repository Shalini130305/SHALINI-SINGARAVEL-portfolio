// Edge-ML dashboard: SIMULATED signal and a transparent demo rule. No camera or model is used here.
(() => {
  const N = 180, W = 600, H = 200;
  const THRESH = 0.2;   // demo rule: eye openness below this counts as "closed"
  const MIN_RUN = 15;   // demo rule: consecutive closed frames needed to raise an alert
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let data = [], alert = [], cursor = 0, timer = null;

  function signal(mode) {
    const v = [];
    let closed = 0;
    for (let i = 0; i < N; i++) {
      if (closed === 0) {
        const start = mode === 'drowsy' ? i > 40 && Math.random() < 0.05 : Math.random() < 0.02;
        if (start) closed = mode === 'drowsy' ? 15 + Math.floor(Math.random() * 10) : 2;
      }
      if (closed > 0) { closed--; v.push(0.08 + Math.random() * 0.03); continue; }
      const open = mode === 'drowsy' ? Math.max(0.14, 0.32 - i * 0.001) : 0.3;
      v.push(open + (Math.random() - 0.5) * 0.03);
    }
    return v;
  }

  function evaluate(values) {
    let run = 0;
    return values.map(x => { run = x < THRESH ? run + 1 : 0; return run >= MIN_RUN; });
  }

  function draw() {
    const X = i => (i / (N - 1)) * W, Y = x => H - (x / 0.4) * H, bw = W / N;
    let s = `<line x1="0" x2="${W}" y1="${Y(THRESH)}" y2="${Y(THRESH)}" class="thr"/>`;
    for (let i = 0; i <= cursor; i++) {
      if (alert[i]) s += `<rect class="alert-band" x="${X(i) - bw / 2}" y="0" width="${bw}" height="${H}"/>`;
    }
    s += `<polyline class="trace" points="${data.slice(0, cursor + 1).map((x, i) => X(i) + ',' + Y(x)).join(' ')}"/>`;
    $('signal').innerHTML = s;

    const on = alert[cursor], low = data[cursor] < THRESH;
    const status = $('status');
    status.textContent = on ? 'ALERT: demo rule triggered' : low ? 'Eyes closing (below threshold)' : 'Eyes open: no alert';
    status.className = 'status ' + (on ? 'bad' : low ? 'warn' : 'ok');
    $('frame').textContent = `${cursor + 1} / ${N}`;
    $('alerts').textContent = alert.slice(0, cursor + 1).filter((a, i) => a && !alert[i - 1]).length;
  }

  function tick() {
    draw();
    if (cursor < N - 1) cursor++;
    else stop();
  }

  function stop() { clearInterval(timer); timer = null; }

  function play(mode) {
    stop();
    data = signal(mode);
    alert = evaluate(data);
    cursor = 0;
    if (reduce) { cursor = N - 1; draw(); return; }
    timer = setInterval(tick, 45);
    tick();
  }

  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => play(b.dataset.mode)));
})();
