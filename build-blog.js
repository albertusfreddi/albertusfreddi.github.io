#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const blogDataDir = path.join(__dirname, 'blog-data');
const distDir = path.join(__dirname, 'dist');
const blogDir = path.join(distDir, 'blog');
const langs = ['en', 'id', 'zh', 'ja', 'ko'];

const langNames = { en: 'English', id: 'Bahasa Indonesia', zh: '中文', ja: '日本語', ko: '한국어' };

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
<style>
:root { --bg: #0a0a0a; --fg: #e8e8e8; --accent: #D1161A; --border: #2a2a2a; --code-bg: #141414; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; }
header { background: var(--bg); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 10; }
nav { display: flex; justify-content: space-between; align-items: center; max-width: 960px; margin: 0 auto; }
nav a { color: var(--fg); text-decoration: none; margin-left: 1.5rem; }
nav a:hover { color: var(--accent); }
.lang-switcher { display: flex; gap: 0.5rem; font-size: 0.9rem; }
.lang-switcher a { padding: 0.25rem 0.5rem; border: 1px solid var(--border); border-radius: 4px; margin-left: 0; }
.lang-switcher a.active { background: var(--accent); border-color: var(--accent); }
main { max-width: 760px; margin: 2rem auto; padding: 0 1.5rem; }
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.meta { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
article h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
article p { margin: 1rem 0; }
article a { color: var(--accent); }
.callout { background: var(--code-bg); border-left: 3px solid var(--accent); padding: 1rem; margin: 1.5rem 0; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.metric { background: var(--code-bg); padding: 1rem; border: 1px solid var(--border); border-radius: 6px; }
.metric .num { display: block; font-size: 1.8rem; font-weight: 700; color: var(--accent); }
.metric .label { font-size: 0.85rem; color: #888; }
.code-block { margin: 1.5rem 0; }
.code-header { background: var(--border); padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px 6px 0 0; }
pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: 0 0 6px 6px; padding: 1rem; overflow-x: auto; }
code { font-family: "Consolas", "Monaco", monospace; font-size: 0.9rem; color: #d4d4d4; }
.diagram-container { margin: 1.5rem 0; }
footer { border-top: 1px solid var(--border); padding: 2rem 1.5rem; text-align: center; color: #888; font-size: 0.9rem; margin-top: 4rem; }
@media (max-width: 640px) { h1 { font-size: 1.5rem; } }
</style>
</head>
<body>
<header>
<nav>
<a href="/blog/${lang}/">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
<h1>${title}</h1>
<div class="meta">${readTime} • ${article.date}</div>
<article>
${body}
</article>
</main>
<footer>
<p>&copy; 2026 Albertus Freddi • <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
</footer>
</body>
</html>`;
}

function buildIndexPage(articles, lang) {
  const title = lang === 'en' ? 'Blog & Engineering Case Studies' :
                lang === 'id' ? 'Blog & Studi Kasus Teknis' :
                lang === 'zh' ? '博客与技术案例' :
                lang === 'ja' ? 'ブログ・技術事例' : '블로그 & 기술 사례';

  const desc = lang === 'en' ? 'In-depth technical case studies on automation pipelines, reverse-engineered APIs, resilient scraping, and distributed systems.' :
               lang === 'id' ? 'Studi kasus teknis mendalam tentang pipeline otomasi, API reverse-engineered, scraping resilient, dan sistem terdistribusi.' :
               lang === 'zh' ? '深入的自动化管道、逆向工程API、弹性爬虫和分布式系统技术案例。' :
               lang === 'ja' ? '自動化パイプライン、リバースエンジニアリングAPI、レジリエントスクレイピング、分散システムの技術事例。' :
               '자동화 파이프라인, 리버스 엔지니어링 API, 탄력적 스크래핑, 분산 시스템 기술 사례.';

  const listItems = articles.map(a => {
    const artTitle = a.title?.[lang] || '';
    const artDesc = a.desc?.[lang] || '';
    const readTime = a.readTime?.[lang] || '9 min read';
    return `<article class="post-card">
<h2><a href="/blog/${lang}/${a.slug}.html">${artTitle}</a></h2>
<p>${artDesc}</p>
<div class="meta">${readTime} • ${a.date}</div>
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
<style>
:root { --bg: #0a0a0a; --fg: #e8e8e8; --accent: #D1161A; --border: #2a2a2a; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; }
header { background: var(--bg); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 10; }
nav { display: flex; justify-content: space-between; align-items: center; max-width: 960px; margin: 0 auto; }
nav a { color: var(--fg); text-decoration: none; margin-left: 1.5rem; }
nav a:hover { color: var(--accent); }
.lang-switcher { display: flex; gap: 0.5rem; font-size: 0.9rem; }
.lang-switcher a { padding: 0.25rem 0.5rem; border: 1px solid var(--border); border-radius: 4px; margin-left: 0; }
.lang-switcher a.active { background: var(--accent); border-color: var(--accent); }
main { max-width: 960px; margin: 2rem auto; padding: 0 1.5rem; }
h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.intro { font-size: 1.1rem; color: #aaa; margin-bottom: 3rem; }
.post-card { background: #141414; border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
.post-card h2 { font-size: 1.4rem; margin-bottom: 0.5rem; }
.post-card h2 a { color: var(--fg); text-decoration: none; }
.post-card h2 a:hover { color: var(--accent); }
.post-card p { color: #aaa; margin: 0.5rem 0; }
.post-card .meta { color: #666; font-size: 0.85rem; margin-top: 0.5rem; }
footer { border-top: 1px solid var(--border); padding: 2rem 1.5rem; text-align: center; color: #888; font-size: 0.9rem; margin-top: 4rem; }
</style>
</head>
<body>
<header>
<nav>
<a href="/blog/${lang}/">Albertus Freddi</a>
<div class="lang-switcher">${langSwitcher}</div>
</nav>
</header>
<main>
<h1>${title}</h1>
<p class="intro">${desc}</p>
${listItems}
</main>
<footer>
<p>&copy; 2026 Albertus Freddi • <a href="mailto:albertus.freddi@gmail.com">albertus.freddi@gmail.com</a></p>
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${langs.map(lang => `  <url><loc>https://albertusfreddi.github.io/blog/${lang}/</loc><priority>1.0</priority></url>`).join('\n')}
${articles.flatMap(a => langs.map(lang =>
  `  <url><loc>https://albertusfreddi.github.io/blog/${lang}/${a.slug}.html</loc><lastmod>${a.date}</lastmod><priority>0.8</priority></url>`
)).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`\nBuild complete: ${articles.length} articles, 5 languages, sitemap generated`);
