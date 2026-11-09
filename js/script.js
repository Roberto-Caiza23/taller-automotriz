/* =========================================================
   Taller Cordillera - AD01 Mantenimiento automotriz
   Frontend sin backend: arrays de objetos + localStorage
   ========================================================= */

/* ---------- 1. DATOS ---------- */

const USUARIOS = [
  { usuario: "admin",     clave: "admin123",     rol: "Administrador", nombre: "Carlos Mendoza", email: "admin@taller.com",  telefono: "0991112233", activo: true },
  { usuario: "cliente1",  clave: "cliente123",   rol: "Cliente",       nombre: "María López",    email: "maria@mail.com",    telefono: "0987654321", activo: true },
  { usuario: "cliente2",  clave: "cliente123",   rol: "Cliente",       nombre: "Juan Pérez",     email: "juan@mail.com",     telefono: "0976543210", activo: true },
  { usuario: "bloqueado", clave: "bloqueado123", rol: "Cliente",       nombre: "Cuenta Bloqueada", email: "x@mail.com",      telefono: "0960000000", activo: false }
];

// Diccionario del catálogo de servicios
const SERVICIOS = {
  "Cambio de aceite":        { descripcion: "Aceite y filtro según especificación del fabricante.", precio: 45 },
  "Revisión de frenos":      { descripcion: "Inspección de pastillas, discos y líquido de frenos.", precio: 30 },
  "Alineación y balanceo":   { descripcion: "Corrección de ángulos y balanceo de las cuatro llantas.", precio: 40 },
  "Diagnóstico con scanner": { descripcion: "Lectura de códigos de falla y reporte del estado del motor.", precio: 25 },
  "Mantenimiento preventivo":{ descripcion: "Revisión general de 30 puntos, niveles y filtros.", precio: 80 },
  "Cambio de batería":       { descripcion: "Prueba de carga y reemplazo de batería con garantía.", precio: 95 }
};

const MARCAS = ["Chevrolet", "Kia", "Hyundai", "Toyota", "Nissan", "Mazda", "Ford", "Renault", "Volkswagen", "Otra"];
const ESTADOS = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];
const CLASE_ESTADO = {
  "Pendiente": "warning text-dark", "En revisión": "info text-dark", "En proceso": "primary",
  "Finalizado": "success", "Cancelado": "secondary"
};

const KEY_SOLICITUDES = "taller_solicitudes";
const KEY_SESION = "taller_sesion";

const SOLICITUDES_INICIALES = [
  { id: 1, propietario: "cliente1", nombre: "María López", telefono: "0987654321", email: "maria@mail.com",
    placa: "PBA-1234", marca: "Chevrolet", modelo: "Sail", anio: 2018, kilometraje: 52000,
    servicio: "Cambio de aceite", prioridad: "Normal", extras: ["Lavado"], fecha: "2026-12-10", hora: "09:00",
    observaciones: "Ruido leve al encender.", estado: "Pendiente" },
  { id: 2, propietario: "cliente2", nombre: "Juan Pérez", telefono: "0976543210", email: "juan@mail.com",
    placa: "GTC-567", marca: "Toyota", modelo: "Hilux", anio: 2021, kilometraje: 31000,
    servicio: "Revisión de frenos", prioridad: "Urgente", extras: [], fecha: "2026-12-11", hora: "14:30",
    observaciones: "Los frenos vibran.", estado: "En proceso" },
  { id: 3, propietario: "cliente1", nombre: "María López", telefono: "0987654321", email: "maria@mail.com",
    placa: "PBA-1234", marca: "Chevrolet", modelo: "Sail", anio: 2018, kilometraje: 48000,
    servicio: "Alineación y balanceo", prioridad: "Normal", extras: [], fecha: "2026-10-02", hora: "11:00",
    observaciones: "", estado: "Finalizado" }
];

let solicitudes = [];
let sesion = null; // objeto de usuario logueado

/* ---------- 2. UTILIDADES ---------- */

const $ = (id) => document.getElementById(id);

function esc(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function cargarSolicitudes() {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY_SOLICITUDES));
    solicitudes = Array.isArray(guardado) ? guardado : [...SOLICITUDES_INICIALES];
  } catch (e) {
    solicitudes = [...SOLICITUDES_INICIALES];
  }
  guardarSolicitudes();
}

function guardarSolicitudes() {
  localStorage.setItem(KEY_SOLICITUDES, JSON.stringify(solicitudes));
}

function siguienteId() {
  return solicitudes.length ? Math.max(...solicitudes.map((s) => s.id)) + 1 : 1;
}

function esAdmin() {
  return sesion !== null && sesion.rol === "Administrador";
}

function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

function badgeEstado(estado) {
  return `<span class="badge bg-${CLASE_ESTADO[estado] || "secondary"}">${esc(estado)}</span>`;
}

function llenarSelect(select, opciones, textoInicial) {
  const inicial = textoInicial ? `<option value="">${textoInicial}</option>` : "";
  select.innerHTML = inicial + opciones.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
}

/* ---------- 3. NAVEGACIÓN Y CONTROL DE ACCESO ---------- */

const VISTAS = ["inicio", "acerca", "servicios", "login", "solicitud", "mis", "admin", "perfil"];
const REQUIERE_SESION = ["solicitud", "mis", "admin", "perfil"];

function mostrarVista(nombre) {
  if (REQUIERE_SESION.includes(nombre) && !sesion) {
    Swal.fire({ icon: "info", title: "Inicia sesión", text: "Debes iniciar sesión para acceder a esta sección." });
    nombre = "login";
  } else if (nombre === "admin" && !esAdmin()) {
    Swal.fire({ icon: "error", title: "Acceso denegado", text: "Esta sección es solo para administradores." });
    return;
  }

  VISTAS.forEach((v) => $("vista-" + v).classList.toggle("d-none", v !== nombre));
  document.querySelectorAll("[data-vista].nav-link").forEach((a) =>
    a.classList.toggle("activo", a.dataset.vista === nombre)
  );

  if (nombre === "mis") renderMis();
  if (nombre === "admin") renderAdmin();
  if (nombre === "perfil") renderPerfil();
  if (nombre === "solicitud" && !$("solId").value) prepararFormularioNuevo();

  // cerrar menú móvil
  const menu = $("menu");
  if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarBarra() {
  document.querySelectorAll(".sesion-only").forEach((li) => li.classList.toggle("d-none", !sesion));
  $("btnIrLogin").classList.toggle("d-none", !!sesion);
  $("btnLogout").classList.toggle("d-none", !sesion);
  $("etiquetaSesion").textContent = sesion ? `${sesion.nombre} (${sesion.rol})` : "";
}

/* ---------- 4. LOGIN / LOGOUT ---------- */

function iniciarSesion(e) {
  e.preventDefault();
  const usuario = $("loginUsuario").value.trim();
  const clave = $("loginClave").value;

  if (!usuario || !clave) {
    return Swal.fire({ icon: "warning", title: "Campos obligatorios", text: "Escribe tu usuario y contraseña." });
  }

  const encontrado = USUARIOS.find((u) => u.usuario === usuario && u.clave === clave);

  if (!encontrado) {
    return Swal.fire({ icon: "error", title: "Acceso inválido", text: "Usuario o contraseña incorrectos." });
  }
  if (!encontrado.activo) {
    return Swal.fire({ icon: "error", title: "Cuenta deshabilitada", text: "Tu cuenta está deshabilitada. Contacta al administrador." });
  }

  sesion = encontrado;
  sessionStorage.setItem(KEY_SESION, encontrado.usuario);
  $("formLogin").reset();
  actualizarBarra();
  Swal.fire({ icon: "success", title: `Bienvenido, ${encontrado.nombre}`, timer: 1400, showConfirmButton: false });
  mostrarVista("mis");
}

function cerrarSesion() {
  sesion = null;
  sessionStorage.removeItem(KEY_SESION);
  actualizarBarra();
  mostrarVista("inicio");
}

function restaurarSesion() {
  const guardado = sessionStorage.getItem(KEY_SESION);
  const u = USUARIOS.find((x) => x.usuario === guardado && x.activo);
  sesion = u || null;
}

/* ---------- 5. CATÁLOGO Y PERFIL ---------- */

function renderCatalogo() {
  $("catalogoServicios").innerHTML = Object.entries(SERVICIOS)
    .map(([nombre, info]) => `
      <div class="col-md-6 col-lg-4">
        <div class="tarjeta">
          <h2>${esc(nombre)}</h2>
          <p>${esc(info.descripcion)}</p>
          <span class="precio">Desde $${info.precio}</span>
        </div>
      </div>`)
    .join("");
}

function renderPerfil() {
  $("perfilRol").textContent = sesion.rol;
  const datos = { "Usuario": sesion.usuario, "Nombre": sesion.nombre, "Correo": sesion.email, "Teléfono": sesion.telefono, "Rol": sesion.rol };
  $("datosPerfil").innerHTML = Object.entries(datos)
    .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`)
    .join("");
}

/* ---------- 6. FORMULARIO: VALIDACIÓN ---------- */

function validarSolicitud(d) {
  const errores = [];
  const anioActual = new Date().getFullYear();

  if (d.nombre.length < 3) errores.push({ campo: "solNombre", msg: "El nombre debe tener al menos 3 caracteres." });
  if (!/^09\d{8}$/.test(d.telefono)) errores.push({ campo: "solTelefono", msg: "El teléfono debe tener 10 dígitos y empezar con 09." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errores.push({ campo: "solEmail", msg: "Ingresa un correo electrónico válido." });

  if (!/^[A-Z]{3}-\d{3,4}$/.test(d.placa)) errores.push({ campo: "solPlaca", msg: "La placa debe tener formato ABC-123 o ABC-1234." });
  if (!d.marca) errores.push({ campo: "solMarca", msg: "Selecciona la marca." });
  if (d.modelo.length < 2) errores.push({ campo: "solModelo", msg: "Escribe el modelo del vehículo." });

  if (!Number.isInteger(d.anio) || d.anio < 1990 || d.anio > anioActual + 1)
    errores.push({ campo: "solAnio", msg: `El año debe estar entre 1990 y ${anioActual + 1}.` });

  if (!Number.isInteger(d.kilometraje) || d.kilometraje < 0 || d.kilometraje > 999999)
    errores.push({ campo: "solKm", msg: "El kilometraje debe ser un número entero entre 0 y 999999." });

  if (!d.servicio || !SERVICIOS[d.servicio]) errores.push({ campo: "solServicio", msg: "Selecciona un tipo de servicio." });

  if (!d.fecha) {
    errores.push({ campo: "solFecha", msg: "Selecciona una fecha." });
  } else {
    const fecha = new Date(d.fecha + "T00:00:00");
    if (d.fecha < hoyISO()) errores.push({ campo: "solFecha", msg: "La fecha no puede ser anterior a hoy." });
    else if (fecha.getDay() === 0) errores.push({ campo: "solFecha", msg: "El taller no atiende los domingos." });
  }

  if (!d.hora) errores.push({ campo: "solHora", msg: "Selecciona una hora." });
  else if (d.hora < "08:00" || d.hora > "17:00") errores.push({ campo: "solHora", msg: "El horario de atención es de 08:00 a 17:00." });

  if (esAdmin() && !d.propietario) errores.push({ campo: "solPropietario", msg: "Selecciona el cliente propietario." });
  if (!ESTADOS.includes(d.estado)) errores.push({ campo: "solEstado", msg: "Estado no válido." });

  return errores;
}

function limpiarMarcasError() {
  document.querySelectorAll("#formSolicitud .invalido").forEach((el) => el.classList.remove("invalido"));
}

/* ---------- 7. FORMULARIO: LEER / GUARDAR / EDITAR ---------- */

function leerFormulario() {
  const extras = [...document.querySelectorAll('input[name="extras"]:checked')].map((c) => c.value);
  const prioridad = document.querySelector('input[name="prioridad"]:checked').value;
  return {
    propietario: esAdmin() ? $("solPropietario").value : sesion.usuario,
    nombre: $("solNombre").value.trim(),
    telefono: $("solTelefono").value.trim(),
    email: $("solEmail").value.trim(),
    placa: $("solPlaca").value.trim().toUpperCase(),
    marca: $("solMarca").value,
    modelo: $("solModelo").value.trim(),
    anio: parseInt($("solAnio").value, 10),
    kilometraje: parseInt($("solKm").value, 10),
    servicio: $("solServicio").value,
    prioridad,
    extras,
    fecha: $("solFecha").value,
    hora: $("solHora").value,
    observaciones: $("solObs").value.trim(),
    estado: esAdmin() ? $("solEstado").value : "Pendiente"
  };
}

function guardarSolicitud(e) {
  e.preventDefault();
  if (!sesion) return mostrarVista("login");

  const datos = leerFormulario();
  const errores = validarSolicitud(datos);
  limpiarMarcasError();

  if (errores.length) {
    errores.forEach((er) => $(er.campo).classList.add("invalido"));
    return Swal.fire({
      icon: "error",
      title: "No se guardó la solicitud",
      html: `<ul style="text-align:left">${errores.map((er) => `<li>${esc(er.msg)}</li>`).join("")}</ul>`
    });
  }

  const idEdicion = $("solId").value;

  if (idEdicion) {
    // Edición: solo administrador
    if (!esAdmin()) return Swal.fire({ icon: "error", title: "Acceso denegado", text: "Solo el administrador puede editar." });
    const sol = solicitudes.find((s) => s.id === Number(idEdicion));
    Object.assign(sol, datos);
    guardarSolicitudes();
    Swal.fire({ icon: "success", title: "Solicitud actualizada", timer: 1400, showConfirmButton: false });
    prepararFormularioNuevo();
    mostrarVista("admin");
  } else {
    solicitudes.push({ id: siguienteId(), ...datos });
    guardarSolicitudes();
    Swal.fire({ icon: "success", title: "Solicitud registrada", text: "Ya aparece en tu listado.", timer: 1600, showConfirmButton: false });
    prepararFormularioNuevo();
    mostrarVista("mis");
  }
}

function prepararFormularioNuevo() {
  $("formSolicitud").reset();
  limpiarMarcasError();
  $("solId").value = "";
  $("tituloForm").textContent = "Solicitar mantenimiento";
  $("btnGuardar").textContent = "Registrar solicitud";
  $("solFecha").min = hoyISO();

  $("bloqueAdmin").classList.toggle("d-none", !esAdmin());

  if (esAdmin()) {
    // el admin puede registrar para sí mismo o para otro cliente
    $("solPropietario").value = sesion.usuario;
    $("solEstado").value = "Pendiente";
  }
  // Prellenar con el perfil del usuario (el cliente es siempre él mismo)
  prellenarDatosCliente(sesion ? sesion.usuario : "");
}

function prellenarDatosCliente(usuario) {
  const u = USUARIOS.find((x) => x.usuario === usuario);
  if (!u) return;
  $("solNombre").value = u.nombre;
  $("solTelefono").value = u.telefono;
  $("solEmail").value = u.email;
}

function editarSolicitud(id) {
  if (!esAdmin()) return Swal.fire({ icon: "error", title: "Acceso denegado", text: "Solo el administrador puede editar." });
  const s = solicitudes.find((x) => x.id === id);
  if (!s) return;

  mostrarVista("solicitud");
  $("solId").value = s.id;
  $("tituloForm").textContent = `Editar solicitud #${s.id}`;
  $("btnGuardar").textContent = "Guardar cambios";
  $("bloqueAdmin").classList.remove("d-none");
  $("solPropietario").value = s.propietario;
  $("solEstado").value = s.estado;
  $("solNombre").value = s.nombre;
  $("solTelefono").value = s.telefono;
  $("solEmail").value = s.email;
  $("solPlaca").value = s.placa;
  $("solMarca").value = s.marca;
  $("solModelo").value = s.modelo;
  $("solAnio").value = s.anio;
  $("solKm").value = s.kilometraje;
  $("solServicio").value = s.servicio;
  document.querySelector(`input[name="prioridad"][value="${s.prioridad}"]`).checked = true;
  document.querySelectorAll('input[name="extras"]').forEach((c) => (c.checked = s.extras.includes(c.value)));
  $("solFecha").removeAttribute("min"); // permite conservar fechas pasadas al editar
  $("solFecha").value = s.fecha;
  $("solHora").value = s.hora;
  $("solObs").value = s.observaciones;
}

/* ---------- 8. LISTADOS ---------- */

function filaSimple(s) {
  return `<tr>
    <td>#${s.id}</td>
    <td>${esc(s.placa)}</td>
    <td>${esc(s.marca)} ${esc(s.modelo)} (${s.anio})</td>
    <td>${esc(s.servicio)}${s.prioridad === "Urgente" ? ' <span class="badge bg-danger">Urgente</span>' : ""}</td>
    <td>${esc(s.fecha)} ${esc(s.hora)}</td>
    <td>${badgeEstado(s.estado)}</td>
  </tr>`;
}

function renderMis() {
  const propias = solicitudes.filter((s) => s.propietario === sesion.usuario);
  $("tbodyMis").innerHTML = propias.length
    ? propias.map(filaSimple).join("")
    : `<tr><td colspan="6" class="text-center text-muted py-4">Aún no tienes solicitudes. Registra la primera desde «Solicitar mantenimiento».</td></tr>`;
}

function renderAdmin() {
  if (!esAdmin()) return;
  const texto = $("filtroTexto").value.trim().toLowerCase();
  const estado = $("filtroEstado").value;

  const lista = solicitudes
    .filter((s) => !estado || s.estado === estado)
    .filter((s) => !texto || [s.placa, s.nombre, s.servicio].some((c) => c.toLowerCase().includes(texto)));

  $("tbodyAdmin").innerHTML = lista.length
    ? lista.map((s) => `<tr>
        <td>#${s.id}</td>
        <td>${esc(s.nombre)}<br><small class="text-muted">${esc(s.propietario)}</small></td>
        <td>${esc(s.placa)}</td>
        <td>${esc(s.servicio)}</td>
        <td>${esc(s.fecha)} ${esc(s.hora)}</td>
        <td>
          <select class="form-select form-select-sm" data-accion="estado" data-id="${s.id}">
            ${ESTADOS.map((e) => `<option ${e === s.estado ? "selected" : ""}>${e}</option>`).join("")}
          </select>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-warning" data-accion="editar" data-id="${s.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-accion="eliminar" data-id="${s.id}">Eliminar</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="7" class="text-center text-muted py-4">No hay solicitudes que coincidan.</td></tr>`;

  $("contadorAdmin").textContent = `Mostrando ${lista.length} de ${solicitudes.length} solicitudes.`;
}

function cambiarEstado(id, nuevo) {
  if (!esAdmin()) return Swal.fire({ icon: "error", title: "Acceso denegado" });
  const s = solicitudes.find((x) => x.id === id);
  s.estado = nuevo;
  guardarSolicitudes();
  Swal.fire({ icon: "success", title: `Estado: ${nuevo}`, toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
  renderAdmin();
}

function eliminarSolicitud(id) {
  if (!esAdmin()) return Swal.fire({ icon: "error", title: "Acceso denegado" });
  Swal.fire({
    icon: "warning",
    title: `¿Eliminar la solicitud #${id}?`,
    text: "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545"
  }).then((r) => {
    if (!r.isConfirmed) return;
    solicitudes = solicitudes.filter((s) => s.id !== id);
    guardarSolicitudes();
    renderAdmin();
    Swal.fire({ icon: "success", title: "Solicitud eliminada", timer: 1300, showConfirmButton: false });
  });
}

/* ---------- 9. EVENTOS E INICIO ---------- */

function inicializar() {
  // Selects dinámicos
  llenarSelect($("solMarca"), MARCAS, "Selecciona una marca");
  llenarSelect($("solServicio"), Object.keys(SERVICIOS), "Selecciona un servicio");
  llenarSelect($("solEstado"), ESTADOS);
  llenarSelect($("filtroEstado"), ESTADOS, "Todos los estados");
  $("solPropietario").innerHTML = USUARIOS.filter((u) => u.rol === "Cliente" || u.rol === "Administrador")
    .map((u) => `<option value="${u.usuario}">${esc(u.nombre)} (${u.usuario})</option>`).join("");

  cargarSolicitudes();
  restaurarSesion();
  renderCatalogo();
  actualizarBarra();

  // Navegación (delegación: cualquier elemento con data-vista)
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-vista]");
    if (!el) return;
    e.preventDefault();
    if (el.dataset.vista === "solicitud") $("solId").value = ""; // siempre nueva desde el menú
    mostrarVista(el.dataset.vista);
  });

  $("formLogin").addEventListener("submit", iniciarSesion);
  $("btnLogout").addEventListener("click", cerrarSesion);
  $("formSolicitud").addEventListener("submit", guardarSolicitud);
  $("btnLimpiarForm").addEventListener("click", prepararFormularioNuevo);
  $("btnNueva").addEventListener("click", () => { $("solId").value = ""; mostrarVista("solicitud"); prepararFormularioNuevo(); });

  // Al elegir otro cliente (admin), se rellenan sus datos
  $("solPropietario").addEventListener("change", (e) => prellenarDatosCliente(e.target.value));

  // Placa en mayúsculas mientras se escribe
  $("solPlaca").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase()));

  // Filtros
  $("filtroTexto").addEventListener("input", renderAdmin);
  $("filtroEstado").addEventListener("change", renderAdmin);

  // Acciones de la tabla de administración
  $("tbodyAdmin").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.accion === "editar") editarSolicitud(id);
    if (btn.dataset.accion === "eliminar") eliminarSolicitud(id);
  });
  $("tbodyAdmin").addEventListener("change", (e) => {
    if (e.target.dataset.accion === "estado") cambiarEstado(Number(e.target.dataset.id), e.target.value);
  });

  mostrarVista(sesion ? "mis" : "inicio");
}

document.addEventListener("DOMContentLoaded", inicializar);
