/**
 * BUZÓN DE TORTILLALAND (Google Apps Script)
 * -------------------------------------------
 * Recibe los mensajes del muro (sin que el visitante se registre) y cuenta las velas.
 * Los mensajes llegan como "pendiente" a la hoja "Mensajes"; tú los apruebas en admin.html.
 *
 * INSTALACIÓN (5 minutos, ver README.md):
 *  1. Crea una hoja nueva en https://sheets.new
 *  2. Menú Extensiones › Apps Script. Borra lo que haya, pega TODO este archivo.
 *  3. Cambia CLAVE_ADMIN por una clave larga solo tuya (la usarás en el panel).
 *  4. Implementar › Nueva implementación › tipo "Aplicación web":
 *       Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *  5. Copia la URL que termina en /exec y pégala en config.js (buzon.url).
 *  Si cambias este código, usa Implementar › Gestionar implementaciones › Editar › Nueva versión.
 */

const CLAVE_ADMIN = 'CAMBIA-ESTA-CLAVE-POR-UNA-LARGA';
const HOJA = 'Mensajes';
const MAX_FILAS = 5000;

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.insertSheet(HOJA);
    h.appendRow(['id', 'fecha', 'nombre', 'mensaje', 'estado']);
    h.setFrozenRows(1);
  }
  return h;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Evita que un texto como "=IMPORTXML(...)" se convierta en fórmula dentro de la hoja.
function seguro_(s) {
  s = String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function velas_() {
  return Number(PropertiesService.getScriptProperties().getProperty('velas')) || 0;
}

function filas_() {
  const h = hoja_();
  const n = h.getLastRow() - 1;
  return n > 0 ? h.getRange(2, 1, n, 5).getValues() : [];
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'pendientes') {
    if (p.key !== CLAVE_ADMIN) return json_({ ok: false, error: 'clave' });
    const lista = filas_()
      .filter(r => r[4] === 'pendiente')
      .map(r => ({ id: String(r[0]), at: new Date(r[1]).getTime() || 0, n: String(r[2]).replace(/^'/, ''), t: String(r[3]).replace(/^'/, '') }));
    return json_({ ok: true, pendientes: lista, velas: velas_() });
  }
  return json_({ ok: true, velas: velas_() });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) {}
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'ocupado' });
  try {
    if (d.action === 'vela') {
      const n = velas_() + 1;
      PropertiesService.getScriptProperties().setProperty('velas', String(n));
      return json_({ ok: true, velas: n });
    }

    if (d.action === 'mensaje') {
      const t = seguro_(String(d.t || '').slice(0, 140));
      const n = seguro_(String(d.n || '').slice(0, 30));
      if (!t) return json_({ ok: false, error: 'vacío' });
      const h = hoja_();
      if (h.getLastRow() > MAX_FILAS) return json_({ ok: false, error: 'lleno' });
      const id = Utilities.getUuid().slice(0, 8);
      h.appendRow([id, new Date(), n, t, 'pendiente']);
      return json_({ ok: true, id: id });
    }

    if (d.action === 'marcar') {
      if (d.key !== CLAVE_ADMIN) return json_({ ok: false, error: 'clave' });
      const estados = d.estados || {};
      const h = hoja_();
      let cambiados = 0;
      filas_().forEach((r, i) => {
        const s = estados[String(r[0])];
        if (s === 'aprobado' || s === 'rechazado') { h.getRange(i + 2, 5).setValue(s); cambiados++; }
      });
      return json_({ ok: true, cambiados: cambiados });
    }

    if (d.action === 'velas-set') {
      if (d.key !== CLAVE_ADMIN) return json_({ ok: false, error: 'clave' });
      const n = Math.max(0, Math.floor(Number(d.n) || 0));
      PropertiesService.getScriptProperties().setProperty('velas', String(n));
      return json_({ ok: true, velas: n });
    }

    return json_({ ok: false, error: 'acción desconocida' });
  } finally {
    lock.releaseLock();
  }
}
