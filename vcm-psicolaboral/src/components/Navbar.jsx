import { NavLink } from 'react-router-dom';

export default function Navbar({ usuario, onLogout }) {
  const nombreMostrar = usuario?.nombre || 'Dra. Marcela Vidal';
  const rolMostrar = usuario?.rol === 'ANALISTA' ? 'Analista Reclutamiento' : 'Evaluadora RRHH';
  const iniciales = nombreMostrar
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <nav className="navbar navbar-expand bg-white border-bottom px-2 px-md-4 py-2 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">

        {/* Logo de la empresa */}
        <NavLink
          className="navbar-brand d-flex align-items-center me-4"
          to={usuario ? '/dashboard' : '/empleos'}
        >
          <img
            src="/Logo-Aqua.png"
            alt="Logo AquaChile"
            width="150"
            className="me-2"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-secondary fs-6 fw-normal ms-1">PSICOLABORAL</span>
        </NavLink>

        {/* Menú de navegación */}
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {usuario && (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`
                    }
                    to="/dashboard"
                  >
                    Dashboard
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`
                    }
                    to="/candidatos"
                  >
                    Candidatos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`
                    }
                    to="/solicitudes"
                  >
                    Solicitudes
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`
                    }
                    to="/ofertas-admin"
                  >
                    Ofertas
                  </NavLink>
                </li>
              </>
            )}

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`
                }
                to="/empleos"
              >
                Portal Empleos
              </NavLink>
            </li>
          </ul>

          {/* Perfil del usuario o Acceso Interno */}
          {usuario ? (
            <div className="d-flex align-items-center gap-2">
              <div className="text-end me-2">
                <div className="fw-bold small">{nombreMostrar}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{rolMostrar}</div>
              </div>

              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '36px', height: '36px' }}
              >
                {iniciales}
              </div>

              {onLogout && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={onLogout}
                  title="Cerrar sesión"
                >
                  <i className="bi bi-box-arrow-right"></i> Salir
                </button>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-sm text-white fw-semibold px-3" style={{ backgroundColor: '#0d3c61' }}>
              Acceso RRHH
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}