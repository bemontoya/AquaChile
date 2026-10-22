import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import SolicitudesTabla from './components/SolicitudesTabla'
import SubHeader from './components/SubHeader'
import CandidatosTabla from './components/CandidatosTabla'
import RegistroCandidato from './components/RegistroCandidato'
import { solicitudesIniciales } from './data/solicitudesData'
import { candidatosIniciales } from './data/candidatosData'

export default function App() {
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales)
  const [candidatos, setCandidatos] = useState(candidatosIniciales)
  const [filtroActual, setFiltroActual] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  // Filtrado de solicitudes
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstado = filtroActual === 'Todos' || s.estado === filtroActual
    const coincideBusqueda =
      s.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.cargo.toLowerCase().includes(busqueda.toLowerCase())
    return coincideEstado && coincideBusqueda
  })

  // Función para agregar un nuevo candidato
  const handleGuardarCandidato = (nuevoCandidato) => {
    setCandidatos([nuevoCandidato, ...candidatos])
    navigate('/candidatos') // Redirige automáticamente a la tabla de candidatos
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* El Navbar ahora usará Links para la navegación */}
      <Navbar />

      <main className="container-fluid px-4 py-4">
        <Routes>
          {/* Ruta del Dashboard */}
          <Route 
            path="/" 
            element={<Dashboard solicitudes={solicitudes} candidatos={candidatos} />} 
          />

          {/* Ruta de Solicitudes */}
          <Route
            path="/solicitudes"
            element={
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
            }
          />

          {/* Ruta de Candidatos */}
          <Route
            path="/candidatos"
            element={<CandidatosTabla candidatos={candidatos} />}
          />

          {/* Ruta para Registrar Candidato */}
          <Route
            path="/registro-candidato"
            element={<RegistroCandidato onGuardar={handleGuardarCandidato} />}
          />
        </Routes>
      </main>
    </div>
  )
}