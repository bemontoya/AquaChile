import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#0d3c61' }}>
      <div className="container-fluid px-4">
        <NavLink className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="bg-white text-primary rounded px-2 py-1 fs-6 fw-extrabold" style={{ color: '#0d3c61' }}>
            AC
          </span>
          AquaChile | Evaluaciones Psicolaborales
        </NavLink>

        <div className="navbar-nav ms-auto d-flex flex-row gap-3">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'active border-bottom border-2 border-white' : ''}`}
          >
            Dashboard
          </NavLink>

          <NavLink 
            to="/solicitudes" 
            className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'active border-bottom border-2 border-white' : ''}`}
          >
            Solicitudes
          </NavLink>

          <NavLink 
            to="/candidatos" 
            className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'active border-bottom border-2 border-white' : ''}`}
          >
            Candidatos
          </NavLink>

          <NavLink 
            to="/registro-candidato" 
            className={({ isActive }) => `btn btn-sm btn-light fw-bold ms-2 text-dark d-flex align-items-center gap-1 ${isActive ? 'shadow' : ''}`}
          >
            + Registrar Candidato
          </NavLink>
        </div>
      </div>
    </nav>
  );
}