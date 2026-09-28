import React from 'react';

export default function Navbar(){
    return(
        //navbar-expand-lg permite que el menú se adapte en móviles.
        //bg-white border-bottom le da el fondo blanco con una linea divisoria inferior.
        <nav className="navbar navbar-expand-lg bg-white border-bottom px-4 py-2">
            <div className="container-fluid">

                {/* Logo de la empresa*/}
                <a className="navbar-brand d-flex align-items-center me-4" href='#inicio'>
                    <span className="fw-bold text-primary fs-5 me-1">AquaChile</span>
                    <span className="text-secondary fs-6 fw-normal ms-1">PSICOLABORAL</span>

                </a>

                {/*Menu de navegacion*/}
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link text-secondary" href='#dashboard'>Dashboard</a>

                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-secondary" href='#candidatos'>Candidatos</a>
                        </li>
                        {/* Pestaña activa con borde azul inferior*/}
                        <li className="nav-item">
                            <a className="nav-link fw-bold text-dark border-bottom border-primary border-2 active" href="#solicitudes">
                                Solicitudes

                            </a>

                        </li>

                    </ul>

                    {/* Perfil del ususario (evaluador/evaluadora)*/}
                    <div className="d-flex align-items-center gap-2">
                        <div className="text-end me-2">
                            <div className="fw-bold small"> Dra. Marcela Vidal </div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem'}}>Evaluadora RRHH</div>

                        </div>
                        {/* Avatar con iniciales del usuario */}
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

    )
}