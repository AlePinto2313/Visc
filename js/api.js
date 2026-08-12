// =============================================
// js/api.js — Capa de comunicación con Apps Script
// =============================================
// IMPORTANTE: cambia SCRIPT_URL por la URL de tu Web App desplegada.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec';
// ── Core fetch ────────────────────────────────────────────────────────────────

async function callAPI(action, params = {}) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // evita preflight CORS
    body: JSON.stringify({ action, params }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

const Auth = {
  async tieneUsuarios() {
    return callAPI('tieneUsuarios');
  },
  async crearSuperAdmin(correo, clave) {
    return callAPI('crearSuperAdminInicial', { correo, clave });
  },
  async login(correo, clave) {
    const res = await callAPI('login', { correo, clave });
    if (res.success && res.token) {
      localStorage.setItem('visc_token', res.token);
      localStorage.setItem('visc_session', JSON.stringify(res.session));
    }
    return res;
  },
  async logout() {
    const token = Auth.getToken();
    if (token) await callAPI('logout', { token }).catch(() => {});
    localStorage.removeItem('visc_token');
    localStorage.removeItem('visc_session');
    localStorage.removeItem('visc_empresa');
  },
  async getSession() {
    const token = Auth.getToken();
    if (!token) return { success: false };
    const res = await callAPI('getSession', { token });
    if (res.success) localStorage.setItem('visc_session', JSON.stringify(res.session));
    return res;
  },
  getToken() {
    return localStorage.getItem('visc_token') || '';
  },
  getSessionLocal() {
    try { return JSON.parse(localStorage.getItem('visc_session') || 'null'); } catch { return null; }
  },
  async actualizarPerfil(datos) {
    return callAPI('actualizarPerfil', { token: Auth.getToken(), datos });
  },
  async guardarFirma(firmaBase64) {
    return callAPI('guardarFirmaUsuario', { token: Auth.getToken(), firmaBase64 });
  },
  async getFirma() {
    return callAPI('getFirmaUsuario', { token: Auth.getToken() });
  },
};

// ── Usuarios ──────────────────────────────────────────────────────────────────

const Usuarios = {
  async listar() {
    return callAPI('listarUsuarios', { token: Auth.getToken() });
  },
  async crear(datos) {
    return callAPI('crearUsuario', { token: Auth.getToken(), datos });
  },
  async editar(correoOriginal, datos) {
    return callAPI('editarUsuario', { token: Auth.getToken(), correoOriginal, datos });
  },
  async eliminar(correo) {
    return callAPI('eliminarUsuario', { token: Auth.getToken(), correo });
  },
};

// ── Empresas ──────────────────────────────────────────────────────────────────

const Empresas = {
  async listar() {
    return callAPI('listarEmpresas', { token: Auth.getToken() });
  },
  async crear(run, razonSocial) {
    return callAPI('crearEmpresa', { token: Auth.getToken(), run, razonSocial });
  },
  async seleccionar(run) {
    const res = await callAPI('seleccionarEmpresaActiva', { token: Auth.getToken(), run });
    if (res.success && res.empresa) {
      localStorage.setItem('visc_empresa', JSON.stringify(res.empresa));
      localStorage.setItem('visc_session', JSON.stringify(res.session));
    }
    return res;
  },
  async activa() {
    return callAPI('obtenerEmpresaActiva', { token: Auth.getToken() });
  },
  getEmpresaLocal() {
    try { return JSON.parse(localStorage.getItem('visc_empresa') || 'null'); } catch { return null; }
  },
  async estadisticas() {
    return callAPI('obtenerEstadisticas', { token: Auth.getToken() });
  },
};

// ── Observaciones ─────────────────────────────────────────────────────────────

const Observaciones = {
  async guardar(datos) {
    datos._token = Auth.getToken();
    return callAPI('guardarDatos', { datos });
  },
  async buscarPDFs(rut) {
    return callAPI('buscarPdfsPorRutConToken', { token: Auth.getToken(), rut });
  },
};

// ── Visitas ───────────────────────────────────────────────────────────────────

const Visitas = {
  async guardar(datos) {
    datos._token = Auth.getToken();
    return callAPI('guardarVisita', { datos });
  },
  async buscarPDFs(empresa) {
    return callAPI('buscarVisitasPorEmpresaConToken', { token: Auth.getToken(), empresa });
  },
};

// ── Asistencias ───────────────────────────────────────────────────────────────

const Asistencias = {
  async guardar(datos) {
    datos._token = Auth.getToken();
    return callAPI('guardarAsistenciaCompleta', { datos });
  },
  async enviarConfirmaciones(datosEnvio) {
    return callAPI('enviarConfirmacionesAsistenciaCompleta', { datosEnvio });
  },
  async generarPDFConFirmas(datos) {
    datos._token = Auth.getToken();
    return callAPI('generarPDFConFirmas', { datos });
  },
  async obtenerCodigoFirma(nombreEmpresa, rut, idAsistencia) {
    return callAPI('obtenerCodigoFirma', { nombreEmpresa, rut, idAsistencia });
  },
};

// ── Tiempo Dedicado ───────────────────────────────────────────────────────────

const TiempoDedicado = {
  async crear(nombre) {
    return callAPI('crearTiempoDedicado', { token: Auth.getToken(), nombre });
  },
  async listar() {
    return callAPI('listarTiemposDedicados', { token: Auth.getToken() });
  },
  async obtener(sheetId) {
    return callAPI('obtenerTiempoDedicado', { token: Auth.getToken(), sheetId });
  },
  async guardar(sheetId, resumen, tareas) {
    return callAPI('guardarTiempoDedicado', { token: Auth.getToken(), sheetId, resumen, tareas });
  },
  async generarPDF(sheetId) {
    return callAPI('generarPDFTiempoDedicado', { token: Auth.getToken(), sheetId });
  },
  async enviarCorreo(sheetId) {
    return callAPI('enviarCorreoTiempoDedicado', { token: Auth.getToken(), sheetId });
  },
  async enviarCorreoConAdjunto(sheetId, payload) {
    return callAPI('enviarCorreoTiempoDedicadoConAdjunto', { token: Auth.getToken(), sheetId, payload });
  },
};

// ── Inspecciones ──────────────────────────────────────────────────────────────

const Inspecciones = {
  async listarPlantillas() {
    return callAPI('listarPlantillasInspeccion', { token: Auth.getToken() });
  },
  async guardarPlantilla(plantilla) {
    return callAPI('guardarPlantillaInspeccion', { token: Auth.getToken(), plantilla });
  },
  async eliminarPlantilla(plantillaId) {
    return callAPI('eliminarPlantillaInspeccion', { token: Auth.getToken(), plantillaId });
  },
  async guardar(inspeccion) {
    return callAPI('guardarInspeccion', { token: Auth.getToken(), inspeccion });
  },
  async listarPDFs() {
    return callAPI('listarInspeccionesPDF', { token: Auth.getToken() });
  },
};

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function toast(msg, tipo = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Cargando…';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

function requireAuth() {
  const token = Auth.getToken();
  if (!token) { window.location.href = 'index.html'; return null; }
  return Auth.getSessionLocal();
}

function tienePermiso(modulo, nivel = 'leer') {
  const sess = Auth.getSessionLocal();
  if (!sess) return false;
  const niveles = { leer: 1, crear: 2, editar: 3, aprobar: 4, admin: 5 };
  const n = (sess.modulos || {})[modulo] || '';
  return (niveles[n] || 0) >= (niveles[nivel] || 1);
}
