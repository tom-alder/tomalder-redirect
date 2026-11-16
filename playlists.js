// Spotify mode: an add-on to the core site, switched on in the dev panel ("Spotify"). When it is on, hovering the
// Spotify icon swaps the pile under the ruler for Tom's 6 playlist covers, with Filo bobbing his head beside them.
// The covers, back-of-sleeve copy, barcode and Filo are from the strategybreakdowns.com footer experiment
// (embeds/footer-easter-egg-spotify.html).
//   click a cover: its sleeve slides up from behind it (a covered one swings out and lands on top first)
//   click the sleeve: opens the playlist on Spotify
//   drag, resize and stack the covers and Filo exactly like any other card
(function () {
  const PL = [
    { id: 'jazzy', title: 'Jazzy Morning', saves: 92, url: 'https://open.spotify.com/playlist/3fecQD2EnvD1MtAXUkhZqp',
      desc: "Jazz in the morning is genuinely one of life's treasures.\n\n☕️ Coffee +\n🍳 Eggs +\n🌞 Sun +\n🎹 Thelonious Monk / Duke Ellington / Abdullah Ibrahim\n= 🧘" },
    { id: 'ambient', title: 'Ambient Space', saves: 85, url: 'https://open.spotify.com/playlist/1O5W9HAspT17F9gLHIEpg0',
      desc: "Hazy and atmospheric. Mostly no beat.\n\nNothing beats ambient for a calm flow-state.\n\nBrian Eno, Oneohtrix Point Never, and some of the more minimal corners of Four Tet's back catalog." },
    { id: 'techy', title: 'Techy Breaks', saves: 80, url: 'https://open.spotify.com/playlist/2ozNjULXRFfwT4iUBMOSOK',
      desc: 'Originally a collaborative playlist with a few buddies. This ones for the breakbeat and jungle heads out there.\n\nA tribute to the legendary <span style="white-space:nowrap"><span class="pl-sub" data-href="https://www.youtube.com/watch?v=v89CjsSOJ_c">Amen break</span>.</span>' },
    { id: 'deep', title: 'Deep Work', saves: 110, url: 'https://open.spotify.com/playlist/49wS4ztVCtoVKo3QzLG5Mj',
      desc: "For work, you need to be amped for.\n\nWeekend all-nighters. Launch days. Rethinking-your-entire-business-strategy mornings.\n\nWe've all been there. Deep/trancy/techy music helps.\n\n(Doubles as a workout playlist) 👟" },
    { id: 'housey', title: 'Housey Flow', saves: 125, url: 'https://open.spotify.com/playlist/4Ebplo93sSjPC6TNw8yNI7',
      desc: 'Groovy bouncy house.\n\nTrusty. Dependable. Reliable.\n\nIn the rotation at least 1 hour per day. Sometimes more like 8. 🎧' },
    { id: 'lofi', title: 'Lo-Fi Radio', saves: 79, url: 'https://open.spotify.com/playlist/2VIapn8jGg2f5wqDepnedC',
      desc: 'As much as we love&nbsp;<span class="pl-sub" data-href="https://www.youtube.com/watch?v=jfKfPfyJRdk">Lofi&nbsp;Girl</span> (creative indie internet business🤘), the \'chill beats to study to\' movement does undersell the incredible instrumental hip-hop beatmakers out there.\n\nLo-Fi Radio is built around J Dilla, Nujabes, and Madlib, plus contemporary instrumentalists like FKJ and Clams Casino.' },
  ];
  const PROFILE = 'https://open.spotify.com/user/richardalder'; // Tom's Spotify profile
  const SPOTIFY = '<svg class="pl-spotify" viewBox="0 0 168 168" aria-hidden="true"><circle cx="84" cy="84" r="84" fill="#1ED760"/><path fill="none" stroke="#0D0B22" stroke-width="13" stroke-linecap="round" d="M37 64 Q 84 49 132 64"/><path fill="none" stroke="#0D0B22" stroke-width="11" stroke-linecap="round" d="M44 88 Q 84 76 124 88"/><path fill="none" stroke="#0D0B22" stroke-width="9" stroke-linecap="round" d="M51 112 Q 84 102 117 112"/></svg>';
  // Filo with headphones, lifted from the footer
  const FILO = `<div class="pl-filo"><svg class="pl-filo-svg" viewBox="-32 0 552 360" aria-hidden="true">
    <path d="M50 48.4615C50 27.2198 67.2198 10 88.4616 10H194.136C201.866 10 209.416 12.3291 215.803 16.6836L240.197 33.3164C246.584 37.6709 254.134 40 261.864 40H323.538C344.78 40 362 57.2198 362 78.4615V121.538C362 142.78 344.78 160 323.538 160H88.4616C67.2198 160 50 142.78 50 121.538L50 48.4615Z" fill="#FFE7C6" stroke="#0D0B22" stroke-width="20"/>
    <rect x="14" y="47" width="437" height="160" rx="72" fill="#B19EF8" stroke="#0D0B22" stroke-width="18" stroke-linejoin="round"/>
    <rect x="383" y="123" width="108" height="150" rx="52" fill="#B19EF8" stroke="#0D0B22" stroke-width="18" stroke-linejoin="round"/>
    <path d="M60 117.143C60 96.6294 76.1178 80 96 80H384C403.882 80 420 96.6294 420 117.143V302.857C420 323.371 403.882 340 384 340H96C76.1178 340 60 323.371 60 302.857V117.143Z" fill="#FFFAF3"/>
    <path d="M50 170V117.143C50 96.6294 66.5655 80 87 80H383C403.435 80 420 96.6294 420 117.143V302.857C420 323.371 403.435 340 383 340H87C66.5655 340 50 323.371 50 302.857V230.5" fill="none" stroke="#0D0B22" stroke-width="20" stroke-linejoin="round"/>
    <path d="M402.155 150H357.845C336.944 150 320 166.512 320 186.88V213.12C320 233.488 336.944 250 357.845 250H402.155C423.056 250 440 233.488 440 213.12V186.88C440 166.512 423.056 150 402.155 150Z" fill="#FFFAF3" stroke="#0D0B22" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M239.002 150H190.998C168.356 150 150 166.512 150 186.88V213.12C150 233.488 168.356 250 190.998 250H239.002C261.644 250 280 233.488 280 213.12V186.88C280 166.512 261.644 150 239.002 150Z" fill="#FFFAF3" stroke="#0D0B22" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M280 200L320 200" fill="none" stroke="#0D0B22" stroke-width="20"/>
    <path d="M150 200L35 200C21.1929 200 10 211.193 10 225L10 238" fill="none" stroke="#0D0B22" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="-15" y="146" width="95" height="135" rx="45" fill="#B19EF8" stroke="#0D0B22" stroke-width="18" stroke-linejoin="round"/>
  </svg><span class="pl-notes" aria-hidden="true">
    <svg class="pl-note pl-note-a" viewBox="0 0 30 42" width="30" height="40"><path d="M24 4 V30 M24 4 C30 4 33 14 32 22" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="32" rx="8" ry="6" fill="currentColor" transform="rotate(-22 16 32)"/></svg>
    <svg class="pl-note pl-note-b" viewBox="0 0 42 36" width="38" height="32"><rect x="12" y="6" width="3.2" height="20" fill="currentColor"/><rect x="32" y="3" width="3.2" height="23" fill="currentColor"/><rect x="12" y="3" width="23" height="5" fill="currentColor" rx="0.6"/><ellipse cx="8" cy="28" rx="7" ry="5" fill="currentColor" transform="rotate(-18 8 28)"/><ellipse cx="28" cy="26" rx="7" ry="5" fill="currentColor" transform="rotate(-18 28 26)"/></svg>
    <svg class="pl-note pl-note-c" viewBox="0 0 32 44" width="32" height="42"><path d="M24 3 V30 M24 3 C30 4 33 12 32 18 M24 14 C30 16 33 22 32 28" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="34" rx="8" ry="6" fill="currentColor" transform="rotate(-22 16 34)"/></svg>
  </span></div>`;
  const barcode = () => { const pool = [1, 1, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3, 3.5, 4, 4.5, 5]; let s = ''; for (let k = 0; k < 20; k++) s += `<i style="width:${pool[Math.floor(Math.random() * pool.length)]}px"></i>`; return s; };

  // the playlists as a pile on the site's own pile engine (timelines.js), so they deal, drag, resize and stack exactly
  // like the cards for every other piece. Filo is one more card in the pile.
  let lastDown = null, downXY = [0, 0]; document.addEventListener('pointerdown', e => { lastDown = e.target; downXY = [e.clientX, e.clientY]; }, true);
  // the green play cursor comes up with a sleeve when you click a cover (never from hovering), and stays while you
  // stay on or near the pile; moving well off to the side puts everything back to normal
  let live = null; // { card, n }
  const sleeveLabel = card => { const t = card.querySelector('.pl-title'); return `<em>Play on Spotify</em><span>${t ? t.textContent : ''}</span>`; };
  // with a sleeve up, the rest of the pile fades like any pile does under the cursor: a veil the page's own colour sits
  // just beneath the open cover, so everything behind it reads as 1 faded group while the sleeve stays crisp
  const veilOn = (card, n) => { const pile = n.querySelector('.pile'); let v = pile.querySelector('.pl-veil');
    if (!v) { v = document.createElement('i'); v.className = 'pl-veil'; pile.prepend(v); }
    v.style.zIndex = card.style.zIndex; requestAnimationFrame(() => v.classList.add('on')); };
  const veilOff = n => { const v = n && n.querySelector('.pl-veil'); if (!v) return; v.classList.remove('on'); setTimeout(() => { if (!v.classList.contains('on')) v.remove(); }, 320); };
  const endSleeve = () => { if (!live) return; live.card.classList.remove('flip'); veilOff(live.n); live = null; Site.gc && Site.gc.hide('sleeve'); };
  Site.plEnd = endSleeve; // the ruler calls this whenever the pile changes or goes, so a sleeve's disc never outlives it
  // the pinned disc stays on its sleeve's edge as the page scrolls or the cover is dragged
  const pinSpot = card => { const b = card.querySelector('.pl-back'); if (!b) return null; const r = b.getBoundingClientRect(); return [Math.max(36, Math.min(innerWidth - 36, r.left + r.width / 2)), Math.max(36, Math.min(innerHeight - 40, r.bottom))]; };
  const repin = () => { if (!live || !Site.gc || !Site.gc.pinned || !Site.gc.pinned()) return; if (!live.card.isConnected) return endSleeve();
    const b = live.card.querySelector('.pl-back'), r = b && b.getBoundingClientRect(); if (!r || r.bottom < 0 || r.top > innerHeight) return endSleeve(); // scrolled off: the sleeve closes
    const q = pinSpot(live.card); if (q) Site.gc.pin(q[0], q[1]); };
  addEventListener('scroll', repin, { passive: true });
  addEventListener('pointermove', e => { if (!live) return; if (!live.card.isConnected) return endSleeve(); repin();
    const inside = [...live.n.querySelectorAll('.pile .pi')].some(o => { const r = o.getBoundingClientRect(); return e.clientX > r.left - 64 && e.clientX < r.right + 64 && e.clientY > r.top - 64 && e.clientY < r.bottom + 64; });
    if (!inside) endSleeve(); });
  // on a touchscreen the disc can't follow a pointer, so instead of sitting where you tapped (over the sleeve's words)
  // it glides to the sleeve's bottom edge once the sleeve has opened, its label underneath
  // a tap on the pinned disc where there's no card under it still plays the sleeve
  document.addEventListener('click', e => { if (!live || !live.card.isConnected || !Site.gc || !Site.gc.hit || !Site.gc.hit(e.clientX, e.clientY)) return; if (e.target.closest && e.target.closest('.pi')) return;
    const b = live.card.querySelector('.pl-back'); if (b && b.dataset.href) { e.preventDefault(); e.stopPropagation(); window.open(b.dataset.href, '_blank', 'noopener'); endSleeve(); } }, true); // and the pile stays
  const startSleeve = (card, n) => { live = { card, n }; veilOn(card, n); if (!Site.gc) return; Site.gc.show('sleeve', 'spotify', sleeveLabel(card));
    if (Site.touchy && Site.touchy()) setTimeout(() => { if (!live || live.card !== card) return; const q = pinSpot(card); if (q) Site.gc.pin(q[0], q[1]); }, 300); }; // kept on screen
  function post() {
    const covers = PL.map((p, i) => ({ cls: 'cover', id: p.id, html: `<span class="cv"><span class="pl-front"><img src="assets/pl-${p.id}.jpg" alt="${p.title} playlist cover" draggable="false"></span>
      <span class="pl-back" data-href="${p.url}" role="link"><span class="pl-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="pl-head"><span class="pl-side">Side ${i < 3 ? 'A' : 'B'}</span><span class="pl-title">${p.title}</span></span>
        <span class="pl-desc">${p.desc}</span>
        <span class="pl-foot"><span class="pl-barcode">${barcode()}</span><span class="pl-live">${SPOTIFY}<span>${p.saves} saves</span></span></span></span></span>` }));
    return { custom: 'pl', title: 'Playlists', date: '2026-11-15', url: PROFILE,
      // Filo is dealt onto the left half of the pile, so the notes floating up and right from his headphones always
      // land over the covers, never out over the page
      // plus the desk the playlists play at: a photo and a short clip
      // 1 pile: Filo sits on its left side (top, middle or bottom left, picked per visit), and the vertical desk clip
      // sits on the right side, always 2nd from the top, so most of it shows
      pile: covers.concat([{ img: 'assets/pl-desk.jpg' }, { video: 'assets/pl-desk.mp4', under: true, pos: rnd => [112 + rnd() * 18, (rnd() * 2 - 1) * 22, (rnd() < .5 ? -1 : 1) * (1.5 + rnd() * 3.5)] }], [{ cls: 'filo', html: FILO,
        pos: rnd => { const y = [-70, 0, 70][Math.floor(rnd() * 3)]; return [-128 + rnd() * 16, y + (rnd() * 2 - 1) * 10, (rnd() < .5 ? -1 : 1) * (1 + rnd() * 4)]; } }]),
      // a click shows that cover's sleeve, the way a click on any other card brings up its "open" card. The sleeve
      // links to the playlist. A covered cover first swings out and lands on top so its sleeve can be seen.
      onArm: (card, n) => {
        // a click on the sleeve (or a link in its copy) opens it; it never flips the cover shut
        // (a tap on the green disc counts as a tap on its sleeve: the disc lets taps through to whatever is under it)
        const onDisc = live && Site.gc && Site.gc.hit && Site.gc.hit(downXY[0], downXY[1]) ? live.card.querySelector('.pl-back') : null;
        const hit = onDisc || (lastDown && lastDown.closest && (lastDown.closest('.pl-sub') || lastDown.closest('.pi.cover.flip .pl-back')));
        if (hit) { window.open(hit.dataset.href, '_blank', 'noopener'); endSleeve(); return; }
        const all = [...n.querySelectorAll('.pi.cover')];
        // the desk photo and its clip open Tom's Spotify profile
        if (card && card.classList.contains('media')) { endSleeve(); all.forEach(c => c.classList.remove('flip')); window.open(PROFILE, '_blank', 'noopener'); return; }
        if (!card || !card.classList.contains('cover')) { endSleeve(); all.forEach(c => c.classList.remove('flip')); return; }
        if (card.classList.contains('flip')) { endSleeve(); return; }
        endSleeve(); all.forEach(c => c.classList.remove('flip'));
        const r = card.getBoundingClientRect(), covered = [...n.querySelectorAll('.pile .pi')].some(o => o !== card && +o.style.zIndex > +card.style.zIndex && (() => { const q = o.getBoundingClientRect(); return q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top; })());
        const raise = () => n._raise ? n._raise(card) : null; // to the true top of the stack, in front of Filo too
        if (!covered) { raise(); card.classList.add('flip'); startSleeve(card, n); return; }
        const side = (parseFloat(card.style.getPropertyValue('--x')) || 1) < 0 ? -1 : 1, x = card._x || 0, y = card._y || 0;
        card.animate([{ translate: `${x}px ${y}px` }, { translate: `${x + side * 200}px ${y - 10}px`, offset: .45 }, { translate: `${x}px ${y}px` }], { duration: 720, easing: 'cubic-bezier(.33, .8, .25, 1)' });
        setTimeout(raise, 320); setTimeout(() => { card.classList.add('flip'); startSleeve(card, n); }, 740);
      } };
  }

  // the covers, the desk photo and its clip download in the background with the rest (timelines.js), right after the
  // newest piece's: the Spotify icon is near the top, so it's often the first thing hovered
  if (Site.media) Site.media.pile(1, post().pile);
  let on = false;
  Site.setSpotifyMode = v => { on = !!v; document.documentElement.dataset.spotify = on ? 'on' : 'off'; };
  // hovering the Spotify icon (once per visit to it) brings up the playlists, like hovering a piece on the ruler
  document.addEventListener('mouseover', e => { if (Site.touchy && Site.touchy()) return; // a tap's pretend hover doesn't count
    const a = e.target.closest && e.target.closest('.so[aria-label="Spotify"]'); if (!a || a._plHover) return; a._plHover = true; if (on && Site.rcShowPost) Site.rcShowPost(post()); });
  // on a touchscreen there's no hover: the first tap on the icon brings the playlists up (and scrolls them into view)
  // instead of leaving the page; with the playlists already up, a tap goes to Spotify as normal
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('.so[aria-label="Spotify"]');
    if (!a || !on || !Site.touchy || !Site.touchy() || !Site.rcShowPost) return;
    if (document.querySelector('.rc-pane.in.pl')) return;
    e.preventDefault(); Site.rcShowPost(post()); setTimeout(() => Site.rcReveal && Site.rcReveal(), 60); }, true);
  document.addEventListener('mouseout', e => { const a = e.target.closest && e.target.closest('.so[aria-label="Spotify"]'); if (a && !a.contains(e.relatedTarget)) a._plHover = false; });
})();
