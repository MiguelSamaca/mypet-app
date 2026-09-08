// Optimiza las fotos del bucket manteniendo ruta y formato originales
// (cambiar la extensión rompería las URLs ya guardadas en la base).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('file:///c:/Users/migue/AppData/Local/Temp/claude/pgtools/');
const sharp = require('sharp');

const SRC = 'backup-mayte/storage/peludos';
const DST = 'backup-mayte/storage-opt/peludos';
const MAX = 1600;      // lado mayor en px
const Q   = 80;        // calidad
const MIN_TOCAR = 300 * 1024;  // por debajo de esto, se copia tal cual

function walk(d, base = d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p, base) : [path.relative(base, p)];
  });
}

const files = walk(SRC);
console.log(`Archivos: ${files.length}`);
let orig = 0, nuevo = 0, tocados = 0, copiados = 0, errores = [];

for (const [i, rel] of files.entries()) {
  const src = path.join(SRC, rel), dst = path.join(DST, rel);
  const st = fs.statSync(src);
  orig += st.size;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const ext = path.extname(rel).toLowerCase();
  try {
    if (st.size <= MIN_TOCAR) { fs.copyFileSync(src, dst); copiados++; }
    else {
      let img = sharp(src, { failOn: 'none' }).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
      if (ext === '.jpeg' || ext === '.jpg') img = img.jpeg({ quality: Q, mozjpeg: true });
      else if (ext === '.webp') img = img.webp({ quality: Q });
      else if (ext === '.png') img = img.png({ compressionLevel: 9 });
      const buf = await img.toBuffer();
      // si la "optimización" no ayuda, conserva el original
      if (buf.length < st.size) { fs.writeFileSync(dst, buf); tocados++; }
      else { fs.copyFileSync(src, dst); copiados++; }
    }
    nuevo += fs.statSync(dst).size;
  } catch (e) {
    fs.copyFileSync(src, dst); copiados++; nuevo += st.size;
    errores.push({ rel, error: String(e.message || e) });
  }
  if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/${files.length}...`);
}

const mb = b => (b / 1048576).toFixed(1);
console.log(`\nOriginal:    ${mb(orig)} MB`);
console.log(`Optimizado:  ${mb(nuevo)} MB   (${(100 - nuevo / orig * 100).toFixed(1)}% menos)`);
console.log(`Recomprimidos: ${tocados}   Copiados sin tocar: ${copiados}   Errores: ${errores.length}`);
if (errores.length) console.log(errores.slice(0, 5));
