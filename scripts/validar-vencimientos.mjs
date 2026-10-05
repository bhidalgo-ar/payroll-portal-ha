#!/usr/bin/env node
/**
 * Valida feriados.json y vencimientos.json (CLAUDE.md §9).
 *
 * Chequea lo mecánico: formato, fechas reales de calendario, duplicados, que las
 * terminaciones de CUIT de cada obligación cubran 0-9 una sola vez y que ningún
 * vencimiento caiga en un feriado o día no laborable. Que las fechas sean las del
 * calendario oficial de ARCA no lo puede saber un script: eso se carga a mano
 * desde la fuente oficial.
 *
 * Uso: node scripts/validar-vencimientos.mjs [ruta/vencimientos.json] [ruta/feriados.json]
 * Sale con 1 si hay errores. Las advertencias (fin de semana) no cortan.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RUTA_VENC = process.argv[2] ? resolve(process.argv[2]) : resolve(RAIZ, 'vencimientos.json');
const RUTA_FER = process.argv[3] ? resolve(process.argv[3]) : resolve(RAIZ, 'feriados.json');

const TIPOS = ['inamovible', 'trasladable', 'puntual', 'no_laborable'];
const ESTADOS = ['oficial', 'estimado'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const errores = [];
const avisos = [];
const err = (m) => errores.push(m);
const avisar = (m) => avisos.push(m);

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_TERM = /^\d(-\d)*$/;
const RE_PERIODO = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

/* Fecha real de calendario: 2026-02-30 tiene el formato bien pero no existe. */
function fechaValida(v) {
  if (typeof v !== 'string' || !RE_FECHA.test(v)) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
const diaSemana = (v) => new Date(v + 'T00:00:00Z').getUTCDay();

function leer(ruta) {
  try {
    const datos = JSON.parse(readFileSync(ruta, 'utf8'));
    if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
      console.error('✗ ' + ruta + ': el JSON tiene que ser un objeto, no ' + (Array.isArray(datos) ? 'un array' : String(datos)));
      process.exit(1);
    }
    return datos;
  } catch (e) {
    console.error('✗ ' + ruta + ' no es JSON válido o no se puede leer: ' + e.message);
    process.exit(1);
  }
}

/* Dominios oficiales aceptados como fuente de un vencimiento. Se compara el host
   completo (el dominio o un subdominio suyo), no un texto cualquiera de la URL:
   "arca.gob.ar.ejemplo.invalid" no pasa. */
const DOMINIOS_OFICIALES = ['arca.gob.ar', 'afip.gob.ar', 'argentina.gob.ar', 'boletinoficial.gob.ar'];
function fuenteOficial(u) {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:') return false;
    return DOMINIOS_OFICIALES.some((d) => url.hostname === d || url.hostname.endsWith('.' + d));
  } catch { return false; }
}

/* ── feriados.json ────────────────────────────────────────────────────────── */
const fer = leer(RUTA_FER);
const feriados = new Map();   // fecha -> feriado
const aniosFeriados = new Set();

if (!fer.meta || typeof fer.meta !== 'object') err('feriados.json: falta el objeto "meta"');
else if (fer.meta.actualizado && !fechaValida(fer.meta.actualizado)) {
  err('feriados.json: meta.actualizado no es una fecha AAAA-MM-DD real: ' + fer.meta.actualizado);
}
if (!Array.isArray(fer.feriados)) {
  err('feriados.json: "feriados" tiene que ser un array');
  fer.feriados = [];
}

let anterior = '';
for (const [i, f] of fer.feriados.entries()) {
  const et = 'feriados.json #' + (i + 1) + (f && f.fecha ? ' (' + f.fecha + ')' : '');
  if (!f || typeof f !== 'object') { err(et + ': no es un objeto'); continue; }
  if (!fechaValida(f.fecha)) {
    err(et + ': "fecha" no es una fecha AAAA-MM-DD real — ' + f.fecha);
    continue;
  }
  if (feriados.has(f.fecha)) err(et + ': fecha duplicada');
  else feriados.set(f.fecha, f);
  if (f.fecha < anterior) err(et + ': fuera de orden (viene después de ' + anterior + ')');
  anterior = f.fecha > anterior ? f.fecha : anterior;
  aniosFeriados.add(f.fecha.slice(0, 4));

  if (!f.nombre || typeof f.nombre !== 'string') err(et + ': falta "nombre"');
  if (!TIPOS.includes(f.tipo)) err(et + ': tipo "' + f.tipo + '" inválido (' + TIPOS.join(' | ') + ')');
  if (!ESTADOS.includes(f.estado)) err(et + ': estado "' + f.estado + '" inválido (' + ESTADOS.join(' | ') + ')');
  if (!f.fuente || typeof f.fuente !== 'string') err(et + ': falta "fuente"');
  if (f.estado === 'estimado' && (!f.regla || typeof f.regla !== 'string')) {
    err(et + ': estado "estimado" sin "regla" que explique cómo se calculó');
  }
  if (f.fechaOriginal !== undefined && !fechaValida(f.fechaOriginal)) {
    err(et + ': "fechaOriginal" no es una fecha AAAA-MM-DD real — ' + f.fechaOriginal);
  }
}

/* ── vencimientos.json ────────────────────────────────────────────────────── */
const ven = leer(RUTA_VENC);

if (!ven.meta || typeof ven.meta !== 'object') err('vencimientos.json: falta el objeto "meta"');
else if (ven.meta.actualizado !== null && ven.meta.actualizado !== undefined
    && !fechaValida(ven.meta.actualizado)) {
  err('vencimientos.json: meta.actualizado tiene que ser null o una fecha AAAA-MM-DD real: ' + ven.meta.actualizado);
}
if (!Array.isArray(ven.vencimientos)) {
  err('vencimientos.json: "vencimientos" tiene que ser un array');
  ven.vencimientos = [];
}

const ids = new Set();
let totalGrupos = 0;
for (const [i, v] of ven.vencimientos.entries()) {
  const et = 'vencimientos.json ' + (v && v.id ? '"' + v.id + '"' : '#' + (i + 1));
  if (!v || typeof v !== 'object') { err(et + ': no es un objeto'); continue; }

  if (!v.id || typeof v.id !== 'string') err(et + ': falta "id" (texto único y estable)');
  else if (ids.has(v.id)) err(et + ': id duplicado');
  else ids.add(v.id);

  if (!v.nombre || typeof v.nombre !== 'string') err(et + ': falta "nombre"');
  if (!RE_PERIODO.test(String(v.periodo || ''))) {
    err(et + ': "periodo" tiene que ser AAAA-MM o AAAA — recibí "' + v.periodo + '"');
  }
  if (typeof v.fuente !== 'string' || !fuenteOficial(v.fuente)) {
    err(et + ': "fuente" tiene que ser una URL https de un sitio oficial (' + DOMINIOS_OFICIALES.join(', ') + ') — recibí "' + v.fuente + '"');
  }

  if (!Array.isArray(v.grupos) || !v.grupos.length) {
    err(et + ': "grupos" tiene que ser un array con al menos un grupo');
    continue;
  }

  /* Terminaciones de CUIT: entre todos los grupos, cada dígito 0-9 exactamente una vez,
     o un único grupo "todas". */
  const cuenta = new Map();
  let hayTodas = false;
  for (const [j, g] of v.grupos.entries()) {
    totalGrupos++;
    const eg = et + ', grupo ' + (j + 1);
    if (!g || typeof g !== 'object') { err(eg + ': no es un objeto'); continue; }
    const t = g.terminaciones;
    if (t === 'todas') {
      hayTodas = true;
    } else if (typeof t === 'string' && RE_TERM.test(t)) {
      for (const d of t.split('-')) cuenta.set(d, (cuenta.get(d) || 0) + 1);
    } else {
      err(eg + ': "terminaciones" tiene que ser "d-d-d" (dígitos separados por guion) o "todas" — recibí "' + t + '"');
    }

    if (!fechaValida(g.fecha)) {
      err(eg + ': "fecha" no es una fecha AAAA-MM-DD real — ' + g.fecha);
      continue;
    }
    const dow = diaSemana(g.fecha);
    if (dow === 0 || dow === 6) avisar(eg + ': ' + g.fecha + ' cae ' + DIAS[dow] + ' (revisar contra el calendario de ARCA)');
    const f = feriados.get(g.fecha);
    if (f) {
      err(eg + ': ' + g.fecha + ' es ' + (f.tipo === 'no_laborable' ? 'día no laborable' : 'feriado')
        + ' (' + f.nombre + ') — un vencimiento de ARCA no cae en día no hábil');
    }
    if (!aniosFeriados.has(g.fecha.slice(0, 4))) {
      avisar(eg + ': feriados.json no tiene fechas de ' + g.fecha.slice(0, 4) + ', no se pudo chequear contra feriados');
    }
  }
  if (hayTodas) {
    if (v.grupos.length !== 1) err(et + ': un grupo "todas" tiene que ser el único grupo de la obligación');
  } else {
    const faltan = [], repetidos = [];
    for (let d = 0; d <= 9; d++) {
      const n = cuenta.get(String(d)) || 0;
      if (n === 0) faltan.push(d);
      if (n > 1) repetidos.push(d);
    }
    if (faltan.length) err(et + ': las terminaciones no cubren ' + faltan.join(', '));
    if (repetidos.length) err(et + ': terminaciones repetidas: ' + repetidos.join(', '));
  }
}

/* ── salida ───────────────────────────────────────────────────────────────── */
for (const a of avisos) console.warn('⚠ ' + a);
for (const e of errores) console.error('✗ ' + e);

if (errores.length) {
  console.error('\nvencimientos/feriados: ' + errores.length + ' error(es).');
  process.exit(1);
}

const porAnio = {};
for (const f of fer.feriados) {
  const a = f.fecha.slice(0, 4);
  porAnio[a] = porAnio[a] || { oficial: 0, estimado: 0 };
  porAnio[a][f.estado]++;
}
const resumenFer = Object.entries(porAnio)
  .map(([a, c]) => a + ': ' + [c.oficial ? c.oficial + ' oficiales' : '', c.estimado ? c.estimado + ' estimadas' : '']
    .filter(Boolean).join(' + '))
  .join(' · ');
console.log('✓ feriados.json OK — ' + fer.feriados.length + ' fechas (' + resumenFer + ')');
const n = ven.vencimientos.length;
console.log('✓ vencimientos.json OK — ' + (n
  ? n + ' vencimiento(s), ' + totalGrupos + ' grupo(s)'
  : '0 vencimientos (pendiente de carga desde ARCA)'));
