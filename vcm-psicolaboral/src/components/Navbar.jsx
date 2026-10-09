import React from 'react';

// Recibimos las propiedades desde App.jsx para saber qué pestaña está activa y cambiarla
export default function Navbar({ vistaActual, setVistaActual }){
    return(
        <nav className="navbar navbar-expand bg-white border-bottom px-2 px-md-4 py-2 shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">

                {/* Logo de la empresa (Redirige a Dashboard) */}
                <a 
                  className="navbar-brand d-flex align-items-center me-4" 
                  href="#dashboard"
                  onClick={(e) => { e.preventDefault(); setVistaActual('dashboard'); }}
                >
                    <img
                        src="/Logo-Aqua.png"
                        alt="Logo AquaChile"
                        width="150"
                        className="me-2"
                        style={{objectFit: 'contain'}}
                    />
                    <span className="text-secondary fs-6 fw-normal ms-1">PSICOLABORAL</span>
                </a>

                {/* Menú de navegación */}
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        
                        {/* Pestaña Dashboard */}
                        <li className="nav-item">
                            <a 
                              className={`nav-link ${vistaActual === 'dashboard' ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`} 
                              href="#dashboard"
                              onClick={(e) => { e.preventDefault(); setVistaActual('dashboard'); }}
                            >
                              Dashboard
                            </a>
                        </li>

                        {/* Pestaña Candidatos */}
                        <li className="nav-item">
                            <a 
                              className={`nav-link ${vistaActual === 'candidatos' ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`} 
                              href="#candidatos"
                              onClick={(e) => { e.preventDefault(); setVistaActual('candidatos'); }}
                            >
                              Candidatos
                            </a>
                        </li>

                        {/* pestaña de solicitudes */}
                        <li className="nav-item">
                            <a 
                              className={`nav-link ${vistaActual === 'solicitudes' ? 'fw-bold text-dark border-bottom border-primary border-2 active' : 'text-secondary'}`} 
                              href="#solicitudes"
                              onClick={(e) => { e.preventDefault(); setVistaActual('solicitudes'); }}
                            >
                                Solicitudes
                            </a>
                        </li>

                    </ul>

                    {/* perfil del usuario */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="text-end me-2">
                            <div className="fw-bold small"> Dra. Marcela Vidal </div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem'}}>Evaluadora RRHH</div>
                        </div>

                        <div 
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '36px', height: '36px'}}
                        >
                            MV
                        </div>
                    </div>

                </div>

            </div>
        </nav>
    );
}