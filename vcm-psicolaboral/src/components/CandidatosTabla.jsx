import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FAMILIAS_CANDIDATOS } from '../data/catalogos';

// Color principal de AquaChile: es el único color de acento de la pantalla
const COLOR_PRIMARIO = '#0d3c61';

// Estilo común de las tarjetas: borde fino y sin sombra
const tarjeta = { border: '1px solid #e5e7eb', boxShadow: 'none' };

// Saca las iniciales del nombre (sirve si el candidato no trae el campo "iniciales")
const obtenerIniciales = (nombre = '') =>
  nombre
    .split(' ')       // separa el nombre en palabras
    .filter(Boolean)  // elimina espacios vacíos
    .slice(0, 2)      // usa solo las dos primeras palabras
    .map((palabra) => palabra[0].toUpperCase())
    .join('');

// Prepara un texto para compararlo: minúsculas y sin tildes.
// Así "Muñoz", "munoz" y "MUÑOZ" se consideran iguales.
// (texto ?? '') evita errores si el campo viene vacío (null o undefined)
const normalizar = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')                  // separa cada letra de su tilde
    .replace(/[\u0300-\u036f]/g, '');  // elimina las tildes

// Deja el RUT solo con números y la K: quita puntos, guiones y espacios.
// Así "18.636.789-K" se puede encontrar escribiendo "18636789" o "18.636".
const limpiarRut = (texto) => normalizar(texto).replace(/[.\-\s]/g, '');

export default function CandidatosTabla({ candidatos }) {
  // Hook de navegación de React Router
  const navigate = useNavigate();

  // Texto que el usuario escribe en el buscador
  const [busqueda, setBusqueda] = useState('');
  // Familia de cargo seleccionada para filtrar
  const [filtroFamilia, setFiltroFamilia] = useState('Todos');

  // Lo que escribió el usuario, ya preparado para comparar
  const termino = normalizar(busqueda.trim());
  const terminoRut = limpiarRut(busqueda);

  // Filtrado dinámico por búsqueda o familia de cargo
  const candidatosFiltrados = candidatos.filter((item) => {
    const coincideFamilia = filtroFamilia === 'Todos' || item.familiaCargo === filtroFamilia;

    // Si el buscador está vacío, todos coinciden.
    // Si no, buscamos el texto en el nombre, el cargo o el RUT.
    const coincideBusqueda =
      termino === '' ||
      normalizar(item.nombre).includes(termino) ||
      normalizar(item.cargo).includes(termino) ||
      (terminoRut !== '' && limpiarRut(item.rut).includes(terminoRut));

    return coincideFamilia && coincideBusqueda;
  });

  // Opciones del filtro rápido: "Todos" + una opción por cada familia de cargo
  const opcionesFiltro = [
    { id: 'Todos', label: `Todos (${candidatos.length})` },
    ...FAMILIAS_CANDIDATOS.map((familia) => ({ id: familia, label: familia })),
  ];

  return (
    <div className="w-100">
      {/* Estilos para el foco del buscador y el efecto al pasar el mouse */}
      <style>{`
        .buscador:focus {
          border-color: ${COLOR_PRIMARIO};
          box-shadow: 0 0 0 0.2rem rgba(13, 60, 97, 0.12);
        }
        .btn-principal:hover { background-color: #0a2f4d !important; }
        .chip:hover { background-color: #f3f4f6; }
      `}</style>

      {/* Ruta de navegación (breadcrumb) */}
      <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
        Gestión de personas &gt; Reclutamiento y selección
      </div>

      {/* Encabezado principal */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-semibold mb-1 text-dark">Listado de candidatos</h1>
          <p className="text-muted small mb-0">
            Registro maestro de postulantes a evaluaciones psicolaborales
          </p>
        </div>

        {/* Total de postulantes: texto simple, sin caja ni ícono de color */}
        <div className="text-md-end">
          <div className="fs-3 fw-semibold text-dark lh-1">{candidatos.length}</div>
          <div className="text-muted small">Postulantes totales</div>
        </div>
      </div>

      {/* Buscador + botón de acción */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-3">
        {/* Buscador */}
        <div className="input-group" style={{ maxWidth: '420px' }}>
          <span className="input-group-text bg-white text-muted border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control buscador border-start-0 ps-1"
            placeholder="Buscar por nombre, cargo o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Botón de acción adaptado a React Router */}
        <button
          type="button"
          className="btn btn-principal text-white px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
          style={{ backgroundColor: COLOR_PRIMARIO }}
          onClick={() => navigate('/registro-candidato')}
        >
          <i className="bi bi-plus-lg"></i> Registrar nuevo candidato
        </button>
      </div>

      {/* Filtro rápido por familia de cargo */}
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <span
          className="text-muted text-uppercase me-1"
          style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
        >
          Filtro rápido
        </span>
        {opcionesFiltro.map((opcion) => {
          // ¿Es la opción que está seleccionada ahora?
          const activa = filtroFamilia === opcion.id;
          return (
            <button
              key={opcion.id}
              type="button"
              // Activa: azul marino relleno. Inactiva: blanca con borde gris
              className={`btn btn-sm chip ${
                activa ? 'text-white fw-medium' : 'bg-white border text-secondary'
              }`}
              style={activa ? { backgroundColor: COLOR_PRIMARIO, borderColor: COLOR_PRIMARIO } : {}}
              onClick={() => setFiltroFamilia(opcion.id)}
            >
              {opcion.label}
            </button>
          );
        })}
      </div>

      {/* Tabla de candidatos */}
      <div className="card rounded-3 mb-3 overflow-hidden" style={tarjeta}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead
              className="table-light text-muted text-uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
            >
              <tr>
                <th scope="col" className="ps-4 py-3 fw-medium">Nombre completo</th>
                <th scope="col" className="py-3 fw-medium">Correo electrónico</th>
                <th scope="col" className="py-3 fw-medium">Teléfono</th>
                <th scope="col" className="py-3 fw-medium">Cargo postulación</th>
                <th scope="col" className="py-3 fw-medium">Familia de cargo</th>
                <th scope="col" className="text-end pe-4 py-3 fw-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Mensaje cuando la búsqueda no encuentra nada */}
              {candidatosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No se encontraron candidatos con esos criterios.
                  </td>
                </tr>
              )}

              {/* La key combina id + posición: así React no se confunde si dos
                  candidatos llegan con el mismo id (datos de prueba repetidos) */}
              {candidatosFiltrados.map((item, indice) => (
                <tr key={`${item.id}-${indice}`}>
                  {/* Nombre completo y RUT */}
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="bg-light border text-secondary rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                        style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}
                      >
                        {item.iniciales || obtenerIniciales(item.nombre)}
                      </div>
                      <div>
                        <div className="fw-medium text-dark">{item.nombre}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          RUT: {item.rut}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="text-secondary small">{item.email}</td>
                  <td className="text-secondary small text-nowrap">{item.telefono}</td>

                  {/* Cargo arriba y ubicación abajo (en vez de un badge al lado) */}
                  <td>
                    <div className="text-dark small fw-medium">{item.cargo}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {item.ubicacion}
                    </div>
                  </td>

                  {/* Familia de cargo como texto simple, sin pastilla de color */}
                  <td className="text-secondary small">{item.familiaCargo}</td>

                  <td className="text-end pe-4">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border text-secondary text-nowrap"
                      onClick={() => navigate(`/candidatos/${item.id}`)}
                    >
                      <i className="bi bi-eye me-1"></i> Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="text-muted small">
            Mostrando{' '}
            <strong className="text-dark">
              {candidatosFiltrados.length === 0 ? 0 : 1} a {candidatosFiltrados.length}
            </strong>{' '}
            de <strong className="text-dark">{candidatos.length}</strong> candidatos
          </div>

          <nav aria-label="Navegación de páginas">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">&lt; Anterior</span>
              </li>
              <li className="page-item active">
                <span
                  className="page-link"
                  style={{ backgroundColor: COLOR_PRIMARIO, borderColor: COLOR_PRIMARIO }}
                >
                  1
                </span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Siguiente &gt;</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}