#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const blogDataDir = path.join(__dirname, '..', 'blog-data');
const publicDir = path.join(__dirname, 'public');
const blogDir = path.join(publicDir, 'blog');
const langs = ['en', 'id'];

const langNames = {
  en: 'English',
  id: 'Bahasa Indonesia'
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
  h1 {
    font-size: 1.75rem;
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
`;

function buildArticlePage(article, lang) {
  const title = article.title?.[lang] || '';
  const desc = article.desc?.[lang] || '';
  const body = article.body?.[lang] || '';
  const readTime = article.readTime?.[lang] || '9 min read';
  const canonical = `https://albertusfreddi.github.io/blog/${lang}/${article.slug}.html`;

  const alternates = langs.map(l =>
    `<link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/${article.slug}.html">`
  ).join('\n');

  const langSwitcher = langs.map(l =>
    `<a href="/blog/${l}/${article.slug}.html" class="${l === lang ? 'active' : ''}">${langNames[l]}</a>`
  ).join('');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "datePublished": `${article.date}T09:00:00+07:00`,
    "dateModified": `${article.date}T09:00:00+07:00`,
    "author": {
      "@type": "Person",
      "name": "Albertus Freddi"
    },
    "inLanguage": lang,
    "mainEntityOfPage": canonical
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
${alternates}
<link rel="alternate" hreflang="x-default" href="https://albertusfreddi.github.io/blog/en/${article.slug}.html">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${baseStyles}</style>
</head>
<body>
<header>
<nav>
<a href="/blog/${lang}/" class="brand">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
<h1>${title}</h1>
<div class="meta">
<span>${readTime}</span>
<span>•</span>
<span>${article.date}</span>
</div>
<article>
${body}
</article>
</main>
<footer>
<p>&copy; 2026 Albertus Freddi · <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
</footer>
</body>
</html>`;
}

function buildIndexPage(articles, lang) {
  const title = lang === 'en' ? 'Blog & Engineering Case Studies' : 'Blog & Studi Kasus Teknis';

  const desc = lang === 'en' ? 'In-depth technical case studies on automation pipelines, reverse-engineered APIs, resilient scraping, and distributed systems.' : 'Studi kasus teknis mendalam tentang pipeline otomasi, API reverse-engineered, scraping resilient, dan sistem terdistribusi.';

  const listItems = articles.map(a => {
    const artTitle = a.title?.[lang] || '';
    const artDesc = a.desc?.[lang] || '';
    const readTime = a.readTime?.[lang] || '9 min read';
    return `<article class="post-card">
<h2><a href="/blog/${lang}/${a.slug}.html">${artTitle}</a></h2>
<p>${artDesc}</p>
<div class="meta"><span>${readTime}</span><span>•</span><span>${a.date}</span></div>
</article>`;
  }).join('\n');

  const langSwitcher = langs.map(l =>
    `<a href="/blog/${l}/" class="${l === lang ? 'active' : ''}">${langNames[l]}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Albertus Freddi</title>
<meta name="description" content="${desc}">
<meta name="author" content="Albertus Freddi">
<link rel="canonical" href="https://albertusfreddi.github.io/blog/${lang}/">
<style>${baseStyles}</style>
</head>
<body>
<header>
<nav>
<a href="/blog/${lang}/" class="brand">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
<h1>${title}</h1>
<p class="intro">${desc}</p>
${listItems}
</main>
<footer>
<p>&copy; 2026 Albertus Freddi · <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
</footer>
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
