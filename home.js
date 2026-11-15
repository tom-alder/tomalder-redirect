// tomalder.me: a quiet column (photo, name, links, bio, writing), vertically centred.
// Craft details: a theme dot that previews the other theme like a moon phase and flips on click; inline product
// marks that idle on their own, loop their animation while hovered and always finish the loop on leave.
(function () {
  const { PROJECTS, Mark, LE, LM } = Site;
  const P = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
  const $ = s => document.querySelector(s);
  const dev = (() => { try { return JSON.parse(localStorage.getItem('ta-dev')) || {}; } catch (e) { return {}; } })();
  // settings Tom has picked are fixed here: the Cursor click, the Fade exit for Strategy Screenshots, the Inset edge
  const opt = { copy: dev.copy ?? 0, tl: dev.tl ?? 0, daily: dev.daily ?? 'capture', dot: dev.dot ?? 'snow', click: 'cursor',
    spotify: dev.spotify ?? 'on', ask: 'ask', exit: 'fade', edge: 'inset' };
  const ASKS = [['pill', 'Pill'], ['ask', 'Ask'], ['button', 'Button'], ['tag', 'Tag'], ['frame', 'Frame']];
  const CLICKS = [['flip', 'Flip'], ['tab', 'Tab'], ['receipt', 'Receipt'], ['message', 'Message'], ['cursor', 'Cursor'], ['keycap', 'Keycap'], ['spotlight', 'Spotlight'], ['fan', 'Fan'], ['hold', 'Hold'], ['placard', 'Placard']]; // clicks.js
  const setClick = v => { const d = document.documentElement.dataset; d.click = v; d.ask = 'none'; d.cap = 'off'; };
  if (!CLICKS.some(a => a[0] === opt.click)) opt.click = 'flip'; setClick(opt.click);
  Site.setSpotifyMode && Site.setSpotifyMode(opt.spotify === 'on'); // the separate Spotify-mode build (playlists.js)
  const EDGES = [['hair', 'Hairline'], ['inset', 'Inset'], ['paper', 'Paper'], ['matte', 'Matte'], ['none', 'Shadow only']];
  if (!EDGES.some(a => a[0] === opt.edge)) opt.edge = 'hair'; document.documentElement.dataset.edge = opt.edge;
  const save = () => { try { localStorage.setItem('ta-dev', JSON.stringify(opt)); } catch (e) {} };

  // ---------- the theme switch: the quicker.chat glasses ----------
  // The glasses from the quicker.chat app (src/renderer/ui/components/logo-glasses.tsx). Their lenses are tinted
  // with the OTHER theme, like sunglasses: lightly at rest, fully on hover, so you see the other mode through them.
  // Nothing moves or grows; only the shade changes. Click switches the theme.
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  $('.specs').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; try { sessionStorage.setItem('ta-theme', next); } catch (e) {}
  });

  // ---------- social: grey and still; the one you're on darkens ----------
  const ICONS = {
    x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    spotify: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  };
  const SOC = [['x', 'https://x.com/tomaldertweets', 'X'], ['linkedin', 'https://www.linkedin.com/in/tom-alder/', 'LinkedIn'], ['youtube', Site.ME.youtube, 'YouTube'],
    ['github', 'https://github.com/tom-alder', 'GitHub'], ['spotify', 'https://open.spotify.com/user/richardalder', 'Spotify']];
  $('.social').innerHTML = SOC.map(([k, href, name]) => `<a class="so" href="${href}" target="_blank" rel="noopener" aria-label="${name}"><svg viewBox="0 0 24 24"><path d="${ICONS[k]}"/></svg></a>`).join('');

  // ---------- inline marks ----------
  // Strategy Screenshots "capture": after the email header. First the resting logo takes itself apart (the glasses
  // lift away, the dots and header band retract, the outline un-draws and the fills fade), so the page is clear for
  // the screenshot: a crosshair drags from the window's top-left to its bottom-right over a peach selection, a
  // flash, the window draws itself back, the band wipes in, the dots pop and the glasses drop on. Ends on the
  // resting logo, so the loop always lands home. The crosshair is drawn in the page's text colour (it sits on the
  // page, not on the logo), so it shows in dark mode too.
  const kf = LM.kf, SW = LE.SW, ICON_VB = '-10 -20 470 410'; // tight round the logo so it sits on the text line; motions spill outside it
  // How the resting logo clears before the capture: 5 versions to choose between (dev panel, "Exit"). After it, the
  // capture itself always plays the same: crosshair drag, flash, window redraws, band, dots, glasses.
  //   iris    a camera iris closes over it from the outside in, to a point
  //   wipe    a page-coloured wipe crosses it left to right with a thin peach leading edge (the band wipe, reversed)
  //   blinds  5 horizontal slats close over it like a shutter
  //   fade    it fades out as one piece, nothing moving
  //   undraw  1 calm gesture: the fills and band fade, the dots shrink in turn, the outline un-draws, the glasses fade where they are
  const EXITS = { iris: .55, wipe: .5, blinds: .5, fade: .5, undraw: .8 };
  const PAGE = 'style="fill:var(--bg)"', COVER = [-20, -30, 500, 430];
  function exitFrame(kind, t, E) {
    const e = kf(t, [[0, 0], [E, 1, 'io']]);
    if (kind === 'iris') { const r = 360 * (1 - e) ** 1.2, [x, y, w, h] = COVER;
      return { a: 'daily', layers: { top: `<path fill-rule="evenodd" ${PAGE} d="M${x} ${y}h${w}v${h}h${-w}z M${235 - r} 175a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z"/>` } }; }
    if (kind === 'wipe') { const [x, y, , h] = COVER, wx = x + 500 * e;
      return { a: 'daily', layers: { top: `<rect x="${x}" y="${y}" width="${Math.max(0, wx - x)}" height="${h}" ${PAGE}/>` + (e > .01 && e < .99 ? `<rect x="${wx - 6}" y="-10" width="12" height="370" rx="6" fill="${LE.COL.peach}"/>` : '') } }; }
    if (kind === 'blinds') { const n = 5, sh = 430 / n;
      return { a: 'daily', layers: { top: Array.from({ length: n }, (_, i) => { const k = kf(t, [[i * .04, 0], [E - (n - 1 - i) * .04, 1, 'io']]); return `<rect x="-20" y="${(-30 + i * sh).toFixed(1)}" width="500" height="${(k > .001 ? sh * k + 4 : 0).toFixed(1)}" ${PAGE}/>`; }).join('') } }; }
    if (kind === 'fade') return { a: 'daily', layers: { top: `<rect x="${COVER[0]}" y="${COVER[1]}" width="${COVER[2]}" height="${COVER[3]}" ${PAGE} opacity="${e.toFixed(3)}"/>` } };
    // undraw
    const fill = 1 - kf(t, [[0, 0], [.35, 1, 'io']]), band = 1 - kf(t, [[.05, 0], [.45, 1, 'io']]), draw = 1 - kf(t, [[.25, 0], [E, 1, 'io']]);
    const dk = i => 1 - kf(t, [[.05 + i * .08, 0], [.3 + i * .08, 1, 'in']]), spO = 1 - kf(t, [[.1, 0], [.45, 1]]);
    return { a: 'daily', outlineReveal: draw, fillO: fill, bandO: band > .001 ? 1 : 0, bandClip: 380 * band, menuO: band, dotsO: 1,
      dotsSt: [0, 1, 2].map(i => ({ r: 11 * dk(i), o: dk(i) > .01 ? 1 : 0 })), specs: { o: spO } };
  }
  const makeCapture = kind => { const E = EXITS[kind]; return { dur: E + 3.6, fn: t => {
    if (t < E) return exitFrame(kind, t, E);
    const T = t - E; // the capture, from an empty page
    const drag = kf(T, [[0, 0], [.2, 0], [1.1, 1, 'io']]), cx = 50 + 370 * Math.pow(drag, 1.45), cy = 10 + 330 * Math.pow(drag, .6);
    const selO = kf(T, [[0, 0], [.15, 1], [1.15, 1], [1.4, 0]]), crossO = kf(T, [[0, 0], [.12, 1], [1.12, 1], [1.25, 0]]), flash = kf(T, [[1.1, 0], [1.18, 1], [1.55, 0]]);
    const draw = kf(T, [[1.12, 0], [1.6, 1, 'out']]), fill = kf(T, [[1.25, 0], [1.65, 1]]), band = kf(T, [[1.45, 0], [1.95, 1, 'out']]);
    const dk = i => kf(T, [[1.9 + i * .1, 0], [2.15 + i * .1, 1, 'back']]);
    const sp = kf(T, [[2.2, 0], [2.75, 1, 'back']]), spY = -90 * (1 - sp), spO = kf(T, [[2.2, 0], [2.32, 1]]);
    const sel = selO > .01 ? `<rect x="50" y="10" width="${Math.max(0, cx - 50).toFixed(1)}" height="${Math.max(0, cy - 10).toFixed(1)}" rx="30" fill="${LE.COL.peach}" opacity="${(selO * .9).toFixed(3)}"/>` : '';
    const cross = crossO > .01 ? `<g style="stroke:var(--fg)" stroke-width="${SW}" stroke-linecap="round" opacity="${crossO.toFixed(3)}"><path d="M${cx - 44} ${cy}H${cx - 14}M${cx + 14} ${cy}H${cx + 44}M${cx} ${cy - 44}V${cy - 14}M${cx} ${cy + 14}V${cy + 44}"/></g>` : '';
    const fl = flash > .01 ? `<rect x="40" y="0" width="390" height="350" rx="44" fill="#fff" opacity="${(flash * .85).toFixed(3)}"/>` : '';
    return { a: 'daily', ...(draw < .999 ? { outlineReveal: draw } : {}), fillO: fill, bandO: band > .001 ? 1 : 0, bandClip: 380 * band, menuO: band, dotsO: 1,
      dotsSt: [0, 1, 2].map(i => ({ r: 11 * dk(i), o: dk(i) > .01 ? 1 : 0 })), specs: { y: spY, o: spO }, layers: { back: sel, front: fl, top: cross } };
  } }; };
  const CAPTURES = Object.fromEntries(Object.keys(EXITS).map(k => [k, makeCapture(k)]));
  const CAPTURE = CAPTURES.iris;

  // Strategy Breakdowns "toss", copied from the Gmail avatar (Gmail avatar_Final Cut_Opt_02, measured frame by frame
  // on 14 Nov 2026): the folder nods forward, flicks the glasses high (well over a folder-height), the folder opens
  // as one piece and catches them, closes, opens again, and they fly out and land back on the face with a settle.
  // Folder open, as in the original: the back panel is FULL height and leans left from the shared bottom-left
  // corner (so a tall peach wedge shows), the front panel leans right and drops.
  // The glasses in flight, as measured: they never spin; they turn, so their WIDTH foreshortens while their height
  // stays (on the way up from full width to ~70% at the top of the arc; out of the folder they start ~85% and open
  // back to full width as they land), and they tilt with the slope of their path (18 degrees at most). The narrow
  // glasses are redrawn as geometry, never squashed, so every stroke keeps the logo's weight.
  // While inside, they're drawn behind the front panel and cut at its top edge.
  const arcP = (cx, cy, r, a0, a1) => { const o = []; for (let i = 0; i <= 10; i++) { const a = (a0 + (a1 - a0) * i / 10) * Math.PI / 180; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; };
  const BACK = [...arcP(88, 48, 38, 180, 270), [194, 10], [206, 12], [216, 17], [240, 33], [250, 38], [262, 40], [324, 40], ...arcP(324, 78, 38, 270, 360), [362, 302], ...arcP(324, 302, 38, 0, 90), [88, 340], ...arcP(88, 302, 38, 90, 180)];
  const backPanel = k => `<path d="${LE.ptsD(BACK.map(([x, y]) => [x - k * .24 * (340 - y), y]))}" fill="${LE.COL.peach}" stroke="${LE.COL.ink}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  const openD = k => p => { const f = (340 - p[1]) / 260; return [p[0] + k * 52 * f, p[1] + k * 24 * f]; };
  // the SB glasses at width factor w (1 = as on the face), centred where they sit, moved by x, y and tilted r
  function flyingSpecs(w, x, y, r) {
    const S = LE.SPEC_SB, c = 295, X = v => c + (v - c) * w, I = LE.COL.ink;
    const L = { x: X(S.L.x), y: S.L.y, w: S.L.w * w, h: S.L.h }, R = { x: X(S.R.x), y: S.R.y, w: S.R.w * w, h: S.R.h };
    L.rx = Math.min(S.L.rx, L.w / 2); L.ry = S.L.ry; R.rx = Math.min(S.R.rx, R.w / 2); R.ry = S.R.ry;
    const hx = X(S.hookX), hr = S.hookR;
    return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} ${c} 200)" fill="none" stroke="${I}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${L.x} ${S.aY}H${hx + hr}A${hr} ${hr} 0 0 0 ${hx} ${S.aY + hr}V${S.hookEnd}"/><path d="M${L.x + L.w} ${S.bY}L${R.x} ${S.bY}"/>
      <path d="${LE.rrD(L)}" fill="${LE.COL.lens}"/><path d="${LE.rrD(R)}" fill="${LE.COL.lens}"/></g>`;
  }
  const tossY = t => kf(t, [[0, 0], [.32, 10], [.46, 4], [1.02, -500, 'out'], [1.56, 90, 'in'], [2.7, 90], [3.26, -470, 'out'], [3.9, 0, 'in'], [3.98, 11, 'out'], [4.12, -4, 'io'], [4.24, 1.5], [4.34, 0]]);
  const yaw = t => t < 2 ? kf(t, [[.46, 1], [.7, .95], [1.02, .7, 'out'], [1.56, .68]]) : kf(t, [[2.7, .85], [3.26, .92], [3.9, 1, 'out']]);
  const TOSS = { dur: 5.1, n: 0, fn: t => {
    const open = kf(t, [[0, 0], [.62, 0], [1.0, 1, 'out'], [1.55, 1], [1.88, 0, 'io'], [2.4, 0], [2.76, 1, 'out'], [3.3, 1], [3.66, 0, 'io']]);
    const y = tossY(t), vy = (tossY(t + .012) - tossY(t - .012)) / .024;
    const x = kf(t, [[0, 0], [.46, 0], [.98, -14], [1.5, 4], [2.7, 4], [3.22, 10], [3.86, 0]]);
    const tilt = Math.max(-18, Math.min(18, vy * .028));
    const nod = kf(t, [[0, 0], [.32, 7, 'io'], [.46, -2.5, 'out'], [.62, 0, 'io']]);
    const caught = kf(t, [[0, 0], [1.5, 0], [1.6, 1, 'out'], [1.82, 0, 'io']]), land = kf(t, [[0, 0], [3.86, 0], [3.97, 1, 'out'], [4.2, 0, 'io']]);
    const flying = t > .46 && t < 3.9, inside = t > .98 && t < 3.25, edge = 80 + 24 * open, cid = 'toss' + (++TOSS.n);
    const fly = flying ? flyingSpecs(yaw(t), x, y, inside && y > 60 ? 0 : tilt) : '';
    return { a: 'sb', deform: openD(open), tab: { o: 0 }, root: { r: nod + 2 * caught - 1.5 * land, y: 5 * caught + 3 * land + Math.max(0, nod) * .6 },
      specs: flying ? { o: 0 } : { x, y, r: tilt },
      layers: { back: backPanel(open), ...(flying ? inside ? { mid: `<defs><clipPath id="${cid}"><rect x="-600" y="-1200" width="1700" height="${1200 + edge}"/></clipPath></defs><g clip-path="url(#${cid})">${fly}</g>` } : { front: fly } : {}) } };
  } };
  const DAILY = { capture: CAPTURE, corners: 'daily-screenshot', dots: 'daily-dotsdrop', draw: 'daily-drawon' };
  Site.homeMotions = { TOSS, CAPTURE, CAPTURES }; // for frame-by-frame checks

  // quicker.chat: the nav pill's own behaviour (design/beehiiv-post-style/qc-mark-player.js), ported. The glasses
  // turn into typing dots the moment you hover, the dots wave for as long as you stay, and on leave they finish
  // the wave they're on, then pop back into the glasses.
  // resting idles for the 3 marks (Tom: only these, never the hover animations): blink once, blink twice, and the
  // look-around. "Blink once" is the Brand Guide's double blink with its second blink cut (it closes at 1.1s and 1.4s).
  const IDLE_SET = c => { const M = Site.MOTION, dbl = M[`${c}-blink`], once = { id: `${c}-blink1`, dur: 1.8, fn: u => dbl.fn(u < 1.3 ? u : 2) };
    return [once, once, dbl, M[`${c}-look`]]; };
  function qcTyping(el) {
    const D = 2, AMP = 14 + D * SW * .35, F = 1.3, IN = .45, OUT = .9, E = LM.E, cl = v => Math.max(0, Math.min(1, v));
    const st = { phase: 'rest', shrink: 0, arm: 1, tau: 0, u: 0, hover: false, outAt: null, last: 0, idle: null, nextIdle: 0 };
    const IDLES = IDLE_SET('qc');
    const m = new Mark(el, 'qc', { vb: ICON_VB }).drive(now => {
      const dt = st.last ? Math.min(.05, now - st.last) : 0; st.last = now;
      // at rest, a random idle every few seconds: mostly blinks, sometimes the long look-around. When it glances
      // right, the arm's hook is kept outside the bubble, so the gap in the outline never fills in.
      if (st.phase === 'rest' && !st.hover) {
        if (!st.idle && now > st.nextIdle) { st.idle = { m: IDLES[Math.floor(Math.random() * IDLES.length)], t0: now }; }
        if (st.idle) { const u = now - st.idle.t0; if (u < st.idle.m.dur) { const s2 = st.idle.m.fn(u); return { ...s2, specs: { ...(s2.specs || {}), x: Math.min(14, (s2.specs && s2.specs.x) || 0) } }; }
          st.idle = null; st.nextIdle = now + 4 + Math.random() * 5; }
      } else st.idle = null;
      if (!st.nextIdle) st.nextIdle = now + 3 + Math.random() * 4;
      if (st.phase === 'in') { st.u = Math.min(1, st.u + dt / IN); st.shrink = E.in(st.u); st.arm = 1 - E.in(cl(st.u * 1.25)); if (st.u >= 1) { st.phase = 'wave'; st.tau = 0; } }
      else if (st.phase === 'wave') { st.tau += dt; if (!st.hover && st.outAt != null && st.tau >= st.outAt) { st.phase = 'out'; st.u = 0; st.tau = 0; st.outAt = null; } }
      else if (st.phase === 'out') { st.u = Math.min(1, st.u + dt / OUT); st.shrink = 1 - E.back(cl(st.u / .6)); st.arm = E.out(cl((st.u - .5) / .5)); if (st.u >= 1) { st.phase = 'rest'; st.shrink = 0; st.arm = 1; } }
      const wv = i => st.phase === 'wave' ? AMP * Math.max(0, Math.sin(2 * Math.PI * (F * st.tau - .17 * i))) : 0;
      return LM.dotsPose('qc', D, st.shrink, st.arm, wv);
    });
    return { m, hover(on) { st.hover = on;
      if (on) { st.outAt = null; if (st.phase === 'rest') { st.phase = 'in'; st.u = 0; } else if (st.phase === 'out') { st.phase = 'in'; st.u = Math.cbrt(cl(st.shrink)); } }
      else if (st.phase === 'wave') st.outAt = Math.ceil(st.tau * F - 1e-6) / F;
      else if (st.phase === 'in') st.outAt = 1 / F; } };
  }

  // ---------- bio ----------
  let marks = [];
  function renderBio() {
    marks.forEach(m => m.destroy()); marks = [];
    const chip = c => `<a class="il" data-c="${c}" href="${P[c].url}" target="_blank" rel="noopener"><span class="ic"></span><span class="t">${P[c].name}</span></a>`;
    const SPONSOR = 'https://sponsor.strategybreakdowns.com/?utm_source=sb_tomalder&utm_medium=website&utm_campaign=homepage&utm_content=sponsorships';
    const paras = COPY[opt.copy].paras, inline = paras.some(p => p.includes('{work}')); // copy with its own "work with us" link drops the separate media-kit line
    $('.bio').innerHTML = paras.map(p => `<p>${p.replace(/\{(sb|daily|qc)\}/g, (_, c) => chip(c)).replace('{work}', `<a class="work" href="${SPONSOR}" target="_blank" rel="noopener"><span class="t">work with us</span></a>`)}</p>`).join('')
      + (inline ? '' : `<p class="cta">Selling to founders? <a href="${SPONSOR}" target="_blank" rel="noopener"><span class="t">Here's the media kit</span><i>↗</i></a></p>`);
    document.querySelectorAll('.il').forEach(a => {
      const c = a.dataset.c, ic = a.querySelector('.ic');
      if (c === 'qc') { const q = qcTyping(ic); marks.push(q.m); a.addEventListener('mouseenter', () => q.hover(true)); a.addEventListener('mouseleave', () => q.hover(false)); return; }
      const m = new Mark(ic, c, { vb: ICON_VB }), rest = () => m.idle(IDLE_SET(c), [4, 9]); rest(); marks.push(m);
      const motion = () => c === 'sb' ? TOSS : opt.daily === 'capture' ? CAPTURES[opt.exit] : DAILY[opt.daily];
      a.addEventListener('mouseenter', () => m.hold(motion()));
      a.addEventListener('mouseleave', () => m.release(rest));
      if (c === 'sb') { const cta = $('.cta a, .bio a.work'); if (cta) { cta.addEventListener('mouseenter', () => m.hold(TOSS)); cta.addEventListener('mouseleave', () => m.release(rest)); } }
    });
  }

  // ---------- writing timeline ----------
  let tlDestroy = null;
  function renderTimeline() { if (tlDestroy) tlDestroy(); const mount = $('.tl-mount'); mount.innerHTML = ''; tlDestroy = Site.timelines[0].mount(mount); }

  // ---------- dev options (not in the final site) ----------
  // shown on localhost, or anywhere with ?dev in the address; visitors to tomalder.me never see it
  const DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).has('dev');
  function renderDev() {
    if (!DEV) { $('.dev').hidden = true; return; }
    const row = (label, key, items) => `<div><b>${label}</b>${items.map(([v, n]) => `<button data-k="${key}" data-v="${v}" class="${opt[key] === v ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    $('.dev').innerHTML = row('Copy', 'copy', COPY.map((c, i) => [i, `${i + 1} ${c.name}`]))
      + row('Spotify', 'spotify', [['off', 'Off'], ['on', 'On: hover the Spotify icon']])
      + row('Screenshots', 'daily', [['capture', 'Capture'], ['corners', 'Corners'], ['dots', 'Dots drop'], ['draw', 'Draw on']])
;
  }
  $('.dev').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k, v = ['daily', 'dot', 'ask', 'exit', 'edge', 'click', 'spotify'].includes(k) ? b.dataset.v : +b.dataset.v;
    opt[k] = v; save(); renderDev(); if (k === 'copy' || k === 'daily') renderBio(); if (k === 'tl') renderTimeline(); if (k === 'click') setClick(v); if (k === 'spotify') Site.setSpotifyMode && Site.setSpotifyMode(v === 'on'); if (k === 'edge') document.documentElement.dataset.edge = v; if (k === 'exit') renderBio(); });

  // the page only scrolls when its real content (bio, ruler and a normal-sized pile, ~460px under the ruler) can't fit
  // the window; otherwise it never scrolls, so a card dragged or enlarged off the edge can't create scrollbars
  const fitCheck = () => { const ax = document.querySelector('.tl-axis'); if (!ax) return; const bottom = ax.getBoundingClientRect().bottom + scrollY + 460;
    document.documentElement.classList.toggle('fits', bottom <= innerHeight); };
  addEventListener('resize', fitCheck);
  renderBio(); renderTimeline(); renderDev(); requestAnimationFrame(fitCheck);
})();
