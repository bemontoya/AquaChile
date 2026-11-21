import { useNavigate } from 'react-router-dom';
import GraficoPorArea from './GraficoPorArea';

const COLOR_PRIMARIO = '#0d3c61';
const tarjeta = { border: '1px solid #e5e7eb', boxShadow: 'none' };

// Máximo de filas visibles en cada lista: la tarjeta crece con los registros
// hasta este límite. Usa Infinity para mostrar todos.
const MAX_SOLICITUDES_VISIBLES = 8;
const MAX_CANDIDATOS_VISIBLES = 5;

// Único color "de estado": un punto discreto junto al texto
const COLOR_ESTADO = {
  Pendiente: '#b7791f',
  'En proceso': COLOR_PRIMARIO,
  Finalizada: '#9ca3af',
};

function Punto({ color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}

function Estado({ estado }) {
  return (
    <span className="d-inline-flex align-items-center gap-2 small text-secondary text-nowrap">
      <Punto color={COLOR_ESTADO[estado] || '#9ca3af'} />
      {estado}
    </span>
  );
}

function Metrica({ titulo, valor, nota, color }) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="card rounded-3 p-3 h-100" style={tarjeta}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span
            className="text-muted text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
          >
            {titulo}
          </span>
          {nota && (
            <span className="d-inline-flex align-items-center gap-1 text-muted small">
              <Punto color={color} />
              {nota}
            </span>
          )}
        </div>
        <div className="fs-2 fw-semibold text-dark lh-1">{valor}</div>
      </div>
    </div>
  );
}

function EncabezadoSeccion({ titulo, enlace, onClick }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <h5 className="fs-6 fw-semibold text-dark mb-0">{titulo}</h5>
      <button
        type="button"
        className="btn btn-link btn-sm p-0 text-decoration-none link-nav"
        onClick={onClick}
      >
        {enlace} <i className="bi bi-arrow-right ms-1"></i>
      </button>
    </div>
  );
}

// Recibimos 'solicitudes' y 'candidatos' como props
export default function Dashboard({ solicitudes = [], candidatos = [] }) {
  const navigate = useNavigate();

  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length;
  const enProceso = solicitudes.filter((s) => s.estado === 'En proceso').length;
  const finalizadas = solicitudes.filter((s) => s.estado === 'Finalizada').length;
  const activas = pendientes + enProceso;
  // 1) filter: dejamos solo las solicitudes que aún no están finalizadas
  // 2) reverse: damos vuelta la lista para que las más nuevas queden primero
  // 3) slice(0, N): tomamos solo las primeras N filas (el límite de arriba)
  const prioritarias = solicitudes
    .filter((s) => s.estado !== 'Finalizada')
    .reverse()
    .slice(0, MAX_SOLICITUDES_VISIBLES);

  // [...candidatos] hace una copia, así reverse() no modifica la lista original
  const ultimosCandidatos = [...candidatos].reverse().slice(0, MAX_CANDIDATOS_VISIBLES);

  return (
    <div className="w-100">
      <style>{`
        .link-nav { color: ${COLOR_PRIMARIO}; font-weight: 500; }
        .link-nav:hover { color: ${COLOR_PRIMARIO}; text-decoration: underline !important; }
      `}</style>

      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="h4 fw-semibold text-dark mb-1">Gestión de evaluaciones psicolaborales</h1>
        <p className="text-muted small mb-0">
          Panel de control y métricas globales del proceso de selección
        </p>
      </div>

      {/* Métricas */}
      <div className="row g-3 mb-4">
        <Metrica titulo="Total solicitudes" valor={solicitudes.length} />
        <Metrica titulo="Pendientes" valor={pendientes} nota="Por asignar" color={COLOR_ESTADO.Pendiente} />
        <Metrica titulo="En proceso" valor={enProceso} nota="En curso" color={COLOR_ESTADO['En proceso']} />
        <Metrica titulo="Finalizadas" valor={finalizadas} nota="Completas" color={COLOR_ESTADO.Finalizada} />
      </div>

      {/* Solicitudes + gráfico (cada tarjeta toma la altura de su contenido) */}
      <div className="row g-4 mb-4 align-items-start">
        <div className="col-12 col-lg-5 order-2">
          <GraficoPorArea solicitudes={solicitudes} />
        </div>

        <div className="col-12 col-lg-7 order-1">
          <div className="card rounded-3" style={tarjeta}>
            <div className="card-body p-4">
              <EncabezadoSeccion
                titulo="Gestión de solicitudes"
                enlace="Ver todas"
                onClick={() => navigate('/solicitudes')}
              />
              <p className="text-muted small mb-4">
                Control del flujo evaluativo, asignación de baterías y entrega de informes de aptitud laboral.
              </p>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span
                  className="text-muted text-uppercase"
                  style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
                >
                  Evaluaciones recientes prioritarias
                </span>
                <span className="text-muted small">
                  <strong className="text-dark">{activas}</strong> activas
                </span>
              </div>

              <ul className="list-group list-group-flush">
                {prioritarias.length === 0 && (
                  <li className="list-group-item px-0 text-muted small">Sin solicitudes activas.</li>
                )}
                {prioritarias.map((s) => (
                  <li
                    key={s.id}
                    className="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-medium text-dark small">
                        {s.codigo || s.id} <span className="fw-normal text-muted">· {s.area}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Psic. {s.evaluador} · {s.cargo}
                      </div>
                    </div>
                    <Estado estado={s.estado} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Candidatos */}
      <div className="card rounded-3 mb-4" style={tarjeta}>
        <div className="card-body p-4">
          <EncabezadoSeccion
            titulo="Gestión de candidatos"
            enlace="Ver todos"
            onClick={() => navigate('/candidatos')}
          />
          <p className="text-muted small mb-4">
            Administración de postulantes, fichas técnicas y perfiles psicolaborales para plantas y centros de cultivo.
          </p>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="text-muted text-uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
            >
              Últimos candidatos agregados
            </span>
            <span className="text-muted small">
              Total activos: <strong className="text-dark">{candidatos.length}</strong>
            </span>
          </div>

          <ul className="list-group list-group-flush">
            {ultimosCandidatos.length === 0 && (
              <li className="list-group-item px-0 text-muted small">Aún no hay candidatos registrados.</li>
            )}
            {ultimosCandidatos.map((c) => (
              <li
                key={c.id}
                className="list-group-item px-0 d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-light border text-secondary fw-semibold rounded-circle d-flex align-items-center justify-content-center small"
                    style={{ width: 36, height: 36 }}
                  >
                    {c.iniciales}
                  </div>
                  <div>
                    <div className="fw-medium text-dark small">{c.nombre}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      RUT: {c.rut} · {c.cargo}
                    </div>
                  </div>
                </div>
                <span className="text-muted small text-nowrap">
                  <i className="bi bi-geo-alt me-1"></i>
                  {c.ubicacion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}