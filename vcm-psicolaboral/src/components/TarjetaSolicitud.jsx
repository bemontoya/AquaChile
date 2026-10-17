export default function TarjetaSolicitud({solicitud}){
    const badge = solicitud.estado === 'Finalizada' 
    ? 'bg-light text-secondary border'
    : solicitud.estado === 'En proceso'
        ? 'bg-primary-subtle text-primary'
        : 'bg-warning-subtle text-warning-emphasis border';

    return(
        <div className="card border-0 shadow-sm rounded-3 mb-2">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark small">{solicitud.id}</span>
                    <span className={`badge rounded-pill fw-medium ${badge}`}>{solicitud.estado}</span>
                </div>
            <div className="fw-semibold text-dark">{solicitud.candidato}</div>
            <div className="text-muted small mb-2">RUT: {solicitud.rut}</div>
            <div className="text-muted small"><i className="bi bi-briefcase me-1"></i>{solicitud.cargo}</div>
            <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{solicitud.ubicacion}</div>
            <div className="text-muted small"><i className="bi bi-person me-1"></i>{solicitud.evaluador}</div>
            </div>
        </div>
    );
};