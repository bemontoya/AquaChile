# Plataforma de Gestión de Evaluaciones Psicolaborales — AquaChile (MVP Frontend)

Este proyecto corresponde al desarrollo del MVP del frontend para la gestión y seguimiento de evaluaciones psicolaborales de **AquaChile**.

El sistema permite la administración de candidatos, el registro de solicitudes y la visualización de indicadores clave a través de un tablero interactivo tipo Kanban y vistas tabulares, optimizando el flujo de reclutamiento y selección en las distintas áreas y plantas operativas.

---


## Integrantes:
-- Javier Cataldo
-- Benjamin Montoya

##  Tecnologías Utilizadas

* **React 18** (con Vite como herramienta de construcción)
* **React Router DOM v6** (para la navegación entre vistas SPA)
* **Bootstrap 5 & Bootstrap Icons** (para maquetación web responsive y diseño de UI)
* **@hello-pangea/dnd** (para la interacción Drag & Drop en el tablero Kanban)
* **Vitest & React Testing Library** (para la suite de pruebas unitarias)

---

##  Estructura del Proyecto

```text
src/
├── assets/          # Recursos estáticos e imágenes
├── components/      # Componentes reutilizables UI (CandidatosTabla, FormSolicitud, KanbanSolicitudes, etc.)
├── data/            # Datos simulados (Mocks) y catálogos estáticos (candidatosData, solicitudesData, catalogos)
├── App.jsx          # Componente principal y configuración de rutas
├── main.jsx         # Punto de entrada de React con BrowserRouter
└── setupTests.js    # Configuración de entornos de pruebas (Jest-DOM)
```

---

##  Requisitos e Instalación



### Pasos para ejecutar en entorno local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITO_GITHUB>
   cd vcm-psicolaboral
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre la dirección que indica la consola (generalmente `http://localhost:5173`) en tu navegador.

---

##  Ejecución de Pruebas Unitarias (Testing con Vitest)

Las pruebas automatizadas del proyecto verifican el correcto renderizado de los componentes, la gestión de props y la navegación.

### Pasos para ejecutar los Tests:

1. **Asegurarte de tener las dependencias de prueba instaladas:**
   Si aún no las has instalado en el proyecto, ejecuta:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
   ```

2. **Ejecutar los tests en modo watch (desarrollo):**
   Mantiene las pruebas escuchando cambios en el código.
   ```bash
   npm run test
   ```

3. **Ejecutar una sola pasada de tests (Ideal para capturas de pantalla de evidencia):**
   Ejecuta la suite completa, genera la métrica en consola y finaliza el proceso inmediatamente.
   ```bash
   npx vitest run
   ```

### Suites de Pruebas Incluidas
* `src/components/CandidatosTabla.test.jsx`: Valida la renderización dinámica de los datos del candidato.
* `src/components/SubHeader.test.jsx`: Verifica la correcta visualización de contadores y resumen de navegación.
* `src/components/GraficoPorArea.test.jsx`: Comprueba la distribución y estructura de las barras indicadoras por área.
