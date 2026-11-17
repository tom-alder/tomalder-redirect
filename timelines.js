// The writing as a ruler of months. Hover a tick and that piece appears under it as a small pile on a desk, and
// stays there until you hover another piece:
// pictures, clips, stickers and sketched pages, each keeping its own shape, stacked with a slight tilt, with
// just the title and date beneath. The pile is still (no animation) until you touch it: drag any item off the
// pile and, once it's clear of the ones underneath, letting go springs it back to the bottom of the pile; let go
// while it's still on the pile and it springs back to where it was. A plain click opens the piece.
// Moving to another tick swaps the pile in from the way you're moving. The pile is anchored to the tick's own
// place on the ruler, so the loupe never drags it sideways.
// On a touchscreen a finger on a card drags it straight away, any way it goes, while the page holds still; a swipe that
// starts off the cards scrolls the page. 2 fingers on the pile pinch a card bigger or smaller.
(function () {
  const { WRITING, esc, fmtDate } = Site;
  const POSTS = [...WRITING].sort((a, b) => a.date < b.date ? -1 : 1).map((p, i) => ({ ...p, i, ts: Date.parse(p.date) }));
  // ---------- every pile's pictures and clips, fetched before anyone asks for them ----------
  // Once the page has loaded and gone quiet, the piles' pictures (and each clip's first frame) download in the
  // background: the newest piece's first, then the playlists', then the rest, newest to oldest. So hovering a date shows
  // its pile complete at once instead of filling in. On a computer the clips follow, 1 at a time, each into a hidden
  // player of its own; when its pile appears, that same player goes into the card, already loaded, and starts at once
  // (about 3x faster than streaming it, in Chrome and Safari alike, and nothing downloads twice; a plain download into the
  // browser's cache doesn't do it, because Safari's video player ignores that cache and downloads again). A phone or tablet skips
  // the clips to spare a data plan (it already has each clip's first frame, and the clip plays as it streams), and a
  // connection that asks to save data, or is slow, skips the lot.
  const media = (() => {
    const piles = [], kept = [], players = new Map(); let started = false;
    const net = navigator.connection || {}, thin = !!net.saveData || /2g|3g/.test(net.effectiveType || '');
    const roomy = !matchMedia('(hover: none)').matches; // a mouse: a computer, with the memory for decoded pictures and loaded clips
    const urlsOf = pile => { const out = []; for (const it of pile) { if (it.img) out.push(it.img); if (it.video) out.push(it.video.replace(/\.mp4$/, '-poster.jpg'), it.video);
      for (const m of (it.html || STICKER[it.sticker] || '').matchAll(/src="([^"]+)"/g)) out.push(m[1]); } return out; };
    // a picture is kept (so the browser holds it ready) and, on a computer, decoded too, so it draws the instant it's shown
    const pic = u => new Promise(done => { const im = new Image(); im.decoding = 'async'; im.fetchPriority = 'low';
      im.onload = () => { kept.push(im); if (roomy && im.decode) im.decode().then(done, done); else done(); }; im.onerror = done; im.src = u; });
    // a clip's hidden player is handed out as soon as it exists: half-loaded still beats starting from nothing
    const clip = u => new Promise(done => { const v = document.createElement('video');
      v.muted = v.loop = v.playsInline = true; v.preload = 'auto'; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.poster = u.replace(/\.mp4$/, '-poster.jpg');
      let t = 0; const fin = () => { clearTimeout(t); v.removeEventListener('canplaythrough', fin); v.removeEventListener('error', fin); done(); };
      v.addEventListener('canplaythrough', fin); v.addEventListener('error', fin); t = setTimeout(fin, 20000); players.set(u, v); v.src = u; });
    function start() { if (started || thin) return; started = true;
      const all = [...new Set(piles.sort((a, b) => a.rank - b.rank).flatMap(p => urlsOf(p.pile)))];
      const pics = all.filter(u => !/\.mp4$/.test(u)), clips = roomy ? all.filter(u => /\.mp4$/.test(u)) : [];
      let busy = 0; // 4 pictures at a time; the clips 1 at a time once the pictures are in
      const pump = () => { while (busy < 4 && pics.length) { busy++; pic(pics.shift()).then(() => { busy--; pump(); }); }
        if (!busy && clips.length) { busy++; clip(clips.shift()).then(() => { busy--; pump(); }); } };
      pump(); }
    const later = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 600));
    if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
    return { pile: (rank, pile) => piles.push({ rank, pile }),
      // the clip's hidden player, unless it's already in use (still in a pile that's fading out) or failed to load
      take: u => { const v = players.get(u); return v && !v.isConnected && !v.error ? v : null; },
      state: () => ({ started, thin, roomy, pics: kept.length, clips: players.size, loaded: [...players.values()].filter(v => v.readyState >= 4).length }) };
  })();
  POSTS.slice().reverse().forEach((p, i) => media.pile(i ? i + 1 : 0, p.pile)); // the newest first; the playlists (playlists.js) take rank 1
  Site.media = media;
  const T0 = Date.parse('2024-01-01'), T1 = Date.parse('2026-11-15'), span = T1 - T0, tpos = ts => (ts - T0) / span;
  const NS = 'http://www.w3.org/2000/svg';
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  // touch: when a finger (or a pen) last came down, so hover code can ignore the pretend mouse events a tap sends after it
  Site.touchAt = -Infinity; addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') Site.touchAt = performance.now(); }, true);
  Site.touchy = () => performance.now() - Site.touchAt < 1200;
  // how far a pile is scaled down to fit a narrow screen (1 = full size)
  const zOf = el => { const p = el && el.closest && el.closest('.rc-pane'); return (p && p._z) || 1; };
  const months = (() => { const out = [], d = new Date(T0); while (d.getTime() <= T1) { out.push(new Date(d)); d.setMonth(d.getMonth() + 1); } return out; })();

  // real marks: Notion (Simple Icons) black on its white tile, Figma in its own colours, Loom in its purple
  const NOTION = '<svg viewBox="0 0 24 24"><path fill="#000" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.86-1.307-.86-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>';
  const FIGMA = '<svg viewBox="0 0 38 57"><path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>';
  const LOOM = '<svg viewBox="0 0 24 24"><path fill="#625DF5" d="M24 10.665h-7.018l6.078-3.509-1.335-2.312-6.078 3.509 3.508-6.077L16.843.94l-3.508 6.077V0h-2.67v7.018L7.156.94 4.844 2.275l3.509 6.077-6.078-3.508L.94 7.156l6.078 3.509H0v2.67h7.017L.94 16.844l1.335 2.313 6.077-3.508-3.509 6.077 2.312 1.335 3.509-6.078V24h2.67v-7.017l3.508 6.077 2.312-1.335-3.509-6.078 6.078 3.509 1.335-2.313-6.077-3.508h7.017v-2.67H24zm-12 4.966a3.645 3.645 0 1 1 0-7.29 3.645 3.645 0 0 1 0 7.29z"/></svg>';
  // beehiiv: its own app icon (the white hive on its pink-to-blue tile, render-kit's beehiiv-stack logo), filling the tile
  // inside the white rim, the way a die-cut sticker looks
  const BEEHIIV = '<img class="pi-mark" src="assets/sticker-beehiiv.jpg" alt="" draggable="false">';
  const STICKER = { notion: NOTION, figma: FIGMA, loom: LOOM, beehiiv: BEEHIIV };

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
    const z = zOf(pile); // measured on screen, placed in the pile's own (unscaled) units
    pile.querySelectorAll('.pi.sticker').forEach(st => { if (st._x || st._y) return; st.style.setProperty('--x', ((mx + +st.dataset.ax * hw) / z).toFixed(1) + 'px'); st.style.setProperty('--y', ((my + +st.dataset.ay * hh) / z).toFixed(1) + 'px'); });
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
        const ny = parseFloat(el.style.getPropertyValue('--y')) + dy * k * .35, roomUp = (r.top - pr.top + 4) / zOf(pile); // mostly sideways, and never up into the ruler
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
    else if (it.video) inner = `<video data-src="${it.video}" poster="${it.video.replace(/\.mp4$/, '-poster.jpg')}" muted loop playsinline autoplay preload="auto"></video>${it.play ? `<span class="pi-play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>` : ''}`;
    else if (it.sticker) inner = `<span class="pi-tile">${STICKER[it.sticker]}</span>`;
    else if (it.doc) inner = `<span class="pi-doc-bar"><i></i><i></i><i></i></span><span class="pi-doc-t">${esc(it.doc)}</span><span class="pi-doc-img"></span><span class="pi-doc-l" style="width:88%"></span><span class="pi-doc-l" style="width:70%"></span><span class="pi-doc-l" style="width:80%"></span>`;
    else if (it.html) inner = it.html; // add-on piles (playlists.js) bring their own card markup
    else if (it.job) inner = `<span class="pi-job-k">Job ad</span><span class="pi-job-t">${esc(it.job)}</span><span class="pi-job-h">The role</span><span class="pi-doc-l" style="width:92%"></span><span class="pi-doc-l" style="width:70%"></span><span class="pi-job-h">About you</span><span class="pi-doc-l" style="width:84%"></span><span class="pi-doc-l" style="width:58%"></span><span class="pi-job-apply">Apply →</span>`;
    if (it.back) inner += it.back; // a sleeve that shows on click (playlists.js: the desk photo and clip carry 1 for Tom's Spotify profile)
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
    // a pile shrunk to fit a narrow screen is scaled as a whole (zOf), so pointer movement on screen is divided by that
    // scale before it moves a card, and a card's own offsets are multiplied by it before they're compared on screen
    const offOf = (el, x, y) => { // how much of the item, at offset x/y, sits outside the rest of the pile (0..1)
      const z = zOf(pile), r = el.getBoundingClientRect(), others = [...pile.querySelectorAll(":scope > .pi")].filter(o => o !== el && !o.classList.contains('sticker') && !o.classList.contains('stamp'))
        // where each of the others sits AT HOME, not where it has been dragged: otherwise a card left out of the pile
        // becomes part of it, and the next card dropped beside it counts as "on the pile" and stays out too
        .map(o => { const q = o.getBoundingClientRect(), hx = (o._x || 0) * z, hy = (o._y || 0) * z; return { left: q.left - hx, top: q.top - hy, right: q.right - hx, bottom: q.bottom - hy }; });
      // a lone card (a job ad) has nothing under it, so it measures against its own home spot instead
      const ex = (x - (el._x || 0)) * z, ey = (y - (el._y || 0)) * z, home = { left: r.left - ex - x * z, top: r.top - ey - y * z, right: r.right - ex - x * z, bottom: r.bottom - ey - y * z };
      const U = others.length ? { l: Math.min(...others.map(o => o.left)), t: Math.min(...others.map(o => o.top)), r: Math.max(...others.map(o => o.right)), b: Math.max(...others.map(o => o.bottom)) }
        : { l: home.left, t: home.top, r: home.right, b: home.bottom };
      const w = Math.max(0, Math.min(r.right, U.r) - Math.max(r.left, U.l)), h = Math.max(0, Math.min(r.bottom, U.b) - Math.max(r.top, U.t));
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2; offOf.centreOver = cx > U.l && cx < U.r && cy > U.t && cy < U.b; // is its centre still over the pile
      return 1 - (w * h) / Math.max(1, r.width * r.height);
    };
    const place = (el, x, y, ms = 0, ease = 'cubic-bezier(.34, 1.56, .64, 1)') => { el.style.transition = ms ? `translate ${ms}ms ${ease}, rotate ${ms}ms ${ease}` : 'none'; el.style.translate = `${x}px ${y}px`; el._x = x; el._y = y; };
    // on a touchscreen a tap opens from the click that follows it, not from the finger lifting: browsers only let a
    // page open a new tab from a click
    let tapEl = null, tapAt = 0;
    pile.addEventListener('click', () => { if (!tapEl || performance.now() - tapAt > 900) return; const t = tapEl; tapEl = null; if (t.isConnected) open(t); });
    // 2 fingers pinch a card bigger or smaller and twist it, like the corner handles do with a mouse. Only the first has
    // to be on the card: the second can land anywhere on the pile (on another card, or between them), and a finger that
    // lands between the cards first is picked up by the card the next finger touches
    const pinchGeo = g => { const [a, b] = [...g.pts.values()]; return { d: Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; };
    const pinchStart = (el, g) => { const p = pinchGeo(g); el.style.rotate = ''; el.classList.add('pinch');
      return { ...p, s0: el._s || 1, r0: parseFloat(el.style.getPropertyValue('--r')) || 0, x0: el._x || 0, y0: el._y || 0 }; };
    const pinchMove = (el, g) => { const P = g.pinch, p = pinchGeo(g), z = zOf(pile);
      const sc = Math.max(.6, Math.min(3, P.s0 * p.d / P.d)); el._s = sc; el.style.setProperty('--s', sc.toFixed(3));
      let da = (p.ang - P.ang) * 180 / Math.PI; da = ((da + 540) % 360) - 180; el.style.setProperty('--r', (P.r0 + da).toFixed(2) + 'deg');
      place(el, P.x0 + (p.mx - P.mx) / z, P.y0 + (p.my - P.my) / z); };
    // a finger on a card drags it straight away, up and down included: the cards never let the browser scroll or zoom
    // from them (touch-action: none, home.css), so a swipe that starts on a card always moves the card. As it starts to
    // move it grows a little, as if lifted off the desk. A swipe that starts between the cards still scrolls the page.
    // Belt and braces for a browser that ignores touch-action: while a card is moving or pinched the pile cancels each
    // finger move (which a passive listener can't do), and Safari's own pinch event, so the page stays put underneath
    pile.addEventListener('touchmove', e => { if (pile._lock && e.cancelable) e.preventDefault(); }, { passive: false });
    pile.addEventListener('gesturestart', e => { if (pile._lock && e.cancelable) e.preventDefault(); });
    let stray = null; // a finger on the pile but between the cards, which a finger landing on a card next pinches with
    pile.addEventListener('pointermove', e => { if (stray && stray.id === e.pointerId) stray.at = [e.clientX, e.clientY]; });
    const unstray = e => { if (stray && stray.id === e.pointerId) stray = null; };
    pile.addEventListener('pointerup', unstray); pile.addEventListener('pointercancel', unstray);
    // a long press never brings up the browser's own menu (Android's image menu, for one)
    pile.addEventListener('contextmenu', e => { if (Site.touchy()) e.preventDefault(); });
    const lift = (el, v) => { const a = parseFloat(getComputedStyle(el).getPropertyValue('--lf')) || 1; if (el._lfa) el._lfa.cancel();
      const an = el._lfa = el.animate([{ '--lf': a }, { '--lf': v }], { duration: v > 1 ? 170 : 260, easing: 'cubic-bezier(.2, .9, .3, 1)', fill: 'forwards' });
      if (v === 1) an.onfinish = () => { if (el._lfa === an) { an.cancel(); el._lfa = null; } }; };
    // a second finger joins a card held by 1, and the 2 pinch it
    const join = (g, id, at) => { try { g.el.setPointerCapture(id); } catch (er) {} g.pts.set(id, at); g.pinch = pinchStart(g.el, g); g.moved = true; pile._lock = true; };
    pile.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') { const held = [...pile.querySelectorAll(":scope > .pi")].map(o => o._g).find(q => q && q.touch && q.pts.size === 1 && q.el.isConnected);
        if (held) { join(held, e.pointerId, [e.clientX, e.clientY]); return; } }
      const el = e.target.closest('.pi');
      if (!el) { if (e.pointerType !== 'mouse') stray = { id: e.pointerId, at: [e.clientX, e.clientY] }; return; }
      if (el._g) return; // a third finger
      // with a mouse, cancelling the press stops text selection and the browser's own image drag; a touch is left
      // alone, because Safari then drops the click that a tap opens from
      if (e.pointerType === 'mouse') e.preventDefault();
      // "on top" means what you see: nothing else covers it. A sticker sitting a little higher in the stack doesn't
      // count, so dragging the visible front card away always sends it to the back.
      const er = el.getBoundingClientRect(), hits = (q) => q.left < er.right && q.right > er.left && q.top < er.bottom && q.bottom > er.top;
      const shownOnTop = el.classList.contains('sticker') || ![...pile.querySelectorAll(":scope > .pi")].some(o => o !== el && !o.classList.contains('sticker') && +o.style.zIndex > +el.style.zIndex && hits(o.getBoundingClientRect()));
      const z = zOf(pile), first = e.pointerId, sx = e.clientX, sy = e.clientY, ox = el._x || 0, oy = el._y || 0; let dx = 0, dy = 0;
      const g = el._g = { el, pts: new Map([[first, [sx, sy]]]), pinch: null, moved: false, touch: e.pointerType !== 'mouse', lifted: false };
      try { el.setPointerCapture(first); } catch (er2) {} el.classList.add('drag'); pane.dragging = true;
      if (g.touch && stray) { const s = stray; stray = null; join(g, s.id, s.at); } // the finger already down between the cards
      const move = ev => { if (!g.pts.has(ev.pointerId)) return; g.pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
        if (g.pinch) { if (g.pts.size === 2) pinchMove(el, g); return; }
        if (ev.pointerId !== first) return;
        dx = (ev.clientX - sx) / z; dy = (ev.clientY - sy) / z; const far = Math.hypot(dx, dy) * z;
        // a finger: the card waits until it has moved 8px, so the wobble in a tap never nudges it, then lifts and follows
        if (g.touch && !g.moved && far < 8) return;
        if (far > 4) g.moved = true;
        if (g.touch && !g.lifted) { g.lifted = true; pile._lock = true; el.classList.add('lift'); lift(el, 1.06); }
        place(el, ox + dx, oy + dy); el.style.rotate = `${Math.max(-10, Math.min(10, dx * .04))}deg`; };
      const end = () => { if (g.lifted || g.pinch) pile._lock = false; if (g.lifted) { el.classList.remove('lift'); lift(el, 1); } // put down
        el.style.transition = ''; // hand transitions back to the stylesheet (the drag set its own)
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('drag', 'pinch'); el._g = null; pane.dragging = false; pane.heldUntil = performance.now() + 1100; };
      const up = ev => {
        if (!g.pts.has(ev.pointerId)) return; g.pts.delete(ev.pointerId);
        if (g.pinch) { if (g.pts.size) return; end(); return; } // a pinch leaves the card as it is when the last finger lifts
        if (ev.pointerId !== first) return;
        end();
        // the browser took the touch over (to scroll the page): nothing was dropped and nothing was tapped, and the card
        // goes back to exactly where it was
        if (ev.type === 'pointercancel') { el.style.rotate = ''; place(el, ox, oy, g.moved ? 220 : 0, 'ease-out'); return; }
        if (!g.moved) { el.style.rotate = ''; if (g.touch) { tapEl = el; tapAt = performance.now(); return; } open(el); return; }
        const x = ox + dx, y = oy + dy, off = offOf(el, x, y), isTop = shownOnTop;
        const rot0 = parseFloat(el.style.rotate) || 0;
        // 1 continuous motion: the card tilts a touch as it starts back, and the rest of the rotation happens as it
        // slides, never a separate wiggle before the slide
        const glide = (tx, ty, ms, ease = 'cubic-bezier(.33, .8, .25, 1)') => { el.style.transition = 'none';
          const frames = [{ translate: `${x}px ${y}px`, rotate: `${rot0}deg` }, { translate: `${tx}px ${ty}px`, rotate: '0deg' }];
          const an = el.animate(frames, { duration: ms, easing: ease });
          el.style.translate = `${tx}px ${ty}px`; el.style.rotate = ''; el._x = tx; el._y = ty; return an; };
        // on a phone the pile fills the screen, so "clear of it" is judged more kindly: there's no room to drag a card
        // all the way off without it leaving the screen
        const [stay, clear] = g.touch || innerWidth < 640 ? [.3, .6] : [.5, .88];
        // a card made bigger (pinched, or by a corner handle) mostly hangs outside the pile, so its share outside says
        // nothing: while its centre is still over the pile it stays where you put it
        if ((el._s || 1) > 1.05 && offOf.centreOver) { glide(x, y, 320); return; }
        if (off < stay) { glide(x, y, 320); return; } // stays where you put it, just settling its tilt
        if (off < clear) { glide(x * .28, y * .28, 620); return; } // eases most of the way back
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
    let touching = false; // a finger is on the ruler
    const coarse = matchMedia('(hover: none)').matches; // a touchscreen (no hover)
    let W = 600, mx = null, lastMx = 0, k = 0, active = null, open = false, overCard = false, closeT = 0, cur = null, raf;
    const S = { x: 0, vx: 0, o: 0, vo: 0 }, target = { x: 0 };
    const fish = x => { if (k < .001) return x; const c = mx ?? lastMx, d = x - c, D = d < 0 ? c : W - c, a = Math.abs(d) / (D || 1); return c + Math.sign(d) * D * ((1 + k) * a / (1 + k * a)); };
    function show(p, dir) {
      clip.querySelectorAll('.rc-pane.out').forEach(n => n.remove()); // never more than 1 leaving: no stacked text
      if (cur && cur.classList.contains('focus') && Site.clickClose) Site.clickClose(cur); // a new piece: the old cursor goes
      if (Site.plEnd) Site.plEnd(); // and so does an open playlist sleeve, with its green disc
      if (cur) { const old = cur; old.classList.remove('in'); old.classList.add('out'); old.style.setProperty('--dx', (-dir * 18) + 'px'); old.querySelectorAll('video').forEach(v => v.pause()); setTimeout(() => old.remove(), 240); }
      const n = h(pane(p)); n.dataset.key = p.title; n.style.setProperty('--dx', (dir * 18) + 'px'); clip.append(n); cur = n;
      // each clip: the hidden player that's been loading it in the background (it starts at once), or, if that's busy or
      // there isn't one (a phone), a new player that streams it
      n.querySelectorAll('video[data-src]').forEach(v => { const ready = media.take(v.dataset.src); if (ready) v.replaceWith(ready); else v.src = v.dataset.src; });
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
        pile.style.marginTop = '0px'; const poke = (pile.getBoundingClientRect().top - Math.min(...items.map(o => o.getBoundingClientRect().top))) / zOf(pile); if (poke > 0) { pile.style.marginTop = Math.round(poke) + 'px'; n.style.setProperty('--pt', Math.round(poke) + 'px'); } // a tilted card that pokes up pushes the pile down, never into the ruler
        const pb = pile.getBoundingClientRect().bottom, low = Math.max(...items.map(o => o.getBoundingClientRect().bottom)); if (!isFinite(low)) return;
        cap.style.marginTop = Math.max(-200, Math.round((low - pb) / zOf(pile) + 22)) + 'px'; };
      const settle = () => { unbury(n); placeStickers(n); gapUnder(); fitPane(n); }; // after makeDraggable, so the stacking order is set
      // and again as anything still loading gets its size (a preloaded picture or clip already has it)
      settle(); n.querySelectorAll('img, video').forEach(m => { if (m.tagName === 'IMG' ? m.complete : m.readyState >= 1) return; m.addEventListener(m.tagName === 'IMG' ? 'load' : 'loadedmetadata', settle, { once: true }); });
      requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('in')));
    }
    // a pile wider than the screen (a phone) shrinks as a whole until its cards fit with 12px to spare each side; a
    // pile that fits is left at full size. Measured from where the cards sit at home, so a card dragged out or
    // enlarged doesn't shrink everything else.
    function fitPane(n) {
      if (!n || !n.isConnected) return; const z0 = n._z || 1, nr = n.getBoundingClientRect(); let L = 1e9, R = -1e9, T = 1e9, B = -1e9;
      for (const o of n.querySelectorAll('.pile > .pi')) { const q = o.getBoundingClientRect(); if (!q.width) continue; const hx = (o._x || 0) * z0, hy = (o._y || 0) * z0, sc = o._s || 1, w = q.width / sc, hh = q.height / sc, c = q.left + q.width / 2 - hx, m = q.top + q.height / 2 - hy;
        L = Math.min(L, (c - w / 2 - nr.left) / z0); R = Math.max(R, (c + w / 2 - nr.left) / z0); T = Math.min(T, (m - hh / 2 - nr.top) / z0); B = Math.max(B, (m + hh / 2 - nr.top) / z0); }
      if (R < L) { L = 0; R = n.offsetWidth; T = 0; B = 0; }
      // and on a short screen (a phone on its side) it also shrinks to fit the height, so the whole pile can be seen at once
      const zH = innerHeight < 500 && B > T ? (innerHeight - 36) / (B - T) : 1;
      const z = Math.max(.5, Math.min(1, (innerWidth - 24) / (R - L), zH));
      n._z = z; n._L = L; n._R = R; n.style.scale = z < 1 ? z.toFixed(4) : '';
    }
    let fitW = innerWidth; addEventListener('resize', () => { if (innerWidth === fitW) return; fitW = innerWidth; fitPane(cur); });
    // a hook for add-on modes (playlists.js): show any pane under the ruler, centred, until a tick is hovered again
    // add-on piles: a post-like object (custom pile items, its own click) shown under the ruler, centred
    Site.rcShowPost = (p) => { guard = performance.now() + 4000; gx0 = null; p.i = -1; p.ts = T0 + span / 2; const dir = 0; active = p; show(p, dir); open = true; };
    Site.rcShowCustom = (n) => {
      clip.querySelectorAll('.rc-pane.out').forEach(o => o.remove()); if (Site.plEnd) Site.plEnd();
      if (cur) { const old = cur; old.classList.remove('in'); old.classList.add('out'); old.style.setProperty('--dx', '0px'); old.querySelectorAll('video').forEach(v => v.pause()); setTimeout(() => old.remove(), 240); }
      clip.append(n); cur = n; active = { i: -1, ts: T0 + span / 2, custom: true }; open = true; fitPane(n);
      requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('in')));
    };
    (function tick() {
      W = el.clientWidth; if (W !== tick.w) { tick.w = W; svg.setAttribute('viewBox', `0 0 ${W} 64`); }
      k += ((mx == null ? 0 : touching ? 1.3 : K) - k) * .1;
      let best = null, bd = 1e9;
      for (const it of items) {
        const x = fish(it.x0 * W), d = mx == null ? 999 : Math.abs(x - mx), mag = Math.exp(-(((x - (mx ?? lastMx)) / 60) ** 2)) * Math.min(1, k / K);
        if (it.post) it.ex += (((it.post === active && open) ? 4 : 0) - it.ex) * .14;
        const hgt = (it.post ? 16 : it.year ? 10 : 5) * (1 + mag * .35) + (it.post ? it.ex : 0);
        // only what changed is written (at rest nothing does, which keeps a phone's battery out of it)
        const xs = x.toFixed(2), ys = (40 - hgt).toFixed(2);
        if (xs !== it.xs) { it.xs = xs; it.ln.setAttribute('x1', xs); it.ln.setAttribute('x2', xs); if (it.tx) it.tx.setAttribute('x', xs); }
        if (ys !== it.ys) { if (it.ys === undefined) { it.ln.setAttribute('y2', 40); if (it.tx) it.tx.setAttribute('y', 58); } it.ys = ys; it.ln.setAttribute('y1', ys); }
        if (it.post) { if (d < bd) { bd = d; best = it.post; } const on = it.post === active && open; if (on !== it.on) { it.on = on; it.ln.classList.toggle('on', on); } }
      }
      if (mx != null && best && bd < 34) { if (best !== active) { const dir = active ? Math.sign(best.i - active.i) : 0; active = best; show(best, dir); } open = true; closeT = 0; }
      // it stays open until you hover another piece
      if (active && cur) { const ax = tpos(active.ts) * W, er = el.getBoundingClientRect(), z = cur._z || 1, w = cur.offsetWidth, L = cur._L ?? 0, R = cur._R ?? w;
        const lo = 12 - er.left - L * z, hi = innerWidth - 12 - er.left - R * z;
        target.x = z < 1 || lo > hi ? (innerWidth - (R - L) * z) / 2 - er.left - L * z
          : innerWidth >= 640 && !coarse ? Math.max(12 - er.left, Math.min(innerWidth - er.left - w - 12, ax - w / 2)) // desktop, as it always was
          : Math.max(lo, Math.min(hi, ax - w * z / 2)); }
      if (S.o < .02 && open) { S.x = target.x; S.vx = 0; }
      [S.x, S.vx] = spring(S.x, target.x, S.vx); [S.o, S.vo] = spring(S.o, open ? 1 : 0, S.vo, 260, 30);
      const o = Math.max(0, Math.min(1, S.o));
      const tf = `translate(${S.x.toFixed(1)}px, ${((1 - o) * -6).toFixed(2)}px)`, op = o.toFixed(3), pe = o > .5 ? 'auto' : 'none';
      if (tf !== tick.tf) { tick.tf = tf; card.style.transform = tf; } if (op !== tick.op) { tick.op = op; card.style.opacity = op; } if (pe !== tick.pe) { tick.pe = pe; card.style.pointerEvents = pe; }
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
    svg.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') { if (touching) mx = lastMx = e.clientX - svg.getBoundingClientRect().left; return; } // a finger keeps the ruler till it lifts
      if (tripping(e)) { mx = null; return; } if (resizing || (S.o > .5 && nearPile(e.clientX, e.clientY))) { mx = null; return; } mx = lastMx = e.clientX - svg.getBoundingClientRect().left; });
    svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') mx = null; });
    // on a touchscreen there's no hover: a finger on the ruler picks the nearest piece, sliding along it scrubs through
    // them under a stronger loupe, and lifting keeps the one you're on. Then the pile is brought into view if it's
    // below the bottom of the screen.
    svg.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; touching = true; guard = 0;
      mx = lastMx = e.clientX - svg.getBoundingClientRect().left; });
    const lift = e => { if (e.pointerType === 'mouse' || !touching) return; touching = false;
      requestAnimationFrame(() => requestAnimationFrame(() => { mx = null; if (e.type === 'pointerup') setTimeout(reveal, 320); })); };
    svg.addEventListener('pointerup', lift); svg.addEventListener('pointercancel', lift);
    // a click on the ruler opens the piece you're on (with a mouse); a tap only picks it
    svg.addEventListener('click', () => { if (Site.touchy()) return; if (active && open && cur && cur._arm) cur._arm(); });
    // scroll just enough to show the whole pile under the ruler, never pushing the ruler itself off the top
    function reveal() { if (!cur || !open) return; const rs = [...cur.querySelectorAll('.pile > .pi')].map(o => o.getBoundingClientRect()).filter(q => q.width); if (!rs.length) return;
      const top = svg.getBoundingClientRect().top, over = Math.max(...rs.map(q => q.bottom)) + 16 - innerHeight; if (over <= 0) return;
      scrollBy({ top: Math.max(0, Math.min(over, top - 8)), behavior: 'smooth' }); }
    // bring a pile into view: with the ruler above it if both fit the screen, otherwise just the cards
    Site.rcReveal = () => { if (!cur) return; const rs = [...cur.querySelectorAll('.pile > .pi')].map(o => o.getBoundingClientRect()).filter(q => q.width); if (!rs.length) return;
      const ct = Math.min(...rs.map(q => q.top)), b = Math.max(...rs.map(q => q.bottom)), rt = Math.min(svg.getBoundingClientRect().top, ct);
      const t = b - rt + 32 < innerHeight ? rt : ct;
      scrollBy({ top: b - t + 24 < innerHeight ? (t + b) / 2 - innerHeight / 2 : t - 12, behavior: 'smooth' }); };
    // nothing opens by itself, on a touchscreen either: the page starts with just the ruler, and a tap on it opens a piece
    // a click off the pile (anywhere that isn't a card, its open-card or the ruler) fades it away and returns to the
    // page as it first loaded: no pile, no piece picked
    const offTap = (e, finger) => {
      if (!cur || !open) return; if (e.target.closest && e.target.closest('.pi, .rc-go .g-hit, .rc-go .g-disc, .tl-axis, .rc-hd, .dev' + (finger ? ', .social' : ''))) return;
      // with the cursor up, a click inside its zone (64px round the cards) opens instead; any further out dismisses the
      // cursor and the pile together, in 1 click
      if (document.documentElement.classList.contains('gc-on') && [...cur.querySelectorAll('.pile .pi')].some(o => { const r = o.getBoundingClientRect(); return e.clientX > r.left - 64 && e.clientX < r.right + 64 && e.clientY > r.top - 64 && e.clientY < r.bottom + 64; })) return;
      if (cur.classList.contains('focus') && Site.clickClose) Site.clickClose(cur);
      if (Site.plEnd) Site.plEnd();
      const gone = cur; open = false; active = null; mx = null;
      setTimeout(() => { if (cur === gone && !open) { gone.remove(); cur = null; } }, 450);
    };
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') offTap(e); });
    // a finger counts as a tap when it lifts without having scrolled (the browser cancels a touch it scrolls with). This
    // doesn't wait for a click: iPhone Safari only sends one to things it thinks are clickable, never to blank page.
    let tapDown = null;
    addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') tapDown = { id: e.pointerId, x: e.clientX, y: e.clientY }; }, true);
    addEventListener('pointercancel', e => { if (tapDown && tapDown.id === e.pointerId) tapDown = null; }, true);
    addEventListener('pointerup', e => { const d = tapDown; if (!d || d.id !== e.pointerId) return; tapDown = null;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) offTap(e, true); }, true);
    // corner handles, like a transform box. Only a corner you can actually see (nothing on top of it) counts. Within
    // NEAR px of it, everything ramps together with your distance (0 at the edge of the zone, full at the corner):
    // the cursor turns to a crosshair, the purple handle fades in (tilted with the card, sitting on the rounded
    // corner's arc), that card's own drop shadow turns purple and very slightly deeper, and its 2 edges meeting there
    // pick up a purple gradient (80% at the corner, fading out a set distance along each side). Pressing in that zone
    // resizes: always proportional, always from the card's centre, the whole outline purple while you hold.
    const hd = h('<div class="rc-hd"></div>'); document.body.append(hd);
    let hot = null, resizing = false, resizedAt = 0;
    const NEAR = 48, EDGE = 130;
    // the visible shape: a sticker's tile; a sleeve while it is showing (a playlist cover's, or the profile one on the
    // desk photo and clip)
    const sleeve = o => o.classList.contains('flip') ? o.querySelector('.pl-back') : null;
    const shapeOf = o => sleeve(o) || o.querySelector('.pi-tile') || o;
    const boxOf = o => { const sl = sleeve(o);
      if (sl) { // its size from layout (inside the 60% zoom); its offset from the card's centre measured live and un-rotated
        const r = o.getBoundingClientRect(), q = sl.getBoundingClientRect(), vx = q.left + q.width / 2 - (r.left + r.width / 2), vy = q.top + q.height / 2 - (r.top + r.height / 2), sc = o._s || 1;
        const a = -((parseFloat(o.style.getPropertyValue('--r')) || 0) + (parseFloat(o.style.rotate) || 0)) * Math.PI / 180;
        return { w: sl.offsetWidth * .6, h: sl.offsetHeight * .6, dx: (vx * Math.cos(a) - vy * Math.sin(a)) / sc, dy: (vx * Math.sin(a) + vy * Math.cos(a)) / sc, rad: 16 * .6 }; }
      const t = shapeOf(o); return { w: t.offsetWidth, h: t.offsetHeight, dx: 0, dy: 0, rad: parseFloat(getComputedStyle(t).borderTopLeftRadius) || 0 }; };
    const geom = o => { const bx = boxOf(o), r = o.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, sc = o._s || 1, z = zOf(o);
      const w = bx.w * sc * z / 2, hh = bx.h * sc * z / 2, rad = bx.rad * sc * z, inset = Math.min(4, rad * (1 - Math.SQRT1_2) * .45); // just inside the corner: under half the way to the arc, and never more than 4px in however big the card is
      const deg = (parseFloat(o.style.getPropertyValue('--r')) || 0) + (parseFloat(o.style.rotate) || 0), a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
      const pt = (lx, ly) => { lx += bx.dx * sc; ly += bx.dy * sc; return [cx + c * lx - sn * ly, cy + sn * lx + c * ly]; };
      // how far a corner's zone reaches: NEAR, but never more than halfway to the centre, so the middle of a small card (a
      // logo sticker is 48px) is left for dragging it instead of every corner lighting up at once
      const reach = Math.max(12, Math.min(NEAR, Math.hypot(w, hh) / 2));
      return { deg, cx, cy, reach, corners: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => ({ sx, sy, p: pt(sx * (w - inset), sy * (hh - inset)), probe: pt(sx * (w - inset - 7), sy * (hh - inset - 7)) })) }; };
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
      // no handles for a finger, nor for the "mouse" moves a touchscreen browser echoes (just after a touch, or when the
      // page scrolls under where the last tap was): on a touch-first device only a mouse that really moved counts
      if (resizing) return; if (e.pointerType !== 'mouse' || Site.touchy() || (coarse && !e.movementX && !e.movementY)) return hideHd(); if (!cur || cur.dragging || S.o < .6 || !cur.isConnected || cur.classList.contains('focus')) return hideHd();
      const list = [];
      for (const o of cur.querySelectorAll('.pile .pi:not(.filo)')) { const g = geom(o); for (const cn of g.corners) { const d = Math.hypot(e.clientX - cn.p[0], e.clientY - cn.p[1]);
        if (d < g.reach && visibleAt(o, cn.probe)) list.push({ key: keyOf(o, cn), o, g, cn, deg: g.deg, k: Math.max(0, Math.min(1, 1 - (d - 6) / (g.reach - 6))) }); } }
      setTargets(list);
    });
    // pressing resizes the strongest live corner, unless you're over a different card and not right on the corner (within
    // about 10px of it): then the press drags the card you're over, a sticker sitting near another card's corner included
    document.addEventListener('pointerdown', e => {
      if (!hot || resizing || e.pointerType !== 'mouse' || Site.touchy()) return;
      let under = null; for (const el of document.elementsFromPoint(e.clientX, e.clientY)) { if (hd.contains(el)) continue; under = el.closest('.pi'); break; }
      if (under && under !== hot.o && hot.k < .9) return;
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
