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

// ── Games config (Play Lab — Laboratorio de IA) ───────────────────────────────
const GAMES = {
  mc: {
    name: 'OpenAI Core · Data Center',
    lab: 'INFRAESTRUCTURA & NODOS',
    age: '6+ años',
    description: 'Recorre los pasillos del supercomputador, sincroniza bots de datos, recicla servidores obsoletos y tiende redes de fibra óptica de alta velocidad.',
    levels: 14,
    emoji: '⚡'
  },
  minecraft: {
    name: 'Anthropic Lab · Agentes IA',
    lab: 'ALINEACIÓN & EVENTOS',
    age: '7+ años',
    description: 'Programa tus propias reglas de alineación y controla el comportamiento autónomo de agentes de IA mediante eventos de causa y efecto.',
    levels: 12,
    emoji: '🧠'
  },
  hero: {
    name: 'DeepMind Robotics · Co-Pilot',
    lab: 'ROBÓTICA AUTÓNOMA',
    age: '8+ años',
    description: 'Coordina tus operaciones con un Agente Co-Pilot robótico y utiliza funciones avanzadas para desbloquear compuertas de seguridad.',
    levels: 12,
    emoji: '🤖'
  },
  aquatic: {
    name: 'Centro de Datos Submarino de HiCloud, China',
    lab: 'CLUSTER SUBMARINO DEEPSEEK',
    age: '9+ años',
    description: 'Sumérgete en el océano profundo para gestionar las cápsulas presurizadas de HiCloud en Hainan que procesan y entrenan modelos para DeepSeek.',
    levels: 16,
    emoji: '🌊'
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function serveFile(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
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

// ── fixHtml: patch the game HTML for offline use + Play Lab AI Mod ────────────
function fixHtml(html, game, level) {
  html = html.replace("</body>", "<script src=\"https://edu.playcode.com.ar/wp-content/plugins/playcode-domain-analytics/tracker.js\" async></script>\n</body>");

  // Replace legacy Minecraft titles with new Play Lab AI Studio names
  const gameConfig = GAMES[game];
  if (gameConfig && gameConfig.name) {
    const oldNames = [
      'Minecraft: Viaje del héroe', "Minecraft: Hero's Journey",
      'Aventurero de Minecraft', 'Minecraft: Adventurer',
      'Minecraft: Viaje acuático', 'Minecraft: Aquatic', 'Minecraft: Viaje Acuático', 'Cloud Neural · Red Submarina', 'Cloud Neural',
      'Diseñador de Minecraft Hora de Código', 'Diseñador de Minecraft', 'Minecraft: Diseñador', 'Minecraft: Designer'
    ];
    for (const old of oldNames) {
      if (html.includes(old)) {
        html = html.split(old).join(gameConfig.name);
      }
    }
  }

  // Styles + MutationObserver + Play Lab AI Total Conversion Mod
  const injection = `
  <link rel="stylesheet" href="/assets/css/playlab-ai-theme.css">
  <script src="/assets/js/playlab-ai-mod.js"></script>
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

    /* ── Responsive Game Header ── */
    @media (max-width: 600px) {
      #logo_home_link { padding: 0 6px !important; }
      #logo_home_link svg { width: 28px !important; height: 28px !important; margin-top: 8px !important; }
    }
  </style>

  <script>
    /* ── Analytics & Tracking Stubs (prevents trackEvent Uncaught TypeError) ── */
    (function () {
      var noop = function () {};
      if (typeof window.ga !== 'function') {
        window.ga = noop;
      }
      if (typeof window.trackEvent !== 'function') {
        window.trackEvent = noop;
      }
      if (!window.newrelic) {
        window.newrelic = {
          noticeError: noop,
          setErrorHandler: noop,
          finished: noop,
          recordCustomEvent: noop,
          addPageAction: noop,
          setCustomAttribute: noop
        };
      }
    })();

    /* Remove "Need help?" panel + patch header logo to return to Play Lab Home */
    (function () {
      var SEL = [
        '[class*="hintsAndVideos"]','[class*="HintsAndVideos"]',
        '[class*="videoThumbnail"]','[class*="VideoWithCallout"]',
        '[class*="videoWithCallout"]','[class*="authoredHints"]',
        '[class*="AuthoredHints"]','[id="authored-hints"]',
        '[id="hints-and-videos"]',
      ];
      function patchLogo() {
        document.querySelectorAll('#logo_home_link, .header_logo a').forEach(function(a){
          a.href = '/';
          a.title = 'Volver a Play Lab — Laboratorio de IA';
          if (!a._patched) {
            a._patched = true;
            a.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:8px;margin-top:4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span style="font-family:sans-serif;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.3px;">Play Lab</span></div>';
          }
        });
      }

      function hideHelp() {
        patchLogo();
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
              if (p.id === 'feedback-dialog' || (p.className && (p.className.indexOf('dash_modal') !== -1 || p.className.indexOf('modal') !== -1)) || p.id === 'codeApp') {
                break;
              }
              if (p.className && p.className.length > 3) {
                p.style.setProperty('display','none','important'); break;
              }
              p = p.parentElement;
            }
          }
        });
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

    /* ── OFFLINE / VERCEL API INTERCEPTOR ────────────────────────────────── */
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
              var p = d.promise();
              p.abort = function() {};
              return p;
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
  </script>`;

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
    // Replace Code.org logo link and image with Play Lab Home icon
    .replace(/<a id="logo_home_link" href="[^"]*"><img [^>]*><\/a>/g,
      '<a id="logo_home_link" href="/" title="Play Lab — Inicio" style="display:flex;align-items:center;height:100%;padding:0 12px;text-decoration:none;"><svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff" style="margin-top:6px;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a>')
    .replace(/href="\/\/code\.org"/g, 'href="/"')
    .replace(/href="https:\/\/code\.org"/g, 'href="/"')
    // Update next level redirects in HTML
    .replace(/\/courses\/[\w-]+\/units\/\d+\/lessons\/\d+\/levels\/(\d+)/g, '/play/' + game + '/$1')
    .replace(/\/s\/[\w-]+\/lessons\/\d+\/levels\/(\d+)/g, '/play/' + game + '/$1')
    // Set data-playlab-theme on <html> so each game loads its own studio theme immediately
    .replace('<html', `<html data-playlab-theme="${game}"`)
    // Run PlayLabAI.beforeCraftInit() right after phaser & locales load, before craft.min.js executes
    .replace('<script data-appoptions=', '<script>if(window.PlayLabAI)window.PlayLabAI.beforeCraftInit();</script>\n<script data-appoptions=')
    // Inject our styles + scripts right before </title>
    .replace('</title>', `</title>\n${injection}`);
}

// ── Landing menu (Play Lab — Retro Game Computer / 16-bit Pixel Lab OS) ─────
function buildMenu() {
  const studioStyles = {
    mc: {
      studioName: 'OPENAI STUDIO',
      winBarBg: '#18181b',
      winBarText: '#ffffff',
      winAccent: '#10a37f',
      cardBg: '#ffffff',
      cardBorder: '#18181b',
      titleColor: '#18181b',
      descColor: '#3f3f46',
      btnBg: '#10a37f',
      btnShadow: '#065f46',
      badgeBg: '#10a37f',
      img: '/images/lab_openai.png'
    },
    minecraft: {
      studioName: 'ANTHROPIC LAB',
      winBarBg: '#292524',
      winBarText: '#faf8f5',
      winAccent: '#d97757',
      cardBg: '#faf8f5',
      cardBorder: '#292524',
      titleColor: '#292524',
      descColor: '#57534e',
      btnBg: '#d97757',
      btnShadow: '#9a3412',
      badgeBg: '#d97757',
      img: '/images/lab_anthropic.png'
    },
    hero: {
      studioName: 'DEEPMIND EDU',
      winBarBg: '#1d4ed8',
      winBarText: '#ffffff',
      winAccent: '#facc15',
      cardBg: '#ffffff',
      cardBorder: '#1e3a8a',
      titleColor: '#1e293b',
      descColor: '#475569',
      btnBg: '#2563eb',
      btnShadow: '#1e3a8a',
      badgeBg: '#2563eb',
      img: '/images/lab_deepmind.png'
    },
    aquatic: {
      studioName: 'HICLOUD · DEEPSEEK',
      winBarBg: '#0f172a',
      winBarText: '#f8fafc',
      winAccent: '#0ea5e9',
      cardBg: '#1e293b',
      cardBorder: '#0f172a',
      titleColor: '#f8fafc',
      descColor: '#cbd5e1',
      btnBg: '#0284c7',
      btnShadow: '#0369a1',
      badgeBg: '#0284c7',
      img: '/images/lab_cloud.png'
    },
  };

  const cards = Object.entries(GAMES).map(([id, g]) => {
    const s = studioStyles[id];
    return `
    <article class="retro-card" id="card-${id}" onclick="location.href='/play/${id}/1'"
             style="background:${s.cardBg};border-color:${s.cardBorder};">
      <!-- Retro Window Title Bar -->
      <div class="retro-card-bar" style="background:${s.winBarBg};color:${s.winBarText};border-bottom-color:${s.cardBorder};">
        <div class="retro-card-bar-left">
          <span class="retro-led" style="background:${s.winAccent}"></span>
          <span>${s.studioName}</span>
        </div>
        <div class="retro-win-btns">
          <span>_</span><span>□</span>
        </div>
      </div>

      <!-- 16-bit Pixel Art Illustration -->
      <div class="card-img-wrap" style="border-bottom-color:${s.cardBorder};">
        <img src="${s.img}" alt="${g.name}" class="card-img" loading="lazy">
        <div class="card-age-badge">${g.age}</div>
        <div class="card-badge" style="background:${s.badgeBg};">${g.levels} NIVELES</div>
      </div>

      <!-- Cartridge Body -->
      <div class="card-body">
        <h2 class="card-title" style="color:${s.titleColor};">${g.name}</h2>
        <p class="card-desc" style="color:${s.descColor};">${g.description}</p>
        <button class="retro-play-btn" style="--btn-bg:${s.btnBg};--btn-sh:${s.btnShadow};--btn-bd:${s.cardBorder};">
          <span>▶</span> EJECUTAR LAB
        </button>
      </div>
    </article>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Play Lab — Laboratorio de IA · Play Code</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
      background-color:#cad2c5;
      background-image:radial-gradient(#95a59a 1.25px, transparent 1.25px);
      background-size:16px 16px;
      color:#18181b;
      min-height:100vh;
      display:flex;
      flex-direction:column;
      align-items:center;
      padding:24px 16px 64px;
      overflow-x:hidden;
    }

    /* Main Retro Computer Desktop Window */
    .os-window{
      width:100%;
      max-width:1240px;
      background:#ece8df;
      border:4px solid #18181b;
      box-shadow:8px 8px 0 #18181b;
      display:flex;
      flex-direction:column;
    }

    /* Top OS Window Title Bar */
    .os-titlebar{
      background:#18181b;
      color:#faf8f5;
      padding:10px 16px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      font-family:'Press Start 2P',monospace;
      font-size:11px;
      letter-spacing:1px;
      border-bottom:4px solid #18181b;
    }
    .os-titlebar-left{display:flex;align-items:center;gap:10px}
    .os-status-dot{width:10px;height:10px;background:#10a37f;display:inline-block;border:2px solid #ffffff}
    .os-controls{display:flex;gap:6px}
    .os-ctrl-box{
      background:#ece8df;
      color:#18181b;
      font-family:'Press Start 2P',monospace;
      font-size:9px;
      width:22px;
      height:22px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid #18181b;
      box-shadow:inset -2px -2px 0 #9ca3af;
    }

    /* Retro OS Menu Strip */
    .os-menubar{
      background:#ded9ce;
      border-bottom:3px solid #18181b;
      padding:8px 18px;
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      justify-content:space-between;
      font-family:'VT323',monospace;
      font-size:21px;
      color:#18181b;
    }
    .os-menu-items{display:flex;gap:22px}
    .os-menu-items span{cursor:default}
    .os-menu-items span u{text-decoration:underline}
    .os-ram-badge{
      background:#18181b;
      color:#10a37f;
      padding:2px 10px;
      font-size:18px;
      letter-spacing:1px;
    }

    /* Inner Workspace Padding */
    .os-content{
      padding:28px 24px 34px;
    }

    /* Hero CRT Monitor Box */
    .hero-monitor{
      background:#1e242b;
      border:4px solid #18181b;
      box-shadow:6px 6px 0 rgba(24,24,27,0.2);
      padding:24px 20px;
      margin-bottom:32px;
      text-align:center;
      color:#f8fafc;
      position:relative;
    }
    .hero-tag{
      display:inline-block;
      background:#10a37f;
      color:#ffffff;
      font-family:'Press Start 2P',monospace;
      font-size:9px;
      padding:6px 12px;
      border:2px solid #ffffff;
      margin-bottom:14px;
      letter-spacing:1px;
    }
    .hero-title{
      font-family:'Press Start 2P',monospace;
      font-size:clamp(16px,2.6vw,28px);
      color:#ffffff;
      line-height:1.5;
      text-shadow:3px 3px 0 #18181b;
      margin-bottom:10px;
    }
    .hero-title span{color:#facc15}
    .hero-sub{
      font-family:'VT323',monospace;
      font-size:24px;
      color:#cbd5e1;
      letter-spacing:1px;
    }

    /* 4-Card Cartridge Grid */
    .grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:24px;
      width:100%;
    }

    /* Retro Cartridge Card */
    .retro-card{
      border:3px solid #18181b;
      box-shadow:6px 6px 0 #18181b;
      cursor:pointer;
      transition:transform .12s ease,box-shadow .12s ease;
      display:flex;
      flex-direction:column;
      overflow:hidden;
    }
    .retro-card:hover{
      transform:translate(-3px,-3px);
      box-shadow:9px 9px 0 #18181b;
    }
    .retro-card:active{
      transform:translate(2px,2px);
      box-shadow:3px 3px 0 #18181b;
    }

    /* Card Window Top Bar */
    .retro-card-bar{
      padding:8px 12px;
      border-bottom:3px solid #18181b;
      display:flex;
      align-items:center;
      justify-content:space-between;
      font-family:'Press Start 2P',monospace;
      font-size:9px;
      letter-spacing:0.5px;
    }
    .retro-card-bar-left{display:flex;align-items:center;gap:8px}
    .retro-led{width:8px;height:8px;display:inline-block;border:1.5px solid #ffffff}
    .retro-win-btns{display:flex;gap:6px;font-size:10px;opacity:0.8}

    /* Pixel Art Image Container */
    .card-img-wrap{
      position:relative;
      width:100%;
      aspect-ratio:1.33;
      overflow:hidden;
      border-bottom:3px solid #18181b;
      background:#18181b;
    }
    .card-img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
      image-rendering:pixelated;
      transition:transform .25s ease;
    }
    .retro-card:hover .card-img{transform:scale(1.04)}

    /* Pixel Badges */
    .card-age-badge{
      position:absolute;
      top:10px;
      left:10px;
      font-family:'Press Start 2P',monospace;
      font-size:8px;
      color:#18181b;
      background:#facc15;
      padding:6px 8px;
      border:2px solid #18181b;
      box-shadow:2px 2px 0 #18181b;
    }
    .card-badge{
      position:absolute;
      top:10px;
      right:10px;
      font-family:'Press Start 2P',monospace;
      font-size:8px;
      color:#ffffff;
      padding:6px 8px;
      border:2px solid #18181b;
      box-shadow:2px 2px 0 #18181b;
    }

    /* Card Text & Button */
    .card-body{
      padding:18px;
      display:flex;
      flex-direction:column;
      flex-grow:1;
    }
    .card-title{
      font-family:'Press Start 2P',monospace;
      font-size:12px;
      line-height:1.55;
      margin-bottom:10px;
      min-height:38px;
    }
    .card-desc{
      font-size:14.5px;
      font-weight:500;
      line-height:1.55;
      margin-bottom:18px;
      flex-grow:1;
    }
    .retro-play-btn{
      width:100%;
      font-family:'Press Start 2P',monospace;
      font-size:10px;
      color:#ffffff;
      background:var(--btn-bg);
      border:3px solid var(--btn-bd);
      box-shadow:0 4px 0 var(--btn-sh);
      padding:13px 10px;
      cursor:pointer;
      letter-spacing:1px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      margin-top:auto;
      transition:transform .08s,box-shadow .08s,filter .12s;
    }
    .retro-play-btn:hover{filter:brightness(1.08)}
    .retro-play-btn:active{
      transform:translateY(3px);
      box-shadow:0 1px 0 var(--btn-sh);
    }

    /* Bottom Retro Computer Taskbar */
    .os-taskbar{
      position:fixed;
      bottom:0;
      left:0;
      right:0;
      z-index:100;
      background:#ded9ce;
      border-top:3px solid #18181b;
      padding:6px 16px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      font-family:'Press Start 2P',monospace;
      font-size:9px;
    }
    .os-start-btn{
      background:#10a37f;
      color:#ffffff;
      border:2px solid #18181b;
      box-shadow:2px 2px 0 #18181b;
      padding:6px 12px;
      display:flex;
      align-items:center;
      gap:8px;
    }
    .os-clock{
      background:#ece8df;
      border:2px solid #18181b;
      padding:6px 12px;
      color:#18181b;
    }

    @media (max-width: 1024px) {
      .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }
    @media (max-width: 640px) {
      body { padding: 12px 10px 60px; }
      .os-content { padding: 16px 14px 24px; }
      .grid { grid-template-columns: 1fr; gap: 18px; }
      .os-menubar { display: none; }
    }
  </style>
  <style>
    /* PLAY CODE INTRO / SPLASH SCREEN */
    @keyframes pcPopIn {
      0% { transform: scale(0.7); opacity: 0; filter: brightness(1.4); }
      70% { transform: scale(1.04); opacity: 1; }
      100% { transform: scale(1); opacity: 1; filter: brightness(1); }
    }
    @keyframes pcShimmer {
      0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
      40% { opacity: 0.5; }
      100% { transform: translateX(250%) rotate(25deg); opacity: 0; }
    }
    @keyframes pcFadeUp {
      0% { transform: translateY(12px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes pcFill {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    @keyframes pcPulse {
      0%, 100% { box-shadow: 0 12px 35px rgba(0,0,0,0.6), 0 0 25px rgba(255, 140, 0, 0.35); }
      50% { box-shadow: 0 14px 45px rgba(0,0,0,0.7), 0 0 45px rgba(255, 140, 0, 0.65); }
    }
    .playcode-intro-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: radial-gradient(circle at center, #002D6B 0%, #001A3E 60%, #000F24 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      cursor: pointer;
      transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .playcode-intro-overlay.playcode-intro-hide {
      opacity: 0 !important;
      transform: scale(1.05) !important;
      pointer-events: none !important;
    }
    .playcode-intro-logo-wrap {
      position: relative;
      width: 110px;
      height: 110px;
      border-radius: 26px;
      overflow: hidden;
      background: #00214E;
      border: 2px solid rgba(255, 140, 0, 0.45);
      animation: pcPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pcPulse 2s 0.5s infinite ease-in-out;
      box-shadow: 0 12px 35px rgba(0,0,0,0.6), 0 0 25px rgba(255, 140, 0, 0.35);
    }
    .playcode-intro-logo-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      width: 60%;
      height: 200%;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      animation: pcShimmer 1.8s 0.35s ease-in-out infinite;
      pointer-events: none;
    }
    .playcode-intro-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .playcode-intro-brand {
      margin-top: 18px;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 4px;
      display: flex;
      gap: 6px;
      animation: pcFadeUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .playcode-intro-brand .brand-play { color: #ffffff; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); }
    .playcode-intro-brand .brand-code { color: #ff941a; text-shadow: 0 0 15px rgba(255, 148, 26, 0.6); }
    .playcode-intro-tagline {
      margin-top: 6px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.75);
      text-transform: uppercase;
      animation: pcFadeUp 0.6s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .playcode-intro-loader {
      margin-top: 22px;
      width: 120px;
      height: 4px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 99px;
      overflow: hidden;
    }
    .playcode-intro-progress {
      height: 100%;
      background: linear-gradient(90deg, #ff6a00, #ffb319);
      border-radius: 99px;
      box-shadow: 0 0 10px #ff941a;
      animation: pcFill 1.4s 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .playcode-intro-skip {
      position: absolute;
      bottom: 24px;
      font-size: 11px;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <!-- ============ PLAY CODE INTRO / SPLASH SCREEN ============ -->
  <div id="playcode-intro" class="playcode-intro-overlay" title="Toca para continuar">
    <div class="playcode-intro-logo-wrap">
      <img src="/playcode-intro-logo.png" alt="Play Code" class="playcode-intro-logo" />
    </div>
    <div class="playcode-intro-brand">
      <span class="brand-play">PLAY</span><span class="brand-code">CODE</span>
    </div>
    <div class="playcode-intro-tagline">Play Lab · Laboratorio de IA</div>
    <div class="playcode-intro-loader">
      <div class="playcode-intro-progress"></div>
    </div>
    <div class="playcode-intro-skip">Toca para continuar</div>
  </div>
  <script>
    (function() {
      var intro = document.getElementById('playcode-intro');
      if (!intro) return;
      var dismissed = false;
      function dismiss() {
        if (dismissed) return;
        dismissed = true;
        intro.classList.add('playcode-intro-hide');
        setTimeout(function() {
          if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 450);
      }
      intro.addEventListener('click', dismiss);
      intro.addEventListener('touchstart', dismiss, { passive: true });
      window.addEventListener('keydown', dismiss, { once: true });
      setTimeout(dismiss, 1400);
    })();
  </script>

  <!-- ============ RETRO COMPUTER DESKTOP WINDOW (PLAYLAB OS v1.0) ============ -->
  <div class="os-window">
    <header class="os-titlebar">
      <div class="os-titlebar-left">
        <span class="os-status-dot"></span>
        <span>PLAYLAB_OS v1.0 — ACADEMIA PLAY CODE</span>
      </div>
      <div class="os-controls">
        <div class="os-ctrl-box">_</div>
        <div class="os-ctrl-box">□</div>
        <div class="os-ctrl-box">×</div>
      </div>
    </header>

    <nav class="os-menubar">
      <div class="os-menu-items">
        <span>[<u>A</u>]rchivo</span>
        <span>[<u>L</u>]aboratorios</span>
        <span>[<u>M</u>]isiones</span>
        <span>[<u>A</u>]yuda</span>
      </div>
      <div class="os-ram-badge">GPU CLUSTER: ONLINE · 4 LABS READY</div>
    </nav>

    <div class="os-content">
      <section class="hero-monitor">
        <div class="hero-tag">PLAY CODE · ACADEMIA DE INTELIGENCIA ARTIFICIAL</div>
        <h1 class="hero-title">PLAY LAB · <span>LABORATORIO DE IA</span></h1>
        <p class="hero-sub">&gt; Selecciona un cartucho de laboratorio para iniciar tu entrenamiento_</p>
      </section>

      <main class="grid">${cards}</main>
    </div>
  </div>

  <footer class="os-taskbar">
    <div class="os-start-btn">
      <span>▣</span>
      <span>PLAY CODE</span>
    </div>
    <div class="os-clock">SYS READY · ${new Date().getFullYear()}</div>
  </footer>
</body>
</html>`;
}

// ── Request handler ───────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const reqPath = url.parse(req.url).pathname;
  console.log(`${new Date().toISOString().slice(11,19)} ${req.method} ${reqPath}`);

  // Root → menu
  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
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

  // Intercept instruction avatar characters to serve the animated AI bot GIF
  if (reqPath.includes('Pop_Up_Character') || reqPath.includes('Agent_Neutral')) {
    const referer = req.headers.referer || '';
    let gifFile = 'al.gif';
    if (referer.includes('/minecraft/')) gifFile = 'am.gif';
    else if (referer.includes('/hero/')) gifFile = 'pch.gif';
    else if (referer.includes('/aquatic/')) gifFile = 'lg.gif';
    if (serveFile(res, path.join(SITE_DIR, 'images', gifFile))) return;
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
  console.log(`\n⚡ Play Lab — Laboratorio de IA (Servidor Local)`);
  console.log(`   URL: http://localhost:${PORT}\n`);
  Object.entries(GAMES).forEach(([id, g]) =>
    console.log(`   ${g.emoji}  ${g.name} → http://localhost:${PORT}/play/${id}/1`)
  );
  console.log('');
});
