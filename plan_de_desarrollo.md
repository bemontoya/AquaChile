# Plan de División de Tareas — AquaChile (Frontend & Backend)

Este documento detalla la distribución de responsabilidades para el equipo de desarrollo, dividiendo las tareas entre **Frontend (React/Vite)** y **Backend (Node.js/Express + Prisma/PostgreSQL)**.

---

## 1. Arquitectura General y Persistencia de Datos (Backend)

### 🗄️ Base de Datos y Modelado (Prisma + PostgreSQL)
- [ ] Configurar la cadena de conexión de PostgreSQL en `.env` (`DATABASE_URL`).
- [ ] Definir el esquema en `prisma/schema.prisma` con las entidades:
  - `Candidato`: Datos personales, contacto y asignación laboral.
  - `Evaluacion`: Etapas del proceso de reclutamiento (psicolaboral, técnico, entrevista).
  - `Reunion`: Integración con Google Calendar (fecha, link de Meet, ID de evento).
- [ ] Ejecutar migraciones iniciales (`npx prisma migrate dev --name init`).
- [ ] Crear scripts de siembra (*seeders*) con datos ficticios para pruebas de desarrollo.

### 🌐 Endpoints REST API (`server.js`)
- [ ] **Módulo Candidatos:**
  - `GET /api/candidatos`: Obtener listado con filtros y ordenamiento desde BD.
  - `POST /api/candidatos`: Crear un candidato e integrar el disparo de correo.
  - `PUT /api/candidatos/:id`: Actualizar ficha técnica de un postulante.
- [ ] **Módulo Notificaciones (Resend):**
  - Refactorizar endpoint `/api/enviar-confirmacion` para guardar histórico en BD.
- [ ] **Módulo Agendamiento (Google Calendar):**
  - `POST /api/agendar-reunion`: Autenticación con Service Account (`googleapis`), creación del evento en Google Calendar y generación automática del enlace a Google Meet.

---

## 2. Interfaz de Usuario y Flujos (Frontend)

### 🎨 Componentes y UI (React + Bootstrap)
- [ ] **Ficha y Listado de Candidatos (`CandidatosTabla.jsx`):**
  - Modificar el clic sobre el nombre del candidato para abrir el modal de detalle.
  - Mantener la columna "Acciones" con el botón rápido de **Editar**.
- [ ] **Modal de Detalle del Candidato (`CandidatoDetalleModal.jsx`):**
  - Mostrar la ficha técnica completa (RUT, datos de contacto, unidad, planta).
  - Incluir el botón destacado **"Agendar Entrevista Psicolaboral"** en la sección inferior.
- [ ] **Modal de Agendamiento (`AgendarReunionModal.jsx`):**
  - Formulario para seleccionar fecha, hora de inicio/fin y notas.
  - Conexión con el endpoint `POST /api/agendar-reunion`.
- [ ] **Integración con API Backend (`fetch` Services):**
  - Sustituir los datos Mocks por llamadas HTTP reales hacia la API en el puerto `3001`.

---

## 3. Matriz de Tareas por Rol

| Módulo / Funcionalidad | Tareas Backend | Tareas Frontend |
| :--- | :--- | :--- |
| **Gestión de Candidatos** | Enrutamiento Express + Consultas con Prisma ORM | Formularios de registro, listado con filtros y vistas modales |
| **Notificaciones por Email** | Integración SDK Resend con templates HTML | Feedback en UI (alertas de éxito/error al registrar) |
| **Integración Google Calendar** | Autenticación JWT, creación de evento y link de Google Meet | Modal de agendamiento y despliegue del link de la reunión |
| **Persistencia** | Configuración de esquema PostgreSQL e índices | Manejo de estado global/local (`useState`, `useEffect`) |

---

## 4. Próximos Pasos Recomendados
1. Instalar **Prisma** en el proyecto backend (`npm install @prisma/client prisma`).
2. Configurar la base de datos local o remota en el archivo `.env`.
3. Crear el componente `CandidatoDetalleModal.jsx` en el frontend para centralizar la vista de la ficha y el botón de agendamiento.