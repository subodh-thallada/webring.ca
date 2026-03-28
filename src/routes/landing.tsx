import { Hono } from 'hono'
import { raw } from 'hono/html'
import type { Bindings } from '../types'
import { getActiveMembers } from '../data'
import { CANADA_VIEWBOX, CANADA_PATH, projectToSvg } from '../lib/canada-map'
import Layout from '../templates/Layout'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  c.header('Cache-Control', 'public, max-age=300')
  const active = await getActiveMembers(c.env.WEBRING)

  return c.html(
    <Layout fullHeight hideChrome>
      {raw(`<style>
        .landing {
          display: flex;
          flex: 1;
          min-height: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
        }

        /* ── Left column — single CSS grid ── */
        .landing-left {
          flex: 0 0 47%;
          display: grid;
          grid-template-rows:
            auto          /* title */
            auto 1fr      /* about header, about body (open) */
            auto 0fr      /* members header, members body */
            auto 0fr;     /* join header, join body */
          transition: grid-template-rows 0.4s ease;
          align-content: start;
          position: relative;
          border-left: 2px solid var(--border-strong);
          border-right: 2px solid var(--border-strong);
          padding-bottom: 3.5rem;
        }

        /* ── Site title ── */
        .landing-title {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          padding: 1.5rem 2rem;
          line-height: 1.1;
          color: var(--fg);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .landing-title-flag {
          height: 1.2em;
          width: auto;
          display: inline-block;
          flex-shrink: 0;
        }

        /* ── Accordion headers ── */
        .accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.1rem 2rem;
          background: none;
          border: none;
          border-top: 2px solid var(--border-strong);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 2.8rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--fg);
          text-align: left;
          line-height: 1.15;
        }
        .accordion-toggle {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border: 1.5px solid var(--border-strong);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .accordion-toggle svg {
          width: 16px;
          height: 16px;
          stroke: var(--fg);
          stroke-width: 2;
          fill: none;
        }

        /* ── Accordion bodies ── */
        .accordion-body {
          overflow: hidden;
          min-height: 0;
        }
        .accordion-body-inner {
          padding: 0 2rem 1.8rem;
        }
        .accordion-about {
          font-size: 1.15rem;
          font-weight: 400;
          line-height: 1.55;
          color: var(--fg);
          max-width: 42ch;
        }

        /* ── Members list ── */
        .member-list { list-style: none; padding-left: 0; }
        .member-list li {
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .member-list li:first-child { border-top: 1px solid var(--border); }
        .member-list-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--fg);
          text-decoration: none;
        }
        .member-list-name:hover { color: var(--accent); }
        .member-list-meta {
          font-size: 0.8rem;
          font-weight: 400;
          color: var(--fg-muted);
        }

        /* ── Join section ── */
        .join-text {
          font-size: 1.05rem;
          line-height: 1.55;
          color: var(--fg);
          margin-bottom: 1rem;
        }
        .join-link {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent);
          text-decoration: none;
        }
        .join-link:hover { opacity: 0.7; }

        /* ── Widget ── */
        .landing-widget {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          border-top: 2px solid var(--border-strong);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          background: var(--bg);
        }
        .landing-widget a {
          color: var(--fg);
          text-decoration: none;
          transition: color 0.15s;
        }
        .landing-widget a:visited { color: var(--fg); }
        .landing-widget a:hover { color: var(--accent); }
        .landing-widget-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--fg-muted);
          flex-shrink: 0;
        }

        /* ── Right column — map ── */
        .landing-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }
        .canada-map {
          width: 100%;
          max-width: 600px;
          height: auto;
        }
        .canada-outline {
          fill: none;
          stroke: var(--border);
          stroke-width: 1.5;
          stroke-linejoin: round;
        }
        .canada-dot {
          fill: var(--accent);
          opacity: 0.85;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          transform-origin: center;
          transform-box: fill-box;
        }
        .canada-dot:hover {
          opacity: 1;
          transform: scale(1.6);
        }
        .canada-dot.is-highlighted {
          opacity: 1;
          transform: scale(1.6);
        }

        /* ── Landing theme toggle ── */
        .landing-theme-toggle {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: 1.5px solid var(--border-strong);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg);
          transition: opacity 0.2s;
          z-index: 10;
        }
        .landing-theme-toggle:hover { opacity: 0.6; }

        /* ── Responsive ── */
        @media (max-width: 767px) {
          .landing { flex-direction: column; height: auto; }
          .landing-left {
            border-left: none;
            border-right: none;
            border-bottom: 2px solid var(--border-strong);
            /* all bodies collapsed on mobile by default, JS overrides */
            grid-template-rows:
              auto
              auto 1fr
              auto 0fr
              auto 0fr !important;
          }
          .landing-title { font-size: 2.2rem; padding: 1.2rem 1.5rem; }
          .accordion-header { font-size: 1.8rem; padding: 1rem 1.5rem; }
          .accordion-body-inner { padding: 0 1.5rem 1.5rem; }
          .accordion-toggle { width: 30px; height: 30px; }
          .accordion-toggle svg { width: 14px; height: 14px; }
          .landing-right {
            flex: none;
            min-height: 40vh;
            padding: 1.5rem;
          }
          .landing-theme-toggle { top: 1.2rem; right: 1rem; width: 30px; height: 30px; }
          .landing-theme-toggle svg { width: 14px; height: 14px; }
        }
      </style>`)}
      {raw(`<noscript><style>.landing-left { grid-template-rows: auto auto 1fr auto 1fr auto 1fr !important; } .accordion-toggle { display: none; }</style></noscript>`)}
      <div class="landing">
        {raw(`<button class="landing-theme-toggle" onclick="__toggleTheme()" aria-label="Toggle theme"><svg class="theme-icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg class="theme-icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>`)}
        <div class="landing-left" id="landing-left">
          <a href="/" class="landing-title">webring.ca <img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg" alt="Flag of Canada" class="landing-title-flag" /></a>

          <button class="accordion-header" aria-expanded="true" aria-controls="accordion-about" data-index="0">
            <span>About</span>
            <span class="accordion-toggle" aria-hidden="true">
              {raw('<svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8" /></svg>')}
            </span>
          </button>
          <div class="accordion-body" id="accordion-about">
            <div class="accordion-body-inner">
              <p class="accordion-about">webring.ca is a curated community of Canadian builders, designers, and creators. We connect and showcase the diverse talent across Canada, fostering collaboration and innovation in the digital space.</p>
            </div>
          </div>

          <button class="accordion-header" aria-expanded="false" aria-controls="accordion-members" data-index="1">
            <span>Members</span>
            <span class="accordion-toggle" aria-hidden="true">
              {raw('<svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8" /><line x1="8" y1="3" x2="8" y2="13" /></svg>')}
            </span>
          </button>
          <div class="accordion-body" id="accordion-members">
            <div class="accordion-body-inner">
              {active.length === 0 ? (
                <p class="accordion-about">No members yet.</p>
              ) : (
                <ul class="member-list">
                  {active.map((m) => (
                    <li data-member-slug={m.slug}>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" class="member-list-name">{m.name}</a>
                      <span class="member-list-meta">{m.city ?? ''}{m.city ? ' \u00b7 ' : ''}{m.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button class="accordion-header" aria-expanded="false" aria-controls="accordion-join" data-index="2">
            <span>Join</span>
            <span class="accordion-toggle" aria-hidden="true">
              {raw('<svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8" /><line x1="8" y1="3" x2="8" y2="13" /></svg>')}
            </span>
          </button>
          <div class="accordion-body" id="accordion-join">
            <div class="accordion-body-inner">
              <p class="join-text">
                <strong>{active.length} member{active.length !== 1 ? 's' : ''}</strong> across Canada.
                Add your site to the ring and join a community of builders sharing their work on the open web.
              </p>
              <a href="/join" class="join-link">Join the ring {raw('&rarr;')}</a>
            </div>
          </div>

          <div class="landing-widget">
            <a href="/random">{raw('&larr;')} prev</a>
            <span class="landing-widget-dot"></span>
            <a href="/random">{raw('&#x1F341;')} webring.ca</a>
            <span class="landing-widget-dot"></span>
            <a href="/random">next {raw('&rarr;')}</a>
          </div>
        </div>

        <div class="landing-right">
          <svg
            class="canada-map"
            viewBox={CANADA_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={`Map of Canada showing ${active.filter(m => m.lat != null).length} member locations`}
          >
            <path d={CANADA_PATH} class="canada-outline" />
            {active.map((m) => {
              if (m.lat == null || m.lng == null) return null
              const { x, y } = projectToSvg(m.lat, m.lng)
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  class="canada-dot"
                  data-slug={m.slug}
                >
                  <title>{m.name}{m.city ? ` — ${m.city}` : ''}</title>
                </circle>
              )
            })}
          </svg>
        </div>
      </div>
      {raw(`<script>
(function() {
  var MINUS = '<svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8" /></svg>';
  var PLUS = '<svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8" /><line x1="8" y1="3" x2="8" y2="13" /></svg>';
  var state = [true, false, false];
  var left = document.getElementById('landing-left');
  var headers = left.querySelectorAll('.accordion-header');

  function updateGrid() {
    var rows = 'auto';
    for (var i = 0; i < state.length; i++) {
      rows += ' auto ' + (state[i] ? '1fr' : '0fr');
    }
    left.style.gridTemplateRows = rows;
  }

  headers.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var i = parseInt(btn.getAttribute('data-index'), 10);
      var opening = !state[i];
      if (opening) {
        for (var j = 0; j < state.length; j++) {
          if (j !== i && state[j]) {
            state[j] = false;
            var otherBtn = headers[j];
            otherBtn.querySelector('.accordion-toggle').innerHTML = PLUS;
            otherBtn.setAttribute('aria-expanded', 'false');
          }
        }
      }
      state[i] = opening;
      var icon = btn.querySelector('.accordion-toggle');
      icon.innerHTML = opening ? MINUS : PLUS;
      btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      updateGrid();
    });
  });

  // Cross-panel hover: member list ↔ map dots
  var memberItems = document.querySelectorAll('[data-member-slug]');
  var mapDots = document.querySelectorAll('.canada-dot');

  memberItems.forEach(function(li) {
    var slug = li.getAttribute('data-member-slug');
    li.addEventListener('mouseenter', function() {
      mapDots.forEach(function(dot) {
        if (dot.getAttribute('data-slug') === slug) {
          dot.classList.add('is-highlighted');
        }
      });
    });
    li.addEventListener('mouseleave', function() {
      mapDots.forEach(function(dot) {
        dot.classList.remove('is-highlighted');
      });
    });
  });
})();
</script>`)}
    </Layout>
  )
})

export default app
