import { useEffect, useRef, useState } from 'react';
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
  const [menuAbierto,setMenuAbierto]=useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuAbierto) return;
    const cerrarSiAfuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', cerrarSiAfuera);
    return () => document.removeEventListener('mousedown', cerrarSiAfuera);
  }, [menuAbierto]);

  // Al entrar o salir de una sesión, el menú empieza cerrado
  useEffect(() => {
    setMenuAbierto(false);
  }, [usuario]);

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
            <div className='position-relative' ref={menuRef}>
              <button
                type='button'
                className='btn btn-sm p-0 border-0 bg-transparent d-flex align-items-center gap-2'
                onClick={()=>setMenuAbierto(!menuAbierto)}
                aria-expanded={menuAbierto}
                title='Menú de perfil'>
                  <span className='text-end d-none d-sm-block'>
                    <span className='d-block fw-bold small lh-sm'>{nombreMostrar}</span>
                  </span>
                  <span
                  className='bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold'
                  style={{ width: '36px', height: '36px'}}>{iniciales}</span>
                  <i className='bi bi-chevron-down text-muted small'
                  style={{transform: menuAbierto ? 'rotate(180deg)':'none'}}></i>
                </button>

                {menuAbierto && (
                 <> 
                  <div
                    className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm"
                    style={{ display: 'block', minWidth: '230px', zIndex: 1041 }}
                  >
                    <div className="px-3 py-2 border-bottom">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {usuario?.email || '—'}
                      </div>
                      <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle fw-normal mt-2">
                        {rolMostrar}
                      </span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {onLogout && (
                      <button
                        type="button"
                        className="dropdown-item small text-danger d-flex align-items-center gap-2"
                        onClick={onLogout}
                      >
                        <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                      </button>
                    )}
                  </div>
                </>
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