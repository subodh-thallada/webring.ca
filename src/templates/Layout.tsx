import type { FC, PropsWithChildren } from 'hono/jsx'
import { raw } from 'hono/html'

const Layout: FC<PropsWithChildren<{ title?: string; fullHeight?: boolean; hideChrome?: boolean }>> = ({ title, fullHeight, hideChrome, children }) => {
  const pageTitle = title ? `${title} — webring.ca` : 'webring.ca'

  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{pageTitle}</title>
          <meta name="description" content="A webring for Canadian builders — developers, designers, and founders." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Space+Grotesk:wght@400;500;600;700&amp;family=Space+Mono:wght@400;700&amp;display=swap" rel="stylesheet" />
          {raw(`<script>(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);window.__toggleTheme=function(){var d=document.documentElement,c=d.getAttribute('data-theme'),isDark=c?c==='dark':matchMedia('(prefers-color-scheme:dark)').matches,n=isDark?'light':'dark';d.setAttribute('data-theme',n);localStorage.setItem('theme',n)}})()</script>`)}
          <style>{raw(`
            :root {
              color-scheme: light;
              --bg: #fff;
              --fg: #1a1a1a;
              --fg-muted: #888;
              --fg-faint: #bbb;
              --border: #e0ddd8;
              --border-strong: #1a1a1a;
              --accent: #c22;
              --accent-visited: #922;
              --code-bg: #f3f1ed;
            }
            @media (prefers-color-scheme: dark) {
              :root:not([data-theme="light"]) {
                color-scheme: dark;
                --bg: #111110;
                --fg: #e0ddd8;
                --fg-muted: #666;
                --fg-faint: #444;
                --border: #2a2927;
                --border-strong: #e0ddd8;
                --accent: #f55;
                --accent-visited: #d44;
                --code-bg: #1a1918;
              }
            }
            [data-theme="dark"] {
              color-scheme: dark;
              --bg: #111110;
              --fg: #e0ddd8;
              --fg-muted: #666;
              --fg-faint: #444;
              --border: #2a2927;
              --border-strong: #e0ddd8;
              --accent: #f55;
              --accent-visited: #d44;
              --code-bg: #1a1918;
            }
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: var(--fg);
              background: var(--bg);
            }
            nav {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.9rem 2.5rem;
              border-bottom: 1px solid var(--border);
            }
            .site-name {
              font-family: 'Space Mono', monospace;
              font-weight: 700;
              font-size: 0.9rem;
              color: var(--fg);
              text-decoration: none;
              letter-spacing: -0.02em;
            }
            .nav-links { display: flex; gap: 1.75rem; align-items: center; }
            .nav-links a {
              font-family: 'Space Mono', monospace;
              color: var(--fg-muted);
              text-decoration: none;
              font-size: 0.78rem;
              transition: color 0.2s;
            }
            .nav-links a:hover { color: var(--fg); }
            .theme-toggle {
              background: none;
              border: none;
              cursor: pointer;
              padding: 0.2rem;
              color: var(--fg-muted);
              display: flex;
              align-items: center;
              transition: color 0.2s;
            }
            .theme-toggle:hover { color: var(--fg); }
            .theme-icon-sun, .theme-icon-moon { width: 16px; height: 16px; }
            .theme-icon-sun { display: none; }
            @media (prefers-color-scheme: dark) {
              :root:not([data-theme="light"]) .theme-icon-sun { display: block; }
              :root:not([data-theme="light"]) .theme-icon-moon { display: none; }
            }
            [data-theme="dark"] .theme-icon-sun { display: block !important; }
            [data-theme="dark"] .theme-icon-moon { display: none !important; }
            [data-theme="light"] .theme-icon-sun { display: none !important; }
            [data-theme="light"] .theme-icon-moon { display: block !important; }
            main { min-height: 60vh; padding: 2rem 2.5rem; }
            footer {
              border-top: 1px solid var(--border);
              padding: 0.5rem 2.5rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: 'Space Mono', monospace;
              font-size: 0.65rem;
              color: var(--fg-faint);
            }
            footer a { color: var(--fg-faint); text-decoration: none; transition: color 0.15s; }
            footer a:hover { color: var(--fg-muted); }
            a { color: var(--accent); }
            a:visited { color: var(--accent-visited); }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; font-weight: 700; letter-spacing: -0.03em; }
            h2 { font-size: 1.2rem; margin-bottom: 0.75rem; }
            p { margin-bottom: 1rem; }
            code { background: var(--code-bg); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.9em; font-family: 'Space Mono', monospace; }
            pre { background: var(--code-bg); padding: 1rem; border-radius: 4px; overflow-x: auto; margin-bottom: 1rem; }
            pre code { background: none; padding: 0; }
            ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
            li { margin-bottom: 0.25rem; }
            .full-height { min-height: 100vh; display: flex; flex-direction: column; }
            .full-height .container { flex: 1; display: flex; flex-direction: column; min-height: 0; }
            .full-height main { flex: 1; display: flex; flex-direction: column; min-height: 0; padding: 0; }
            @media (max-width: 767px) {
              .full-height { min-height: auto; }
            }
          `)}</style>
          <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js" async></script>
        </head>
        <body class={fullHeight ? 'full-height' : ''}>
          <div class="container">
            {!hideChrome && (
              <nav>
                <a href="/" class="site-name">webring.ca</a>
                <div class="nav-links">
                  <a href="/join">join</a>
                  <a href="/directory">directory</a>
                  {raw(`<button class="theme-toggle" onclick="__toggleTheme()" aria-label="Toggle theme"><svg class="theme-icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg class="theme-icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>`)}
                </div>
              </nav>
            )}
            <main>
              {children}
            </main>
            {!hideChrome && (
              <footer>
                <span>A webring for Canadian builders</span>
                <a href="https://github.com/stanleypangg/webring.ca">GitHub</a>
              </footer>
            )}
          </div>
        </body>
      </html>
    </>
  )
}

export default Layout
