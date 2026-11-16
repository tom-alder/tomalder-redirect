// Shared data and the live mark player for the 5 personal-site concepts.
// Marks are drawn every frame by design/logo-lab/engine.js and animated by its motions.js (the Brand Guide's
// 128 motions), never a bitmap, so the logo rules (one line weight, the gap tracking the arm) always hold.
(function (root) {
  const LE = root.LogoEngine, LM = root.LogoMotions;
  const MOTION = {}; for (const k in LM.B) for (const m of LM.B[k]) MOTION[m.id] = m;

  // ---------- content ----------
  const utm = (url, content) => `${url}${url.includes('?') ? '&' : '?'}utm_source=sb_tomalder&utm_medium=website&utm_content=${content}`;
  const PROJECTS = [
    { id: 'sb', char: 'sb', name: 'Strategy Breakdowns', kind: 'Weekly newsletter', short: 'The playbooks behind the world\'s greatest companies.',
      long: 'A weekly 3-minute email on the playbooks and growth hacks behind the world\'s greatest software, internet and media companies.',
      stat: '150,000+ readers', url: utm('https://strategybreakdowns.com', 'strategy_breakdowns'), host: 'strategybreakdowns.com' },
    { id: 'daily', char: 'daily', name: 'Strategy Screenshots', kind: 'Daily newsletter', short: '1 chart, 1 big idea, 1 poll, 1-minute read.',
      long: 'The daily, bite-size version of Strategy Breakdowns. 1 chart, 1 big idea, 1 poll, 1-minute read.',
      stat: 'New, since Oct 2026', url: utm('https://strategybreakdowns.com', 'strategy_screenshots'), host: 'strategybreakdowns.com' },
    { id: 'qc', char: 'qc', name: 'quicker.chat', kind: 'Mac app', short: 'One inbox for all your DMs.',
      long: 'A Mac app that brings iMessage, WhatsApp, LinkedIn, Slack and X into one inbox, and organises it for you.',
      stat: 'Waitlist open', url: utm('https://quicker.chat', 'quicker_chat'), host: 'quicker.chat' },
  ];
  // pile: what the timeline shows when you hover a piece, bottom item first. Each item keeps its own shape:
  // img (a picture), video (a looping clip; play: true adds a play button), sticker (a small logo), doc (a sketch of
  // a page), job (a Notion job ad).
  const post = (date, slug, title, pile, url) => ({ date, title, pile, sub: '', open: 50, url: url || utm(`https://strategybreakdowns.com/p/${slug}`, 'writing') });
  const job = (date, title, url, role) => ({ date, title, job: true, url, sub: 'Job ad', open: 50, pile: [{ job: role }, { sticker: 'notion' }] });
  const I = f => ({ img: 'assets/' + f }), V = (f, o) => ({ video: 'assets/' + f, ...o });
  const WRITING = [
    post('2026-10-09', '3-years-into-strategy-breakdowns', '3 years into Strategy Breakdowns', [I('3y-welcome.jpg'), I('3y-mauritius.jpg'), I('3y-hero.jpg'), I('3y-brazil.jpg'), I('3y-laptop.jpg'), I('qc-og.jpg')]),
    { ...job('2026-06-02', 'Hiring a Partnerships Manager', utm('https://strategybreakdowns.com/p/hiring-partnerships-manager', 'writing'), 'Partnerships Manager') },
    post('2026-04-15', 'why-i-use-beehiiv', 'Why I built my business on beehiiv', [I('bh-gauges.jpg'), I('bh-stats.jpg'), I('bh-chart.jpg'), I('bh-dash.jpg'), I('bh-growth.jpg')]),
    job('2026-02-19', 'Hiring a Newsletter Operations Coordinator', 'https://www.notion.so/tomalder/3f3a1965bd7780ec91c3f0f0ee7c04ae', 'Newsletter Operations Coordinator'),
    job('2026-02-11', 'Hiring a Superwriter', 'https://www.notion.so/tomalder/2eea1965bd7780a18aa4c99292f4bc95', 'Superwriter'),
    post('2026-01-21', '2-years-into-strategy-breakdowns', '2 years into Strategy Breakdowns', [I('2-years-into-strategy-breakdowns-3.jpg'), V('2y-film-1.mp4'), V('2y-film-2.mp4'), I('2-years-into-strategy-breakdowns-2.jpg'), V('2y-film-3.mp4'), V('2y-film-4.mp4'), I('2-years-into-strategy-breakdowns-1.jpg')]),
    post('2025-12-17', '2025-wrapped', '2025 Wrapped', [I('wr-5.jpg'), I('wr-4.jpg'), I('wr-3.jpg'), I('wr-2.jpg'), I('wr-1.jpg')]),
    post('2025-02-18', 'lean-creator-stack', 'The Lean Creator Stack', [I('lean-creator-stack-2.jpg'), I('lean-creator-stack-1.jpg'), V('lean-techstack.mp4')]),
    post('2025-01-14', '1-year-full-time', '1.5 years into Strategy Breakdowns', [V('loom-b33f2631c63c49118044751cd98f2fa9.mp4', { play: true, href: 'https://www.loom.com/share/b33f2631c63c49118044751cd98f2fa9' }), V('loom-b5a957918924419b94807d5fd76e68d3.mp4', { play: true, href: 'https://www.loom.com/share/b5a957918924419b94807d5fd76e68d3' }), V('loom-1year.mp4', { play: true, href: 'https://www.loom.com/share/3646fbcf9e254d9ea83a96003fa8ba2c' }), { sticker: 'loom' }], 'https://1year.strategybreakdowns.com/'), // .loom below: a Loom piece, so the click cursor is Loom's play button
    post('2024-08-20', 'strategy-breakdowns-2', 'Redesigning Strategy Breakdowns', [I('2-0-mindmap.jpg'), I('2-0-scope.jpg'), I('2-0-avatars.jpg'), I('2-0-58.jpg'), I('2-0-12.jpg'), I('2-0-36.jpg'), V('wordmark-2-0.mp4'), { sticker: 'notion' }, { sticker: 'figma' }], 'https://tomalder.notion.site/Strategy-Breakdowns-2-0-80fd384bdec44261bdcf54e6c5608d5f'),
    post('2024-06-18', '1-year-into-strategy-breakdowns', '1 year into Strategy Breakdowns', [I('1y-nsm.jpg'), I('1y-writegrowsell.jpg'), I('1y-message.jpg'), I('1y-cash.jpg')]),
    post('2024-01-09', '6-months-into-strategy-breakdowns', '6 months into Strategy Breakdowns', [I('6mo-sources.jpg'), I('6mo-signups.jpg'), I('6mo-revenue.jpg'), I('6mo-workflow.jpg'), V('wordmark-old-click.mp4')]),
  ];
  WRITING.find(p => p.url === 'https://1year.strategybreakdowns.com/').loom = true;
  const ME = { name: 'Tom Alder', line: 'I write about how great companies grow, and build the tools I wish I had.',
    x: 'https://x.com/tomaldertweets', email: 'tom@strategybreakdowns.com', youtube: 'https://www.youtube.com/@Tom-Alder' };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (d, long) => { const [y, m, day] = d.split('-').map(Number); return long ? `${day} ${MON[m - 1]} ${y}` : `${MON[m - 1]} ${y}`; };

  // ---------- the mark player ----------
  // One rAF loop drives every live mark. A mark rests, plays a motion once or on loop, idles through a list of
  // motions with rests between, or runs a custom state function. look(x, y) adds an eased glasses offset to
  // whatever is playing (the specs translate; the engine re-cuts the outline gap where the arm now crosses).
  const live = new Set();
  const now = () => performance.now() / 1000;
  class Mark {
    constructor(el, char, o = {}) {
      this.el = el; this.char = char; this.vb = o.vb || '-40 -75 530 530';
      el.innerHTML = `<svg viewBox="${this.vb}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block;width:100%;height:100%"></svg>`;
      this.svg = el.firstChild; this.cur = null; this.lk = [0, 0]; this.lkT = [0, 0]; this.extra = null;
      this.idleList = null; this.nextIdle = 0; this.dirty = true; this.paused = false;
      live.add(this); this.draw(now());
    }
    play(id, { loop = false, then } = {}) { const m = typeof id === 'string' ? MOTION[id] : id; if (!m) return this; this.cur = { m, t0: now(), loop, then }; this.dirty = true; return this; }
    stop() { this.cur = null; this.dirty = true; return this; }
    // hover loops: hold() loops a motion while hovered; release() lets the loop that is playing run to its end,
    // never cutting or rewinding it. Hovering again before it ends just keeps it looping.
    hold(id) { const m = typeof id === 'string' ? MOTION[id] : id; if (!m) return this;
      if (this.cur && this.cur.m === m) { this.cur.loop = true; return this; } this.idleList = null; return this.play(m, { loop: true }); }
    release(then) { const c = this.cur; if (!c || !c.loop) return this; const t = now(), n = Math.floor((t - c.t0) / c.m.dur); c.t0 += n * c.m.dur; c.loop = false; c.then = then; return this; }
    idle(ids, gap = [2, 5]) { this.idleList = ids; this.gap = gap; this.nextIdle = now() + gap[0] * Math.random() + .4; return this; }
    drive(fn) { this.fn = fn; return this; }
    look(x, y) { this.lkT = [x, y]; return this; }
    busy() { return !!this.cur; }
    destroy() { live.delete(this); }
    state(t) {
      let st;
      if (this.fn) st = this.fn(t);
      else if (this.cur) { const { m, t0, loop } = this.cur; let u = t - t0;
        if (u >= m.dur) { if (loop) u %= m.dur; else { const then = this.cur.then; this.cur = null; then && then(); st = { a: this.char }; } }
        if (!st) st = m.fn(u); }
      else st = { a: this.char };
      if (this.lk[0] || this.lk[1]) { const sp = st.specs || {}; st = { ...st, specs: { ...sp, x: (sp.x || 0) + this.lk[0], y: (sp.y || 0) + this.lk[1] } }; }
      return st;
    }
    draw(t) {
      if (this.idleList && !this.cur && !this.fn && t > this.nextIdle) { this.play(this.idleList[Math.floor(Math.random() * this.idleList.length)]); this.nextIdle = t + 99; this.cur.then = () => { this.nextIdle = now() + this.gap[0] + Math.random() * (this.gap[1] - this.gap[0]); }; }
      const k = .14; this.lk = [this.lk[0] + (this.lkT[0] - this.lk[0]) * k, this.lk[1] + (this.lkT[1] - this.lk[1]) * k];
      const moving = Math.abs(this.lk[0] - this.lkT[0]) > .05 || Math.abs(this.lk[1] - this.lkT[1]) > .05;
      if (!this.cur && !this.fn && !moving && !this.dirty) return;
      this.dirty = false;
      // a mark driven every frame (quicker.chat's) mostly draws the same resting frame: only touch the page when it changes
      const s = this.state(t); if (s === this.lastState) return; this.lastState = s; // a driver handing back the same pose: nothing to do
      const f = LE.frame(s); if (f !== this.lastFrame) { this.svg.innerHTML = f; this.lastFrame = f; }
    }
  }
  (function loop() { const t = now(); for (const m of live) if (!m.paused && m.el.isConnected) m.draw(t); else if (!m.el.isConnected) live.delete(m); requestAnimationFrame(loop); })();

  // the glasses' centre of a mark on screen, for look-at-the-cursor
  function glassesCentre(mark) {
    const r = mark.el.getBoundingClientRect(), [vx, vy, vw, vh] = mark.vb.split(' ').map(Number), s = Math.min(r.width / vw, r.height / vh);
    const S = LE.CH[mark.char].spec, cx = (S.L.x + S.R.x + S.R.w) / 2, cy = S.L.y + S.L.h / 2;
    return [r.left + (r.width - vw * s) / 2 + (cx - vx) * s, r.top + (r.height - vh * s) / 2 + (cy - vy) * s];
  }
  function lookAt(mark, x, y, reach = 16) {
    const [cx, cy] = glassesCentre(mark), dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
    mark.look(dx / d * reach * k, dy / d * reach * .7 * k);
  }

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  root.Site = { live, PROJECTS, WRITING, ME, MOTION, Mark, lookAt, glassesCentre, fmtDate, h, esc, now, LE, LM, variants: [] };
})(window);
