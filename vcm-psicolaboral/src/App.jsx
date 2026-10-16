import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SubHeader from './components/SubHeader';
import SolicitudesTabla from './components/SolicitudesTabla';
import CandidatosTabla from './components/CandidatosTabla';
import RegistroCandidato from './components/RegistroCandidato';
import Dashboard from './components/Dashboard';

import { solicitudesIniciales } from './data/solicitudesData';
import { candidatosIniciales } from './data/candidatosData';

export default function App() {
  // Pestaña inicial: 'candidatos'
  const [vistaActual, setVistaActual] = useState('candidatos');

  const [solicitudes] = useState(solicitudesIniciales);
  const [candidatos, setCandidatos] = useState(candidatosIniciales);

  const [filtroActual, setFiltroActual] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrado de solicitudes por búsqueda y estado
  const solicitudesFiltradas = solicitudes.filter((item) => {
    const coincideEstado = filtroActual === 'Todos' || item.estado === filtroActual;
    const coincideBusqueda = 
      item.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rut.includes(busqueda);

    return coincideEstado && coincideBusqueda;
  });

  //Agrega un candidato nuevo al estado y vuelve al lsitado
  const agregarCandidato = (nuevoCandidato) => {
    setCandidatos((prev) => [...prev, nuevoCandidato]);
    setVistaActual('candidatos');
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 1. Navbar con los 4 botones principales */}
      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
      {/* 2. Área principal dinámica */}
      <main className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1300px' }}>
        
        {/* Vista: Dashboard */}
        {vistaActual === 'dashboard' && (
          <Dashboard 
            setVistaActual={setVistaActual}
            solicitudes={solicitudes}
            candidatos={candidatos}
          />
        )}

        {/* Vista: Candidatos (Listado/Tabla) */}
        {vistaActual === 'candidatos' && (
          <CandidatosTabla 
            candidatos={candidatos} 
            onNuevoCandidato={() => setVistaActual('nuevo_candidato')} 
          />
        )}

        {/* Vista: Registro Candidatos (Formulario) */}
        {vistaActual === 'nuevo_candidato' && (
          <RegistroCandidato 
            onAgregar={agregarCandidato}
            onCancelar={() => setVistaActual('candidatos')} 
          />
        )}

        {/* Vista: Solicitudes (Abre la tabla de solicitudes) */}
        {vistaActual === 'solicitudes' && (
          <>
            <SubHeader 
              filtroActual={filtroActual} 
              setFiltroActual={setFiltroActual}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              solicitudes={solicitudes}
            />
            <SolicitudesTabla solicitudes={solicitudesFiltradas} />
          </>
        )}

      </main>

      {/* Pie de página corporativo */}
      <footer className="text-center text-muted py-3 border-top bg-white small mt-auto d-flex justify-content-between px-4">
        <span>© 2024 AquaChile S.A. — Sistema Interno de Evaluación Psicolaboral. Confidencial.</span>
        <span>Servidor Central Puerto Montt <span className="text-success">•</span></span>
      </footer>
    </div>
  );
}