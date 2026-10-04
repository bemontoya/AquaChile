import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SubHeader from './components/SubHeader';
import SolicitudesTabla from './components/SolicitudesTabla';
import CandidatoForm from './components/CandidatoForm';
import Dashboard from './components/Dashboard'; // Importamos el Dashboard
import { solicitudesIniciales } from './data/solicitudesData';

export default function App() {
  // estado para controlar la pestaña activa ('dashboard', 'candidatos' o 'solicitudes')
  const [vistaActual, setVistaActual] = useState('dashboard');

  const [solicitudes] = useState(solicitudesIniciales);
  const [filtroActual, setFiltroActual] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const solicitudesFiltradas = solicitudes.filter((item) => {
    const coincideEstado = filtroActual === 'Todos' || item.estado === filtroActual;
    const coincideBusqueda = 
      item.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rut.includes(busqueda);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Navbar con control de pestañas */}
      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
      {/* renderizado dinámico de la vista elegida */}
      <main className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1300px' }}>
        {vistaActual === 'dashboard' && (
          <Dashboard setVistaActual={setVistaActual} />
        )}

        {vistaActual === 'candidatos' && (
          <CandidatoForm onCancelar={() => setVistaActual('solicitudes')} />
        )}

        {vistaActual === 'solicitudes' && (
          <>
            <SubHeader 
              filtroActual={filtroActual} 
              setFiltroActual={setFiltroActual}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              onNuevaSolicitud={() => setVistaActual('candidatos')}
            />
            <SolicitudesTabla solicitudes={solicitudesFiltradas} />
          </>
        )}
      </main>

      {/* pie de página dinámico */}
      <footer className="text-center text-muted py-3 border-top bg-white small mt-auto d-flex justify-content-between px-4">
        <span>© 2024 AquaChile S.A. — Sistema Interno de Evaluación Psicolaboral. Confidencial.</span>
        <span>Servidor Central Puerto Montt <span className="text-success">•</span></span>
      </footer>
    </div>
  );
}