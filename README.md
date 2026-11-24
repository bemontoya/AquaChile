# Plataforma Integral de Gestión de Evaluaciones Psicolaborales — AquaChile

Plataforma web desarrollada para la gestión, seguimiento y evaluación psicolaboral de candidatos en procesos de reclutamiento y selección de **AquaChile**.

El sistema integra un portal público de postulación con carga de currículums (PDF/DOCX), gestión de ofertas laborales, administración de candidatos con almacenamiento persistente de archivos, tablero Kanban interactivo, agendamiento de entrevistas con Google Meet, notificaciones automáticas por correo electrónico y un **Asistente de Inteligencia Artificial** con supervisión humana para el análisis de perfiles y generación de preguntas conductuales (metodología STAR).

---

## Integrantes
- **Javier Cataldo**
- **Benjamín Montoya**

---

## Tecnologías Utilizadas

### Frontend
- **React 18** + **Vite** (entorno de desarrollo y empaquetado SPA)
- **React Router DOM v6** (enrutamiento dinámico y protección de vistas por rol)
- **Bootstrap 5 & Bootstrap Icons** (diseño responsivo e interfaz de usuario)
- **@hello-pangea/dnd** (interacción Drag & Drop para el tablero Kanban de solicitudes)

### Backend y Seguridad
- **Node.js & Express** (servidor API RESTful)
- **JSON Web Tokens (JWT)** & **bcryptjs** (autenticación y control de acceso basado en roles: `ANALISTA` y `EVALUADOR`)
- **Multer** (recepción y validación de archivos CV en formato PDF y DOCX)
- **pdf-parse & Mammoth** (extracción automática de texto plano desde currículums en PDF y Word con anonimización de datos sensibles/PII)
- **Swagger UI (`swagger-jsdoc` / `swagger-ui-express`)** (documentación interactiva de endpoints en `/api-docs`)
- **CORS & dotenv** (gestión de políticas de origen cruzado y variables de entorno)

### Base de Datos y ORM
- **PostgreSQL (Neon Serverless)** (base de datos relacional en la nube)
- **Prisma ORM** (modelado de esquema, migraciones y consultas tipadas)
- **Supabase**

### Servicios Externos e Integraciones Cloud
- **Groq Cloud API (LLM)** (motor de Inteligencia Artificial para análisis orientativo de adecuación al perfil y sugerencia de preguntas de entrevista por competencias)
- **Brevo Transactional Email API (HTTP/443)** (envío instantáneo de citaciones y notificaciones por correo electrónico con enlace de videollamada)
- **Google Calendar API & Google Meet** (agendamiento de entrevistas y generación de enlaces de reunión)
- **Render & Vercel** (despliegue continuo en producción para Backend y Frontend respectivamente)

### Testing y Calidad de Software
- **Vitest & React Testing Library** (pruebas unitarias y de componentes en frontend)
- **Supertest / Vitest** (pruebas de integración de endpoints en backend)

---

## Estructura del Proyecto

```text
vcm-psicolaboral/
├── prisma/
│   └── schema.prisma            # Modelos de BD (Usuario, Oferta, Postulante, Postulacion, SolicitudEvaluacion)
├── middlewares/
│   ├── auth.js                  # Verificación de token JWT y permisos por rol
│   └── uploadCV.js              # Configuración de Multer para carga segura de CVs
├── src/
│   ├── assets/                  # Recursos estáticos e imágenes corporativas
│   ├── components/              # Componentes UI (CandidatosTabla, DetalleCandidato, KanbanSolicitudes, etc.)
│   ├── data/                    # Catálogos y datos de referencia
│   ├── services/                # Cliente HTTP y consumo de API (api.js)
│   ├── utils/                   # Integración con Google Calendar / Meet (googleCalendar.js)
│   ├── App.jsx                  # Configuración principal de rutas y estado global
│   ├── main.jsx                 # Punto de entrada de la aplicación React
│   └── setupTests.js            # Configuración de entorno de pruebas
├── server.js                    # Servidor principal Express, endpoints API, IA y Brevo
├── swagger.js                   # Configuración de documentación OpenAPI / Swagger
├── package.json                 # Dependencias y scripts de ejecución
└── .env                         # Variables de entorno (no versionado)
