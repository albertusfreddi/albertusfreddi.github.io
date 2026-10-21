#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const blogDataDir = path.join(__dirname, 'blog-data');

if (!fs.existsSync(blogDataDir)) {
  console.error('blog-data/ tidak ditemukan');
  process.exit(1);
}

const files = fs.readdirSync(blogDataDir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const filePath = path.join(blogDataDir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { file: f, path: filePath, data };
  })
  .filter(a => a.data.status === 'ready')
  .sort((a, b) => (a.data.date || '').localeCompare(b.data.date || ''));

if (files.length === 0) {
  console.log('Tidak ada artikel ready untuk dipublikasi hari ini');
  process.exit(0);
}

const article = files[0];
console.log(`Publishing: ${article.data.slug}`);

article.data.status = 'published';
article.data.date = new Date().toISOString().split('T')[0];

fs.writeFileSync(article.path, JSON.stringify(article.data, null, 2), 'utf-8');
console.log(`Status updated to published`);

console.log('Rebuilding blog...');
execSync('node build-blog.js', { stdio: 'inherit' });

console.log(`\nPublished: ${article.data.slug}`);
