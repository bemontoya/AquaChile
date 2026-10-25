import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import KanbanSolicitudes from './components/KanbanSolicitudes' // Importamos tu Kanban
import SubHeader from './components/SubHeader'
import CandidatosTabla from './components/CandidatosTabla'
import RegistroCandidato from './components/RegistroCandidato'
import { solicitudesIniciales } from './data/solicitudesData'
import { candidatosIniciales } from './data/candidatosData'
import { crearSolicitudDesdeCandidato } from './utils/solicitudes'

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
    setCandidatos((prev) => [nuevoCandidato, ...prev])

    // Todo postulante nuevo entra a la cola como solicitud Pendiente
    setSolicitudes((prev) => [
      crearSolicitudDesdeCandidato(nuevoCandidato, prev), 
      ...prev
    ])

    navigate('/candidatos')
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main className="container-fluid px-4 py-4">
        <Routes>
          {/* Ruta del Dashboard */}
          <Route 
            path="/" 
            element={<Dashboard solicitudes={solicitudes} candidatos={candidatos} />} 
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard solicitudes={solicitudes} candidatos={candidatos} />} 
          />

          {/* Ruta de Solicitudes con el tablero Kanban y Drag and Drop */}
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
                <KanbanSolicitudes 
                  solicitudes={solicitudesFiltradas} 
                  setSolicitudes={setSolicitudes} 
                />
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
            element={<RegistroCandidato 
              onAgregar={handleGuardarCandidato}
              onCancelar={() => navigate('/candidatos')} 
            />}
          />
        </Routes>
      </main>
    </div>
  )
}