/* ─────────────────────────────────────────────
   EMPRESAS - cargar lista y gestion (Opción B)
───────────────────────────────────────────── */
async function loadCompanies() {
  const list = document.getElementById("companies-list");
  if (!list) return;
  list.innerHTML = "<div style=\"text-align:center;padding:40px;color:var(--gray-400);\"><div class=\"spinner\" style=\"border-color:var(--gray-200);border-top-color:var(--gray-400);margin:0 auto 8px;\"></div>Cargando empresas...</div>";
  try {
    const res = await Empresas.listar();
    allEmpresas = res?.empresas || res?.data || res || [];
    renderCompanies(allEmpresas);
  } catch(err) {
    list.innerHTML = "<div style=\"text-align:center;padding:32px;color:var(--danger);\"><i class=\"bi bi-exclamation-circle\" style=\"font-size:24px;\"></i><br>Error al cargar empresas.</div>";
  }
}

function renderCompanies(companies) {
  const list = document.getElementById("companies-list");
  if (!list) return;
  if (!companies.length) {
    list.innerHTML = "<div style=\"text-align:center;padding:32px;color:var(--gray-400);\">No se encontraron empresas.</div>";
    return;
  }
  list.innerHTML = "";
  companies.forEach(c => list.appendChild(buildCompanyRow(c)));
}

function buildCompanyRow(c) {
  const row = document.createElement("div");
  row.className = "user-row";
  
  const isActiva = c.estado === "ACTIVA";
  
  row.innerHTML = `
    <div class="user-row-header">
      <div class="user-avatar-sm" style="background:var(--navy);"><i class="bi bi-building"></i></div>
      <div class="user-meta">
        <strong>${c.razonSocial}</strong>
        <span>RUT: ${c.run}</span>
      </div>
      <div class="user-row-actions">
        <span class="role-badge" style="background:${isActiva ? "#dcfce7" : "#fee2e2"}; color:${isActiva ? "#166534" : "#991b1b"}; font-size:10px; font-weight:600;">${c.estado || "ACTIVA"}</span>
        <i class="bi bi-chevron-down chevron"></i>
      </div>
    </div>
    <div class="user-expand-panel">
      ${buildCompanyExpandPanel(c)}
    </div>
  `;

  // Toggle expand
  row.querySelector(".user-row-header").addEventListener("click", () => {
    row.classList.toggle("expanded");
  });

  // Guardar cambios de la empresa
  row.querySelector(".btn-edit-company")?.addEventListener("click", () => saveCompanyConfig(row, c));

  // Activar esta empresa para mi sesion
  row.querySelector(".btn-activate-company-session")?.addEventListener("click", async () => {
    const btn = row.querySelector(".btn-activate-company-session");
    btn.disabled = true; btn.textContent = "Activando...";
    try {
      const r = await Empresas.seleccionar(c.run);
      if (r && r.success) {
        toast("Empresa activada en tu sesion.");
        setTimeout(() => location.reload(), 1000);
      } else {
        toast(r?.message || "Error al seleccionar empresa.", "error");
      }
    } catch(e) { toast("Error de conexion.", "error"); }
    finally { btn.disabled = false; btn.innerHTML = "<i class=\"bi bi-check2-circle\"></i> Seleccionar como activa"; }
  });

  return row;
}

function buildCompanyExpandPanel(c) {
  const m = c.modulos || {};
  const modulesList = MODULOS.map(mod => {
    const activo = m[mod] !== false; // default true if not false
    return `
      <div class="modulo-item" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--gray-100);">
        <span class="modulo-name" style="font-size:13px; font-weight:500; text-transform:capitalize;">${mod.replace(/_/g, " ")}</span>
        <label class="toggle-switch">
          <input type="checkbox" class="comp-mod-toggle" data-mod="${mod}" ${activo?"checked":""} />
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  }).join("");

  const isActiva = c.estado === "ACTIVA";

  return `
    <div class="expand-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:20px; padding:12px 0;">
      <div>
        <div class="section-label" style="font-weight:600; font-size:11px; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Estado general de la empresa</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
          <label class="toggle-switch">
            <input type="checkbox" class="comp-estado-toggle" ${isActiva?"checked":""} />
            <span class="toggle-slider"></span>
          </label>
          <strong style="font-size:13px;color:var(--text);">${isActiva ? "Empresa Activa (Operando)" : "Empresa Inactiva (Suspendida)"}</strong>
        </div>
        <button class="btn btn-outline btn-sm btn-activate-company-session" style="margin-top:20px;">
          <i class="bi bi-check2-circle"></i> Seleccionar como activa de mi sesion
        </button>
      </div>
      <div>
        <div class="section-label" style="font-weight:600; font-size:11px; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Modulos habilitados para esta empresa</div>
        <div class="modulos-grid" style="display:flex; flex-direction:column; gap:4px; max-height:220px; overflow-y:auto; padding-right:6px;">
          ${modulesList}
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px; border-top:1px solid var(--gray-200); padding-top:14px;">
      <button class="btn btn-primary btn-sm btn-edit-company">
        <i class="bi bi-check-lg"></i> Guardar configuracion
      </button>
    </div>`;
}

async function saveCompanyConfig(row, c) {
  const btn = row.querySelector(".btn-edit-company");
  const isActiva = row.querySelector(".comp-estado-toggle").checked;
  const estado = isActiva ? "ACTIVA" : "INACTIVA";

  const modulos = {};
  MODULOS.forEach(mod => {
    const toggle = row.querySelector(".comp-mod-toggle[data-mod=\"" + mod + "\"]");
    modulos[mod] = toggle ? toggle.checked : true;
  });

  btn.disabled = true; btn.innerHTML = "<span class=\"spinner\"></span>";
  try {
    const res = await Empresas.guardarConfiguracion(c.run, estado, modulos);
    if (res?.ok || res?.success || res?.resultado === "ok") {
      toast("Configuracion de la empresa guardada correctamente.");
      loadCompanies();
    } else {
      toast(res?.error || res?.message || "Error al guardar configuracion.", "error");
    }
  } catch(_) { toast("Error de conexion.", "error"); }
  finally { btn.disabled = false; btn.innerHTML = "<i class=\"bi bi-check-lg\"></i> Guardar configuracion"; }
}

function openCompanyModal() {
  document.getElementById("me-run").value = "";
  document.getElementById("me-razon").value = "";
  document.getElementById("modal-nueva-empresa").classList.add("open");
}
function closeCompanyModal() { document.getElementById("modal-nueva-empresa").classList.remove("open"); }

// Bind company modal and submit events
setTimeout(() => {
  const neBtn = document.getElementById("btn-nueva-empresa");
  if (neBtn) neBtn.addEventListener("click", openCompanyModal);
  
  const cEl1 = document.getElementById("btn-cerrar-modal-empresa");
  if (cEl1) cEl1.addEventListener("click", closeCompanyModal);
  
  const cEl2 = document.getElementById("btn-cancelar-modal-empresa");
  if (cEl2) cEl2.addEventListener("click", closeCompanyModal);
  
  const submitBtn = document.getElementById("btn-crear-empresa-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const run = document.getElementById("me-run").value.trim();
      const razon = document.getElementById("me-razon").value.trim();
      if (!run || !razon) {
        toast("RUT y Razon Social son obligatorios.", "warning");
        return;
      }
      
      submitBtn.disabled = true; submitBtn.innerHTML = "<span class=\"spinner\"></span> Creando…";
      try {
        const res = await Empresas.crear(run, razon);
        if (res && res.success) {
          toast("Empresa creada correctamente en Sheets y Drive.");
          closeCompanyModal();
          loadCompanies();
        } else {
          toast(res?.message || "Error al crear empresa.", "error");
        }
      } catch(e) { toast("Error de conexion.", "error"); }
      finally { submitBtn.disabled = false; submitBtn.innerHTML = "Crear empresa"; }
    });
  }

  // Search companies locally
  const seekComp = document.getElementById("inp-buscar-empresa");
  if (seekComp) {
    seekComp.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const filtered = allEmpresas.filter(c =>
        (c.razonSocial||"").toLowerCase().includes(q) || (c.run||"").toLowerCase().includes(q)
      );
      renderCompanies(filtered);
    });
  }
}, 300);
