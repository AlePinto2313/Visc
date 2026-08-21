// =============================================
// js/api.js — Capa de comunicación con Apps Script
// =============================================
// IMPORTANTE: cambia SCRIPT_URL por la URL de tu Web App desplegada.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyELO5cgqjSCX8tFm_og3bcXEJwpyFovTDKj62CR6cIUDgIcA19RHeZ1LBcUInYPPx0/exec';
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
  async guardarConfiguracion(run, estado, modulos) {
    return callAPI('guardarConfiguracionEmpresa', { token: Auth.getToken(), run, estado, modulos });
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

// ── Capacitaciones ────────────────────────────────────────────────────────────

const Capacitaciones = {
  async listar() {
    return callAPI('listarCapacitaciones', { token: Auth.getToken() });
  },
  async guardar(capacitacion) {
    return callAPI('guardarCapacitacion', { token: Auth.getToken(), capacitacion });
  },
  async eliminar(id) {
    return callAPI('eliminarCapacitacion', { token: Auth.getToken(), id });
  },
  async guardarEvaluacion(idCapacitacion, respuestasUsuario) {
    return callAPI('guardarEvaluacion', { token: Auth.getToken(), idCapacitacion, respuestasUsuario });
  },
  async listarEvaluaciones() {
    return callAPI('listarEvaluaciones', { token: Auth.getToken() });
  },
  async calificarEvaluacionManual(idEvaluacion, calificacionesMap, observaciones, estadoManual) {
    return callAPI('calificarEvaluacionManual', { token: Auth.getToken(), idEvaluacion, calificacionesMap, observaciones, estadoManual });
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
  if (!token) { window.location.href = 'login.html'; return null; }
  return Auth.getSessionLocal();
}

function tienePermiso(modulo, nivel = 'leer') {
  const sess = Auth.getSessionLocal();
  if (!sess) return false;
  const niveles = { leer: 1, crear: 2, editar: 3, aprobar: 4, admin: 5 };
  const n = (sess.modulos || {})[modulo] || '';
  return (niveles[n] || 0) >= (niveles[nivel] || 1);
}

// ── Theme Customizer ─────────────────────────────────────────────────────────

const Theme = {
  async getColor() {
    return callAPI('getThemeColor', {});
  },
  async setColor(color) {
    return callAPI('setThemeColor', { token: Auth.getToken(), color });
  }
};

function applyThemeColor(hex) {
  if (!hex || !hex.startsWith('#')) hex = '#4F46E5';
  localStorage.setItem('theme_color', hex);
  
  // Helper to lighten/darken hex colors
  function adjustColor(hexColor, percent) {
    var num = parseInt(hexColor.replace('#',''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
  }

  var secondary = adjustColor(hex, 15); // Lighter
  var dark = adjustColor(hex, -20);      // Darker
  var lightBg = hex + '1c';             // 11% opacity (hex '1c')

  var styleEl = document.getElementById('dynamic-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-style';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = '\n' +
    '    :root {\n' +
    '      --theme-color: ' + hex + ' !important;\n' +
    '      --theme-color-secondary: ' + secondary + ' !important;\n' +
    '      --theme-color-dark: ' + dark + ' !important;\n' +
    '      --theme-color-lightBg: ' + lightBg + ' !important;\n' +
    '    }\n' +
    '  ';
}

// Auto-run theme color load
(function() {
  // 1. Instantly apply cached theme color from localStorage to avoid screen flicker
  var cachedColor = localStorage.getItem('theme_color') || '#4F46E5';
  applyThemeColor(cachedColor);

  // 2. Fetch fresh theme color from Google Sheets asynchronously and update DOM
  document.addEventListener('DOMContentLoaded', function() {
    // Only fetch from server if a token is present
    if (localStorage.getItem('visc_token')) {
      Theme.getColor().then(function(res) {
        if (res && res.success && res.color) {
          applyThemeColor(res.color);
        }
      }).catch(function() {});
    }
  });
})();
