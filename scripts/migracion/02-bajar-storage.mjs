// Descarga los 672 archivos del bucket público "peludos" del proyecto de origen.
import fs from 'node:fs';
import path from 'node:path';

const CSV    = 'mypet-backup-full/storage_objects.csv';
const BASE   = 'https://cvhzsanjnkmqzrjdgcjh.supabase.co/storage/v1/object/public/peludos/';
const DEST   = 'backup-mayte/storage/peludos';
const Q = String.fromCharCode(34), NL = String.fromCharCode(10), CR = String.fromCharCode(13);

function parseCSV(t) {
  let rows = [], cur = [], fld = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === Q) { if (t[i+1] === Q) { fld += Q; i++; } else q = false; } else fld += c; }
    else if (c === Q) q = true;
    else if (c === ',') { cur.push(fld); fld = ''; }
    else if (c === NL) { cur.push(fld); rows.push(cur); cur = []; fld = ''; }
    else if (c === CR) {}
    else fld += c;
  }
  if (fld !== '' || cur.length) { cur.push(fld); rows.push(cur); }
  return rows.filter(r => r.length > 1);
}

const rows = parseCSV(fs.readFileSync(CSV, 'utf8'));
const head = rows[0];
const iName = head.indexOf('name');
const names = rows.slice(1).map(r => r[iName]).filter(Boolean);
console.log(`Archivos a descargar: ${names.length}`);

let ok = 0, fail = 0, bytes = 0;
const fallos = [];
const CONC = 8;
let idx = 0;

async function worker() {
  while (idx < names.length) {
    const n = names[idx++];
    const out = path.join(DEST, n);
    if (fs.existsSync(out) && fs.statSync(out).size > 0) { ok++; bytes += fs.statSync(out).size; continue; }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    try {
      const res = await fetch(BASE + n.split('/').map(encodeURIComponent).join('/'));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error('archivo vacío');
      fs.writeFileSync(out, buf);
      ok++; bytes += buf.length;
    } catch (e) {
      fail++; fallos.push({ archivo: n, error: String(e.message || e) });
    }
    if ((ok + fail) % 50 === 0) console.log(`  ${ok + fail}/${names.length}...`);
  }
}

await Promise.all(Array.from({ length: CONC }, worker));

console.log(`\nDescargados: ${ok}   Fallidos: ${fail}   Total: ${(bytes / 1048576).toFixed(1)} MB`);
if (fallos.length) {
  fs.writeFileSync('backup-mayte/storage-fallidos.json', JSON.stringify(fallos, null, 2));
  console.log('Fallidos guardados en backup-mayte/storage-fallidos.json');
  for (const f of fallos.slice(0, 10)) console.log('  -', f.archivo, '->', f.error);
}
