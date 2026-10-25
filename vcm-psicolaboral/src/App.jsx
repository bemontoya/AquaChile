import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import KanbanSolicitudes from './components/KanbanSolicitudes' // Importamos tu Kanban
import SubHeader from './components/SubHeader'
import CandidatosTabla from './components/CandidatosTabla'
import RegistroCandidato from './components/RegistroCandidato'
import SolicitudesTabla from './components/SolicitudesTabla'
import { solicitudesIniciales } from './data/solicitudesData'
import { candidatosIniciales } from './data/candidatosData'
import { crearSolicitudDesdeCandidato } from './utils/solicitudes'

export default function App() {
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales)
  const [candidatos, setCandidatos] = useState(candidatosIniciales)
  const [filtroActual, setFiltroActual] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [modoSolicitudes, setModoSolicitudes] = useState('kanban')
  const navigate = useNavigate()

  // Filtrado de solicitudes
  const solicitudesBuscadas = solicitudes.filter((s) => {
    const texto = busqueda.toLowerCase()
    return(
      s.candidato.toLowerCase().includes(texto) ||
      s.rut.toLowerCase().includes(texto) ||
      s.cargo.toLowerCase().includes(texto)
  )
  })

  // Búsqueda + filtro por estado (para vista Tabla)
  const solicitudesFiltradas = solicitudesBuscadas.filter((s) =>
    filtroActual === 'Todos' || s.estado === filtroActual
  )

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
                  mostrarFiltroEstado={modoSolicitudes === 'tabla'}
                />
                <div className='d-flex justify-content-end align-items-center gap-2 mb-3'>
                  <div className='btn-group btn-group-sm shadow-sm' role='group'>
                    <button
                      type='button'
                      className={`btn ${modoSolicitudes === 'tabla' ? 'btn-primary text-white' : 'btn-light border'}`}
                      onClick={() => setModoSolicitudes('tabla')}
                      >
                        <i className='bi bi-table me-1'></i> Tabla
                    </button>
                    <button
                      type='button'
                      className={`btn ${modoSolicitudes === 'kanban' ? 'btn-primary text-white' : 'btn-light border'}`}
                      onClick={() => setModoSolicitudes('kanban')}
                      >
                        <i className='bi bi-kanban me-1'></i> Kanban
                    </button>
                  </div>
                </div>

                {modoSolicitudes === 'tabla' ? (
                  <SolicitudesTabla solicitudes={solicitudesFiltradas} />
                ):(
                <KanbanSolicitudes 
                  solicitudes={solicitudesBuscadas} 
                  setSolicitudes={setSolicitudes} 
                />
                )}
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