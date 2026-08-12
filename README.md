# VISC — Frontend GitHub Pages

Interfaz web estática que llama al proyecto de Apps Script vía `fetch()`.

## Estructura de archivos

```
/
├── index.html            ← Login
├── dashboard.html        ← Menú principal + estadísticas
├── observaciones.html    ← Formulario de observaciones preventivas
├── visitas.html          ← Registro de visitas a terreno
├── asistencia.html       ← Capacitaciones y asistencias
├── inspecciones.html     ← Inspecciones con plantillas
├── tiempo_dedicado.html  ← Registro de horas por consultor
├── usuarios.html         ← Mi cuenta + gestión de usuarios
├── css/
│   └── visc.css          ← Estilos compartidos (tema naranja VISC)
├── js/
│   └── api.js            ← Capa de comunicación con Apps Script
└── API.gs                ← ⚠️ Agregar esto al proyecto Apps Script
```

---

## Setup paso a paso

### 1. Agregar API.gs al proyecto Apps Script

1. Abre tu proyecto en [script.google.com](https://script.google.com)
2. Crea un nuevo archivo: **Archivo → Nuevo → Script**
3. Nómbralo `API`
4. Pega el contenido de `API.gs` (este archivo)
5. Guarda (`Ctrl+S`)

### 2. Redesplegar la Web App

1. Ve a **Implementar → Administrar implementaciones**
2. Edita la implementación existente (ícono del lápiz)
3. En **Versión** selecciona "Nueva versión"
4. Haz clic en **Implementar**
5. Copia la URL que aparece (ej: `https://script.google.com/macros/s/AKfycbx.../exec`)

> Asegúrate que la configuración sea:
> - **Ejecutar como:** Yo (tu cuenta)
> - **Quién tiene acceso:** Cualquier usuario

### 3. Configurar la URL en api.js

Abre `js/api.js` y reemplaza la primera línea:

```javascript
// Antes:
const SCRIPT_URL = 'TU_SCRIPT_URL_AQUI';

// Después:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

### 4. Subir a GitHub Pages

1. Crea un repositorio en GitHub (puede ser privado o público)
2. Sube todos los archivos al repositorio
3. Ve a **Settings → Pages**
4. En **Source** selecciona `Deploy from a branch`
5. Elige `main` (o `master`) y la carpeta raíz `/`
6. Haz clic en **Save**

GitHub te dará una URL como `https://tu-usuario.github.io/nombre-repo/`

---

## Cómo funciona

```
GitHub Pages (HTML/CSS/JS)
         │
         │  POST fetch() con Content-Type: text/plain
         ▼
Apps Script Web App (API.gs → doPost)
         │
         │  Ejecuta las funciones del proyecto
         ▼
Google Sheets / Drive / Gmail
```

Cada llamada desde el frontend sigue este patrón:

```javascript
// Frontend envía:
{ action: 'login', params: { correo: '...', clave: '...' } }

// Apps Script responde:
{ success: true, token: '...', session: { ... } }
```

La sesión (token) se guarda en `localStorage` del navegador.

---

## Troubleshooting

**Error de CORS / preflight**
- Asegúrate de que el `Content-Type` sea `text/plain` (ya está configurado en `api.js`)
- Verifica que la Web App esté desplegada con acceso "Cualquier usuario"

**"Acción desconocida"**
- Verifica que `API.gs` esté guardado y la Web App redesplegada con nueva versión

**Sesión expira rápido**
- El TTL por defecto es 6 horas (`SESSION_TTL_SECONDS = 60 * 60 * 6` en el Apps Script)

**PDF no abre**
- Los PDFs se generan en Google Drive. Verifica que el usuario tenga acceso al Drive correcto.
