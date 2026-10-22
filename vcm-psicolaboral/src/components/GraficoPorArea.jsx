import React from 'react';

// Gráfico de dona (CSS/Bootstrap) con las evaluaciones agrupadas por unidad
const PALETA = ['#0a2a43', '#0d3c61', '#1565a7', '#4aa8e0', '#9fd3f0'];

export default function GraficoPorArea({ solicitudes = [] }) {
    const conteo = solicitudes.reduce((acc, s) => { // contamos cuántas solicitudes hay por unidad
        acc[s.area] = (acc[s.area] || 0) + 1;
        return acc;
    }, {});

    const total = solicitudes.length || 1;

    const filas = Object.entries(conteo)
        .map(([unidad, cantidad]) => ({
            unidad,
            cantidad,
            porcentaje: Math.round((cantidad / total) * 100)
        }))
        .sort((a, b) => b.cantidad - a.cantidad); // ordenamos de mayor a menor

    // Armamos el conic-gradient con cortes acumulados (sin mutar variables)
    const porcentajes = filas.map((fila) => (fila.cantidad / total) * 100);
    const acumulados = porcentajes.map((_, i) => porcentajes.slice(0, i + 1).reduce((a, b) => a + b, 0));
    const segmentos = filas.map((fila, i) => {
        const fin = acumulados[i];
        const inicio = i === 0 ? 0 : acumulados[i - 1];
        return `${PALETA[i % PALETA.length]} ${inicio}% ${fin}%`;
    });
    const gradiente = `conic-gradient(${segmentos.join(', ')})`;

    return (
        <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        
                        {/* icono SVG del gráfico de dona */}
                        <span 
                            className="rounded d-inline-flex align-items-center justify-content-center p-2"
                            style={{ backgroundColor: '#0d3c61', width: '38px', height: '38px' }}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#82b1ff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                <path d="M22 12A10 10 0 0 0 12 2v10z" />
                            </svg>
                        </span>

                        <span style={{ color: '#0d3c61' }} className="fw-bold">
                            Evaluaciones por Unidad
                        </span>
                    </h5>
                    <span className="badge bg-light text-secondary border fw-normal">
                        {solicitudes.length} proceso(s)
                    </span>
                </div>

                <div className="d-flex flex-column align-items-center gap-4">
                    {/* dona con total al centro */}
                    <div className="position-relative flex-shrink-0" style={{ width: '260px', height: '260px' }}>
                        <div className="rounded-circle w-100 h-100" style={{ background: gradiente }}></div>
                        <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white d-flex flex-column align-items-center justify-content-center shadow-sm"
                            style={{ width: '120px', height: '120px' }}>
                            <span className="h3 fw-bold text-dark mb-0">{solicitudes.length}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Total</span>
                        </div>
                    </div>

                  
                    <div className="d-flex flex-column gap-2 w-100">
                        {filas.map((fila, i) => (
                            <div key={fila.unidad} className="d-flex align-items-center justify-content-between gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="rounded-circle d-inline-block flex-shrink-0"
                                        style={{ backgroundColor: PALETA[i % PALETA.length], width: '12px', height: '12px' }}></span>
                                    <span className="text-dark small fw-semibold">{fila.unidad}</span>
                                </div>
                                <span className="text-muted small">{fila.cantidad} ({fila.porcentaje}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}