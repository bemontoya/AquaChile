//Barras horizontales: cuántas evaluaciones tiene asignadas cada psicólogo.
//Usa solo los datos que ya llegan por props. sin dependencias nuevas.

const COLOR_PRIMARIO = '#0d3c61';

export default function GraficoPorEvaluador({solicitudes=[]}){
    const conteo=solicitudes.reduce((acc,s)=>{
        const nombre=s.evaluador || 'Por asignar';
        acc[nombre]=(acc[nombre] || 0)+1;
        return acc;
    }, {});

    const filas=Object.entries(conteo)
    .map(([evaluador,cantidad])=>({evaluador,cantidad}))
    .filter((f)=>f.evaluador !== 'Por asignar')
    .sort((a,b)=> b.cantidad - a.cantidad)
    .slice(0,5);

    const max=Math.max(...filas.map((f)=>f.cantidad),1);
    return (
        <div className="card rounded-3 h-100" style={{border:'1px solid #e5e7eb', boxShadow:'none'}}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <span
                      className="rounded d-inline-flex align-items-center justify-content-center p-2"
                      style={{ backgroundColor: '#0d3c61', width: '38px', height: '38px' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                           stroke="#82b1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span style={{ color: '#0d3c61' }} className="fw-bold">Carga por Evaluador</span>
                  </h5>
                  <span className="badge bg-light text-secondary border fw-normal">
                    {filas.length} evaluador(es)
                  </span>
                </div>

                <p className="text-muted small mb-4">
                  Distribución de la carga evaluativa por psicólogo
                </p>

                {filas.length === 0 && (
                  <p className="text-muted small mb-0">Sin evaluadores asignados.</p>
                )}

                <div className="d-flex flex-column gap-3">
                  {filas.map((f) => (
                    <div key={f.evaluador}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold text-dark text-truncate" title={f.evaluador}>
                          {f.evaluador}
                        </span>
                        <span className="text-muted">{f.cantidad}</span>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${(f.cantidad / max) * 100}%`, backgroundColor: COLOR_PRIMARIO }}
                          aria-valuenow={f.cantidad}
                          aria-valuemin={0}
                          aria-valuemax={max}
                        />
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    );
}