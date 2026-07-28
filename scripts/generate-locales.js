const https = require('https');
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'i18n', 'locales');
const enPath = path.join(LOCALES_DIR, 'en.json');
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

const LANGUAGES = [
  { code: 'hi', file: 'hi.json' },
  { code: 'de', file: 'de.json' },
  { code: 'ja', file: 'ja.json' },
  { code: 'fr', file: 'fr.json' },
  { code: 'es', file: 'es.json' },
  { code: 'zh-CN', file: 'zh.json' },
  { code: 'ar', file: 'ar.json' },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLeafKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      keys.push({ key, value: v });
    } else if (v && typeof v === 'object') {
      keys = keys.concat(getLeafKeys(v, key));
    }
  }
  return keys;
}

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function translateText(text, targetLang, retries = 3) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const attempt = (remaining) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              const translated = parsed[0].map(seg => seg[0]).join('');
              resolve(translated);
            } catch {
              reject(new Error(`Parse failed: "${text.substring(0,40)}..." -> ${data.substring(0,100)}`));
            }
          } else if (remaining > 0 && res.statusCode >= 500) {
            setTimeout(() => attempt(remaining - 1), 1000);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: "${text.substring(0,40)}..."`));
          }
        });
      }).on('error', (err) => {
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1), 1000);
        } else {
          reject(err);
        }
      });
    };
    attempt(retries);
  });
}

function replacePlaceholders(text) {
  const placeholders = [];
  const cleaned = text.replace(/\{\{(.+?)\}\}/g, (match) => {
    const id = `__PH_${placeholders.length}__`;
    placeholders.push({ id, match });
    return id;
  });
  return { cleaned, placeholders };
}

function restorePlaceholders(text, placeholders) {
  let result = text;
  for (const { id, match } of placeholders) {
    result = result.replace(id, match);
  }
  return result;
}

async function translateValue(text, targetLang) {
  if (!text.trim()) return text;
  const { cleaned, placeholders } = replacePlaceholders(text);
  const translated = await translateText(cleaned, targetLang);
  return restorePlaceholders(translated, placeholders);
}

async function generateLocale(langCode, langFile) {
  const outputPath = path.join(LOCALES_DIR, langFile);
  const result = JSON.parse(JSON.stringify(enJson));
  const leafKeys = getLeafKeys(enJson);
  console.log(`\n=== ${langFile} (${langCode}) — ${leafKeys.length} keys ===`);
  let successCount = 0;
  let errorCount = 0;
  for (let i = 0; i < leafKeys.length; i++) {
    const { key, value } = leafKeys[i];
    try {
      const translated = await translateValue(value, langCode);
      setNested(result, key, translated);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`  ERR [${i + 1}] ${key}: ${err.message}`);
    }
    if ((i + 1) % 50 === 0 || i === leafKeys.length - 1) {
      console.log(`  [${i + 1}/${leafKeys.length}] ok=${successCount} err=${errorCount}`);
    }
    await sleep(80);
  }
  const jsonStr = JSON.stringify(result, null, 2);
  fs.writeFileSync(outputPath, jsonStr, 'utf-8');
  console.log(`  => ${langFile} written: ${successCount} ok, ${errorCount} err`);
  return { successCount, errorCount };
}

async function main() {
  let totalSuccess = 0;
  let totalErrors = 0;
  for (const lang of LANGUAGES) {
    const stats = await generateLocale(lang.code, lang.file);
    totalSuccess += stats.successCount;
    totalErrors += stats.errorCount;
    await sleep(500);
  }
  console.log(`\n=== ALL DONE: ${totalSuccess} ok, ${totalErrors} err ===`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
