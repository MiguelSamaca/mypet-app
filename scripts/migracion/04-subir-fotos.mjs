import fs from 'node:fs';
import path from 'node:path';

const env = Object.fromEntries(fs.readFileSync('.env.migracion','utf8').split('\n')
  .filter(l => l.includes('=') && !l.trim().startsWith('#'))
  .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim()]));

const SRC = 'backup-mayte/storage-opt/peludos';
const BASE = `${env.DESTINO_URL}/storage/v1/object/peludos/`;
const KEY = env.DESTINO_SERVICE_ROLE;
const MIME = { '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.webp':'image/webp', '.png':'image/png' };

function walk(d, base = d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  });
}

const files = walk(SRC);
console.log(`Subiendo ${files.length} archivos...`);
let ok = 0, fail = 0, bytes = 0; const fallos = [];
let idx = 0;

async function worker() {
  while (idx < files.length) {
    const rel = files[idx++];
    const buf = fs.readFileSync(path.join(SRC, rel));
    const ext = path.extname(rel).toLowerCase();
    try {
      const res = await fetch(BASE + rel.split('/').map(encodeURIComponent).join('/'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, apikey: KEY,
                   'Content-Type': MIME[ext] || 'application/octet-stream',
                   'x-upsert': 'true' },
        body: buf,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0,120)}`);
      ok++; bytes += buf.length;
    } catch (e) { fail++; fallos.push({ rel, error: String(e.message || e) }); }
    if ((ok + fail) % 100 === 0) console.log(`  ${ok + fail}/${files.length}...`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`\nSubidos: ${ok}   Fallidos: ${fail}   Total: ${(bytes/1048576).toFixed(1)} MB`);
if (fallos.length) { fs.writeFileSync('backup-mayte/subida-fallidos.json', JSON.stringify(fallos,null,2)); console.log(fallos.slice(0,5)); }
