import React from 'react';

export default function SolicitudesTabla({ solicitudes }) {
  
  // Se asignan clases de color a las etiquetas de estado
  // Devuelve verde si el estado está en finalizado, azul si está en proceso y amarillo si está pendiente
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Finalizada':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'En proceso':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Pendiente':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  // Devuelve el botón de acción correspondiente a cada estado
  // Se usa const para que el valor no se pueda reasignar
  const getAccionBtn = (estado) => {
    if (estado === 'Finalizada') {
      // Texto simple sin borde para Ver Detalle
      return (
        <button className="btn btn-link btn-sm text-decoration-none text-success p-0 border-0 align-baseline fw-medium">
          Ver Detalle <i className="bi bi-eye ms-1"></i>
        </button>
      );
    } else if (estado === 'En proceso') {
      // Botón delineado azul para Evaluar
      return (
        <button className="btn btn-link btn-sm text-decoration-none text-primary p-0 border-0 align-baseline fw-medium">
          Evaluar <i className="bi bi-pencil-square ms-1"></i>
        </button>
      );
    } else {
      // Botón delineado amarillo/naranja para Iniciar Evaluación
      return (
        <button className="btn btn-link btn-sm text-decoration-none text-warning-emphasis p-0 border-0 align-baseline fw-medium">
          Iniciar Evaluación <i className="bi bi-play-fill ms-1"></i>
        </button>
      );
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
          
          {/* Encabezado de la tabla */}
          <thead className="table-light text-uppercase text-muted border-bottom" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="py-3 px-3">N° SOLICITUD</th>
              <th className="py-3">CANDIDATO</th>
              <th className="py-3">CARGO</th>
              <th className="py-3">FECHA SOLICITUD</th>
              <th className="py-3">PSICÓLOGO EVALUADOR</th>
              <th className="py-3">ESTADO</th>
              <th className="py-3 text-end px-3">ACCIÓN</th>
            </tr>
          </thead>

          {/* Cuerpo de la tabla */}
          <tbody>
            {solicitudes.length > 0 ? (
              // Se recorre el arreglo de solicitudes y genera una fila <tr> por cada una
              solicitudes.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold px-3">{item.id}</td>
                  
                  {/* Nombre y datos de contacto */}
                  <td>
                    {/* Muestra el nombre del candidato en negrita definido por el fw-bold */}
                    <div className="fw-bold text-dark">{item.candidato}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {/* Detalles del contacto */}
                      RUT: {item.rut} {item.email ? `• ${item.email}` : item.telefono ? `• ${item.telefono}` : ''}
                    </div>
                  </td>

                  {/* Cargo y centro de trabajo */}
                  <td>
                    <div className="fw-semibold text-dark">{item.cargo}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.area}</div>
                  </td>

                  <td className="text-muted">{item.fecha}</td>

                  {/* Evaluador asignado con iniciales */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary-subtle text-secondary rounded-circle p-1">
                        {item.evaluadorInit}
                      </span>
                      <span>{item.evaluador}</span>
                    </div>
                  </td>

                  {/* Badge de estado (color condicional) */}
                  <td>
                    <span className={`badge rounded-pill px-2 py-1 ${getBadgeClass(item.estado)}`}>
                      {item.estado}
                    </span>
                  </td>

                  {/* Botón según el estado actual */}
                  <td className="text-end px-3">
                    {getAccionBtn(item.estado)}
                  </td>
                </tr>
              ))
            ) : (
              // Mensaje cuando la búsqueda o el filtro no devuelven registros
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No se encontraron solicitudes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pie de tabla con información de paginación */}
      <div className="card-footer bg-white border-top py-2 d-flex justify-content-between align-items-center text-muted small">
        <span>Mostrando {solicitudes.length} registro(s)</span>
        <div className="d-flex align-items-center gap-2">
          <span>Filas por página:</span>
          <select className="form-select form-select-sm w-auto">
            <option>6</option>
            <option>10</option>
          </select>
        </div>
      </div>
    </div>
  );
}