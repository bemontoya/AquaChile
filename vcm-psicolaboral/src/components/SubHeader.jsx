import React from 'react';

// Se reciben propiedades desde App.jsx para controlar los filtros y la búsqueda
export default function SubHeader({ filtroActual, setFiltroActual, busqueda, setBusqueda }) {
    return (
        <div className="mb-4">
            {/* Subtítulo */}
            <small className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                GESTIÓN DEL TALENTO ACUÍCOLA • Región de Los Lagos & Aysén
            </small>

            {/* Título de la pantalla e indicadores globales (responsivos) */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                <div>
                    <h2 className="h4 fw-bold mb-1">Listado de Solicitudes de Evaluación</h2>
                    <p className="text-muted small mb-0">Control y seguimiento del estado de los procesos psicolaborales activos.</p>
                </div>

                {/* Métricas de estado rápido */}
                <div className="d-flex gap-2 flex-wrap">
                    <span className="badge bg-light text-dark border p-2 fw-normal">48 Procesos</span>
                </div>
            </div>

            {/* Filtros y buscador (se apilan en móviles y se alinean en escritorio) */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3 pt-2">

                {/* Grupo de botones para cambiar el filtro */}
                <div className="btn-group bg-light p-1 rounded border overflow-auto">
                    <button
                        className={`btn btn-sm ${filtroActual === 'Todos' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-muted'}`}
                        onClick={() => setFiltroActual('Todos')}
                    >
                        Todos <span className="badge bg-secondary ms-1">48</span>
                    </button>

                    <button
                        className={`btn btn-sm ${filtroActual === 'Pendiente' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-muted'}`}
                        onClick={() => setFiltroActual('Pendiente')}
                    >
                        Pendientes <span className="badge bg-warning text-dark ms-1">15</span>
                    </button>
                    
                    <button
                        className={`btn btn-sm ${filtroActual === 'En proceso' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-muted'}`}
                        onClick={() => setFiltroActual('En proceso')}
                    >
                        En proceso <span className="badge bg-info text-dark ms-1">12</span>
                    </button>

                    <button
                        className={`btn btn-sm ${filtroActual === 'Finalizada' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-muted'}`}
                        onClick={() => setFiltroActual('Finalizada')}
                    >
                        Finalizadas <span className="badge bg-success ms-1">21</span>
                    </button>
                </div>

                {/* Campo de entrada para filtrar e ingresar nueva solicitud */}
                <div className="d-flex flex-column flex-sm-row gap-2">
                    <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        placeholder="🔍︎ Buscar candidato por RUT o cargo"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)} // actualiza el estado de la búsqueda
                        style={{ minWidth: '250px' }}
                    />
                    <button className="btn btn-sm btn-primary fw-bold px-3 text-nowrap">
                        + Nueva Solicitud
                    </button>
                </div>

            </div>
        </div>
    );
}