import React from 'react';

// Recibimos 'setVistaActual' como prop para poder redirigir al usuario al hacer clic en los botones
export default function Dashboard({ setVistaActual }) {
  return (
    <div className="w-100">
      
      {/* Encabezado del dashboard */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <div className="text-primary small fw-bold text-uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-grid-fill me-1"></i> Módulo Central de Evaluación
          </div>
          <h2 className="h3 fw-bold mb-1 text-dark">Gestión de Evaluaciones Psicolaborales</h2>
          <p className="text-muted small mb-0">Panel de control y métricas globales del proceso de selección</p>
        </div>

        <div>
          <span className="badge bg-light text-secondary border px-3 py-2 fw-normal d-flex align-items-center gap-2">
            <span className="bg-primary rounded-circle d-inline-block" style={{ width: '8px', height: '8px' }}></span>
            Última actualización hoy a las 08:30 hrs
          </span>
        </div>
      </div>

      {/* Métricas superiores */}
      <div className="row g-3 mb-4">
        
        {/* Total candidatos */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>
                Total Candidatos
              </span>
            </div>
            <div className="h2 fw-bold text-dark mb-0">148</div>
          </div>
        </div>

        {/* Pendientes */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>
                Pendientes
              </span>
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill fw-medium small">
                • Por asignar
              </span>
            </div>
            <div className="h2 fw-bold text-dark mb-0">23</div>
          </div>
        </div>

        {/* En proceso */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>
                En Proceso
              </span>
              <span className="badge bg-primary-subtle text-primary rounded-pill fw-medium small">
                • En curso
              </span>
            </div>
            <div className="h2 fw-bold text-dark mb-0">18</div>
          </div>
        </div>

        {/* Finalizadas */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>
                Finalizadas
              </span>
              <span className="badge bg-success-subtle text-success rounded-pill fw-medium small">
                <i className="bi bi-check-circle me-1"></i> Completas
              </span>
            </div>
            <div className="h2 fw-bold text-dark mb-0">107</div>
          </div>
        </div>

      </div>

      {/* Módulos principales */}
      <div className="row g-4 mb-4">
        
        {/* Gestión de candidatos */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
            
            <div className="card-body p-4 flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <span 
                    className="rounded d-inline-flex align-items-center justify-content-center p-2" 
                    style={{ backgroundColor: '#0d3c61', width: '38px', height: '38px' }}
                  >

                    <svg 
                        width="22" 
                        height="22" 
                        viewBox="0 0 24 24" //dibuja un lienzo de 24x24 unidades 
                        fill="none" 
                        stroke="#82b1ff" //color de las lineas del icono 
                        strokeWidth="2.2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        >
                        {/* cabeza del usuario */}
                        <circle cx="10" cy="7" r="4" /> {/* dibuja un circulo usando las coordenadas que aparecen ahí */}
                        {/* cuerpo del usuario */}
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                        {/* lupa  */}
                        <circle cx="16.5" cy="15.5" r="3.5" />
                        <line x1="19" y1="18" x2="22" y2="21" /> {/* dibuja una linea para el mango de la lupa */}
                    </svg>
               
                  </span>
                  <span style={{ color: '#0d3c61' }} className="fw-bold">
                    Gestión de Candidatos
                  </span>
                </h5>
              </div>

              <p className="text-muted small mb-4">
                Administración centralizada de postulantes, registro integral de fichas técnicas, historial de postulaciones y consolidado de perfiles psicolaborales para plantas y centros de cultivo.
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-muted small text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Últimos Candidatos Agregados
                </span>
                <span className="text-muted small">Total activos: <strong>148</strong></span>
              </div>

              {/* lista de candidatos */}
              <div className="d-flex flex-column gap-2 mb-3">
                
                {/* candidato 1 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-secondary-subtle text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                      <i className="bi bi-person-fill fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark small">Tomás Sanhueza Muñoz</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        RUT: 18.421.905-2 • Jefe de Turno Planta Chinquihue
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark border fw-normal small">Hace 2h</span>
                </div>

                {/* candidato 2 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-secondary-subtle text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                      <i className="bi bi-person-fill fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark small">Camila Valenzuela Pérez</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        RUT: 19.104.382-K • Analista de Aseguramiento Calidad
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark border fw-normal small">Ayer</span>
                </div>

                {/* candidato 3 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-secondary-subtle text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                      <i className="bi bi-person-fill fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark small">Esteban Morales Leal</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        RUT: 16.789.214-4 • Técnico en Mantención Frío
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark border fw-normal small">2 días</span>
                </div>

              </div>
            </div>

            {/* botón módulo candidatos */}
            <div className="card-footer bg-transparent border-0 p-3 pt-0">
              <button 
                type="button"
                className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}
                onClick={() => setVistaActual('candidatos')}
              >
                Ir a Gestión de Candidatos <i className="bi bi-arrow-right"></i>
              </button>
            </div>

          </div>
        </div>

        {/* gestión de solicitudes */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
            
            <div className="card-body p-4 flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <span 
                    className="rounded d-inline-flex align-items-center justify-content-center text-white" 
                    style={{ backgroundColor: '#0d3c61', width: '38px', height: '38px' }}
                  >
                    <i className="bi bi-check2-square fs-5"></i>
                  </span>
                  <span style={{ color: '#0d3c61' }} className="fw-bold">
                    Gestión de Solicitudes
                  </span>
                </h5>
                <span className="badge bg-light text-secondary border fw-normal">Flujo Psicométrico</span>
              </div>

              <p className="text-muted small mb-4">
                Control integral del flujo evaluativo, asignación de baterías técnicas, calendarización con psicólogos evaluadores y entrega formal de informes de aptitud laboral.
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-muted small text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Evaluaciones Recientes Prioritarias
                </span>
                <span className="text-muted small"><strong>41</strong> activas</span>
              </div>

              {/* lista de solicitudes recientes */}
              <div className="d-flex flex-column gap-2 mb-3">
                
                {/* evaluación 1 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div>
                    <div className="fw-bold text-dark small">
                      SOL-2026-089 <span className="fw-normal text-muted">• Piscicultura Quellón</span>
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      Psic. Asignado: Claudio Arriagada • Test DISC
                    </div>
                  </div>
                  <span 
                    className="badge rounded-pill fw-semibold px-3 py-1"
                    style={{ 
                      backgroundColor: '#fff3cd', 
                      color: '#856404', 
                      border: '1px solid #ffebaa',
                      fontSize: '0.75rem'
                    }}
                  >
                    Pendiente
                  </span>
                </div>

                {/* evaluación 2 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div>
                    <div className="fw-bold text-dark small">
                      SOL-2026-088 <span className="fw-normal text-muted">• Logística Puerto Montt</span>
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      Psic. Asignada: Dra. Marcela Vidal • Entrevista por Competencias
                    </div>
                  </div>
                  <span className="badge bg-primary-subtle text-primary fw-medium small">En Proceso</span>
                </div>

                {/* evaluación 3 */}
                <div className="d-flex justify-content-between align-items-center p-2 rounded border bg-light-subtle">
                  <div>
                    <div className="fw-bold text-dark small">
                      SOL-2026-084 <span className="fw-normal text-muted">• Operaciones Calbuco</span>
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      Psic. Asignada: Claudia Rios • Informe Psicolaboral Emitido
                    </div>
                  </div>
                  <span className="badge bg-light text-secondary border fw-medium small">Finalizada</span>
                </div>

              </div>
            </div>

            {/* boton modulo solicitudes */}
            <div className="card-footer bg-transparent border-0 p-3 pt-0">
              <button 
                type="button"
                className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}
                onClick={() => setVistaActual('solicitudes')}
              >
                Ir a Gestión de Solicitudes <i className="bi bi-arrow-right"></i>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}