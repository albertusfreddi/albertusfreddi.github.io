/**
 * Scheduled Article Publisher (Daily Cron Worker)
 * Reads scheduled-90-articles.json and automatically activates any article scheduled for today or earlier.
 * Runs during GitHub Action cron at 00:00 UTC.
 */

const fs = require('fs');
const path = require('path');

const scheduledPath = path.join(__dirname, 'scheduled-90-articles.json');
const publishedPath = path.join(__dirname, 'published-30-articles.json');

if (!fs.existsSync(scheduledPath) || !fs.existsSync(publishedPath)) {
  console.log('Master article JSON files not found. Skipping daily run.');
  process.exit(0);
}

const scheduledArticles = JSON.parse(fs.readFileSync(scheduledPath, 'utf8'));
const publishedArticles = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

const todayStr = new Date().toISOString().split('T')[0];
console.log(`Checking scheduled articles up to: ${todayStr}`);

const toPublish = [];
const remainingScheduled = [];

scheduledArticles.forEach(art => {
  if (art.date <= todayStr) {
    toPublish.push(art);
  } else {
    remainingScheduled.push(art);
  }
});

if (toPublish.length === 0) {
  console.log('No articles scheduled for activation today.');
  process.exit(0);
}

console.log(`Activating ${toPublish.length} scheduled article(s) today!`);

toPublish.forEach(art => {
  art.status = 'published';
  publishedArticles.unshift(art);
});

// Update JSON state
fs.writeFileSync(publishedPath, JSON.stringify(publishedArticles, null, 2), 'utf8');
fs.writeFileSync(scheduledPath, JSON.stringify(remainingScheduled, null, 2), 'utf8');

// Rebuild HTML files and sitemap
require('./build-production-blog.js');

console.log('Daily publishing and sync complete.');
