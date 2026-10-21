/**
 * Generator for 30 Backdated Articles & Sitemap / Index Builder
 * Outputs:
 * - 150 Localized HTML files (30 articles × 5 languages: EN, ID, ZH, JA, KO) in dist/blog/
 * - Localized Blog Indexes (dist/blog/{en,id,zh,ja,ko}/index.html)
 * - Complete sitemap.xml with all published articles and 5 hreflangs
 *
 * Design standards:
 * - Real dark theme: #0e0e0e background, #f5f0e8 cream headings, #c8a96e accents, #D1161A crimson
 * - Metrics grids (.metrics-grid, .metric, .num, .label)
 * - Responsive SVG flowcharts
 * - Syntax-highlighted styled code snippets (.code-block, .code-header, <pre>)
 * - Safe gutters, zero em-dash, collaborative CTAs
 */

const fs = require('fs');
const path = require('path');

const publishedArticles = require('./published-30-articles.json');
const distDir = path.join(__dirname, 'dist');
const distBlogDir = path.join(distDir, 'blog');

// Existing pillar articles
const existingPillars = [
  {
    slug: 'how-i-cut-hotel-checkin-time-60-percent',
    file: 'how-i-cut-hotel-checkin-time-60-percent.html',
    cat: 'Hospitality Automation · Case Study',
    date: '2026-10-14',
    readTime: '8 min read',
    title: {
      en: 'How I Cut Hotel Check-in Time by 60% with Python Automation',
      id: 'Cara Saya Memangkas Waktu Check-in Hotel hingga 60% dengan Otomasi Python',
      zh: '我如何通过Python自动化将酒店入住办理时间缩短60%',
      ja: 'Python自動化でホテルのチェックイン時間を60％短縮した実践例',
      ko: 'Python 자동화로 호텔 체크인 시간을 60% 단축한 실제 구축 사례'
    },
    desc: {
      en: 'A real behind-the-scenes case study: how a Python automation system reduced hotel check-in queue time from 12 minutes to under 5, without replacing front desk staff or buying multi-million enterprise suites.',
      id: 'Studi kasus nyata: bagaimana sistem otomasi Python memangkas antrean check-in hotel dari 12 menit menjadi di bawah 5 menit, tanpa mengganti staf front desk atau membeli software mahal.',
      zh: '真实的实战案例：Python自动化系统如何在不更换前台员工或采购昂贵企业套件的情况下，将酒店入住办理等待时间从12分钟缩短至5分钟以内。',
      ja: 'Pythonによる自動化システムが、フロントデスクのスタッフを入れ替えたり高額なシステムを導入することなく、チェックイン待ち時間を12分から5分未満に短縮した事例。',
      ko: '프론트 데스크 인력을 교체하거나 고가의 엔터프라이즈 솔루션을 도입하지 않고도, Python 자동화 시스템으로 호텔 체크인 대기 시간을 12분에서 5분 미만으로 단축한 사례 연구.'
    }
  },
  {
    slug: 'web-scraping-legal-indonesia-2026',
    file: 'web-scraping-legal-indonesia-2026.html',
    cat: 'Web Scraping · Law & Compliance',
    date: '2026-10-07',
    readTime: '10 min read',
    title: {
      en: "Is Web Scraping Legal in Indonesia? A Developer's Honest Guide (2026)",
      id: 'Apakah Web Scraping Legal di Indonesia? Panduan Jujur Developer (2026)',
      zh: '在印尼进行网页抓取合法吗？开发者合规指南（2026）',
      ja: 'インドネシアでWebスクレイピングは合法か？エンジニア向け解説（2026）',
      ko: '인도네시아 웹 스크래핑은 합법인가? 개발자를 위한 법적 가이드 (2026)'
    },
    desc: {
      en: 'A practical, non-lawyer breakdown of when web scraping is legal in Indonesia: what the UU PDP and UU ITE say, which practices are clearly safe, and what gets developers into legal trouble.',
      id: 'Panduan praktis non-hukum tentang legalitas web scraping di Indonesia: tinjauan UU PDP dan UU ITE, batasan aman, serta apa yang bisa menyeret developer ke ranah hukum.',
      zh: '印尼网页抓取合法性的实用指南：解读印尼个人数据保护法（UU PDP）与电子信息交易法（UU ITE），明确安全边界及潜在风险。',
      ja: 'インドネシアにおけるWebスクレイピングの合法性を実務目線で解説。個人データ保護法（UU PDP）と電子情報取引法（UU ITE）の要点。',
      ko: '인도네시아 웹 스크래핑의 합법성을 실무자 관점에서 정리한 가이드: 개인정보보호법(UU PDP) 및 전자정보거래법(UU ITE) 준수 요건.'
    }
  },
  {
    slug: 'why-whatsapp-bots-fail-indonesia',
    file: 'why-whatsapp-bots-fail-indonesia.html',
    cat: 'AI Agents · Customer Service Automation',
    date: '2026-09-30',
    readTime: '9 min read',
    title: {
      en: 'Why WhatsApp Bots Fail in Indonesian Businesses (And How to Fix It)',
      id: 'Kenapa Bot WhatsApp Sering Gagal di Bisnis Indonesia (Dan Cara Mengatasinya)',
      zh: '为什么WhatsApp机器人在印尼企业中常以失败告终（以及应对方案）',
      ja: 'インドネシアのビジネスでWhatsAppボットが失敗する理由とその解決策',
      ko: '인도네시아 기업의 WhatsApp 챗봇이 실패하는 이유와 해결책'
    },
    desc: {
      en: "Most WhatsApp bots deployed in Indonesian businesses fail or get quietly abandoned within 6 months. Here's why from API policy bans to cultural friction and what architecture actually works.",
      id: 'Sebagian besar bot WhatsApp di bisnis Indonesia gagal atau ditinggalkan dalam 6 bulan. Pelajari alasannya dari risiko ban API hingga gesekan kultural dan arsitektur yang berhasil.',
      zh: '印尼企业部署的大多数WhatsApp机器人在上线6个月内陷入停滞。本文剖析从API封禁政策到文化沟通习惯等根本原因，并给出可行架构。',
      ja: 'インドネシア企業で導入されたWhatsAppボットの多くが半年以内に形骸化します。API規約違反から文化的摩擦まで、原因と実効性のあるアーキテクチャを解説。',
      ko: '인도네시아 기업에 도입된 WhatsApp 챗봇 대부분이 6개월 이내에 실패하는 이유(API 정책 위반, 문화적 소통 차이)와 검증된 해결 아키텍처.'
    }
  }
];

const LANGUAGES = ['en', 'id', 'zh', 'ja', 'ko'];
const LANG_NAMES = {
  en: 'EN',
  id: 'ID',
  zh: '中文',
  ja: '日本語',
  ko: '한국어'
};

const NAV_TRANSLATIONS = {
  en: {
    services: 'Services',
    blog: 'Blog',
    contact: 'Contact',
    readIn: 'Read in:',
    letstalk: "Let's Collaborate",
    cta: 'Need a customized automation system for your business?',
    home: 'Home',
    allArticles: 'All Articles',
    sitemap: 'Sitemap',
    readArch: 'Read Architecture',
    subtitle: 'Field Notes, Architecture & Production Systems',
    tagline: 'Engineering robust data systems, automation architectures, and high-performance applications.'
  },
  id: {
    services: 'Layanan',
    blog: 'Blog',
    contact: 'Kontak',
    readIn: 'Baca dalam:',
    letstalk: 'Ayo Kolaborasi',
    cta: 'Butuh sistem otomasi kustom untuk bisnis Anda?',
    home: 'Beranda',
    allArticles: 'Semua Artikel',
    sitemap: 'Sitemap',
    readArch: 'Pelajari Arsitektur',
    subtitle: 'Catatan Lapangan, Arsitektur Sistem & Rekayasa Produksi',
    tagline: 'Membangun pipeline data tangguh, arsitektur otomasi, dan sistem backend berperforma tinggi.'
  },
  zh: {
    services: '服务',
    blog: '博客',
    contact: '联系',
    readIn: '阅读语言：',
    letstalk: '开展合作',
    cta: '需要为您的业务量身打造自动化系统？',
    home: '首页',
    allArticles: '所有文章',
    sitemap: '网站地图',
    readArch: '阅读架构详情',
    subtitle: '实战手记、系统架构与企业级生产系统',
    tagline: '打造坚固的数据管道、业务自动化架构与高性能后端应用。'
  },
  ja: {
    services: 'サービス',
    blog: 'ブログ',
    contact: 'お問い合わせ',
    readIn: '言語を選択:',
    letstalk: '協業のご相談',
    cta: '御社に最適な業務自動化システムをご検討ですか？',
    home: 'ホーム',
    allArticles: '記事一覧',
    sitemap: 'サイトマップ',
    readArch: 'アーキテクチャを読む',
    subtitle: '開発手記、システム設計と実務エンジニアリング',
    tagline: '堅牢なデータパイプライン、自動化アーキテクチャ、高負荷対応バックエンドの構築。'
  },
  ko: {
    services: '서비스',
    blog: '블로그',
    contact: '문의하기',
    readIn: '언어 선택:',
    letstalk: '협업 문의',
    cta: '귀사에 최적화된 맞춤형 업무 자동화 시스템이 필요하신가요?',
    home: '홈',
    allArticles: '전체 기사',
    sitemap: '사이트맵',
    readArch: '아키텍처 분석 보기',
    subtitle: '현장 실전 노트, 시스템 아키텍처 및 프로덕션 엔지니어링',
    tagline: '안정적인 데이터 파이프라인, 업무 자동화 시스템 및 고성능 백엔드 구축.'
  }
};

function generateArticlePage(item, lang) {
  const currentTitle = item.title[lang] || item.title.en;
  const currentDesc = item.desc[lang] || item.desc.en;
  const canonicalUrl = `https://albertusfreddi.github.io/blog/${lang}/${item.slug}.html`;
  const t = NAV_TRANSLATIONS[lang] || NAV_TRANSLATIONS.en;

  const langButtons = LANGUAGES.map(l => {
    if (l === lang) {
      return `<a class="active">${LANG_NAMES[l]}</a>`;
    }
    return `<a href="../${l}/${item.slug}.html">${LANG_NAMES[l]}</a>`;
  }).join('\n    ');

  const alternates = LANGUAGES.map(l => {
    return `<link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/${item.slug}.html">`;
  }).join('\n');

  // Metrics HTML
  let metricsHtml = '';
  if (item.metrics && item.metrics.length > 0) {
    const metricCols = item.metrics.map(m => {
      return `<div class="metric"><span class="num">${m.num}</span><span class="label">${m.label}</span></div>`;
    }).join('\n');
    metricsHtml = `<div class="metrics-grid">\n${metricCols}\n</div>`;
  }

  // Diagram HTML
  const diagramHtml = item.svgDiagram ? `<div class="diagram-container">${item.svgDiagram}</div>` : '';

  // Code HTML
  let codeHtml = '';
  if (item.codeSnippet && item.codeSnippet.code) {
    codeHtml = `<div class="code-block">
      <div class="code-header">${item.codeSnippet.header || item.codeSnippet.lang || 'Source Implementation'}</div>
      <pre><code>${escapeHtml(item.codeSnippet.code)}</code></pre>
    </div>`;
  }

  // Sections
  const contentBody = item.sections.map((s, idx) => {
    let extra = '';
    if (idx === 0 && metricsHtml) extra += `\n${metricsHtml}`;
    if (idx === 1 && diagramHtml) extra += `\n${diagramHtml}`;
    if (idx === 2 && codeHtml) extra += `\n${codeHtml}`;
    return `<h2>${s.h2}</h2>\n<p>${s.p}</p>${extra}`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${currentTitle} | Albertus Freddi</title>
<meta name="description" content="${currentDesc}">
<meta name="author" content="Albertus Freddi">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${currentTitle}">
<meta property="og:description" content="${currentDesc}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:type" content="article">
<meta property="article:published_time" content="${item.date}T09:00:00+07:00">
<meta property="article:author" content="Albertus Freddi">
${alternates}
<style>
:root{--bg:#0e0e0e;--fg:#e8e6e0;--cream:#f5f0e8;--accent:#c8a96e;--crimson:#D1161A;--muted:#888;--border:#2a2a2a;--card:#141414;color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:400 17px/1.75 'Georgia',serif;padding:0}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
header.site{background:var(--card);border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
header.site .logo{font:700 1.1rem/1 sans-serif;color:var(--cream);letter-spacing:.05em}
header.site nav{display:flex;gap:1.5rem;font-size:.85rem;font-family:sans-serif}
header.site nav a{color:var(--muted)}
header.site nav a:hover{color:var(--cream);text-decoration:none}
.hero{background:linear-gradient(160deg,#161412 0%,#0e0e0e 65%);padding:4rem 2rem 3rem;border-bottom:1px solid var(--border)}
.hero-inner{max-width:740px;margin:0 auto}
.category{font:600 .75rem/1 sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.hero h1{font:700 2.4rem/1.2 Georgia,serif;color:var(--cream);margin-bottom:1.25rem;text-wrap:balance}
.hero .meta{font:400 .9rem/1 sans-serif;color:var(--muted);display:flex;gap:1.5rem;flex-wrap:wrap}
main{max-width:740px;margin:0 auto;padding:3rem 2rem 5rem}
.lang-switch{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:3rem;padding:.75rem 1rem;background:var(--card);border:1px solid var(--border);border-radius:6px;font:500 .8rem/1 sans-serif}
.lang-switch span{color:var(--muted)}
.lang-switch a{color:var(--accent)}
.lang-switch a:hover{text-decoration:none;color:var(--cream)}
.lang-switch .active{color:var(--cream);font-weight:700;pointer-events:none}
article h2{font:700 1.6rem/1.25 Georgia,serif;color:var(--cream);margin:2.5rem 0 1rem}
article p{margin-bottom:1.4rem;color:#ccc8be}
.callout{background:var(--card);border-left:3px solid var(--accent);padding:1.25rem 1.5rem;margin:2rem 0;border-radius:0 6px 6px 0}
.callout p{margin:0;color:var(--cream);font-style:italic}
.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:2.5rem 0}
.metric{background:var(--card);border:1px solid var(--border);padding:1.25rem;border-radius:8px;text-align:center}
.metric .num{font:700 1.9rem/1 sans-serif;color:var(--accent);display:block;margin-bottom:.35rem}
.metric .label{font:400 .8rem/1.25 sans-serif;color:var(--muted)}
.diagram-container{margin:2.5rem 0;overflow-x:auto}
.code-block{background:#111;border:1px solid var(--border);border-radius:8px;overflow:hidden;margin:2.5rem 0}
.code-block .code-header{background:#1a1a1a;padding:.65rem 1.25rem;font:.75rem/1 monospace;color:var(--muted);border-bottom:1px solid var(--border);letter-spacing:.03em}
.code-block pre{padding:1.25rem;overflow-x:auto;font:.85rem/1.6 monospace;color:#c8b89a}
footer.site{background:var(--card);border-top:1px solid var(--border);padding:2.5rem 2rem;text-align:center;font-family:sans-serif}
footer.site .cta{font:700 1.15rem/1 sans-serif;color:var(--cream);margin-bottom:.75rem}
footer.site p{font-size:.9rem;color:var(--muted);margin-bottom:1.25rem}
footer.site .btn{display:inline-block;background:var(--accent);color:#0e0e0e;padding:.75rem 2rem;border-radius:4px;font:700 .9rem/1 sans-serif;letter-spacing:.04em;transition:opacity .2s}
footer.site .btn:hover{text-decoration:none;opacity:.9}
footer.site .links{margin-top:2rem;font-size:.8rem;color:var(--muted);display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap}
footer.site .links a{color:var(--muted)}
footer.site .links a:hover{color:var(--cream)}
@media(max-width:640px){.hero h1{font-size:1.85rem}.metrics-grid{grid-template-columns:1fr}.hero{padding:2.5rem 1rem 2rem}main{padding:2rem 1rem 4rem}}
</style>
</head>
<body>
<header class="site">
  <a class="logo" href="https://albertusfreddi.github.io/">ALBERTUS FREDDI</a>
  <nav>
    <a href="https://albertusfreddi.github.io/#services">${t.services}</a>
    <a href="https://albertusfreddi.github.io/blog/${lang}/">${t.blog}</a>
    <a href="https://albertusfreddi.github.io/#contact">${t.contact}</a>
  </nav>
</header>

<div class="hero">
  <div class="hero-inner">
    <div class="category">${item.cat}</div>
    <h1>${currentTitle}</h1>
    <div class="meta">
      <span>Albertus Freddi</span>
      <span>${item.date}</span>
      <span>${item.readTime}</span>
    </div>
  </div>
</div>

<main>
  <div class="lang-switch">
    <span>${t.readIn}</span>
    ${langButtons}
  </div>

  <article>
    <div class="callout">
      <p>${currentDesc}</p>
    </div>

    ${contentBody}
  </article>
</main>

<footer class="site">
  <div class="cta">${t.cta}</div>
  <p>${t.tagline}</p>
  <a class="btn" href="https://albertusfreddi.github.io/#contact">${t.letstalk}</a>
  <div class="links">
    <a href="https://albertusfreddi.github.io/">${t.home}</a>
    <a href="https://albertusfreddi.github.io/blog/${lang}/">${t.allArticles}</a>
    <a href="https://albertusfreddi.github.io/sitemap.xml">${t.sitemap}</a>
  </div>
</footer>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

// 1. Generate all 30 backdated articles across 5 languages
publishedArticles.forEach(item => {
  LANGUAGES.forEach(lang => {
    const html = generateArticlePage(item, lang);
    const destDir = path.join(distBlogDir, lang);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const targetFile = path.join(destDir, `${item.slug}.html`);
    fs.writeFileSync(targetFile, html, 'utf8');
  });
});

console.log(`Generated 30 articles in 5 languages = ${publishedArticles.length * 5} HTML files.`);

// Combine all currently live articles for index & sitemap (30 backdated + 3 pillars if unique)
const masterLiveMap = new Map();
publishedArticles.forEach(a => masterLiveMap.set(a.slug, a));
existingPillars.forEach(p => {
  if (!masterLiveMap.has(p.slug)) masterLiveMap.set(p.slug, p);
});

const allLiveArticles = Array.from(masterLiveMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

// 2. Generate Localized Blog Index Pages (dist/blog/{en,id,zh,ja,ko}/index.html)
LANGUAGES.forEach(lang => {
  const t = NAV_TRANSLATIONS[lang] || NAV_TRANSLATIONS.en;
  const langButtons = LANGUAGES.map(l => {
    if (l === lang) return `<a class="active">${LANG_NAMES[l]}</a>`;
    return `<a href="../${l}/">${LANG_NAMES[l]}</a>`;
  }).join(' · ');

  const cardsHtml = allLiveArticles.map(art => {
    const title = (art.title && art.title[lang]) || (art.title && art.title.en) || art.slug;
    const desc = (art.desc && art.desc[lang]) || (art.desc && art.desc.en) || '';
    const cat = art.cat || 'Engineering';
    const readTime = art.readTime || '8 min read';

    return `<article class="article-card">
      <div class="card-meta">
        <span class="card-cat">${cat}</span>
        <span class="card-date">${art.date} · ${readTime}</span>
      </div>
      <h2 class="card-title">
        <a href="${art.slug}.html">${title}</a>
      </h2>
      <p class="card-desc">${desc}</p>
      <div class="card-action">
        <a href="${art.slug}.html" class="read-link">${t.readArch} &#8594;</a>
      </div>
    </article>`;
  }).join('\n');

  const indexHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog &amp; Engineering Case Studies | Albertus Freddi</title>
<meta name="description" content="In-depth technical case studies on automation pipelines, reverse-engineered APIs, resilient scraping, and distributed systems.">
<link rel="canonical" href="https://albertusfreddi.github.io/blog/${lang}/">
${LANGUAGES.map(l => `<link rel="alternate" hreflang="${l}" href="https://albertusfreddi.github.io/blog/${l}/">`).join('\n')}
<style>
:root{--bg:#0e0e0e;--fg:#e8e6e0;--cream:#f5f0e8;--accent:#c8a96e;--muted:#888;--border:#222;--card:#141414;color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:400 16px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
header.site{background:var(--card);border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
header.site .logo{font:700 1.1rem/1 sans-serif;color:var(--cream);letter-spacing:.05em}
header.site nav{display:flex;gap:1.5rem;font-size:.85rem}
header.site nav a{color:var(--muted)}
header.site nav a:hover{color:var(--cream);text-decoration:none}
.hero{background:linear-gradient(160deg,#161412 0%,#0e0e0e 65%);padding:4.5rem 2rem 3rem;border-bottom:1px solid var(--border);text-align:center}
.hero h1{font:700 2.8rem/1.15 Georgia,serif;color:var(--cream);margin-bottom:1rem;text-wrap:balance}
.hero p{font-size:1.1rem;color:var(--muted);max-width:620px;margin:0 auto 1.5rem}
.lang-bar{font-size:.85rem;color:var(--muted)}
.lang-bar a{color:var(--accent);margin:0 .25rem}
.lang-bar a.active{color:var(--cream);font-weight:700;pointer-events:none}
main{max-width:960px;margin:0 auto;padding:4rem 2rem 6rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
.article-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.75rem;display:flex;flex-direction:column;justify-content:space-between;transition:border-color .2s,transform .2s}
.article-card:hover{border-color:var(--accent);transform:translateY(-2px)}
.card-meta{display:flex;justify-content:space-between;align-items:center;font-size:.75rem;margin-bottom:1rem}
.card-cat{color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.card-date{color:var(--muted)}
.card-title{font:700 1.25rem/1.3 Georgia,serif;color:var(--cream);margin-bottom:.75rem}
.card-title a{color:var(--cream)}
.card-title a:hover{color:var(--accent);text-decoration:none}
.card-desc{font-size:.9rem;color:#aaa;line-height:1.5;margin-bottom:1.5rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-action{border-top:1px solid var(--border);padding-top:1rem}
.read-link{font-size:.85rem;font-weight:600;color:var(--accent)}
footer.site{background:var(--card);border-top:1px solid var(--border);padding:2.5rem 2rem;text-align:center;font-size:.85rem;color:var(--muted)}
footer.site .links{display:flex;justify-content:center;gap:1.5rem;margin-top:1rem}
footer.site .links a{color:var(--muted)}
footer.site .links a:hover{color:var(--cream)}
@media(max-width:640px){.hero h1{font-size:2rem}.grid{grid-template-columns:1fr}main{padding:2rem 1rem}}
</style>
</head>
<body>
<header class="site">
  <a class="logo" href="https://albertusfreddi.github.io/">ALBERTUS FREDDI</a>
  <nav>
    <a href="https://albertusfreddi.github.io/#services">${t.services}</a>
    <a href="https://albertusfreddi.github.io/blog/${lang}/">${t.blog}</a>
    <a href="https://albertusfreddi.github.io/#contact">${t.contact}</a>
  </nav>
</header>

<div class="hero">
  <h1>${t.subtitle}</h1>
  <p>${t.tagline}</p>
  <div class="lang-bar">
    ${langButtons}
  </div>
</div>

<main>
  <div class="grid">
    ${cardsHtml}
  </div>
</main>

<footer class="site">
  <p>&copy; 2026 Albertus Freddi. All rights reserved.</p>
  <div class="links">
    <a href="https://albertusfreddi.github.io/">${t.home}</a>
    <a href="https://albertusfreddi.github.io/blog/${lang}/">${t.allArticles}</a>
    <a href="https://albertusfreddi.github.io/sitemap.xml">${t.sitemap}</a>
  </div>
</footer>
</body>
</html>`;

  fs.writeFileSync(path.join(distBlogDir, lang, 'index.html'), indexHtml, 'utf8');
});

console.log('Regenerated all localized blog index.html files.');

// 3. Generate Complete sitemap.xml
const staticPages = [
  'https://albertusfreddi.github.io/',
  'https://albertusfreddi.github.io/services/ai-agents/',
  'https://albertusfreddi.github.io/services/web-scraping/',
  'https://albertusfreddi.github.io/services/dashboards/',
  'https://albertusfreddi.github.io/kantor/',
  'https://albertusfreddi.github.io/agency/'
];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Static pages
staticPages.forEach(url => {
  sitemapXml += `  <url>
    <loc>${url}</loc>
    <lastmod>2026-10-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
});

// Blog index pages
LANGUAGES.forEach(l => {
  sitemapXml += `  <url>
    <loc>https://albertusfreddi.github.io/blog/${l}/</loc>
    <lastmod>2026-10-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

// All live articles
allLiveArticles.forEach(art => {
  LANGUAGES.forEach(l => {
    sitemapXml += `  <url>
    <loc>https://albertusfreddi.github.io/blog/${l}/${art.slug}.html</loc>
    <lastmod>${art.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });
});

sitemapXml += `</urlset>\n`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Updated sitemap.xml with ${staticPages.length + LANGUAGES.length + (allLiveArticles.length * LANGUAGES.length)} URLs.`);
