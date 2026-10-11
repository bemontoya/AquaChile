import React, { useState } from 'react';

export default function CandidatosTabla({ candidatos, onNuevoCandidato }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroFamilia, setFiltroFamilia] = useState('Todos');

  // Filtrado dinámico por búsqueda o familia de cargo
  const candidatosFiltrados = candidatos.filter((item) => {
    const coincideFamilia = filtroFamilia === 'Todos' || item.familiaCargo === filtroFamilia;
    const coincideBusqueda = 
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rut.includes(busqueda);

    return coincideFamilia && coincideBusqueda;
  });

  return (
    <div className="w-100">
      
      {/* 1. Miga de pan / Breadcrumb */}
      <div className="text-muted small mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
        GESTIÓN DE PERSONAS &gt; RECLUTAMIENTO Y SELECCIÓN
      </div>

      {/* 2. Encabezado principal con métricas superiores */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h3 fw-bold mb-1 text-dark">Listado de Candidatos</h2>
          <p className="text-muted small mb-0">
            Registro maestro de postulantes a evaluaciones psicolaborales
          </p>
        </div>

        {/* Métrica de resumen rápido */}
        <div className="d-flex gap-3">
          <div className="card border-0 shadow-sm px-3 py-2 d-flex flex-row align-items-center gap-3 rounded-3 bg-white">
            <i className="bi bi-person-workspace text-primary fs-4"></i>
            <div>
              <div className="fw-bold h5 mb-0 text-dark">148</div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Postulantes Totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Barra de Controles: Buscador, Exportar y Botón Registrar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-3">
        
        {/* Buscador */}
        <div className="input-group shadow-sm bg-white rounded-3" style={{ maxWidth: '450px' }}>
          <span className="input-group-text bg-white border-0 text-muted ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 ps-1"
            placeholder="Buscar por nombre o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Botones de acción */}
        <div className="d-flex gap-2 justify-content-end">
          <button 
            type="button" 
            className="btn text-white px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}
            onClick={onNuevoCandidato}
          >
            <i className="bi bi-plus-lg"></i> + Registrar Nuevo Candidato
          </button>
        </div>

      </div>

      {/* 4. Barra de Filtro Rápido */}
      <div className="p-2 mb-3 bg-light rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-bold text-secondary small text-uppercase me-2" style={{ fontSize: '0.75rem' }}>
            FILTRO RÁPIDO:
          </span>
          {[
            { id: 'Todos', label: 'Todos (148)' },
            { id: 'Operaciones y Producción', label: 'Operaciones y Producción' },
            { id: 'Calidad y Medioambiente', label: 'Calidad y Medioambiente' },
            { id: 'Mantenimiento e Ingeniería', label: 'Mantenimiento e Ingeniería' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn btn-sm ${
                filtroFamilia === item.id 
                  ? 'btn-primary fw-semibold' 
                  : 'btn-light border text-secondary'
              }`}
              onClick={() => setFiltroFamilia(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="text-muted small d-none d-lg-block" style={{ fontSize: '0.75rem' }}>
          Base de Postulaciones AquaChile
        </div>
      </div>

      {/* 5. Tabla de Candidatos */}
      <div className="card border-0 shadow-sm rounded-3 mb-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom text-muted small text-uppercase" style={{ fontSize: '0.75rem' }}>
              <tr>
                <th scope="col" className="ps-4 py-3">NOMBRE COMPLETO</th>
                <th scope="col" className="py-3">CORREO ELECTRÓNICO</th>
                <th scope="col" className="py-3">TELÉFONO</th>
                <th scope="col" className="py-3">CARGO POSTULACIÓN</th>
                <th scope="col" className="py-3">FAMILIA DE CARGO</th>
                <th scope="col" className="text-end pe-4 py-3">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {candidatosFiltrados.map((item) => (
                <tr key={item.id}>
                  
                  {/* Nombre completo con Avatar de Iniciales y RUT */}
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}
                      >
                        {item.iniciales}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{item.nombre}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          RUT: {item.rut}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Correo Electrónico */}
                  <td className="text-secondary small">{item.email}</td>

                  {/* Teléfono */}
                  <td className="text-secondary small">{item.telefono}</td>

                  {/* Cargo Postulación y Ubicación */}
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="text-dark small fw-medium">{item.cargo}</span>
                      <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.7rem' }}>
                        {item.ubicacion}
                      </span>
                    </div>
                  </td>

                  {/* Familia de Cargo */}
                  <td>
                    <span className="badge bg-secondary-subtle text-dark border-0 fw-medium px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                      <span className="bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></span>
                      {item.familiaCargo}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="text-end pe-4">
                    <div className="d-flex gap-1 justify-content-end">
                      <button type="button" className="btn btn-sm btn-light border text-secondary me-1">
                        <i className="bi bi-pencil me-1"></i> Editar
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla / Paginación */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="text-muted small">
            Mostrando <strong>1 a {candidatosFiltrados.length}</strong> de <strong>148</strong> candidatos
          </div>

          <nav aria-label="Navegación de páginas">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">&lt; Anterior</span>
              </li>
              <li className="page-item active">
                <span className="page-link" style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}>1</span>
              </li>
              <li className="page-item"><a className="page-link text-secondary" href="#2">2</a></li>
              <li className="page-item"><a className="page-link text-secondary" href="#3">3</a></li>
              <li className="page-item disabled"><span className="page-link">...</span></li>
              <li className="page-item"><a className="page-link text-secondary" href="#30">30</a></li>
              <li className="page-item">
                <a className="page-link text-secondary" href="#siguiente">Siguiente &gt;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* 6. Banner de Cumplimiento Ley de Protección de Datos */}
      <div className="alert alert-light border d-flex align-items-center gap-3 rounded-3 p-3 text-muted small mb-0">
        <i className="bi bi-shield-check fs-4 text-primary"></i>
        <div>
          <strong className="text-dark">Cumplimiento Ley 19.628 de Protección de Datos Personales:</strong> La información contenida en este registro maestro de postulaciones es de uso estrictamente confidencial para los procesos de evaluación psicolaboral y selección de personal de AquaChile S.A. Queda prohibida su reproducción o distribución fuera del departamento de Recursos Humanos.
        </div>
      </div>

    </div>
  );
}