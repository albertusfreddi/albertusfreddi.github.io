#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const blogDataDir = path.join(__dirname, 'blog-data');
const distDir = path.join(__dirname, 'dist');
const blogDir = path.join(distDir, 'blog');
const langs = ['en', 'id'];

const langNames = {
  en: 'English',
  id: 'Bahasa Indonesia'
};
const langShort = {
  en: 'EN',
  id: 'ID'
};

if (!fs.existsSync(blogDataDir)) {
  console.error('blog-data/ tidak ditemukan');
  process.exit(1);
}

langs.forEach(lang => {
  const langDir = path.join(blogDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
});

const articles = fs.readdirSync(blogDataDir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(blogDataDir, f), 'utf-8'));
    return data;
  })
  .filter(a => a.status === 'published')
  .sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`Building ${articles.length} published articles`);

const baseStyles = `
:root {
  --ink: #0e0e0e;
  --cream: #f5f0e8;
  --accent: #c8a96e;
  --red: #D1161A;
  --border: #2a2a2a;
  --code-bg: #1a1a1a;
  --text-secondary: #9a9a9a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif;
  background: var(--ink);
  color: var(--cream);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

header {
  background: var(--ink);
  border-bottom: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(14, 14, 14, 0.92);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 840px;
  margin: 0 auto;
}

nav .brand {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cream);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.lang-switcher {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.lang-switcher a {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.lang-switcher a:hover {
  color: var(--cream);
  border-color: var(--accent);
}

.lang-switcher a.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--ink);
  font-weight: 600;
}

.lang-mobile { display: none; }
.lang-switcher a { white-space: nowrap; }
@media (max-width: 640px) {
  .lang-desktop { display: none; }
  .lang-mobile { display: inline; font-weight: 600; }
}

main {
  max-width: 840px;
  margin: 3rem auto 6rem;
  padding: 0 1.5rem;
}

h1 {
  font-size: 2.25rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: var(--cream);
}

.meta {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 3rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

article h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 3rem 0 1.25rem;
  color: var(--cream);
  letter-spacing: -0.015em;
  line-height: 1.3;
}

article h3 {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: var(--cream);
}

article p {
  margin: 1.25rem 0;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgba(245, 240, 232, 0.92);
}

article a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

article a:hover {
  border-bottom-color: var(--accent);
}

article ul, article ol {
  margin: 1.25rem 0;
  padding-left: 1.5rem;
}

article li {
  margin: 0.75rem 0;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(245, 240, 232, 0.92);
}

.callout {
  background: rgba(200, 169, 110, 0.08);
  border-left: 3px solid var(--accent);
  padding: 1.5rem 1.75rem;
  margin: 2rem 0;
  border-radius: 0 6px 6px 0;
}

.callout p {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--cream);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin: 2.5rem 0;
}

.metric {
  background: var(--code-bg);
  padding: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.3s;
}

.metric:hover {
  border-color: var(--accent);
}

.metric .num {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.metric .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.code-block {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  background: var(--border);
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--cream);
  border-bottom: 1px solid rgba(0,0,0,0.3);
}

pre {
  background: var(--code-bg);
  padding: 1.5rem;
  overflow-x: auto;
  font-size: 0.9375rem;
  line-height: 1.6;
}

code {
  font-family: "SF Mono", "Consolas", "Monaco", "Courier New", monospace;
  color: #d4d4d4;
}

table {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-collapse: collapse;
  margin: 2rem 0;
  font-size: 0.9375rem;
}

th, td {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  text-align: left;
}

th {
  background: var(--code-bg);
  color: var(--cream);
  font-weight: 600;
  white-space: nowrap;
}

td {
  background: rgba(26, 26, 26, 0.4);
}

.diagram-container {
  margin: 2.5rem 0;
  overflow-x: auto;
}

.diagram-container svg {
  max-width: 100%;
  height: auto;
}

footer {
  border-top: 1px solid var(--border);
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  background: rgba(14, 14, 14, 0.6);
}

footer a {
  color: var(--accent);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  header {
    padding: 0.875rem 1rem;
  }

  nav .brand {
    font-size: 0.9375rem;
  }

  .lang-switcher {
    gap: 0.35rem;
    font-size: 0.75rem;
  }

  .lang-switcher a {
    padding: 0.25rem 0.5rem;
  }

  h1 {
    font-size: 1.5rem;
    line-height: 1.25;
    overflow-wrap: break-word;
  }

  article h2 {
    font-size: 1.5rem;
  }

  article p, article li {
    font-size: 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  main {
    padding: 0 1rem;
  }
}

/* Index page specific */
.intro {
  font-size: 1.1875rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.65;
}

.post-card {
  background: rgba(26, 26, 26, 0.5);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 1.75rem;
  transition: all 0.3s;
}

.post-card:hover {
  border-color: var(--accent);
  background: rgba(26, 26, 26, 0.8);
  transform: translateY(-2px);
}

.post-card h2 {
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
  line-height: 1.35;
}

.post-card h2 a {
  color: var(--cream);
  text-decoration: none;
}

.post-card h2 a:hover {
  color: var(--accent);
}

.post-card p {
  color: rgba(245, 240, 232, 0.75);
  margin: 0.75rem 0;
  font-size: 1rem;
  line-height: 1.65;
}

.post-card .meta {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 1rem 0 0;
  display: flex;
  gap: 1rem;
}

/* --- Modern polish (21st.dev-inspired) --- */
html { scroll-behavior: smooth; }
body { scroll-padding-top: 5.5rem; }

::selection { background: rgba(200, 169, 110, 0.35); color: #fff; }

.progress {
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  z-index: 200; pointer-events: none;
}
#progress-bar {
  height: 100%; width: 100%;
  transform: scaleX(0); transform-origin: 0 50%;
  background: linear-gradient(90deg, var(--red), var(--accent));
}

h1 { position: relative; padding-bottom: 0.25rem; }
h1::after {
  content: ""; display: block; width: 64px; height: 3px;
  margin-top: 1rem; border-radius: 2px;
  background: linear-gradient(90deg, var(--red), var(--accent));
}

article h2, article h3 { scroll-margin-top: 5.5rem; }

.hero {
  position: relative;
  height: clamp(220px, 32vw, 340px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border);
  margin: 0 0 2.5rem;
  background:
    radial-gradient(1200px 500px at 20% -10%, rgba(200, 169, 110, 0.14), transparent 55%),
    radial-gradient(1000px 500px at 90% 110%, rgba(209, 22, 26, 0.12), transparent 55%),
    linear-gradient(180deg, #121212, #0e0e0e);
}
.hero canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.hero-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(85% 85% at 50% 45%, transparent 55%, rgba(14, 14, 14, 0.5) 100%);
}

.code-block { border: 1px solid var(--border); box-shadow: 0 12px 34px rgba(0, 0, 0, 0.35); }
.code-header::before {
  content: ""; display: inline-block; width: 8px; height: 8px;
  border-radius: 50%; background: var(--red); margin-right: 9px; vertical-align: middle;
}

.metric .num { font-variant-numeric: tabular-nums; }

.post-card { position: relative; }
.post-card::before {
  content: ""; position: absolute; inset: 0; border-radius: 10px; padding: 1px;
  background: linear-gradient(135deg, rgba(200, 169, 110, 0.55), transparent 40%, transparent 60%, rgba(209, 22, 26, 0.45));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity 0.3s; pointer-events: none;
}
.post-card:hover::before { opacity: 1; }

a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px; }

@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;

const THREE_CDN = `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>`;

const PROGRESS_BAR = `<div class="progress"><div id="progress-bar"></div></div>`;

const HERO = `<div class="hero" aria-hidden="true">
  <canvas id="hero-canvas"></canvas>
  <div class="hero-overlay"></div>
</div>`;

const HERO_JS = `<script>
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = canvas.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(hero.clientWidth, hero.clientHeight, false);

  var camera = new THREE.PerspectiveCamera(55, hero.clientWidth / hero.clientHeight, 0.1, 100);
  camera.position.z = 18;
  var scene = new THREE.Scene();

  var vh = 18.8;
  var spreadX = vh * (hero.clientWidth / hero.clientHeight) * 0.9;
  var spreadY = vh * 0.9;
  var spreadZ = 14;
  var count = Math.min(220, Math.max(90, Math.floor(hero.clientWidth * hero.clientHeight / 2100)));

  var pos = new Float32Array(count * 3), vel = new Float32Array(count * 3);
  for (var i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * spreadX;
    pos[i*3+1] = (Math.random() - 0.5) * spreadY;
    pos[i*3+2] = (Math.random() - 0.5) * spreadZ;
    vel[i*3]   = (Math.random() - 0.5) * 0.012;
    vel[i*3+1] = (Math.random() - 0.5) * 0.012;
    vel[i*3+2] = (Math.random() - 0.5) * 0.012;
  }
  var pointGeom = new THREE.BufferGeometry();
  pointGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var points = new THREE.Points(pointGeom, new THREE.PointsMaterial({ color: 0xc8a96e, size: 0.16, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(points);

  var lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * count * 3), 3));
  var lines = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({ color: 0xc8a96e, transparent: true, opacity: 0.13 }));
  scene.add(lines);

  var t = 0, THRESH2 = 26, MAX_SEGS = 900;
  function frame() {
    t += 0.005;
    for (var i = 0; i < count; i++) {
      pos[i*3]   += vel[i*3]   + Math.sin(t + i) * 0.004;
      pos[i*3+1] += vel[i*3+1] + Math.cos(t + i) * 0.004;
      pos[i*3+2] += vel[i*3+2];
      if (pos[i*3]   >  spreadX / 2) pos[i*3]   = -spreadX / 2; else if (pos[i*3]   < -spreadX / 2) pos[i*3]   = spreadX / 2;
      if (pos[i*3+1] >  spreadY / 2) pos[i*3+1] = -spreadY / 2; else if (pos[i*3+1] < -spreadY / 2) pos[i*3+1] = spreadY / 2;
      if (pos[i*3+2] >  spreadZ / 2) pos[i*3+2] = -spreadZ / 2; else if (pos[i*3+2] < -spreadZ / 2) pos[i*3+2] = spreadZ / 2;
    }
    pointGeom.attributes.position.needsUpdate = true;

    var lp = lines.geometry.attributes.position.array, written = 0;
    for (var a = 0; a < count && written < MAX_SEGS; a++) {
      for (var b = a + 1; b < count && written < MAX_SEGS; b++) {
        var dx = pos[a*3] - pos[b*3], dy = pos[a*3+1] - pos[b*3+1], dz = pos[a*3+2] - pos[b*3+2];
        if (dx*dx + dy*dy + dz*dz < THRESH2) {
          var o = written * 6;
          lp[o]   = pos[a*3];   lp[o+1] = pos[a*3+1]; lp[o+2] = pos[a*3+2];
          lp[o+3] = pos[b*3];   lp[o+4] = pos[b*3+1]; lp[o+5] = pos[b*3+2];
          written++;
        }
      }
    }
    lines.geometry.setDrawRange(0, written * 2);
    lines.geometry.attributes.position.needsUpdate = true;

    points.rotation.y += 0.0012;
    points.rotation.x += 0.0004;
    lines.rotation.copy(points.rotation);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      camera.aspect = hero.clientWidth / hero.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(hero.clientWidth, hero.clientHeight, false);
    }, 150);
  });
})();
</script>`;

const PROGRESS_JS = `<script>
(function () {
  var bar = document.getElementById('progress-bar');
  if (!bar) return;
  function update() {
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? el.scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
</script>`;

const FAVICON = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`;
const OG_IMAGE = `https://albertusfreddi.github.io/og-image.jpg`;

function socialMeta(title, desc, lang) {
  const locale = { en: 'en_US', id: 'id_ID' }[lang] || 'en_US';
  return `<meta name="theme-color" content="#0e0e0e">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:site_name" content="Albertus Freddi">
<meta property="og:locale" content="${locale}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG_IMAGE}">`;
}

function buildArticlePage(article, lang) {
  const title = article.title?.[lang] || '';
  const desc = article.desc?.[lang] || article.description?.[lang] || '';
  const body = article.body?.[lang] || '';
  const readTime = article.readTime?.[lang] || '9 min read';
  const canonical = `https://albertusfreddi.github.io/blog/${lang}/${article.slug}.html`;

  const alternates = langs.map(l =>
    `<link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/${article.slug}.html">`
  ).join('\n');

  const langSwitcher = langs.map(l =>
    `<a href="/blog/${l}/${article.slug}.html" class="${l === lang ? 'active' : ''}"><span class="lang-desktop">${langNames[l]}</span><span class="lang-mobile">${langShort[l]}</span></a>`
  ).join('');

  let faqHtml = '';
  let jsonLd;

  const blogPostingLd = {
    "@type": "BlogPosting",
    "headline": title,
    "description": desc,
    "datePublished": `${article.date}T09:00:00+07:00`,
    "dateModified": `${article.date}T09:00:00+07:00`,
    "author": {
      "@type": "Person",
      "name": "Albertus Freddi",
      "url": "https://albertusfreddi.github.io/"
    },
    "publisher": {
      "@type": "Person",
      "name": "Albertus Freddi"
    },
    "inLanguage": lang,
    "mainEntityOfPage": canonical
  };

  if (article.faq?.[lang] && article.faq[lang].length > 0) {
    const faqTitle = lang === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan';
    const faqCards = article.faq[lang].map(item => `
<div class="faq-card" style="margin-bottom:1.5rem;padding:1.25rem;background:#141414;border:1px solid #2a2a2a;border-radius:8px">
  <h3 style="font-size:1.15rem;color:#f5f0e8;margin-top:0;margin-bottom:0.5rem">${item.q}</h3>
  <p style="color:#bbb;line-height:1.6;margin-bottom:0">${item.a}</p>
</div>`).join('\n');

    faqHtml = `
<section class="faq-section" style="margin-top:3rem;padding-top:2rem;border-top:1px solid #2a2a2a">
  <h2>${faqTitle}</h2>
  ${faqCards}
</section>`;

    const faqLd = {
      "@type": "FAQPage",
      "mainEntity": article.faq[lang].map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };

    jsonLd = {
      "@context": "https://schema.org",
      "@graph": [blogPostingLd, faqLd]
    };
  } else {
    jsonLd = {
      "@context": "https://schema.org",
      ...blogPostingLd
    };
  }

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${FAVICON}
<title>${title} | Albertus Freddi</title>
<meta name="description" content="${desc}">
<meta name="author" content="Albertus Freddi">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="article:published_time" content="${article.date}T09:00:00+07:00">
<meta property="article:author" content="Albertus Freddi">
${socialMeta(title, desc, lang)}
${alternates}
<link rel="alternate" hreflang="x-default" href="https://albertusfreddi.github.io/blog/en/${article.slug}.html">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${baseStyles}</style>
${THREE_CDN}
</head>
<body>
${PROGRESS_BAR}
<header>
<nav>
<a href="/blog/${lang}/" class="brand">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
${HERO}
<h1>${title}</h1>
<div class="meta">
<span>${readTime}</span>
<span>•</span>
<span>${article.date}</span>
</div>
<article>
${body}
${faqHtml}
</article>
</main>
<footer>
<p>&copy; 2026 Albertus Freddi · <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
</footer>
${HERO_JS}
${PROGRESS_JS}
</body>
</html>`;
}

function buildIndexPage(articles, lang) {
  const title = lang === 'en' ? 'Blog & Engineering Case Studies' : 'Blog & Studi Kasus Teknis';

  const desc = lang === 'en' ? 'In-depth technical case studies on automation pipelines, reverse-engineered APIs, resilient scraping, and distributed systems.' : 'Studi kasus teknis mendalam tentang pipeline otomasi, API reverse-engineered, scraping resilient, dan sistem terdistribusi.';

  const listItems = articles.map(a => {
    const artTitle = a.title?.[lang] || '';
    const artDesc = a.desc?.[lang] || a.description?.[lang] || '';
    const readTime = a.readTime?.[lang] || '9 min read';
    return `<article class="post-card">
<h2><a href="/blog/${lang}/${a.slug}.html">${artTitle}</a></h2>
<p>${artDesc}</p>
<div class="meta"><span>${readTime}</span><span>•</span><span>${a.date}</span></div>
</article>`;
  }).join('\n');

  const langSwitcher = langs.map(l =>
    `<a href="/blog/${l}/" class="${l === lang ? 'active' : ''}"><span class="lang-desktop">${langNames[l]}</span><span class="lang-mobile">${langShort[l]}</span></a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${FAVICON}
<title>${title} | Albertus Freddi</title>
<meta name="description" content="${desc}">
<meta name="author" content="Albertus Freddi">
<link rel="canonical" href="https://albertusfreddi.github.io/blog/${lang}/">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://albertusfreddi.github.io/blog/${lang}/">
${socialMeta(title, desc, lang)}
<style>${baseStyles}</style>
${THREE_CDN}
</head>
<body>
${PROGRESS_BAR}
<header>
<nav>
<a href="/blog/${lang}/" class="brand">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
${HERO}
<h1>${title}</h1>
<p class="intro">${desc}</p>
${listItems}
</main>
<footer>
<p>&copy; 2026 Albertus Freddi · <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
</footer>
${HERO_JS}
${PROGRESS_JS}
</body>
</html>`;
}

articles.forEach(article => {
  langs.forEach(lang => {
    const html = buildArticlePage(article, lang);
    const filePath = path.join(blogDir, lang, `${article.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf-8');
  });
  console.log(`Built ${article.slug}`);
});

langs.forEach(lang => {
  const html = buildIndexPage(articles, lang);
  const filePath = path.join(blogDir, lang, 'index.html');
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`Built index ${lang}`);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${langs.map(lang => `  <url>
    <loc>https://albertusfreddi.github.io/blog/${lang}/</loc>
    <priority>1.0</priority>
    ${langs.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/"/>`).join('\n    ')}
  </url>`).join('\n')}
${articles.flatMap(a => langs.map(lang =>
  `  <url>
    <loc>https://albertusfreddi.github.io/blog/${lang}/${a.slug}.html</loc>
    <lastmod>${a.date}</lastmod>
    <priority>0.8</priority>
    ${langs.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/${a.slug}.html"/>`).join('\n    ')}
  </url>`
)).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`\n✓ Build complete: ${articles.length} articles, 2 languages, sitemap with hreflang`);
