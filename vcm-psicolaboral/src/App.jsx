import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SubHeader from './components/SubHeader';
import SolicitudesTabla from './components/SolicitudesTabla';
import { solicitudesIniciales } from './data/solicitudesData';

export default function App() {
  // Estado para mantener la lista original de solicitudes
  //Contiene la lista completa con todas las solicitudes del sistema
  const [solicitudes] = useState(solicitudesIniciales);

  // Estado para el filtro por estado selecionado ('Todos', 'Pendiente', 'En proceso', 'Finalizada')
  // Guarda el filtro por estado seleccionado(Por defecto en 'Todos')
  const [filtroActual, setFiltroActual] = useState('Todos');

  // Estado para el texto escrito en el buscador
  //Guarda el texto escrito por el usuaario en la barra de busqueda(Por defecto está vacío '')
  const [busqueda, setBusqueda] = useState('');

  // Lógica de filtrado en tiempo real
  const solicitudesFiltradas = solicitudes.filter((item) => {
    // Verifica si coincide el estado seleccionado
    const coincideEstado = filtroActual === 'Todos' || item.estado === filtroActual;
    
    // Verifica si la búsqueda coincide con el nombre del candidato, cargo o rut
    const coincideBusqueda = 
      item.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rut.includes(busqueda);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="bg-light min-vh-100">
      {/* 1. Navbar Superior */}
      <Navbar />
      
      {/* 2. Contenido Principal */}
      <main className="container-fluid px-4 py-4" style={{ maxWidth: '1300px' }}>
        {/* Encabezado con controles de búsqueda y filtros */}
        {/* Se pasa el estado de la busqueda y los filtros para que los botones de la interfaz puedan leer y modificar esos valores */}
        <SubHeader 
          filtroActual={filtroActual} 
          setFiltroActual={setFiltroActual}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
        />
        
        {/* Tabla con la información filtrada */}
        <SolicitudesTabla solicitudes={solicitudesFiltradas} />
      </main>

      {/* Pie de pagina */}
      <footer className="text-center text-muted py-3 border-top mt-5 small bg-white">
        © 2024 AquaChile S.A. — Sistema Interno de Evaluación Psicolaboral. Confidencial.
      </footer>
    </div>
  );
}