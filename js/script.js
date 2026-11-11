// ==========================================================
// Taller Cordillera - AD01 Mantenimiento automotriz
// Sin backend: los datos se guardan en un array y en localStorage
// ==========================================================


// ---------- 1. DATOS ----------

// Array de objetos: usuarios de prueba (3 usuarios activos + 1 deshabilitado)
const usuarios = [
  { usuario: "admin", clave: "admin123", rol: "Administrador", nombre: "Roberto Morales", email: "admin@taller.com", telefono: "0991112233", activo: true },
  { usuario: "cliente1", clave: "cliente123", rol: "Cliente", nombre: "María López", email: "maria@mail.com", telefono: "0987654321", activo: true },
  { usuario: "cliente2", clave: "cliente123", rol: "Cliente", nombre: "Juan Pérez", email: "juan@mail.com", telefono: "0976543210", activo: true },
  { usuario: "bloqueado", clave: "bloqueado123", rol: "Cliente", nombre: "Usuario Bloqueado", email: "x@mail.com", telefono: "0960000000", activo: false }
];

// Catálogo de servicios
const servicios = [
  { nombre: "Cambio de aceite", descripcion: "Aceite y filtro nuevos.", precio: 45 },
  { nombre: "Revisión de frenos", descripcion: "Pastillas, discos y líquido de frenos.", precio: 30 },
  { nombre: "Alineación y balanceo", descripcion: "Alineación y balanceo de las cuatro llantas.", precio: 40 },
  { nombre: "Diagnóstico con scanner", descripcion: "Lectura de fallas del motor.", precio: 25 },
  { nombre: "Mantenimiento preventivo", descripcion: "Revisión general del vehículo.", precio: 80 }
];

const estados = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];

// Solicitudes que se cargan la primera vez
const solicitudesIniciales = [
  { id: 1, propietario: "cliente1", nombre: "María López", telefono: "0987654321", email: "maria@mail.com",
    placa: "PBA-1234", marca: "Chevrolet", modelo: "Sail", anio: 2018, kilometraje: 52000,
    servicio: "Cambio de aceite", prioridad: "Normal", extras: ["Lavado"],
    fecha: "2026-12-10", hora: "09:00", observaciones: "Ruido al encender.", estado: "Pendiente" },
  { id: 2, propietario: "cliente2", nombre: "Juan Pérez", telefono: "0976543210", email: "juan@mail.com",
    placa: "GTC-567", marca: "Toyota", modelo: "Hilux", anio: 2021, kilometraje: 31000,
    servicio: "Revisión de frenos", prioridad: "Urgente", extras: [],
    fecha: "2026-12-11", hora: "14:00", observaciones: "Los frenos vibran.", estado: "En proceso" }
];

let solicitudes = [];      // aquí se guardan todas las solicitudes
let usuarioActual = null;  // usuario que inició sesión (null = nadie)


// ---------- 2. GUARDAR Y CARGAR (localStorage) ----------

function cargarDatos() {
  const guardado = localStorage.getItem("solicitudes");
  if (guardado) {
    solicitudes = JSON.parse(guardado);   // convierte el texto en array
  } else {
    solicitudes = solicitudesIniciales;
    guardarDatos();
  }
}

function guardarDatos() {
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes)); // convierte el array en texto
}

// Devuelve el siguiente id disponible
function nuevoId() {
  let mayor = 0;
  for (const s of solicitudes) {
    if (s.id > mayor) {
      mayor = s.id;
    }
  }
  return mayor + 1;
}


// ---------- 3. NAVEGACIÓN ----------

// Muestra una sección y oculta las demás
function mostrarSeccion(nombre) {
  // Si no hay sesión, solo se puede ver inicio, acerca, servicios y login
  const necesitaSesion = ["solicitud", "mis", "admin", "perfil"];
  if (necesitaSesion.includes(nombre) && usuarioActual === null) {
    Swal.fire("Inicia sesión", "Debes iniciar sesión para entrar aquí.", "info");
    nombre = "login";
  }

  // Un cliente no puede entrar a Administración
  if (nombre === "admin" && usuarioActual.rol !== "Administrador") {
    Swal.fire("Acceso denegado", "Solo el administrador puede entrar a esta sección.", "error");
    return;
  }

  // Oculta todas las secciones
  const todas = document.querySelectorAll(".seccion");
  todas.forEach(function (sec) {
    sec.classList.add("d-none");
  });

  // Muestra la elegida
  document.getElementById(nombre).classList.remove("d-none");

  // Actualiza el contenido de las tablas y del perfil
  if (nombre === "mis") mostrarMisMantenimientos();
  if (nombre === "admin") mostrarAdmin();
  if (nombre === "perfil") mostrarPerfil();
}

// Muestra u oculta los botones del menú según haya sesión o no
function actualizarMenu() {
  const enlaces = document.querySelectorAll(".solo-sesion");
  enlaces.forEach(function (item) {
    if (usuarioActual === null) {
      item.classList.add("d-none");
    } else {
      item.classList.remove("d-none");
    }
  });

  if (usuarioActual === null) {
    document.getElementById("btnLogin").classList.remove("d-none");
    document.getElementById("btnLogout").classList.add("d-none");
    document.getElementById("textoSesion").textContent = "";
  } else {
    document.getElementById("btnLogin").classList.add("d-none");
    document.getElementById("btnLogout").classList.remove("d-none");
    document.getElementById("textoSesion").textContent = usuarioActual.nombre + " (" + usuarioActual.rol + ")";
  }
}


// ---------- 4. LOGIN ----------

function iniciarSesion(evento) {
  evento.preventDefault(); // evita que la página se recargue

  const usuario = document.getElementById("loginUsuario").value.trim();
  const clave = document.getElementById("loginClave").value;

  if (usuario === "" || clave === "") {
    Swal.fire("Campos vacíos", "Escribe tu usuario y contraseña.", "warning");
    return;
  }

  // Busca el usuario en el array
  const encontrado = usuarios.find(function (u) {
    return u.usuario === usuario && u.clave === clave;
  });

  if (encontrado === undefined) {
    Swal.fire("Acceso inválido", "Usuario o contraseña incorrectos.", "error");
    return;
  }

  if (encontrado.activo === false) {
    Swal.fire("Cuenta deshabilitada", "Tu cuenta está deshabilitada.", "error");
    return;
  }

  usuarioActual = encontrado;
  document.getElementById("loginUsuario").value = "";
  document.getElementById("loginClave").value = "";
  actualizarMenu();
  Swal.fire("Bienvenido", encontrado.nombre, "success");
  mostrarSeccion("mis");
}

function cerrarSesion() {
  usuarioActual = null;
  actualizarMenu();
  mostrarSeccion("inicio");
}


// ---------- 5. SERVICIOS Y PERFIL ----------

// Dibuja el catálogo y llena el select del formulario
function mostrarServicios() {
  let html = "";
  let opciones = '<option value="">Seleccione un servicio</option>';

  for (const s of servicios) {
    html += '<div class="col-md-4 mb-3">';
    html += '<div class="servicio">';
    html += "<h2>" + s.nombre + "</h2>";
    html += "<p>" + s.descripcion + "</p>";
    html += "<strong>Desde $" + s.precio + "</strong>";
    html += "</div></div>";

    opciones += "<option>" + s.nombre + "</option>";
  }

  document.getElementById("listaServicios").innerHTML = html;
  document.getElementById("solServicio").innerHTML = opciones;
}

// Llena los selects de estados y de clientes (para el administrador)
function llenarSelects() {
  let opcionesEstado = "";
  for (const e of estados) {
    opcionesEstado += "<option>" + e + "</option>";
  }
  document.getElementById("solEstado").innerHTML = opcionesEstado;

  let opcionesCliente = "";
  for (const u of usuarios) {
    if (u.activo) {
      opcionesCliente += '<option value="' + u.usuario + '">' + u.nombre + " (" + u.usuario + ")</option>";
    }
  }
  document.getElementById("solPropietario").innerHTML = opcionesCliente;
}

function mostrarPerfil() {
  let html = "";
  html += "<p><strong>Usuario:</strong> " + usuarioActual.usuario + "</p>";
  html += "<p><strong>Nombre:</strong> " + usuarioActual.nombre + "</p>";
  html += "<p><strong>Correo:</strong> " + usuarioActual.email + "</p>";
  html += "<p><strong>Teléfono:</strong> " + usuarioActual.telefono + "</p>";
  html += "<p><strong>Rol:</strong> " + usuarioActual.rol + "</p>";
  document.getElementById("datosPerfil").innerHTML = html;
}


// ---------- 6. FORMULARIO ----------

// Rellena nombre, teléfono y correo con los datos de un usuario
function llenarDatosCliente() {
  let nombreUsuario = usuarioActual.usuario;
  if (usuarioActual.rol === "Administrador") {
    nombreUsuario = document.getElementById("solPropietario").value;
  }

  const u = usuarios.find(function (x) {
    return x.usuario === nombreUsuario;
  });

  if (u) {
    document.getElementById("solNombre").value = u.nombre;
    document.getElementById("solTelefono").value = u.telefono;
    document.getElementById("solEmail").value = u.email;
  }
}

// Deja el formulario vacío para registrar una solicitud nueva
function nuevaSolicitud() {
  if (usuarioActual === null) {
    mostrarSeccion("solicitud"); // esto mostrará el aviso y llevará al login
    return;
  }

  document.getElementById("solId").value = "";
  document.getElementById("tituloForm").textContent = "Solicitar mantenimiento";
  document.getElementById("btnGuardar").textContent = "Registrar solicitud";

  // Limpia todos los campos
  const campos = ["solPlaca", "solMarca", "solModelo", "solAnio", "solKm", "solServicio", "solFecha", "solHora", "solObs"];
  for (const c of campos) {
    document.getElementById(c).value = "";
  }
  document.getElementById("prioNormal").checked = true;
  document.querySelectorAll('input[name="extras"]').forEach(function (c) {
    c.checked = false;
  });

  // La fecha mínima es hoy
  document.getElementById("solFecha").min = new Date().toISOString().split("T")[0];

  // Solo el administrador ve el cliente y el estado
  if (usuarioActual.rol === "Administrador") {
    document.getElementById("cajaAdmin").classList.remove("d-none");
    document.getElementById("solPropietario").value = usuarioActual.usuario;
    document.getElementById("solEstado").value = "Pendiente";
  } else {
    document.getElementById("cajaAdmin").classList.add("d-none");
  }

  llenarDatosCliente();
  mostrarSeccion("solicitud");
}

// Revisa los datos y devuelve una lista con los errores encontrados
function validarSolicitud(d) {
  const errores = [];
  const anioActual = new Date().getFullYear();
  const hoy = new Date().toISOString().split("T")[0];

  if (d.nombre.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
  }

  // Teléfono: 10 dígitos y empieza con 09
  if (d.telefono.length !== 10 || isNaN(d.telefono) || !d.telefono.startsWith("09")) {
    errores.push("El teléfono debe tener 10 números y empezar con 09.");
  }

  if (!d.email.includes("@") || !d.email.includes(".")) {
    errores.push("El correo no es válido.");
  }

  // Placa: 3 letras mayúsculas, guion y 3 o 4 números (ej: ABC-1234)
  const formatoPlaca = /^[A-Z]{3}-[0-9]{3,4}$/;
  if (!formatoPlaca.test(d.placa)) {
    errores.push("La placa debe tener el formato ABC-1234.");
  }

  if (d.marca === "") {
    errores.push("Seleccione una marca.");
  }

  if (d.modelo.length < 2) {
    errores.push("Escriba el modelo del vehículo.");
  }

  if (isNaN(d.anio) || d.anio < 1990 || d.anio > anioActual + 1) {
    errores.push("El año debe estar entre 1990 y " + (anioActual + 1) + ".");
  }

  if (isNaN(d.kilometraje) || d.kilometraje < 0 || d.kilometraje > 999999) {
    errores.push("El kilometraje debe estar entre 0 y 999999.");
  }

  if (d.servicio === "") {
    errores.push("Seleccione un tipo de servicio.");
  }

  if (d.fecha === "") {
    errores.push("Seleccione una fecha.");
  } else if (d.fecha < hoy) {
    errores.push("La fecha no puede ser anterior a hoy.");
  }

  if (d.hora === "") {
    errores.push("Seleccione una hora.");
  } else if (d.hora < "08:00" || d.hora > "17:00") {
    errores.push("El horario de atención es de 08:00 a 17:00.");
  }

  return errores;
}

function guardarSolicitud(evento) {
  evento.preventDefault();

  // Lee la prioridad (radio button)
  let prioridad = "Normal";
  document.querySelectorAll('input[name="prioridad"]').forEach(function (r) {
    if (r.checked) prioridad = r.value;
  });

  // Lee los servicios adicionales (checkboxes)
  const extras = [];
  document.querySelectorAll('input[name="extras"]').forEach(function (c) {
    if (c.checked) extras.push(c.value);
  });

  // Si es administrador elige el dueño y el estado; si es cliente, es él mismo
  let propietario = usuarioActual.usuario;
  let estado = "Pendiente";
  if (usuarioActual.rol === "Administrador") {
    propietario = document.getElementById("solPropietario").value;
    estado = document.getElementById("solEstado").value;
  }

  // Objeto con los datos del formulario
  const datos = {
    propietario: propietario,
    nombre: document.getElementById("solNombre").value.trim(),
    telefono: document.getElementById("solTelefono").value.trim(),
    email: document.getElementById("solEmail").value.trim(),
    placa: document.getElementById("solPlaca").value.trim().toUpperCase(),
    marca: document.getElementById("solMarca").value,
    modelo: document.getElementById("solModelo").value.trim(),
    anio: parseInt(document.getElementById("solAnio").value),
    kilometraje: parseInt(document.getElementById("solKm").value),
    servicio: document.getElementById("solServicio").value,
    prioridad: prioridad,
    extras: extras,
    fecha: document.getElementById("solFecha").value,
    hora: document.getElementById("solHora").value,
    observaciones: document.getElementById("solObs").value.trim(),
    estado: estado
  };

  // Valida: si hay errores, no guarda
  const errores = validarSolicitud(datos);
  if (errores.length > 0) {
    Swal.fire({ icon: "error", title: "No se guardó la solicitud", html: errores.join("<br>") });
    return;
  }

  const idEditar = document.getElementById("solId").value;

  if (idEditar === "") {
    // Solicitud nueva
    datos.id = nuevoId();
    solicitudes.push(datos);
    guardarDatos();
    Swal.fire("Listo", "Solicitud registrada.", "success");
    mostrarSeccion("mis");
  } else {
    // Edición (solo administrador)
    if (usuarioActual.rol !== "Administrador") {
      Swal.fire("Acceso denegado", "Solo el administrador puede editar.", "error");
      return;
    }
    datos.id = Number(idEditar);
    for (let i = 0; i < solicitudes.length; i++) {
      if (solicitudes[i].id === datos.id) {
        solicitudes[i] = datos;   // reemplaza la solicitud vieja
      }
    }
    guardarDatos();
    Swal.fire("Listo", "Solicitud actualizada.", "success");
    mostrarSeccion("admin");
  }
}


// ---------- 7. LISTADOS ----------

// Cliente: solo ve sus propias solicitudes
function mostrarMisMantenimientos() {
  const propias = solicitudes.filter(function (s) {
    return s.propietario === usuarioActual.usuario;
  });

  let html = "";
  if (propias.length === 0) {
    html = '<tr><td colspan="7" class="text-center">Todavía no tienes solicitudes.</td></tr>';
  }

  for (const s of propias) {
    html += "<tr>";
    html += "<td>" + s.id + "</td>";
    html += "<td>" + s.placa + "</td>";
    html += "<td>" + s.marca + " " + s.modelo + " (" + s.anio + ")</td>";
    html += "<td>" + s.servicio + "</td>";
    html += "<td>" + s.fecha + "</td>";
    html += "<td>" + s.hora + "</td>";
    html += "<td>" + s.estado + "</td>";
    html += "</tr>";
  }

  document.getElementById("tablaMis").innerHTML = html;
}

// Administrador: ve todas las solicitudes y puede cambiarlas
function mostrarAdmin() {
  let html = "";

  if (solicitudes.length === 0) {
    html = '<tr><td colspan="7" class="text-center">No hay solicitudes.</td></tr>';
  }

  for (const s of solicitudes) {
    // Select para cambiar el estado
    let selectEstado = '<select class="form-select form-select-sm" onchange="cambiarEstado(' + s.id + ', this.value)">';
    for (const e of estados) {
      if (e === s.estado) {
        selectEstado += "<option selected>" + e + "</option>";
      } else {
        selectEstado += "<option>" + e + "</option>";
      }
    }
    selectEstado += "</select>";

    html += "<tr>";
    html += "<td>" + s.id + "</td>";
    html += "<td>" + s.nombre + "</td>";
    html += "<td>" + s.placa + "</td>";
    html += "<td>" + s.servicio + "</td>";
    html += "<td>" + s.fecha + " " + s.hora + "</td>";
    html += "<td>" + selectEstado + "</td>";
    html += '<td><button class="btn btn-sm btn-warning" onclick="editarSolicitud(' + s.id + ')">Editar</button> ';
    html += '<button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(' + s.id + ')">Eliminar</button></td>';
    html += "</tr>";
  }

  document.getElementById("tablaAdmin").innerHTML = html;
}


// ---------- 8. ACCIONES DEL ADMINISTRADOR ----------

function editarSolicitud(id) {
  if (usuarioActual.rol !== "Administrador") {
    Swal.fire("Acceso denegado", "Solo el administrador puede editar.", "error");
    return;
  }

  const s = solicitudes.find(function (x) {
    return x.id === id;
  });

  // Pasa los datos de la solicitud al formulario
  document.getElementById("solId").value = s.id;
  document.getElementById("tituloForm").textContent = "Editar solicitud #" + s.id;
  document.getElementById("btnGuardar").textContent = "Guardar cambios";
  document.getElementById("cajaAdmin").classList.remove("d-none");
  document.getElementById("solPropietario").value = s.propietario;
  document.getElementById("solEstado").value = s.estado;
  document.getElementById("solNombre").value = s.nombre;
  document.getElementById("solTelefono").value = s.telefono;
  document.getElementById("solEmail").value = s.email;
  document.getElementById("solPlaca").value = s.placa;
  document.getElementById("solMarca").value = s.marca;
  document.getElementById("solModelo").value = s.modelo;
  document.getElementById("solAnio").value = s.anio;
  document.getElementById("solKm").value = s.kilometraje;
  document.getElementById("solServicio").value = s.servicio;
  document.getElementById("solFecha").removeAttribute("min");
  document.getElementById("solFecha").value = s.fecha;
  document.getElementById("solHora").value = s.hora;
  document.getElementById("solObs").value = s.observaciones;

  document.querySelectorAll('input[name="prioridad"]').forEach(function (r) {
    r.checked = (r.value === s.prioridad);
  });
  document.querySelectorAll('input[name="extras"]').forEach(function (c) {
    c.checked = s.extras.includes(c.value);
  });

  mostrarSeccion("solicitud");
}

function cambiarEstado(id, nuevoEstado) {
  if (usuarioActual.rol !== "Administrador") {
    Swal.fire("Acceso denegado", "Solo el administrador puede cambiar el estado.", "error");
    return;
  }

  const s = solicitudes.find(function (x) {
    return x.id === id;
  });
  s.estado = nuevoEstado;
  guardarDatos();
  Swal.fire("Estado actualizado", "Ahora está: " + nuevoEstado, "success");
}

function eliminarSolicitud(id) {
  if (usuarioActual.rol !== "Administrador") {
    Swal.fire("Acceso denegado", "Solo el administrador puede eliminar.", "error");
    return;
  }

  // Pide confirmación antes de eliminar
  Swal.fire({
    title: "¿Eliminar la solicitud #" + id + "?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      // filter deja todas las solicitudes menos la que se elimina
      solicitudes = solicitudes.filter(function (s) {
        return s.id !== id;
      });
      guardarDatos();
      mostrarAdmin();
      Swal.fire("Eliminada", "La solicitud fue eliminada.", "success");
    }
  });
}


// ---------- 9. INICIO DE LA APLICACIÓN ----------

cargarDatos();
mostrarServicios();
llenarSelects();
actualizarMenu();
mostrarSeccion("inicio");
