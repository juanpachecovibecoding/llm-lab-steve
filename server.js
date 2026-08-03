'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT     = process.argv[2] || 3000;
const SITE_DIR = path.join(__dirname, 'site');
const HTML_DIR = path.join(__dirname, 'html-raw');

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css',
  '.js'  : 'application/javascript',
  '.json': 'application/json',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf' : 'font/ttf',
  '.mp4' : 'video/mp4',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
};

// ── Games config ──────────────────────────────────────────────────────────────
const GAMES = {
  mc:        { name: 'Aventurero de Minecraft', age: '6+ años', description: 'Guía a Steve o Alex por un mapa lineal y usa bloques básicos de movimiento para completar misiones sencillas.', levels: 14, emoji: '⛏️' },
  minecraft: { name: 'Minecraft Diseñador',    age: '7+ años', description: 'Programa tus propias reglas de juego y controla el comportamiento de los monstruos mediante eventos de causa y efecto.', levels: 12, emoji: '🏗️' },
  hero:      { name: 'El viaje del héroe',      age: '8+ años', description: 'Coordina tus acciones con un ayudante robótico y utiliza funciones complejas para superar obstáculos difíciles.', levels: 12, emoji: '🦸' },
  aquatic:   { name: 'Viaje acuático',          age: '9+ años', description: 'Explora el fondo del océano y resuelve acertijos avanzados combinando bucles con condicionales lógicos.', levels: 12, emoji: '🐠' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function serveFile(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
    res.end(data);
    return true;
  } catch (e) {
    return false;
  }
}

function proxyToCodeOrg(req, res, reqPath) {
  const options = {
    hostname: 'studio.code.org',
    path: reqPath,
    method: req.method,
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*', 'Accept-Encoding': 'identity' },
  };
  const proxyReq = https.request(options, (proxyRes) => {
    const chunks = [];
    proxyRes.on('data', c => chunks.push(c));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks);
      // Auto-cache: save to site/ for future offline use
      if (proxyRes.statusCode === 200 && req.method === 'GET') {
        const ext = path.extname(reqPath.split('?')[0]).toLowerCase();
        const cacheableExts = ['.js','.css','.png','.jpg','.jpeg','.gif','.svg',
                               '.ico','.woff','.woff2','.ttf','.mp3','.ogg','.wav',
                               '.mp4','.webm','.webp','.json'];
        if (cacheableExts.includes(ext)) {
          const localPath = path.join(SITE_DIR, reqPath.split('?')[0]);
          try {
            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, body);
            console.log(`  💾 cached: ${reqPath.split('?')[0]}`);
          } catch(e) { /* ignore write errors */ }
        }
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  });
  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end('Asset not available offline');
  });
  proxyReq.end();
}

// ── fixHtml: patch the game HTML for offline use ─────────────────────────────
function fixHtml(html, game, level) {
  const totalLevels = GAMES[game] ? GAMES[game].levels : 14;
  const nextLevel = level < totalLevels ? level + 1 : null;
  const nextLevelUrl = nextLevel ? `/play/${game}/${nextLevel}` : '/';

  // Styles + MutationObserver to hide the "Need help?" panel
  const injection = `
  <style>
    /* ── Hide top-right header menu & broken icons ── */
    .header_right,
    #help-button,
    #hamburger,
    #sign_in_or_user,
    .header_button,
    .show-small-desktop,
    .help_button { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }

    /* ── Hide "Need help?" sidebar — CSS fallback ── */
    [class*="hintsAndVideos"],[class*="HintsAndVideos"],
    [class*="videoThumbnail"],[class*="VideoWithCallout"],
    [class*="videoWithCallout"],[class*="authoredHints"],
    [class*="AuthoredHints"],[id="authored-hints"],
    [id="hints-and-videos"] { display: none !important; }

    /* ── Hide language/locale selector (small footer) ── */
    #page-small-footer,
    .page-small-footer,
    [data-smallfooter],
    footer.small-footer,
    .small-footer,
    select[name="locale"],
    .locale-selector,
    [class*="smallFooter"],
    [class*="SmallFooter"] { display: none !important; }
  </style>

  <script>
    /* Remove "Need help?" panel + intercept Reiniciar to reload page */
    (function () {
      var SEL = [
        '[class*="hintsAndVideos"]','[class*="HintsAndVideos"]',
        '[class*="videoThumbnail"]','[class*="VideoWithCallout"]',
        '[class*="videoWithCallout"]','[class*="authoredHints"]',
        '[class*="AuthoredHints"]','[id="authored-hints"]',
        '[id="hints-and-videos"]',
      ];
      var TOP_RIGHT = ['.header_right', '#help-button', '#hamburger', '#sign_in_or_user', '.header_button', '.help_button'];
      var RESTART = ['volver a empezar','reiniciar','start over','try again','restart'];

      function patchRestart() {
        document.querySelectorAll('button,[role="button"]').forEach(function(btn) {
          if (btn._rp) return;
          var txt = btn.textContent.trim().toLowerCase();
          if (RESTART.some(function(t){ return txt.indexOf(t) !== -1; })) {
            btn._rp = true;
            btn.addEventListener('click', function(e) {
              e.preventDefault(); e.stopImmediatePropagation();
              window.location.reload();
            }, true);
          }
        });
      }

      function patchLogo() {
        document.querySelectorAll('#logo_home_link, .header_logo a').forEach(function(a){
          a.href = 'https://minecraft-hoc-offline.vercel.app';
          if (!a._patched) {
            a._patched = true;
            a.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" style="margin-top:12px;vertical-align:middle;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';
          }
        });
      }

      function hideHelp() {
        patchLogo();
        // Hide top right menu / broken icons
        TOP_RIGHT.forEach(function(s){
          try { document.querySelectorAll(s).forEach(function(el){
            el.style.setProperty('display','none','important');
          }); } catch(e){}
        });
        // Hide help panels
        SEL.forEach(function(s){
          try { document.querySelectorAll(s).forEach(function(el){
            el.style.setProperty('display','none','important');
          }); } catch(e){}
        });
        document.querySelectorAll('*').forEach(function(el){
          if (el.children.length === 0 && el.textContent &&
              el.textContent.trim().match(/^(Need help|Necesitas ayuda)/i)) {
            var p = el.parentElement;
            for (var i = 0; i < 4 && p; i++) {
              if (p.className && p.className.length > 3) {
                p.style.setProperty('display','none','important'); break;
              }
              p = p.parentElement;
            }
          }
        });
        patchRestart();
      }

      document.addEventListener('DOMContentLoaded', hideHelp);
      var obs = new MutationObserver(hideHelp);
      obs.observe(document.documentElement, { childList: true, subtree: true });
      [300, 800, 1500, 3000].forEach(function(t){ setTimeout(hideHelp, t); });
    })();

    /* Disable intro autoplay video & patch appOptions for milestone modal */
    (function () {
      function fixOptions(v) {
        if (!v) return v;
        if (v.autoplayVideo) v.autoplayVideo = null;
        var p = window.location.pathname.split('/');
        var g = p[2] || '${game}';
        var l = parseInt(p[3] || '${level}', 10);
        var nUrl = '/play/' + g + '/' + (l + 1);

        if (v.dialog) {
          v.dialog.shouldShowDialog = true;
        }
        if (v.report && v.report.fallback_response) {
          try {
            var fb = typeof v.report.fallback_response === 'string' ? JSON.parse(v.report.fallback_response) : v.report.fallback_response;
            if (fb && fb.success) {
              fb.success.redirect = nUrl;
              fb.success.new_level_completed = true;
            }
            v.report.fallback_response = typeof v.report.fallback_response === 'string' ? JSON.stringify(fb) : fb;
          } catch(e){}
        }
        return v;
      }

      var _origParse = JSON.parse;
      JSON.parse = function(s) {
        var r = _origParse.apply(this, arguments);
        if (r && (r.autoplayVideo !== undefined || r.dialog !== undefined || r.report !== undefined)) {
          fixOptions(r);
        }
        return r;
      };

      try {
        Object.defineProperty(window, 'appOptions', {
          get: function() { return window._appOptions; },
          set: function(v) {
            window._appOptions = fixOptions(v);
          },
          configurable: true,
        });
      } catch(e){}
    })();

    /* ── OFFLINE / VERCEL API INTERCEPTOR ──────────────────────────────────
       Intercepts XHR / fetch / jQuery.ajax milestone calls so congratulations
       dialog appears both offline and when hosted on Vercel.
    ──────────────────────────────────────────────────────────────────── */
    (function () {
      function getNextLevelUrl() {
        var p = window.location.pathname.split('/');
        var g = p[2] || '${game}';
        var l = parseInt(p[3] || '${level}', 10);
        return '/play/' + g + '/' + (l + 1);
      }

      function getMilestoneObj() {
        var nUrl = getNextLevelUrl();
        return {
          redirect: nUrl,
          next_level_url: nUrl,
          new_level_completed: true,
          puzzle_ratings_enabled: false,
          share_url: null,
          phone_share_url: null,
          success: {
            redirect: nUrl,
            new_level_completed: true
          }
        };
      }

      /* 1. Intercept jQuery.ajax */
      function patchJQuery() {
        if (window.jQuery && window.jQuery.ajax) {
          var _ajax = window.jQuery.ajax;
          window.jQuery.ajax = function(url, options) {
            if (typeof url === 'object') {
              options = url;
              url = options ? options.url : '';
            }
            if (url && (url.indexOf('milestone') !== -1 || url.indexOf('/api/v1/') !== -1)) {
              var obj = getMilestoneObj();
              if (options && typeof options.success === 'function') {
                setTimeout(function() { options.success(obj); }, 10);
              }
              if (options && typeof options.complete === 'function') {
                setTimeout(function() { options.complete({ status: 200, responseJSON: obj }, 'success'); }, 20);
              }
              var d = window.jQuery.Deferred();
              d.resolve(obj);
              return d.promise();
            }
            return _ajax.apply(this, arguments);
          };
        } else {
          setTimeout(patchJQuery, 50);
        }
      }
      patchJQuery();

      /* 2. Intercept XMLHttpRequest with event dispatching */
      var _xhrOpen = XMLHttpRequest.prototype.open;
      var _xhrSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (method, url) {
        this._url = (typeof url === 'string') ? url : '';
        return _xhrOpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function (body) {
        if (this._url && this._url.indexOf('milestone') !== -1) {
          var self = this;
          var respText = JSON.stringify(getMilestoneObj());
          setTimeout(function () {
            try {
              Object.defineProperty(self, 'status', { value: 200, writable: true });
              Object.defineProperty(self, 'statusText', { value: 'OK', writable: true });
              Object.defineProperty(self, 'readyState', { value: 4, writable: true });
              Object.defineProperty(self, 'responseText', { value: respText, writable: true });
              Object.defineProperty(self, 'response', { value: respText, writable: true });
            } catch(e){}
            try { self.dispatchEvent(new Event('readystatechange')); } catch(e){}
            try { self.dispatchEvent(new Event('load')); } catch(e){}
            if (typeof self.onreadystatechange === 'function') self.onreadystatechange();
            if (typeof self.onload === 'function') self.onload();
          }, 10);
          return;
        }
        return _xhrSend.apply(this, arguments);
      };

      /* 3. Intercept fetch */
      if (typeof window.fetch === 'function') {
        var _origFetch = window.fetch;
        window.fetch = function (resource, options) {
          var urlStr = (typeof resource === 'string') ? resource : (resource && resource.url) ? resource.url : '';
          if (urlStr && urlStr.indexOf('milestone') !== -1) {
            var respText = JSON.stringify(getMilestoneObj());
            return Promise.resolve(new Response(respText, {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          return _origFetch.call(this, resource, options);
        };
      }
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">`;

  return html
    // Remove analytics / tracking pixels
    .replace(/<img[^>]+api\/hour\/begin[^>]+>/g, '')
    .replace(/<img[^>]+api\/hour\/finish[^>]+>/g, '')
    // Remove 3rd-party tracking scripts
    .replace(/<script[^>]+onetrust[^>]*><\/script>/g, '')
    .replace(/<script[^>]+googletagmanager[^>]*><\/script>/g, '')
    .replace(/<script[^>]+_google_analytics[^>]*><\/script>/g, '')
    // Strip studio.code.org domain references
    .replace(/https:\/\/studio\.code\.org/g, '')
    .replace(/\/\/studio\.code\.org/g, '')
    // Replace Code.org logo link and image with Home icon
    .replace(/<a id="logo_home_link" href="[^"]*"><img [^>]*><\/a>/g,
      '<a id="logo_home_link" href="https://minecraft-hoc-offline.vercel.app" title="Inicio" style="display:flex;align-items:center;height:100%;padding:0 12px;text-decoration:none;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" style="margin-top:12px;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a>')
    .replace(/href="\/\/code\.org"/g, 'href="https://minecraft-hoc-offline.vercel.app"')
    .replace(/href="https:\/\/code\.org"/g, 'href="https://minecraft-hoc-offline.vercel.app"')
    // Update next level redirects in HTML
    .replace(/\/courses\/[\w-]+\/units\/\d+\/lessons\/\d+\/levels\/(\d+)/g, '/play/' + game + '/$1')
    .replace(/\/s\/[\w-]+\/lessons\/\d+\/levels\/(\d+)/g, '/play/' + game + '/$1')
    // Inject our styles + scripts right before </title>
    .replace('</title>', `</title>\n${injection}`);
}

// ── Landing menu ──────────────────────────────────────────────────────────────
function buildMenu() {
  const accents = {
    mc:        { border:'#5D8233', glow:'rgba(93,130,51,0.6)',   btn1:'#5D8233', btn2:'#3d5c1f', badge:'#7cb342' },
    minecraft: { border:'#E65100', glow:'rgba(230,81,0,0.6)',    btn1:'#E65100', btn2:'#bf360c', badge:'#ff7043' },
    aquatic:   { border:'#0277BD', glow:'rgba(2,119,189,0.6)',   btn1:'#0277BD', btn2:'#01579b', badge:'#29b6f6' },
    hero:      { border:'#6A1B9A', glow:'rgba(106,27,154,0.6)',  btn1:'#6A1B9A', btn2:'#4a148c', badge:'#ab47bc' },
  };
  const imgs = {
    mc:'/images/mc_aventurero.png', minecraft:'/images/mc_designer.png',
    aquatic:'/images/mc_aquatic.png', hero:'/images/mc_hero.png',
  };

  const cards = Object.entries(GAMES).map(([id, g]) => {
    const a = accents[id];
    return `
    <div class="game-card" id="card-${id}" onclick="location.href='/play/${id}/1'"
         style="--bc:${a.border};--gc:${a.glow};">
      <div class="card-img-wrap">
        <img src="${imgs[id]}" alt="${g.name}" class="card-img" loading="lazy">
        <div class="card-age-badge">${g.age}</div>
        <div class="card-badge" style="background:${a.badge}">${g.levels} niveles</div>
      </div>
      <div class="card-body">
        <div class="card-title">${g.name}</div>
        <p class="card-desc"><span class="desc-age">(${g.age})</span> ${g.description}</p>
        <button class="play-btn" style="--b1:${a.btn1};--b2:${a.btn2}">
          <span>▶</span> JUGAR
        </button>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Minecraft · Hora del Código</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'VT323',monospace;background:#0a0e1a;min-height:100vh;display:flex;flex-direction:column;align-items:center;overflow-x:hidden}

    /* Starfield background */
    .stars{position:fixed;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse at 20% 30%,rgba(93,130,51,.08) 0%,transparent 60%),
                 radial-gradient(ellipse at 80% 70%,rgba(2,119,189,.08) 0%,transparent 60%),
                 linear-gradient(180deg,#050812 0%,#0d1526 60%,#0a1f0a 100%)}
    .stars::before,.stars::after{content:'';position:absolute;inset:0;
      background-image:
        radial-gradient(1px 1px at 10% 15%,#fff 0%,transparent 100%),
        radial-gradient(1px 1px at 25% 40%,rgba(255,255,255,.7) 0%,transparent 100%),
        radial-gradient(1px 1px at 40%  8%,#fff 0%,transparent 100%),
        radial-gradient(1px 1px at 55% 25%,rgba(255,255,255,.5) 0%,transparent 100%),
        radial-gradient(1px 1px at 70% 50%,#fff 0%,transparent 100%),
        radial-gradient(1px 1px at 85% 12%,rgba(255,255,255,.8) 0%,transparent 100%),
        radial-gradient(2px 2px at 30% 85%,rgba(255,255,200,.8) 0%,transparent 100%),
        radial-gradient(2px 2px at 72% 18%,rgba(255,255,200,.9) 0%,transparent 100%);
      animation:twinkle 4s ease-in-out infinite alternate}
    .stars::after{animation-delay:-2s}
    @keyframes twinkle{0%{opacity:.6}100%{opacity:1}}

    .wrap{position:relative;z-index:1;width:100%;max-width:1200px;padding:40px 20px 0;display:flex;flex-direction:column;align-items:center}

    /* Header */
    .hdr{text-align:center;margin-bottom:48px}
    .logo-box{display:inline-block;background:#1a3a1a;border:4px solid #5D8233;border-bottom:6px solid #3d5c1f;border-right:6px solid #3d5c1f;padding:14px 28px;margin-bottom:20px}
    .logo-txt{font-family:'Press Start 2P',monospace;font-size:clamp(14px,2.5vw,22px);color:#fff;text-shadow:3px 3px 0 #3d5c1f,-1px -1px 0 #000;line-height:1.6;letter-spacing:1px}
    .logo-txt span{color:#7cb342}
    .sub{font-size:22px;color:#8bc34a;letter-spacing:2px;margin-top:8px}

    /* Grid */
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;width:100%}

    /* Card */
    .game-card{background:#111820;border:3px solid var(--bc,#555);border-bottom-width:5px;border-right-width:5px;cursor:pointer;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;display:flex;flex-direction:column}
    .game-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 50%);pointer-events:none}
    .game-card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--bc),6px 6px 30px var(--gc)}
    .game-card:active{transform:translate(0,0);box-shadow:2px 2px 0 var(--bc)}
    .card-img-wrap{position:relative;width:100%;aspect-ratio:1.25;overflow:hidden}
    .card-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;image-rendering:pixelated}
    .game-card:hover .card-img{transform:scale(1.05)}
    .card-badge{position:absolute;top:10px;right:10px;font-family:'Press Start 2P',monospace;font-size:8px;color:#fff;padding:5px 8px;border:2px solid rgba(255,255,255,.3);border-bottom-width:3px;border-right-width:3px;text-shadow:1px 1px 0 #000}
    .card-age-badge{position:absolute;top:10px;left:10px;font-family:'Press Start 2P',monospace;font-size:8px;color:#0d1520;background:#ffd54f;padding:5px 8px;border:2px solid #ffb300;border-bottom-width:3px;border-right-width:3px;font-weight:bold;text-shadow:none}
    .card-body{padding:16px 18px 18px;border-top:3px solid var(--bc);background:linear-gradient(180deg,#161e2a 0%,#0e1520 100%);display:flex;flex-direction:column;flex-grow:1}
    .card-title{font-family:'Press Start 2P',monospace;font-size:clamp(8px,1.1vw,11px);color:#fff;line-height:1.6;margin-bottom:10px;min-height:36px}
    .card-desc{font-family:'VT323',monospace;font-size:19px;color:#b0bec5;line-height:1.3;margin-bottom:16px;flex-grow:1}
    .desc-age{color:#ffd54f;font-weight:bold;margin-right:4px}
    .play-btn{width:100%;font-family:'Press Start 2P',monospace;font-size:10px;color:#fff;background:linear-gradient(180deg,var(--b1) 0%,var(--b2) 100%);border:none;border-bottom:4px solid rgba(0,0,0,.4);border-right:4px solid rgba(0,0,0,.3);border-top:2px solid rgba(255,255,255,.2);border-left:2px solid rgba(255,255,255,.15);padding:12px 10px;cursor:pointer;letter-spacing:2px;text-shadow:1px 1px 0 rgba(0,0,0,.5);transition:filter .1s,transform .1s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:auto}
    .play-btn:hover{filter:brightness(1.2)}
    .play-btn:active{transform:translateY(2px);border-bottom-width:2px}

    /* Ground strip footer */
    .ground{width:100%;margin-top:48px}
    .grass{height:24px;background:repeating-linear-gradient(90deg,#5D8233 0,#5D8233 16px,#4a6e26 16px,#4a6e26 32px,#6b9e3a 32px,#6b9e3a 48px,#527a2a 48px,#527a2a 64px)}
    .dirt{height:32px;background:repeating-linear-gradient(90deg,#8B6143 0,#8B6143 16px,#7a5235 16px,#7a5235 32px,#9c7050 32px,#9c7050 48px,#6b4423 48px,#6b4423 64px);border-top:3px solid #3d2b12}
    .foot{background:#1a0f08;text-align:center;padding:12px;font-family:'Press Start 2P',monospace;font-size:7px;color:#5D4037;letter-spacing:1px}

    @media(max-width:600px){.logo-txt{font-size:12px}.grid{grid-template-columns:1fr 1fr;gap:16px}.card-title{font-size:7px}.play-btn{font-size:8px}}
  </style>
</head>
<body>
  <div class="stars"></div>
  <div class="wrap">
    <header class="hdr">
      <div class="logo-box">
        <div class="logo-txt">⛏ MINECRAFT<br><span>HORA DEL CÓDIGO</span></div>
      </div>
      <p class="sub">▸ ELIGE UN MUNDO PARA COMENZAR ◂</p>
    </header>
    <main class="grid">${cards}</main>
  </div>
  <div class="ground">
    <div class="grass"></div>
    <div class="dirt"></div>
    <div class="foot">CODE.ORG · USO EDUCATIVO SIN CONEXIÓN · ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;
}

// ── Request handler ───────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const reqPath = url.parse(req.url).pathname;
  console.log(`${new Date().toISOString().slice(11,19)} ${req.method} ${reqPath}`);

  // Root → menu
  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(buildMenu());
  }

  // /play/:game/:level → serve patched game HTML
  const playMatch = reqPath.match(/^\/play\/(\w+)\/(\d+)$/);
  if (playMatch) {
    const [, game, levelStr] = playMatch;
    const level = parseInt(levelStr, 10);
    if (!GAMES[game]) { res.writeHead(404); return res.end('Game not found'); }
    const htmlFile = path.join(HTML_DIR, game, `${levelStr}.html`);
    try {
      let html = fs.readFileSync(htmlFile, 'utf8');
      html = fixHtml(html, game, level);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(html);
    } catch (e) {
      res.writeHead(302, { Location: '/' }); return res.end();
    }
  }

  // Serve locally-cached static assets
  if (serveFile(res, path.join(SITE_DIR, reqPath))) return;
  if (serveFile(res, path.join(SITE_DIR, reqPath, 'index.html'))) return;

  // Helper: quick JSON response
  function jsonOk(obj) {
    const body = JSON.stringify(obj);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(body);
  }

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With' });
    return res.end();
  }

  // POST /milestone/... → return success so the congratulations dialog appears
  if (req.method === 'POST' && reqPath.startsWith('/milestone/')) {
    console.log(`  ✓ milestone: ${reqPath}`);
    req.resume(); // drain body
    const referer = req.headers.referer || '';
    const match = referer.match(/\/play\/([\w-]+)\/(\d+)/);
    let nextUrl = '/';
    if (match) {
      const [, g, l] = match;
      const curLvl = parseInt(l, 10);
      const total = GAMES[g] ? GAMES[g].levels : 14;
      nextUrl = curLvl < total ? `/play/${g}/${curLvl + 1}` : '/';
    }
    return jsonOk({
      redirect: nextUrl,
      next_level_url: nextUrl,
      new_level_completed: true,
      puzzle_ratings_enabled: false,
      share_url: null,
      phone_share_url: null,
    });
  }

  // GET /courses/:game/units/1/lessons/1/levels/:level
  // → redirect to our /play/:game/:level so the next level loads properly
  const coursesMatch = reqPath.match(/^\/courses\/([\w-]+)\/units\/\d+\/lessons\/\d+\/levels\/(\d+)/);
  if (coursesMatch) {
    const [, cGame, cLevel] = coursesMatch;
    const gameKey = Object.keys(GAMES).find(k => k === cGame) || cGame;
    console.log(`  ↪ courses redirect → /play/${gameKey}/${cLevel}`);
    res.writeHead(302, { Location: `/play/${gameKey}/${cLevel}` });
    return res.end();
  }

  // API stubs — silent JSON responses for endpoints the game pings
  if (reqPath === '/api/v1/users/current')          return jsonOk({ id: null, is_signed_in: false });
  if (reqPath.startsWith('/api/user_progress/'))    return jsonOk({});
  if (reqPath.startsWith('/api/user_app_options/')) return jsonOk({});
  if (reqPath.startsWith('/api/example_solutions/'))return jsonOk([]);
  if (reqPath.includes('/get_rubric'))              return jsonOk({});
  if (reqPath.includes('/hidden_lessons'))          return jsonOk({ hidden: [] });
  if (reqPath.startsWith('/puzzle_ratings'))        return jsonOk({ status: 'ok' });
  if (reqPath.includes('hint_view_requests'))       return jsonOk([]);
  if (reqPath.startsWith('/dashboardapi/'))         return jsonOk({});
  if (reqPath.startsWith('/user_preference/'))      return jsonOk({});

  // Proxy everything else to studio.code.org (JS bundles, images, fonts…)
  console.log(`  → proxy: ${reqPath}`);
  proxyToCodeOrg(req, res, reqPath);
});

server.listen(PORT, () => {
  console.log(`\n🎮 Minecraft Hora del Código — Servidor Offline`);
  console.log(`   URL: http://localhost:${PORT}\n`);
  Object.entries(GAMES).forEach(([id, g]) =>
    console.log(`   ${g.emoji}  ${g.name} → http://localhost:${PORT}/play/${id}/1`)
  );
  console.log('');
});
