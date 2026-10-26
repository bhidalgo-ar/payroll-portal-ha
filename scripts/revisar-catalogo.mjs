#!/usr/bin/env node
/**
 * Recalcula de apps.json lo que se deduce del historial git de cada app:
 * `cambios` (cambios funcionales acumulados), `actualizado` (fecha del último) y `version`
 * (+0,1 por cada cambio funcional nuevo desde la última corrida). Criterios en CLAUDE.md §3 y §4.
 *
 * Uso:
 *   node scripts/revisar-catalogo.mjs [--clones <carpeta>] [--aplicar]
 *
 *   --clones   carpeta donde están los clones de los repos de las apps (default: la carpeta
 *              que contiene a este repo). Se busca por nombre de repo, sin distinguir mayúsculas.
 *   --aplicar  escribe apps.json (sin esto sólo muestra el informe).
 *
 * Una app cuyo repo no está clonado queda SIN TOCAR y se informa como "sin acceso": nunca se
 * asume que no cambió.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RUTA = join(RAIZ, 'apps.json');
const args = process.argv.slice(2);
const APLICAR = args.includes('--aplicar');
const iC = args.indexOf('--clones');
const CLONES = iC >= 0 ? resolve(args[iC + 1]) : dirname(RAIZ);

/* Un commit cuenta como cambio funcional si el asunto no es de los excluidos Y toca al menos
   un archivo de código de la app que no sea sólo estilo. */
const ASUNTO_NO_FUNCIONAL =
  /^(docs|style|chore|test|ci|build)(\(|:|!)|cat[aá]logo|revisi[oó]n semanal|revisi[oó]n de versiones|favicon|branding|readme|\bbump\b|^merge\b/i;
const ES_CODIGO = /\.(html|js|mjs|json)$/i;
const NO_ES_CODIGO =
  /(^|\/)(tests?|specs?|\.claude|\.github|node_modules|vendor|reportes|config|scripts|iconos)\/|package(-lock)?\.json$|seed\.json$|^(apps|cumpleanios|frases|vencimientos|feriados|indicadores|normativa|legales)\.json$/i;
const ES_ESTILO = /\.css$/i;

const git = (cwd, a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: { ...process.env, TZ: 'America/Argentina/Buenos_Aires' } });

function buscarClon(repo) {
  if (repo === 'bhidalgo-ar/payroll-portal-ha') return RAIZ;
  const nombre = repo.split('/')[1].toLowerCase();
  if (!existsSync(CLONES)) return null;
  const d = readdirSync(CLONES).find(n => n.toLowerCase() === nombre && existsSync(join(CLONES, n, '.git')));
  return d ? join(CLONES, d) : null;
}

function cambiosFuncionales(cwd, a, repoDefecto) {
  const propio = !a.repo || a.repo === repoDefecto;
  const alcance = propio ? (a.url || '').split('/').pop() : (a.path || '.');
  let ref = 'origin/main';
  try { git(cwd, ['rev-parse', '--verify', '-q', ref]); } catch { ref = 'HEAD'; }
  const salida = git(cwd, ['log', ref, '--no-merges', '--date=format-local:%Y-%m-%d',
    '--format=@@%h|%ad|%s', '--name-status', '--', alcance]);
  const res = [];
  for (const bloque of salida.split('@@').slice(1)) {
    const [cab, ...resto] = bloque.split('\n');
    const [h, fecha, ...s] = cab.split('|');
    const asunto = s.join('|');
    const filas = resto.filter(Boolean).map(l => l.split('\t'));
    const archivos = filas.map(f => f[f.length - 1]);
    const alta = filas.some(f => f[0] === 'A' && f[f.length - 1] === alcance);
    if (ASUNTO_NO_FUNCIONAL.test(asunto)) continue;
    // En un repo propio (un html por app) alcanza con que toque el archivo; en repo ajeno se mira el código.
    const codigo = propio
      ? archivos.filter(f => f === alcance)
      : archivos.filter(f => ES_CODIGO.test(f) && !NO_ES_CODIGO.test(f) && !ES_ESTILO.test(f));
    if (!codigo.length) continue;
    res.push({ h, fecha, asunto, alta });
  }
  return res; // del más nuevo al más viejo
}

/* "6.7" + n → "6.7+n décimas"; "2.5.2" + n → parche + n; enteros (numeración propia) no se tocan. */
function sumarVersion(v, n) {
  if (!n) return v;
  if (/^\d+\.\d+$/.test(v)) {
    const [M, m] = v.split('.').map(Number);
    const t = M * 10 + m + n;
    return Math.floor(t / 10) + '.' + (t % 10);
  }
  if (/^\d+\.\d+\.\d+$/.test(v)) {
    const p = v.split('.').map(Number);
    p[2] += n;
    return p.join('.');
  }
  return v;
}

const cat = JSON.parse(readFileSync(RUTA, 'utf8'));
const hoy = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const repoDefecto = cat.meta.repoDefecto;
const informe = [];

for (const a of cat.apps) {
  const repo = a.repo || repoDefecto;
  const fila = { id: a.id, nombre: a.nombre, repo };
  const cwd = buscarClon(repo);
  if (!cwd) { informe.push({ ...fila, estado: 'SIN ACCESO (no se toca)' }); continue; }
  const lista = cambiosFuncionales(cwd, a, repoDefecto);
  if (!lista.length) { informe.push({ ...fila, estado: 'SIN COMMITS FUNCIONALES (no se toca)' }); continue; }
  const total = lista.length;
  // Un commit que sólo agrega el archivo (alta o repo reiniciado) no prueba un cambio posterior a la fecha ya cargada.
  const ultima = (lista.find(c => !c.alta) || {}).fecha || a.actualizado;
  const previo = Number.isInteger(a.cambios) ? a.cambios : null;
  const nuevos = previo === null ? 0 : Math.max(0, total - previo);
  const propia = a.versionPropia === true;
  const versionNueva = propia ? a.version : sumarVersion(a.version, nuevos);
  const actualizadoNuevo = ultima > (a.actualizado || '') ? ultima : a.actualizado;
  informe.push({
    ...fila, estado: 'OK', cambios: `${previo ?? '—'} → ${total}`, nuevos,
    version: a.version === versionNueva ? a.version : `${a.version} → ${versionNueva}`,
    actualizado: a.actualizado === actualizadoNuevo ? a.actualizado : `${a.actualizado} → ${actualizadoNuevo}`,
    nota: propia ? 'versión propia: se lee a mano (§3)' : (previo === null ? 'primera corrida: ancla, sin subir versión' : ''),
  });
  a.cambios = total;
  a.version = versionNueva;
  a.actualizado = actualizadoNuevo;
}

// Más cambios primero; a igual cantidad, por id. Las apps sin acceso conservan su `cambios` previo.
cat.apps.sort((x, y) => (y.cambios ?? 0) - (x.cambios ?? 0) || x.id - y.id);

console.table(informe);
if (APLICAR) {
  cat.meta.ultimaActualizacion = hoy;
  cat.meta.ultimaRevision = hoy;
  writeFileSync(RUTA, JSON.stringify(cat, null, 2) + '\n');
  console.log('apps.json actualizado. Subí meta.version si algo cambió y corré validar-catalogo.');
} else {
  console.log('(simulacro: no se escribió nada; usá --aplicar)');
}
