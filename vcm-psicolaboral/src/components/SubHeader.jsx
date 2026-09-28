import React from 'react';

//Se reciben propiedades desde App.jsx para controlar los ffiltros y la búsqueda
export default function SubHeader({ filtroActual, setFiltroActual, busqueda, setBusqueda }){
    return (
        <div className="mb-4">
            {/* subtitulo */}
            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px'}}>
                GESTIÓN DEL TALENTO ACUÍCOLA • Región de Los Lagos & Aysén

            </small>

            {/* titulo de la pantalla e indicadores globales */}
            <div className="d-flex justify-content-between align-items-center mt-1 mb-3">
                <div>
                    <h2 className="h4 fw-bold mb-1">Listado de SOlicitudes de Evaluación</h2>
                    <p className="text-muted small mb-0">Control y seguimiento del estado de los procesos psicolaborales activos.</p>
                </div>

                {/* metricas de estado rápido */}
                <div className="d-flex gap-2">
                    <span className="badge bg-light text-dark border p-2 fw-normal">☑ 48 Procesos</span>
                    <span className="badge bg-light text-dark border p-2 fw-normal">96.4% Cumplimiento SLA</span>

                </div>

            </div>

            {/* filtros y botones */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">

                {/* grupo de botones para cambiar el filtro */}
                <div className="btn-group bg-light p-1 rounded border">
                    <button
                        className={`btn btn-sm ${filtroActual === 'Todos' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-muted'}`}
                        onClick={() => setFiltroActual('Todos')}
                    >
                        Todos <span className="badge bg-secondary ms-1">48</span>

                    </button>

                    <button></button>

                </div>
            </div>

            

        </div>
    )
}