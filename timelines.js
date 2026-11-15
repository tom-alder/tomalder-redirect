// The writing as a ruler of months. Hover a tick and that piece appears under it as a small pile on a desk, and
// stays there until you hover another piece:
// pictures, clips, stickers and sketched pages, each keeping its own shape, stacked with a slight tilt, with
// just the title and date beneath. The pile is still (no animation) until you touch it: drag any item off the
// pile and, once it's clear of the ones underneath, letting go springs it back to the bottom of the pile; let go
// while it's still on the pile and it springs back to where it was. A plain click opens the piece.
// Moving to another tick swaps the pile in from the way you're moving. The pile is anchored to the tick's own
// place on the ruler, so the loupe never drags it sideways.
(function () {
  const { WRITING, esc, fmtDate } = Site;
  const POSTS = [...WRITING].sort((a, b) => a.date < b.date ? -1 : 1).map((p, i) => ({ ...p, i, ts: Date.parse(p.date) }));
  const T0 = Date.parse('2024-01-01'), T1 = Date.parse('2026-11-15'), span = T1 - T0, tpos = ts => (ts - T0) / span;
  const NS = 'http://www.w3.org/2000/svg';
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const months = (() => { const out = [], d = new Date(T0); while (d.getTime() <= T1) { out.push(new Date(d)); d.setMonth(d.getMonth() + 1); } return out; })();

  // real marks: Notion (Simple Icons) black on its white tile, Figma in its own colours, Loom in its purple
  const NOTION = '<svg viewBox="0 0 24 24"><path fill="#000" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.86-1.307-.86-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>';
  const FIGMA = '<svg viewBox="0 0 38 57"><path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>';
  const LOOM = '<svg viewBox="0 0 24 24"><path fill="#625DF5" d="M24 10.665h-7.018l6.078-3.509-1.335-2.312-6.078 3.509 3.508-6.077L16.843.94l-3.508 6.077V0h-2.67v7.018L7.156.94 4.844 2.275l3.509 6.077-6.078-3.508L.94 7.156l6.078 3.509H0v2.67h7.017L.94 16.844l1.335 2.313 6.077-3.508-3.509 6.077 2.312 1.335 3.509-6.078V24h2.67v-7.017l3.508 6.077 2.312-1.335-3.509-6.078 6.078 3.509 1.335-2.313-6.077-3.508h7.017v-2.67H24zm-12 4.966a3.645 3.645 0 1 1 0-7.29 3.645 3.645 0 0 1 0 7.29z"/></svg>';
  const STICKER = { notion: NOTION, figma: FIGMA, loom: LOOM };

  // where each item sits: a loose fan, bottom item first, spread wider the more items there are so you can see a
  // little of each. Stickers land in different spots on each pile (a corner, an edge, poking out), picked from the
  // title so the same piece always looks the same.
  const FAN = {
    1: [[0, 0, -1.5]],
    2: [[-30, 16, -4], [26, -14, 3]],
    3: [[-48, 20, -5], [40, -18, 4], [-2, 4, -1]],
    4: [[-56, -22, -5], [48, 24, 4], [-34, 30, 2.5], [28, -20, -2]],
    5: [[-62, 16, -6], [54, -26, 5], [-40, -30, 2], [44, 30, -3], [0, 0, -1]],
    6: [[-66, -18, -5], [58, 26, 5], [-48, 32, 2], [50, -30, -3], [-14, -8, 1.5], [10, 10, -1]],
    7: [[-74, -20, 0], [66, 24, 0], [-54, 34, 0], [58, -30, 0], [-20, -8, 0], [18, 12, 0], [0, -30, 0]],
    9: [[-80, -26, 0], [72, 28, 0], [-62, 36, 0], [64, -32, 0], [-30, -6, 0], [28, 8, 0], [-4, -34, 0], [6, 36, 0], [0, 0, 0]],
  };
  const ANCHORS = [[1, -1], [-1, -1], [-1, 1], [1, 1], [1, -.35], [-1, .3], [.45, -1], [-.4, 1]];
  function placeStickers(n) {
    const pile = n.querySelector('.pile'), cards = [...pile.querySelectorAll(":scope > .pi")].filter(o => !o.classList.contains('sticker'));
    if (!cards.length) return; const pr = pile.getBoundingClientRect(), cx = pr.left + pr.width / 2, cy = pr.top + pr.height / 2;
    let l = 1e9, t = 1e9, r = -1e9, b = -1e9; for (const c of cards) { const q = c.getBoundingClientRect(); if (!q.width) continue; l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
    if (r < l) return; const mx = (l + r) / 2 - cx, my = (t + b) / 2 - cy, hw = (r - l) / 2 - 8, hh = (b - t) / 2 - 8; // 8px in from the edge: about half the sticker overlaps
    pile.querySelectorAll('.pi.sticker').forEach(st => { if (st._x || st._y) return; st.style.setProperty('--x', (mx + +st.dataset.ax * hw).toFixed(1) + 'px'); st.style.setProperty('--y', (my + +st.dataset.ay * hh).toFixed(1) + 'px'); });
  }
  // no card starts fully buried: any card with less than ~15% of itself showing (judged against the cards stacked
  // above it) is nudged outward from the pile's centre, a step at a time, until a strip of it shows
  function unbury(n) {
    const pile = n.querySelector('.pile'), cards = [...pile.querySelectorAll(":scope > .pi")].filter(o => !o.classList.contains('sticker') && !o._x && !o._y);
    const pr = pile.getBoundingClientRect(), pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
    const shown = (el) => { const r = el.getBoundingClientRect(), z = +el.style.zIndex || 0, above = cards.filter(o => o !== el && (+o.style.zIndex || 0) > z).map(o => o.getBoundingClientRect());
      if (!r.width) return 1; let vis = 0, tot = 0; for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { const x = r.left + r.width * (i + .5) / 10, y = r.top + r.height * (j + .5) / 10; tot++; if (!above.some(q => x > q.left && x < q.right && y > q.top && y < q.bottom)) vis++; } return vis / tot; };
    for (const el of cards.sort((a, b) => (+a.style.zIndex || 0) - (+b.style.zIndex || 0))) {
      const min = +el.dataset.min || .2; // most cards need a strip showing; an "under" card gets a few nudges toward 60% showing, never enough to leave the pile
      for (let step = 0; step < (min > .2 ? 6 : 14) && shown(el) < min; step++) { const r = el.getBoundingClientRect(); let dx = r.left + r.width / 2 - pcx, dy = r.top + r.height / 2 - pcy; const d = Math.hypot(dx, dy);
        if (d < 4) { dx = el._seedX || -1; dy = -.6; } const k = 14 / (Math.hypot(dx, dy) || 1);
        const ny = parseFloat(el.style.getPropertyValue('--y')) + dy * k * .35, roomUp = r.top - pr.top + 4; // mostly sideways, and never up into the ruler
        el.style.setProperty('--x', (parseFloat(el.style.getPropertyValue('--x')) + dx * k).toFixed(1) + 'px'); el.style.setProperty('--y', (dy < 0 ? Math.max(ny, parseFloat(el.style.getPropertyValue('--y')) - Math.max(0, roomUp)) : ny).toFixed(1) + 'px'); }
    }
  }
  const SPOTS = [[118, -96, 9], [-126, -92, -8], [-130, 92, 7], [124, 90, -9], [-158, -6, -12], [-24, -122, 6], [150, 4, 11]];
  const hash = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  // every visit deals the piles afresh: order, tilt and placement are random per visitor (a refresh reshuffles),
  // but steady within a visit, so hovering back to a piece shows the same pile
  const VISIT = (Math.random() * 4294967296) >>> 0;
  const rngFor = str => { let a = (VISIT ^ hash(str)) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const shuffle = (arr, rnd) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function item(it, x, y, r, extra = '') {
    let inner;
    if (it.img) inner = `<img src="${it.img}" alt="" draggable="false">`;
    else if (it.video) inner = `<video src="${it.video}" muted loop playsinline autoplay preload="auto"></video>${it.play ? `<span class="pi-play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>` : ''}`;
    else if (it.sticker) inner = `<span class="pi-tile">${STICKER[it.sticker]}</span>`;
    else if (it.doc) inner = `<span class="pi-doc-bar"><i></i><i></i><i></i></span><span class="pi-doc-t">${esc(it.doc)}</span><span class="pi-doc-img"></span><span class="pi-doc-l" style="width:88%"></span><span class="pi-doc-l" style="width:70%"></span><span class="pi-doc-l" style="width:80%"></span>`;
    else if (it.html) inner = it.html; // add-on piles (playlists.js) bring their own card markup
    else if (it.job) inner = `<span class="pi-job-k">Job ad</span><span class="pi-job-t">${esc(it.job)}</span><span class="pi-job-h">The role</span><span class="pi-doc-l" style="width:92%"></span><span class="pi-doc-l" style="width:70%"></span><span class="pi-job-h">About you</span><span class="pi-doc-l" style="width:84%"></span><span class="pi-doc-l" style="width:58%"></span><span class="pi-job-apply">Apply →</span>`;
    const kind = it.html ? it.cls : it.sticker ? 'sticker' : it.doc ? 'doc' : it.job ? 'job' : it.video ? 'media vid' : 'media';
    return `<div class="pi ${kind}"${it.id ? ` data-id="${it.id}"` : ''}${it.href ? ` data-href="${it.href}"` : ''} ${it.under ? ' data-min=".6"' : ''} style="--x:${x}px;--y:${y}px;--r:${r}deg"${extra}>${inner}</div>`;
  }
  const host = u => { try { const x = new URL(u); return (x.host.replace(/^www\./, '') + x.pathname).replace(/\/$/, ''); } catch (e) { return ''; } };
  // what a click does: 5 new versions (the pile dims and a card to open sits on top; no caption) and the 5 earlier
  // ones (which style the caption under the pile). Picked in the dev panel ("Click"), set as html[data-click].
  const TOPCARD = ['ticket', 'pull', 'press', 'sticky', 'window'];
  function pane(p) {
    const rnd = rngFor(p.title), J = (a) => (rnd() * 2 - 1) * a, tilt = (lo, hi) => (rnd() < .5 ? -1 : 1) * (lo + rnd() * (hi - lo));
    const media = p.pile.filter(it => !it.sticker && !it.stamp), n = media.length;
    const slots = shuffle(FAN[n >= 8 ? 9 : Math.min(7, Math.max(1, n))], rnd), spots = shuffle(SPOTS, rnd); let si = 0, mi = 0; const used = [];
    let deal = shuffle(p.pile.filter(it => !it.stamp), rnd);
    const onTop = it => it.sticker || it.cls === 'filo'; // stickers (and Filo on the playlist pile) always start on top
    deal = deal.filter(it => !onTop(it)).concat(deal.filter(onTop));
    // cards marked "under" go just beneath the top card, in random order (2nd and 3rd from the top), so most of each shows
    const under = shuffle(deal.filter(it => it.under), rnd);
    if (under.length) { const rest = deal.filter(it => !it.under && !onTop(it)); rest.splice(Math.max(0, rest.length - 1), 0, ...under); deal = rest.concat(deal.filter(onTop)); }
    const items = deal.map(it => {
      // stickers pin to a spot on the edge of whatever is on the pile (a corner, or part way along a side), always
      // overlapping it; placeStickers() works out where that edge is once the pile has its size
      if (it.sticker) { // each further sticker takes a spot at least most of a side away from the ones already placed
        const free = ANCHORS.filter(([x, y]) => used.every(([u, v]) => Math.hypot(x - u, y - v) >= 1.4)), pool = free.length ? free : ANCHORS;
        const [ax, ay] = pool[Math.floor(rnd() * pool.length)]; used.push([ax, ay]); si++; return item(it, 0, 0, tilt(4, 13), ` data-ax="${(ax + J(.08)).toFixed(3)}" data-ay="${(ay + J(.08)).toFixed(3)}"`); }
      if (it.pos) { const [x, y, r] = it.pos(rnd); return item(it, x, y, r); } // an add-on card with its own placement
      const [x, y] = slots[mi++ % slots.length]; return item(it, n > 1 ? x + J(12) : J(8), n > 1 ? y + J(10) : J(6), tilt(.8, 6));
    }).join('');
    return `<div class="rc-pane${p.custom ? ' custom ' + p.custom : ''}"><div class="pile${items ? '' : ' empty'}${n >= 6 ? ' big' : ''}">${items}</div><a class="rc-cap" href="${p.url}" target="_blank" rel="noopener"><time><span class="rc-d">${fmtDate(p.date)}</span><span class="rc-q">Open?</span><span class="rc-h">Click again</span></time><span class="rc-t">${esc(p.title)}<i>↗</i></span><b class="rc-open">Open<i>↗</i></b></a><b class="rc-tag">Open ↗</b><button class="rc-go" type="button" aria-label="Open ${esc(p.title)}"><span class="go-bar"><i></i><i></i><i></i><span class="go-url">${esc(host(p.url))}</span></span><span class="go-k">${fmtDate(p.date, true)}</span><span class="go-t">${esc(p.title)}</span><span class="go-a">${p.job ? 'See the role' : 'Read it'} <i>↗</i></span></button></div>`;
  }

  // drag to shuffle, like paper on a desk:
  //   nudge it and let go: it stays where you put it
  //   let go with about 2/3 of it off the rest of the pile: it eases most of the way back in
  //   let go with (nearly) all of it clear: it slides straight back in (ease in and out, no swing out) and tucks in:
  //   the top item goes to the BACK of the pile, any other item slots in at the FRONT
  // Clicking without dragging opens the piece. Nothing jumps to the top just because you touched it.
  function makeDraggable(pane, open) {
    const pile = pane.querySelector('.pile');
    // the stacking order lives in z-index, not in the DOM: moving a node would restart it and kill the glide
    // and it is remembered for the rest of the visit: send a card to the back, hover another piece, come back, and
    // the pile is still in the order you left it
    const key = pane.dataset.key, kids = [...pile.querySelectorAll(":scope > .pi")];
    let order = ORDERS.has(key) ? ORDERS.get(key).map(i => kids[i]).filter(Boolean) : kids;
    kids.forEach(o => { if (!order.includes(o)) order.unshift(o); });
    const stack = () => { order.forEach((o, i) => { o.style.zIndex = i + 1; }); if (key) ORDERS.set(key, order.map(o => kids.indexOf(o))); };
    stack();
    pane._raise = el => { order = order.filter(o => o !== el); order.push(el); stack(); }; // bring a card to the true top
    const offOf = (el, x, y) => { // how much of the item, at offset x/y, sits outside the rest of the pile (0..1)
      const r = el.getBoundingClientRect(), others = [...pile.querySelectorAll(":scope > .pi")].filter(o => o !== el && !o.classList.contains('sticker') && !o.classList.contains('stamp'))
        // where each of the others sits AT HOME, not where it has been dragged: otherwise a card left out of the pile
        // becomes part of it, and the next card dropped beside it counts as "on the pile" and stays out too
        .map(o => { const q = o.getBoundingClientRect(), hx = o._x || 0, hy = o._y || 0; return { left: q.left - hx, top: q.top - hy, right: q.right - hx, bottom: q.bottom - hy }; });
      // a lone card (a job ad) has nothing under it, so it measures against its own home spot instead
      const ex = x - (el._x || 0), ey = y - (el._y || 0), home = { left: r.left - ex - x, top: r.top - ey - y, right: r.right - ex - x, bottom: r.bottom - ey - y };
      const U = others.length ? { l: Math.min(...others.map(o => o.left)), t: Math.min(...others.map(o => o.top)), r: Math.max(...others.map(o => o.right)), b: Math.max(...others.map(o => o.bottom)) }
        : { l: home.left, t: home.top, r: home.right, b: home.bottom };
      const w = Math.max(0, Math.min(r.right, U.r) - Math.max(r.left, U.l)), h = Math.max(0, Math.min(r.bottom, U.b) - Math.max(r.top, U.t));
      return 1 - (w * h) / Math.max(1, r.width * r.height);
    };
    const place = (el, x, y, ms = 0, ease = 'cubic-bezier(.34, 1.56, .64, 1)') => { el.style.transition = ms ? `translate ${ms}ms ${ease}, rotate ${ms}ms ${ease}` : 'none'; el.style.translate = `${x}px ${y}px`; el._x = x; el._y = y; };
    pile.addEventListener('pointerdown', e => {
      const el = e.target.closest('.pi'); if (!el) return; e.preventDefault();
      // "on top" means what you see: nothing else covers it. A sticker sitting a little higher in the stack doesn't
      // count, so dragging the visible front card away always sends it to the back.
      const er = el.getBoundingClientRect(), hits = (q) => q.left < er.right && q.right > er.left && q.top < er.bottom && q.bottom > er.top;
      const shownOnTop = el.classList.contains('sticker') || ![...pile.querySelectorAll(":scope > .pi")].some(o => o !== el && !o.classList.contains('sticker') && +o.style.zIndex > +el.style.zIndex && hits(o.getBoundingClientRect()));
      const sx = e.clientX, sy = e.clientY, ox = el._x || 0, oy = el._y || 0; let dx = 0, dy = 0, moved = false;
      el.setPointerCapture(e.pointerId); el.classList.add('drag'); pane.dragging = true;
      const move = ev => { dx = ev.clientX - sx; dy = ev.clientY - sy; if (Math.hypot(dx, dy) > 4) moved = true;
        place(el, ox + dx, oy + dy); el.style.rotate = `${Math.max(-10, Math.min(10, dx * .04))}deg`; };
      const up = () => {
        el.style.transition = ''; // hand transitions back to the stylesheet (the drag set its own)
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('drag'); pane.dragging = false; pane.heldUntil = performance.now() + 1100;
        if (!moved) { el.style.rotate = ''; open(el); return; }
        const x = ox + dx, y = oy + dy, off = offOf(el, x, y), isTop = shownOnTop;
        const rot0 = parseFloat(el.style.rotate) || 0;
        // 1 continuous motion: the card tilts a touch as it starts back, and the rest of the rotation happens as it
        // slides, never a separate wiggle before the slide
        const glide = (tx, ty, ms, ease = 'cubic-bezier(.33, .8, .25, 1)') => { el.style.transition = 'none';
          const d = Math.hypot(x, y) || 1, frames = [{ translate: `${x}px ${y}px`, rotate: `${rot0}deg` }];
            frames.push({ translate: `${tx}px ${ty}px`, rotate: '0deg' });
          const an = el.animate(frames, { duration: ms, easing: ease });
          el.style.translate = `${tx}px ${ty}px`; el.style.rotate = ''; el._x = tx; el._y = ty; return an; };
        if (off < .5) { glide(x, y, 320); return; } // stays where you put it, just settling its tilt
        if (off < .88) { glide(x * .28, y * .28, 620); return; } // eases most of the way back
        // clear of the pile: it slides straight back in, easing in and out, and swaps layer while it's still clear,
        // so it tucks in behind (top card) or in front (any other)
        glide(0, 0, 700, 'cubic-bezier(.55, 0, .3, 1)'); // straight home, easing in and out: no swing out, no slingshot
        // and on the way back it settles to a normal size and tilt: scale back to 1, and a tilt beyond the usual
        // deal range (about 6 degrees) comes back inside it, keeping its direction
        { const s0 = el._s || 1, r0 = parseFloat(el.style.getPropertyValue('--r')) || 0, rn = Math.abs(r0) <= 6 ? r0 : Math.sign(r0) * (2.5 + Math.random() * 3.5);
          if (s0 !== 1 || rn !== r0) { el.animate([{ '--s': s0, '--r': r0 + 'deg' }, { '--s': 1, '--r': rn + 'deg' }], { duration: 700, easing: 'cubic-bezier(.55, 0, .3, 1)' });
            el.style.setProperty('--s', 1); el._s = 1; el.style.setProperty('--r', rn.toFixed(2) + 'deg'); } }
        const lone = !el.classList.contains('sticker') && order.filter(o => !o.classList.contains('sticker')).length < 2; // a lone card just comes home
        if (!lone) setTimeout(() => { order = order.filter(o => o !== el); if (isTop) order.unshift(el); else order.push(el); stack(); }, 230);
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }
  const ORDERS = new Map(); // per piece: its pile's stacking order, as indexes into the dealt cards
  const spring = (v, target, vel, k = 210, d = 24, dt = 1 / 60) => { vel += (k * (target - v) - d * vel) * dt; return [v + vel * dt, vel]; };

  function rulerCard(root) {
    const el = h(`<div class="tl tl-rc"><svg class="tl-axis"></svg><div class="rc-card"><div class="rc-clip"></div></div></div>`); root.append(el);
    const svg = el.querySelector('svg'), card = el.querySelector('.rc-card'), clip = el.querySelector('.rc-clip');
    const items = months.map((m, k) => ({ x0: tpos(m.getTime()), year: m.getMonth() === 0 || k === 0 ? m.getFullYear() : null })).concat(POSTS.map(p => ({ x0: tpos(p.ts), post: p })));
    items.forEach(it => { it.ex = 0; it.ln = document.createElementNS(NS, 'line'); it.ln.setAttribute('class', it.post ? (it.post.job ? 'pt job' : 'pt') : it.year ? 'yr' : 'mo'); svg.append(it.ln);
      if (it.year) { it.tx = document.createElementNS(NS, 'text'); it.tx.textContent = it.year; svg.append(it.tx); } });
    const K = .35; // a gentle loupe
    let guard = 0, gx0 = null; // after an add-on pile opens (the Spotify icon), the ruler sits out the trip down to it
    let W = 600, mx = null, lastMx = 0, k = 0, active = null, open = false, overCard = false, closeT = 0, cur = null, raf;
    const S = { x: 0, vx: 0, o: 0, vo: 0 }, target = { x: 0, w: 300 };
    const fish = x => { if (k < .001) return x; const c = mx ?? lastMx, d = x - c, D = d < 0 ? c : W - c, a = Math.abs(d) / (D || 1); return c + Math.sign(d) * D * ((1 + k) * a / (1 + k * a)); };
    function show(p, dir) {
      clip.querySelectorAll('.rc-pane.out').forEach(n => n.remove()); // never more than 1 leaving: no stacked text
      if (cur && cur.classList.contains('focus') && Site.clickClose) Site.clickClose(cur); // a new piece: the old cursor goes
      if (cur) { const old = cur; old.classList.remove('in'); old.classList.add('out'); old.style.setProperty('--dx', (-dir * 18) + 'px'); old.querySelectorAll('video').forEach(v => v.pause()); setTimeout(() => old.remove(), 240); }
      const n = h(pane(p)); n.dataset.key = p.title; n.style.setProperty('--dx', (dir * 18) + 'px'); clip.append(n); cur = n;
      n.querySelectorAll('video').forEach(v => { v.currentTime = 0; v.play().catch(() => {}); });
      // a first click never leaves the page: it lights up the link and offers to open it. A second click on the
      // pile, or a click on the link itself, goes there. The offer fades after 5s or when you click away.
      const go = () => { n.classList.remove('ask'); window.open(p.url, '_blank', 'noopener'); };
      n._arm = (card) => { if (p.onArm) return p.onArm(card, n); if (Site.CLICK_MODES && Site.CLICK_MODES.includes(document.documentElement.dataset.click)) { Site.clickArm(n, p, card); return; }
        if (n.classList.contains('ask')) return go(); n.querySelectorAll('.pi.picked').forEach(q => q.classList.remove('picked')); if (card) card.classList.add('picked'); n.classList.add('ask'); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('ask'), 5000); };
      n.querySelector('.rc-cap').addEventListener('click', () => { clearTimeout(n._t); n.classList.remove('ask'); });
      const tag = n.querySelector('.rc-tag');
      n.addEventListener('pointermove', e => { const r = n.getBoundingClientRect(); tag.style.left = (e.clientX - r.left) + 'px'; tag.style.top = (e.clientY - r.top) + 'px'; });
      makeDraggable(n, n._arm);
      // the title always sits the same distance (22px) below the lowest card, whatever this visit's deal did
      const gapUnder = () => { const pile = n.querySelector('.pile'), cap = n.querySelector('.rc-cap'), items = [...pile.querySelectorAll(":scope > .pi")]; if (!items.length) return;
        n.style.setProperty('--pt', '0px');
        pile.style.marginTop = '0px'; const poke = pile.getBoundingClientRect().top - Math.min(...items.map(o => o.getBoundingClientRect().top)); if (poke > 0) { pile.style.marginTop = Math.round(poke) + 'px'; n.style.setProperty('--pt', Math.round(poke) + 'px'); } // a tilted card that pokes up pushes the pile down, never into the ruler
        const pb = pile.getBoundingClientRect().bottom, low = Math.max(...items.map(o => o.getBoundingClientRect().bottom)); if (!isFinite(low)) return;
        cap.style.marginTop = Math.max(-200, Math.round(low - pb + 22)) + 'px'; };
      const settle = () => { unbury(n); placeStickers(n); gapUnder(); }; // after makeDraggable, so the stacking order is set
      settle(); n.querySelectorAll('img, video').forEach(m => m.addEventListener(m.tagName === 'IMG' ? 'load' : 'loadedmetadata', settle, { once: true }));
      target.w = n.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('in')));
    }
    // a hook for add-on modes (playlists.js): show any pane under the ruler, centred, until a tick is hovered again
    // add-on piles: a post-like object (custom pile items, its own click) shown under the ruler, centred
    Site.rcShowPost = (p) => { guard = performance.now() + 4000; gx0 = null; p.i = -1; p.ts = T0 + span / 2; const dir = 0; active = p; show(p, dir); open = true; };
    Site.rcShowCustom = (n) => {
      clip.querySelectorAll('.rc-pane.out').forEach(o => o.remove());
      if (cur) { const old = cur; old.classList.remove('in'); old.classList.add('out'); old.style.setProperty('--dx', '0px'); old.querySelectorAll('video').forEach(v => v.pause()); setTimeout(() => old.remove(), 240); }
      clip.append(n); cur = n; active = { i: -1, ts: T0 + span / 2, custom: true }; open = true; target.w = n.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('in')));
    };
    (function tick() {
      W = el.clientWidth; svg.setAttribute('viewBox', `0 0 ${W} 64`);
      k += ((mx == null ? 0 : K) - k) * .1;
      let best = null, bd = 1e9;
      for (const it of items) {
        const x = fish(it.x0 * W), d = mx == null ? 999 : Math.abs(x - mx), mag = Math.exp(-(((x - (mx ?? lastMx)) / 60) ** 2)) * k / K;
        if (it.post) it.ex += (((it.post === active && open) ? 4 : 0) - it.ex) * .14;
        const hgt = (it.post ? 16 : it.year ? 10 : 5) * (1 + mag * .35) + (it.post ? it.ex : 0);
        it.ln.setAttribute('x1', x.toFixed(2)); it.ln.setAttribute('x2', x.toFixed(2)); it.ln.setAttribute('y1', (40 - hgt).toFixed(2)); it.ln.setAttribute('y2', 40);
        if (it.tx) { it.tx.setAttribute('x', x.toFixed(2)); it.tx.setAttribute('y', 58); }
        if (it.post) { if (d < bd) { bd = d; best = it.post; } it.ln.classList.toggle('on', it.post === active && open); }
      }
      if (mx != null && best && bd < 34) { if (best !== active) { const dir = active ? Math.sign(best.i - active.i) : 0; active = best; show(best, dir); } open = true; closeT = 0; }
      // it stays open until you hover another piece
      if (active) { const ax = tpos(active.ts) * W, er = el.getBoundingClientRect(); target.x = Math.max(12 - er.left, Math.min(innerWidth - er.left - target.w - 12, ax - target.w / 2)); }
      if (S.o < .02 && open) { S.x = target.x; S.vx = 0; }
      [S.x, S.vx] = spring(S.x, target.x, S.vx); [S.o, S.vo] = spring(S.o, open ? 1 : 0, S.vo, 260, 30);
      const o = Math.max(0, Math.min(1, S.o));
      card.style.transform = `translate(${S.x.toFixed(1)}px, ${((1 - o) * -6).toFixed(2)}px)`;
      card.style.opacity = o.toFixed(3); card.style.pointerEvents = o > .5 ? 'auto' : 'none';
      raf = requestAnimationFrame(tick);
    })();
    // the ruler ignores you while you resize a card, and while you're over (or within 24px of) the open pile's cards,
    // so enlarging a card over the ruler never swaps the piece out from under you
    const nearPile = (x, y) => cur && [...cur.querySelectorAll('.pile .pi')].some(o => { const r = o.getBoundingClientRect(); return x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24; });
    // the trip from the Spotify icon down to its pile crosses the ruler: it is ignored until you reach the pile, run
    // along the ruler (over 220px sideways), or 4s pass
    addEventListener('pointermove', e => { if (guard && nearPile(e.clientX, e.clientY)) guard = 0; });
    const tripping = e => { if (!guard) return false; if (performance.now() > guard) { guard = 0; return false; } if (gx0 == null) gx0 = e.clientX;
      if (Math.abs(e.clientX - gx0) > 220) { guard = 0; return false; } return true; };
    svg.addEventListener('pointermove', e => { if (tripping(e)) { mx = null; return; } if (resizing || (S.o > .5 && nearPile(e.clientX, e.clientY))) { mx = null; return; } mx = lastMx = e.clientX - svg.getBoundingClientRect().left; });
    svg.addEventListener('pointerleave', () => { mx = null; });
    svg.addEventListener('click', () => { if (active && open && cur && cur._arm) cur._arm(); });
    // a click off the pile (anywhere that isn't a card, its open-card or the ruler) fades it away and returns to the
    // page as it first loaded: no pile, no piece picked
    document.addEventListener('pointerdown', e => {
      if (!cur || !open) return; if (e.target.closest && e.target.closest('.pi, .rc-go .g-hit, .rc-go .g-disc, .tl-axis, .rc-hd, .dev')) return;
      // with the cursor up, a click inside its zone (64px round the cards) opens instead; any further out dismisses the
      // cursor and the pile together, in 1 click
      if (document.documentElement.classList.contains('gc-on') && [...cur.querySelectorAll('.pile .pi')].some(o => { const r = o.getBoundingClientRect(); return e.clientX > r.left - 64 && e.clientX < r.right + 64 && e.clientY > r.top - 64 && e.clientY < r.bottom + 64; })) return;
      if (cur.classList.contains('focus') && Site.clickClose) Site.clickClose(cur);
      const gone = cur; open = false; active = null; mx = null;
      setTimeout(() => { if (cur === gone && !open) { gone.remove(); cur = null; } }, 450);
    });
    // corner handles, like a transform box. Only a corner you can actually see (nothing on top of it) counts. Within
    // NEAR px of it, everything ramps together with your distance (0 at the edge of the zone, full at the corner):
    // the cursor turns to a crosshair, the purple handle fades in (tilted with the card, sitting on the rounded
    // corner's arc), that card's own drop shadow turns purple and very slightly deeper, and its 2 edges meeting there
    // pick up a purple gradient (80% at the corner, fading out a set distance along each side). Pressing in that zone
    // resizes: always proportional, always from the card's centre, the whole outline purple while you hold.
    const hd = h('<div class="rc-hd"></div>'); document.body.append(hd);
    let hot = null, resizing = false, resizedAt = 0;
    const NEAR = 48, EDGE = 130;
    // the visible shape: a sticker's tile; a playlist cover's sleeve while it is showing
    const sleeve = o => o.classList.contains('cover') && o.classList.contains('flip') ? o.querySelector('.pl-back') : null;
    const shapeOf = o => sleeve(o) || o.querySelector('.pi-tile') || o;
    const boxOf = o => { const sl = sleeve(o);
      if (sl) { // its size from layout (inside the 60% zoom); its offset from the card's centre measured live and un-rotated
        const r = o.getBoundingClientRect(), q = sl.getBoundingClientRect(), vx = q.left + q.width / 2 - (r.left + r.width / 2), vy = q.top + q.height / 2 - (r.top + r.height / 2), sc = o._s || 1;
        const a = -((parseFloat(o.style.getPropertyValue('--r')) || 0) + (parseFloat(o.style.rotate) || 0)) * Math.PI / 180;
        return { w: sl.offsetWidth * .6, h: sl.offsetHeight * .6, dx: (vx * Math.cos(a) - vy * Math.sin(a)) / sc, dy: (vx * Math.sin(a) + vy * Math.cos(a)) / sc, rad: 16 * .6 }; }
      const t = shapeOf(o); return { w: t.offsetWidth, h: t.offsetHeight, dx: 0, dy: 0, rad: parseFloat(getComputedStyle(t).borderTopLeftRadius) || 0 }; };
    const geom = o => { const bx = boxOf(o), r = o.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, sc = o._s || 1;
      const w = bx.w * sc / 2, hh = bx.h * sc / 2, rad = bx.rad * sc, inset = Math.min(4, rad * (1 - Math.SQRT1_2) * .45); // just inside the corner: under half the way to the arc, and never more than 4px in however big the card is
      const deg = (parseFloat(o.style.getPropertyValue('--r')) || 0) + (parseFloat(o.style.rotate) || 0), a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
      const pt = (lx, ly) => { lx += bx.dx * sc; ly += bx.dy * sc; return [cx + c * lx - sn * ly, cy + sn * lx + c * ly]; };
      return { deg, cx, cy, corners: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => ({ sx, sy, p: pt(sx * (w - inset), sy * (hh - inset)), probe: pt(sx * (w - inset - 7), sy * (hh - inset - 7)) })) }; };
    const visibleAt = (o, [x, y]) => { for (const e of document.elementsFromPoint(x, y)) { if (hd.contains(e)) continue; return e.closest('.pi') === o; } return false; };
    // every visible corner within NEAR of the pointer is live at once, each at its own strength (closer = stronger),
    // whatever the pointer happens to be over. Each live corner gets its own handle and edge gradient; a card's
    // purple shadow follows its strongest live corner.
    const live = new Map(); // key -> { o, cn, k, ed, sq }
    const keyOf = (o, cn) => (o.dataset.lk || (o.dataset.lk = Math.random().toString(36).slice(2))) + cn.sx + cn.sy + (sleeve(o) ? 's' : '');
    const paint = (list, all) => {
      const keep = new Set(list.map(a => a.key)), hp = new Map();
      for (const [key, L] of live) if (!keep.has(key)) { L.ed.remove(); L.sq.remove(); live.delete(key); }
      for (const a of list) { let L = live.get(a.key);
        if (!L || !L.ed.isConnected || L.ed.parentElement !== shapeOf(a.o)) { if (L) { L.ed.remove(); L.sq.remove(); }
          const ed = document.createElement('span'); ed.className = 'pi-edge'; ed.style.setProperty('--ea', 0); shapeOf(a.o).append(ed);
          const sq = document.createElement('b'); sq.className = 'rc-sq'; hd.append(sq); L = { ed, sq }; live.set(a.key, L); }
        Object.assign(L, a);
        L.sq.style.left = a.cn.p[0] + 'px'; L.sq.style.top = a.cn.p[1] + 'px'; L.sq.style.setProperty('--deg', a.deg + 'deg'); L.sq.style.setProperty('--k', a.k.toFixed(3));
        L.ed.style.setProperty('--ea', all ? 1 : a.k.toFixed(3)); L.ed.style.setProperty('--ex', a.cn.sx < 0 ? '0%' : '100%'); L.ed.style.setProperty('--ey', a.cn.sy < 0 ? '0%' : '100%');
        L.ed.style.setProperty('--L', (EDGE / (sleeve(a.o) ? .6 : 1)).toFixed(1) + 'px'); // in the card's own units: the gradient grows with the card L.ed.classList.toggle('all', !!all);
        const prev = hp.get(a.o); if (!prev || a.k > prev.k) hp.set(a.o, a); }
      // per card: the purple shadow follows its strongest live corner, and its own black outline fades out by the same
      // gradient (centred on that corner) that the purple edge fades in; while resizing the outline is all purple
      if (cur) cur.querySelectorAll('.pile .pi').forEach(o => { const a = hp.get(o), st = o.style;
        st.setProperty('--hp', a ? (all ? 1 : a.k).toFixed(3) : 0); st.setProperty('--kea', a ? (all ? 1 : a.k).toFixed(3) : 0); o.classList.toggle('kl-off', !!(a && all));
        if (a) { st.setProperty('--kex', a.cn.sx < 0 ? '0%' : '100%'); st.setProperty('--key', a.cn.sy < 0 ? '0%' : '100%'); st.setProperty('--kL', EDGE + 'px'); } });
    };
    // what the pointer asks for (each corner's target strength) is instant; what you see eases toward it on a damped
    // spring (ease in and out, ~0.45s), so a quick dash onto a corner ramps up smoothly and a quick sweep past one
    // only rises a little before easing back to nothing. The crosshair and the press respond to the target, at once.
    const sm = new Map(); // key -> { o, cn, deg, g, target, k, v }
    let smRaf = 0, frozen = false;
    const setTargets = list => {
      const seen = new Set(list.map(a => a.key));
      for (const a of list) { const m = sm.get(a.key); if (m) Object.assign(m, a, { target: a.k, k: m.k, v: m.v }); else sm.set(a.key, { ...a, target: a.k, k: 0, v: 0 }); }
      for (const [key, m] of sm) if (!seen.has(key)) m.target = 0;
      document.documentElement.classList.toggle('hd-near', list.length > 0);
      hot = list.length ? list.reduce((m, a) => (a.k > m.k ? a : m)) : null;
      if (!smRaf) { let last = performance.now(); smRaf = requestAnimationFrame(function step(t) {
        const dt = Math.min(.05, (t - last) / 1000); last = t; let alive = false;
        for (const [key, m] of sm) { m.v += (110 * (m.target - m.k) - 21 * m.v) * dt; m.k = Math.max(0, Math.min(1, m.k + m.v * dt));
          if (m.target === 0 && m.k < .004 && Math.abs(m.v) < .02) sm.delete(key); else if (Math.abs(m.target - m.k) > .002 || Math.abs(m.v) > .005) alive = true; // settled: stop repainting
          if (m.o.isConnected) { const g = geom(m.o), c2 = g.corners.find(q => q.sx === m.cn.sx && q.sy === m.cn.sy); if (c2) { m.cn = c2; m.g = g; m.deg = g.deg; } } }
        if (!frozen) paint([...sm.values()].filter(m => m.k > .003 && m.o.isConnected).map(m => ({ key: m.key, o: m.o, g: m.g, cn: m.cn, deg: m.deg, k: m.k })));
        smRaf = alive ? requestAnimationFrame(step) : 0; }); }
    };
    const hideHd = () => setTargets([]);
    document.addEventListener('pointermove', e => {
      if (resizing) return; if (!cur || cur.dragging || S.o < .6 || !cur.isConnected || cur.classList.contains('focus')) return hideHd();
      const list = [];
      for (const o of cur.querySelectorAll('.pile .pi:not(.filo)')) { const g = geom(o); for (const cn of g.corners) { const d = Math.hypot(e.clientX - cn.p[0], e.clientY - cn.p[1]);
        if (d < NEAR && visibleAt(o, cn.probe)) list.push({ key: keyOf(o, cn), o, g, cn, deg: g.deg, k: Math.max(0, Math.min(1, 1 - (d - 6) / (NEAR - 6))) }); } }
      setTargets(list);
    });
    // pressing resizes the strongest live corner, unless you're over a different card and not right on the corner
    // (then the press drags that card as usual)
    document.addEventListener('pointerdown', e => {
      if (!hot || resizing) return;
      let under = null; for (const el of document.elementsFromPoint(e.clientX, e.clientY)) { if (hd.contains(el)) continue; under = el.closest('.pi'); break; }
      if (under && under !== hot.o && hot.k < .7) return;
      e.preventDefault(); e.stopPropagation(); const { o, g, cn } = hot; resizing = true; frozen = true; hd.classList.add('grab'); paint([{ ...hot, k: 1 }]);
      // while you hold, the whole outline turns purple: a purple ring fades in over the card's shape and its black
      // outline fades out; on release they swap back, both ways eased
      const ringIn = shapeOf(o); let ring = ringIn.querySelector(':scope > .pi-ring'); if (!ring) { ring = document.createElement('span'); ring.className = 'pi-ring'; ringIn.append(ring); }
      clearTimeout(ring._t); requestAnimationFrame(() => ring.classList.add('on')); o.classList.add('kl-fade');
      // one gesture, 2 effects: moving toward or away from the card's centre scales it (always proportional), and
      // moving around the centre rotates it, so a diagonal drag does both at once
      const d0 = Math.max(8, Math.hypot(e.clientX - g.cx, e.clientY - g.cy)), s0 = o._s || 1, a0 = Math.atan2(e.clientY - g.cy, e.clientX - g.cx), r0 = parseFloat(o.style.getPropertyValue('--r')) || 0;
      const mv = ev => { const sc = Math.max(.6, Math.min(3, s0 * Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) / d0)); o._s = sc; o.style.setProperty('--s', sc.toFixed(3));
        let da = (Math.atan2(ev.clientY - g.cy, ev.clientX - g.cx) - a0) * 180 / Math.PI; da = ((da + 540) % 360) - 180; o.style.setProperty('--r', (r0 + da).toFixed(2) + 'deg');
        const g2 = geom(o), c2 = g2.corners.find(q => q.sx === cn.sx && q.sy === cn.sy); paint([{ key: keyOf(o, c2), o, g: g2, cn: c2, deg: g2.deg, k: 1 }]); };
      const up = () => { removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); resizing = false; frozen = false; hd.classList.remove('grab'); ring.classList.remove('on'); o.classList.remove('kl-fade'); ring._t = setTimeout(() => ring.remove(), 400); sm.forEach(m => { m.k = m.key === hot?.key ? 1 : m.k; }); hideHd(); resizedAt = performance.now(); };
      addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
    }, true);
    // the click that ends a resize is not a click on the card
    document.addEventListener('click', e => { if (performance.now() - resizedAt < 400) { e.stopPropagation(); e.preventDefault(); } }, true);
    card.addEventListener('pointerenter', () => { overCard = true; }); card.addEventListener('pointerleave', () => { overCard = false; closeT = performance.now(); });
    return () => cancelAnimationFrame(raf);
  }

  Site.timelines = [{ id: 'ruler-pile', name: 'Ruler + pile', mount: rulerCard }];
})();
