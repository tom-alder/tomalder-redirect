// What a click on a pile does: 10 concepts, picked in the dev panel ("Click"), set as html[data-click].
// A first click puts the pile in focus and shows the concept; it opens the piece in a new tab when you act on it.
// Esc or a click away closes it; Enter opens it from any of them.
//   flip       the top card turns over in 3D: its back is a library card with the date stamped on it
//   tab        a folder tab slides up from behind the top card, carrying the title (the SB folder, pulled like a file)
//   receipt    a paper slip prints out from under the pile, line by line, ending in OPEN
//   message    a quicker.chat moment: typing dots, then a link-preview bubble with the piece's own picture
//   cursor     the cursor becomes a soft disc with an arrow, following on a spring, the title trailing beside it
//   keycap     a physical return key with the title beside it; it presses down under you, and Enter works too
//   spotlight  the page dims around the pile and a Spotlight bar shows the address, result highlighted
//   fan        the pile breathes open, cards easing outward, the title set in the space they leave
//   hold       a disc where you clicked: press and hold, the ring fills, it opens; let go early and it lets you off
//   placard    the top card comes forward and a gallery label slides in beside it
(function () {
  const MODES = ['flip', 'tab', 'receipt', 'message', 'cursor', 'keycap', 'spotlight', 'fan', 'hold', 'placard'];
  Site.CLICK_MODES = MODES;
  const esc = Site.esc, fmt = Site.fmtDate;
  let ptr = [0, 0]; addEventListener('pointerdown', e => { ptr = [e.clientX, e.clientY]; }, true);
  const mode = () => document.documentElement.dataset.click;
  const host = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return ''; } };
  const path = u => { try { const x = new URL(u); return (x.host.replace(/^www\./, '') + x.pathname).replace(/\/$/, ''); } catch (e) { return u; } };
  const cards = n => [...n.querySelectorAll('.pile .pi:not(.sticker)')];
  const topCard = n => cards(n).sort((a, b) => +b.style.zIndex - +a.style.zIndex)[0];
  const geo = (n, c) => { const pr = n.getBoundingClientRect(), r = c.getBoundingClientRect(), s = c._s || 1;
    return { x: r.left + r.width / 2 - pr.left, y: r.top + r.height / 2 - pr.top, w: c.offsetWidth * s, h: c.offsetHeight * s, r: (parseFloat(c.style.getPropertyValue('--r')) || 0) + (parseFloat(c.style.rotate) || 0), z: +c.style.zIndex || 1, right: r.right - pr.left, left: r.left - pr.left, bottom: r.bottom - pr.top, top: r.top - pr.top }; };
  const pileBox = n => { const pr = n.getBoundingClientRect(), rs = cards(n).map(c => c.getBoundingClientRect()); const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), R = Math.max(...rs.map(r => r.right)), B = Math.max(...rs.map(r => r.bottom));
    return { x: (l + R) / 2 - pr.left, y: (t + B) / 2 - pr.top, l: l - pr.left, t: t - pr.top, r: R - pr.left, b: B - pr.top }; };
  const thumb = n => { const i = n.querySelector('.pile .pi img'); return i ? i.getAttribute('src') : ''; };
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function markup(m, p, n) {
    const d = fmt(p.date, true), t = esc(p.title), act = p.job ? 'See the role' : 'Read it', th = thumb(n), u = esc(path(p.url)), h = esc(host(p.url));
    switch (m) {
      case 'flip': return `<div class="g-flip g-hit" data-open><span class="g-hole"></span><span class="g-stamp">${d}</span><span class="g-t">${t}</span><span class="g-lines"><i></i><i></i><i></i></span><span class="g-act">${act} ${ARROW}</span></div>`;
      case 'tab': return `<div class="g-tab g-hit" data-open><span class="g-dot"></span><span class="g-t">${t}</span>${ARROW}</div>`;
      case 'receipt': return `<div class="g-rcpt g-hit" data-open><b>STRATEGY BREAKDOWNS</b><i class="g-rule"></i><span>${d.toUpperCase()}</span><span class="g-t">${t}</span><span class="g-u">${u}</span><i class="g-rule"></i><b class="g-act">OPEN IN NEW TAB ↗</b><span class="g-thx">thank you for reading</span></div>`;
      case 'message': return `<div class="g-msg"><span class="g-typing"><i></i><i></i><i></i></span><div class="g-link g-hit" data-open>${th ? `<span class="g-th" style="background-image:url('${th}')"></span>` : ''}<span class="g-t">${t}</span><span class="g-h">${h}</span></div></div>`;
      case 'cursor': return '';
      case 'keycap': return `<div class="g-key g-hit" data-open><span class="g-cap"><span>return</span><b>⏎</b></span><span class="g-lab"><em>Open</em>${t}</span></div>`;
      case 'spotlight': return `<div class="g-spot"><div class="g-q"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="g-typed" style="--n:${u.length}">${u}</span></div><div class="g-row g-hit" data-open><span class="g-fav"></span><span class="g-t">${t}</span><span class="g-h">${h}</span><kbd>↵</kbd></div></div>`;
      case 'fan': return `<div class="g-fan g-hit" data-open><em>${d}</em><span class="g-t">${t}</span><span class="g-act">${act} ${ARROW}</span></div>`;
      case 'hold': return `<div class="g-hold"><button class="g-disc" type="button" aria-label="Hold to open"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="g-track" cx="40" cy="40" r="36"/><circle class="g-ring" cx="40" cy="40" r="36"/></svg><span>Hold</span></button><span class="g-lab">${t}</span></div>`;
      case 'placard': return `<div class="g-plac g-hit" data-open><span class="g-t">${t}</span><span class="g-by">Tom Alder, ${p.date.slice(0, 4)}</span><span class="g-med">${p.job ? 'Job ad, Notion' : 'Essay, Strategy Breakdowns'}</span><i class="g-rule"></i><span class="g-act">View the piece ${ARROW}</span></div>`;
    }
    return '';
  }

  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const gc = document.createElement('div'); gc.className = 'gc'; gc.innerHTML = '<span class="gc-disc"></span><span class="gc-lab"></span>'; document.body.append(gc);
  const disc = gc.querySelector('.gc-disc'), glab = gc.querySelector('.gc-lab');
  // leaving: the disc shrinks into the pointer's tip, and the real pointer comes back once the disc is about its
  // size (a drawn stand-in never quite matched the real pointer's size, so there is none)
  let gx = 0, gy = 0, gtx = 0, gty = 0, gvx = 0, gvy = 0, owner = null, graf = 0, kindNow = '', leaving = 0;
  addEventListener('pointermove', e => { gtx = e.clientX; gty = e.clientY; if (!owner && !leaving) { gx = gtx; gy = gty; } }, true);
  const gstep = () => { gvx += (gtx - gx) * .24; gvy += (gty - gy) * .24; gvx *= .6; gvy *= .6; gx += gvx; gy += gvy;
    gc.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`; gc.style.setProperty('--tilt', Math.max(-12, Math.min(12, gvx)).toFixed(1) + 'deg');
    graf = owner || leaving || Math.abs(gvx) + Math.abs(gvy) > .05 || Math.abs(gtx - gx) + Math.abs(gty - gy) > .5 ? requestAnimationFrame(gstep) : 0; };
  // kinds: arrow (open the piece), loom (a Loom clip: purple play), spotify (a playlist: green play)
  const root = document.documentElement;
  Site.gc = { show(who, kind, html) { owner = who; if (leaving) { clearTimeout(leaving); leaving = 0; root.classList.remove('gc-leave'); } if (kind !== kindNow) { kindNow = kind; gc.dataset.kind = kind; disc.innerHTML = kind === 'arrow' ? ARROW : PLAY; }
      if (glab.innerHTML !== html) glab.innerHTML = html; gc.classList.add('on'); root.classList.add('gc-on'); if (!graf) graf = requestAnimationFrame(gstep); },
    hide(who) { if (who && owner !== who) return; const was = gc.classList.contains('on'); owner = null; gc.classList.remove('on'); root.classList.remove('gc-on');
      if (!was) return; root.classList.add('gc-leave'); clearTimeout(leaving); // the pointer stays hidden until the disc is down to about its size
      leaving = setTimeout(() => { leaving = 0; root.classList.remove('gc-leave'); }, 190); if (!graf) graf = requestAnimationFrame(gstep); } };
  const state = new WeakMap();
  function open(n, p, card) {
    const m = mode(), go = n.querySelector('.rc-go'); if (!go) return;
    close(n, true); n.classList.add('focus'); n.dataset.go = m;
    const top = topCard(n); if (top) top.classList.add('go-top');
    const g = top ? geo(n, top) : { x: 190, y: 155, w: 270, h: 200, r: 0, z: 1, right: 325, left: 55, bottom: 255, top: 55 }, pb = pileBox(n);
    go.innerHTML = markup(m, p, n);
    const set = (k, v) => go.style.setProperty(k, v);
    set('--gx', g.x + 'px'); set('--gy', g.y + 'px'); set('--gw', g.w + 'px'); set('--gh', g.h + 'px'); set('--gr', g.r + 'deg');
    set('--px', pb.x + 'px'); set('--py', pb.y + 'px'); set('--pb', pb.b + 'px'); set('--gR', g.right + 'px');
    const pr = n.getBoundingClientRect(); set('--cx', (ptr[0] - pr.left) + 'px'); set('--cy', (ptr[1] - pr.top) + 'px');
    go.style.zIndex = m === 'tab' ? g.z - 1 : m === 'receipt' ? 0 : 999;
    const st = { p, timers: [] }; state.set(n, st);
    const goOpen = () => { const url = st.url || p.url; close(n); window.open(url, '_blank', 'noopener'); };
    st.goOpen = goOpen;
    go.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); goOpen(); }));
    if (m === 'flip' && top) top.style.setProperty('--ry', '90deg');
    if (m === 'placard' && top) top.style.setProperty('--ls', '1.05');
    if (m === 'fan') { cards(n).forEach(c => { const q = c.getBoundingClientRect(), cx = q.left + q.width / 2 - pr.left, cy = q.top + q.height / 2 - pr.top; let vx = cx - pb.x, vy = cy - pb.y; const d = Math.hypot(vx, vy) || 1;
      if (d < 8) { vx = c === top ? 0 : (Math.random() - .5); vy = c === top ? 1 : (Math.random() - .5); } const L = Math.hypot(vx, vy) || 1, k = c === top ? 70 : 54;
      c.style.setProperty('--fx', (vx / L * k).toFixed(1) + 'px'); c.style.setProperty('--fy', (vy / L * k * .8).toFixed(1) + 'px'); }); }
    if (m === 'spotlight') { const dim = document.createElement('div'); dim.className = 'g-dim'; dim.style.setProperty('--px', pb.x + 'px'); dim.style.setProperty('--py', pb.y + 'px'); n.insertBefore(dim, n.firstChild); st.dim = dim; }
    if (m === 'message') st.timers.push(setTimeout(() => go.classList.add('g-ready'), 700));
    if (m === 'cursor') { // the global cursor disc takes over while the pointer is on or near the pile
      const lab = `<em>${fmt(p.date, true)}</em><span>${esc(p.title)}</span>`;
      // a Loom piece (all its cards are Looms) gets Loom's play button over the whole pile, near it included; every
      // other piece gets the black arrow, whatever cards it holds
      const kind = p.loom ? 'loom' : 'arrow'; st.lab = lab;
      const zone = 64, mv = e => { if (!n.isConnected || !n.classList.contains('focus')) { close(n); return; } // its pile is gone: the cursor goes too
        const rs = cards(n).map(c => c.getBoundingClientRect());
        const inside = rs.some(r => e.clientX > r.left - zone && e.clientX < r.right + zone && e.clientY > r.top - zone && e.clientY < r.bottom + zone);
        if (!inside) { close(n); return; } // well off to the side: back to normal
        Site.gc.show('pile', kind, st.lab); };
      addEventListener('pointermove', mv); st.off = () => { removeEventListener('pointermove', mv); Site.gc.hide('pile'); };
      mv({ clientX: ptr[0], clientY: ptr[1] });
    }
    if (m === 'hold') { const disc = go.querySelector('.g-disc'), ring = go.querySelector('.g-ring');
      const start = e => { e.preventDefault(); e.stopPropagation(); go.classList.add('g-holding'); st.hold = setTimeout(goOpen, 720); };
      const stop = () => { go.classList.remove('g-holding'); clearTimeout(st.hold); };
      disc.addEventListener('pointerdown', start); disc.addEventListener('pointerup', stop); disc.addEventListener('pointerleave', stop); disc.addEventListener('click', e => e.stopPropagation()); }
    requestAnimationFrame(() => requestAnimationFrame(() => go.classList.add('g-in')));
  }
  function close(n, quiet) {
    const go = n.querySelector('.rc-go'), st = state.get(n);
    n.classList.remove('focus'); delete n.dataset.go;
    n.querySelectorAll('.pi').forEach(c => { ['--fx', '--fy', '--ry', '--ls'].forEach(k => c.style.removeProperty(k)); c.classList.remove('go-top'); });
    if (st) { st.timers.forEach(clearTimeout); clearTimeout(st.hold); st.off && st.off(); cancelAnimationFrame(st.raf); if (st.dim) { const d = st.dim; d.classList.add('g-out'); setTimeout(() => d.remove(), 300); } state.delete(n); }
    if (go) { go.classList.remove('g-in', 'g-ready', 'g-holding'); if (!quiet) setTimeout(() => { if (!go.classList.contains('g-in')) go.innerHTML = ''; }, 320); else go.innerHTML = ''; }
  }
  // a click on the pile while the cursor concept is up opens; in the others a second click closes
  Site.clickArm = (n, p, card) => {
    if (n.classList.contains('focus')) { if (n.dataset.go === 'cursor') { const st = state.get(n); st && st.goOpen(); } else close(n); return; }
    open(n, p, card);
  };
  Site.clickClose = close;
  // with the cursor up, a click in the empty space around the pile opens too (clicks on the cards arrive via the pile)
  addEventListener('click', e => { const n = document.querySelector('.rc-pane.in.focus'); if (!n || n.dataset.go !== 'cursor') return;
    if (!document.documentElement.classList.contains('gc-on') || (e.target.closest && e.target.closest('.pi, .dev'))) return;
    const st = state.get(n); st && st.goOpen(); });
  addEventListener('keydown', e => { const n = document.querySelector('.rc-pane.in.focus'); if (!n) return; const st = state.get(n);
    if (e.key === 'Escape') close(n); else if (e.key === 'Enter' && st) { e.preventDefault(); st.goOpen(); } });
})();
