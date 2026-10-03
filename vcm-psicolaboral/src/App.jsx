import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SubHeader from './components/SubHeader';
import SolicitudesTabla from './components/SolicitudesTabla';
import CandidatoForm from './components/CandidatoForm'; // 1. Importamos el componente del formulario
import { solicitudesIniciales } from './data/solicitudesData';

export default function App() {
  // Estado para controlar la pantalla actual ('solicitudes' o 'candidatos')
  const [vistaActual, setVistaActual] = useState('solicitudes');

  // Estado para mantener la lista original de solicitudes
  const [solicitudes] = useState(solicitudesIniciales);

  // Estado para el filtro por estado seleccionado ('Todos', 'Pendiente', 'En proceso', 'Finalizada')
  const [filtroActual, setFiltroActual] = useState('Todos');

  // Estado para el texto escrito en el buscador
  const [busqueda, setBusqueda] = useState('');

  // Lógica de filtrado en tiempo real
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
      
      {/* 1. Navbar Superior: se le pasa 'vistaActual' y 'setVistaActual' para cambiar de pestaña */}
      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
      {/* 2. Contenido principal */}
      <main className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1300px' }}>
        
        {/* Renderizado condicional según la pestaña seleccionada */}
        {vistaActual === 'solicitudes' ? (
          <>
            {/* Encabezado con controles de búsqueda, filtros y botón para crear nuevo candidato */}
            <SubHeader 
              filtroActual={filtroActual} 
              setFiltroActual={setFiltroActual}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              onNuevaSolicitud={() => setVistaActual('candidatos')}
            />
            
            {/* Tabla con la información filtrada */}
            <SolicitudesTabla solicitudes={solicitudesFiltradas} />
          </>
        ) : (
          /* Renderiza el formulario cuando vistaActual es 'candidatos' */
          <CandidatoForm onCancelar={() => setVistaActual('solicitudes')} />
        )}

      </main>

      {/* Pie de pagina fijo al fondo */}
      <footer className="text-center text-muted py-3 border-top bg-white small mt-auto">
        © 2026 AquaChile S.A. — Sistema Interno de Evaluación Psicolaboral. Confidencial.
      </footer>
    </div>
  );
}