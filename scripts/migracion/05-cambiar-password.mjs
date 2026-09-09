// Cambia la contraseña de un usuario del proyecto destino.
// La contraseña se escribe en la terminal (oculta) y va directo a la API de
// Supabase: no pasa por el chat, ni queda en el historial, ni se guarda en disco.
//
//   node scripts/migracion/05-cambiar-password.mjs
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.migracion', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const BASE = env.DESTINO_URL, SR = env.DESTINO_SERVICE_ROLE, ANON = env.DESTINO_ANON_KEY;
if (!BASE || !SR) {
  console.error('Falta DESTINO_URL o DESTINO_SERVICE_ROLE en .env.migracion');
  process.exit(1);
}

const CTRL_C = '\u0003'; // Ctrl+C
const DEL = '\u007f';    // Backspace

function pregunta(texto, oculto = false) {
  return new Promise(res => {
    process.stdout.write(texto);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding('utf8');
    if (!oculto) {
      stdin.once('data', d => { stdin.pause(); res(d.trim()); });
      return;
    }
    let val = '';
    stdin.setRawMode?.(true);
    const onData = ch => {
      if (ch === '\r' || ch === '\n') {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        res(val);
      } else if (ch === CTRL_C) {
        stdin.setRawMode?.(false);
        process.stdout.write('\n');
        process.exit(1);
      } else if (ch === DEL || ch === '\b') {
        if (val.length) { val = val.slice(0, -1); process.stdout.write('\b \b'); }
      } else {
        val += ch;
        process.stdout.write('*');
      }
    };
    stdin.on('data', onData);
  });
}

const POR_DEFECTO = 'miguel.samaca.samaca@gmail.com';
const email = (await pregunta(`Correo del usuario [${POR_DEFECTO}]: `)) || POR_DEFECTO;
const p1 = await pregunta('Contraseña nueva (mín. 8 caracteres): ', true);
const p2 = await pregunta('Repítela: ', true);

if (p1.length < 8) { console.error('Demasiado corta.'); process.exit(1); }
if (p1 !== p2) { console.error('No coinciden.'); process.exit(1); }

const h = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

const lista = await (await fetch(`${BASE}/auth/v1/admin/users?per_page=200`, { headers: h })).json();
const user = (lista.users || []).find(u => u.email?.toLowerCase() === email.toLowerCase());
if (!user) { console.error(`No existe el usuario ${email}`); process.exit(1); }

const upd = await fetch(`${BASE}/auth/v1/admin/users/${user.id}`, {
  method: 'PUT',
  headers: h,
  body: JSON.stringify({ password: p1, email_confirm: true }),
});
if (!upd.ok) { console.error('Error al cambiar:', await upd.text()); process.exit(1); }
console.log('Contraseña actualizada.');

// Comprobación inmediata: intenta entrar con ella, igual que lo hace la app.
const login = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: ANON, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: p1 }),
});
const j = await login.json();
console.log(login.ok && j.access_token
  ? 'Verificado: el login funciona con la contraseña nueva.'
  : `El cambio se guardó, pero el login falló: ${j.error_description || j.msg || JSON.stringify(j)}`);
