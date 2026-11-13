# Taller Cordillera

Aplicación web de mantenimiento automotriz desarrollada como proyecto de la actividad **AD01** de la asignatura **Programación Web 1**. Permite a los clientes solicitar el mantenimiento de su vehículo en línea y consultar el estado de sus solicitudes, y a un administrador gestionarlas.

## Funcionalidades

- Página de inicio, sección «Acerca de» y catálogo de servicios.
- Inicio y cierre de sesión con roles de **Cliente** y **Administrador**.
- Formulario de solicitud de mantenimiento con datos del cliente, del automóvil y del servicio, además de prioridad, fecha y hora.
- Sección «Mis mantenimientos» para que cada cliente consulte sus propias solicitudes.
- Panel de administración para registrar, revisar y actualizar solicitudes (CRUD).
- Perfil de usuario.
- Almacenamiento local en el navegador (`localStorage`); no utiliza backend ni base de datos.

## Tecnologías

- HTML5, CSS3 y JavaScript
- [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [SweetAlert2](https://sweetalert2.github.io/)

## Estructura del proyecto

```
Taller_Automotriz/
├── index.html
├── css/
│   └── styles.css
├── img/
│   └── carro-tuneado.svg
└── js/
    └── script.js
```

## Cómo ejecutarlo

1. Clonar el repositorio o descargarlo como ZIP desde el botón **Code** de GitHub:
   ```
   git clone https://github.com/Roberto-Caiza23/taller-automotriz.git
   ```
2. Abrir el archivo `index.html` en el navegador (o con la extensión Live Server de Visual Studio Code).
3. Se requiere conexión a internet, ya que Bootstrap y SweetAlert2 se cargan desde una CDN.

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `cliente1` | `cliente123` | Cliente |
| `cliente2` | `cliente123` | Cliente |
| `bloqueado` | `bloqueado123` | Cuenta deshabilitada |

Las cuentas son ficticias y solo sirven para demostración.

## Horario de atención

De lunes a sábado, de 08:00 a 17:00.

## Uso de inteligencia artificial

El uso de herramientas de IA durante el desarrollo se documenta en el registro de uso de IA entregado junto con este proyecto.

## Autor

Roberto Morales — Programación Web 1, 2026.
