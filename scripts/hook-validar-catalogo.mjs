#!/usr/bin/env node
/**
 * Hook PostToolUse: cuando se edita apps.json, lo valida enseguida.
 *
 * Lee el payload del hook por stdin y sólo actúa si el archivo tocado es apps.json.
 * Devuelve exit 2 con el detalle en stderr para que Claude vea el error y lo corrija.
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');

let crudo = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) crudo += chunk;

let payload = {};
try { payload = JSON.parse(crudo || '{}'); } catch { process.exit(0); }

const tocado = payload?.tool_input?.file_path
  || payload?.tool_input?.notebook_path
  || '';
if (!/(^|[\\/])apps\.json$/.test(tocado)) process.exit(0);

const r = spawnSync(process.execPath, [resolve(AQUI, 'validar-catalogo.mjs')], {
  cwd: RAIZ, encoding: 'utf8',
});
const salida = ((r.stdout || '') + (r.stderr || '')).trim();

if (r.status !== 0) {
  console.error('apps.json quedó inválido — corregilo antes de seguir:\n' + salida);
  process.exit(2);   // exit 2 = el stderr vuelve a Claude
}
if (salida) console.log(salida);
process.exit(0);
