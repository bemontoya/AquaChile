import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import KanbanSolicitudes from './components/KanbanSolicitudes'
import SubHeader from './components/SubHeader'
import CandidatosTabla from './components/CandidatosTabla'
import RegistroCandidato from './components/RegistroCandidato'
import SolicitudesTabla from './components/SolicitudesTabla'
import { solicitudesIniciales } from './data/solicitudesData'
import { candidatosIniciales } from './data/candidatosData'
import { crearSolicitudDesdeCandidato } from './utils/solicitudes'
import DetalleCandidato from './components/DetalleCandidato'
import Login from './components/Login'
import PortalEmpleos from './components/PortalEmpleos'
import AdminOfertas from './components/AdminOfertas'
import {
  cargarDatosDesdeBD,
  sincronizarEstadoEvaluacion,
  getUsuarioActual,
  cerrarSesion,
} from './services/api'

function RutaProtegida({ usuario, children }) {
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [usuario, setUsuario] = useState(() => getUsuarioActual())
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales)
  const [candidatos, setCandidatos] = useState(candidatosIniciales)
  const [filtroActual, setFiltroActual] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [modoSolicitudes, setModoSolicitudes] = useState('kanban')
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) return
    cargarDatosDesdeBD()
      .then((datos) => {
        if (datos && datos.solicitudesBD.length > 0) {
          setSolicitudes([...datos.solicitudesBD, ...solicitudesIniciales])
          setCandidatos([...datos.candidatosBD, ...candidatosIniciales])
        }
      })
      .catch(() => {})
  }, [usuario])

  const handleLogout = () => {
    cerrarSesion()
    setUsuario(null)
    navigate('/login')
  }

  const handleActualizarSolicitudes = (updater) => {
    setSolicitudes((prev) => {
      const siguiente = typeof updater === 'function' ? updater(prev) : updater
      siguiente.forEach((itemNuevo) => {
        const itemAnterior = prev.find((p) => p.id === itemNuevo.id)
        if (itemAnterior && itemAnterior.estado !== itemNuevo.estado && itemNuevo.evaluacionId) {
          sincronizarEstadoEvaluacion(itemNuevo.evaluacionId, itemNuevo.estado).catch(() => {})
        }
      })
      return siguiente
    })
  }

  const solicitudesBuscadas = solicitudes.filter((s) => {
    const texto = busqueda.toLowerCase()
    return (
      s.candidato.toLowerCase().includes(texto) ||
      s.rut.toLowerCase().includes(texto) ||
      s.cargo.toLowerCase().includes(texto)
    )
  })

  const solicitudesFiltradas = solicitudesBuscadas.filter(
    (s) => filtroActual === 'Todos' || s.estado === filtroActual
  )

  const handleGuardarCandidato = (nuevoCandidato) => {
    setCandidatos((prev) => [nuevoCandidato, ...prev])
    setSolicitudes((prev) => [crearSolicitudDesdeCandidato(nuevoCandidato, prev), ...prev])
    navigate('/candidatos')
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar usuario={usuario} onLogout={handleLogout} />

      <main className="container-fluid px-4 py-4">
        <Routes>
          {/* Rutas Públicas (Sin Login) */}
          <Route path="/empleos" element={<PortalEmpleos />} />
          <Route path="/login" element={<Login onLoginExitoso={(u) => setUsuario(u)} />} />

          {/* Rutas Protegidas con JWT */}
          <Route
            path="/"
            element={
              usuario ? (
                <Dashboard solicitudes={solicitudes} candidatos={candidatos} />
              ) : (
                <Navigate to="/empleos" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <RutaProtegida usuario={usuario}>
                <Dashboard solicitudes={solicitudes} candidatos={candidatos} />
              </RutaProtegida>
            }
          />
          <Route
            path="/ofertas-admin"
            element={
              <RutaProtegida usuario={usuario}>
                <AdminOfertas />
              </RutaProtegida>
            }
          />
          <Route
            path="/solicitudes"
            element={
              <RutaProtegida usuario={usuario}>
                <SubHeader
                  filtroActual={filtroActual}
                  setFiltroActual={setFiltroActual}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  solicitudes={solicitudes}
                  mostrarFiltroEstado={modoSolicitudes === 'tabla'}
                />
                <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                  <div className="btn-group btn-group-sm shadow-sm" role="group">
                    <button
                      type="button"
                      className={`btn ${modoSolicitudes === 'tabla' ? 'btn-primary text-white' : 'btn-light border'}`}
                      onClick={() => setModoSolicitudes('tabla')}
                    >
                      <i className="bi bi-table me-1"></i> Tabla
                    </button>
                    <button
                      type="button"
                      className={`btn ${modoSolicitudes === 'kanban' ? 'btn-primary text-white' : 'btn-light border'}`}
                      onClick={() => setModoSolicitudes('kanban')}
                    >
                      <i className="bi bi-kanban me-1"></i> Kanban
                    </button>
                  </div>
                </div>

                {modoSolicitudes === 'tabla' ? (
                  <SolicitudesTabla solicitudes={solicitudesFiltradas} />
                ) : (
                  <KanbanSolicitudes
                    solicitudes={solicitudesBuscadas}
                    setSolicitudes={handleActualizarSolicitudes}
                  />
                )}
              </RutaProtegida>
            }
          />
          <Route
            path="/candidatos"
            element={
              <RutaProtegida usuario={usuario}>
                <CandidatosTabla candidatos={candidatos} />
              </RutaProtegida>
            }
          />
          <Route
            path="/candidatos/:id"
            element={
              <RutaProtegida usuario={usuario}>
                <DetalleCandidato candidatos={candidatos} />
              </RutaProtegida>
            }
          />
          <Route
            path="/registro-candidato"
            element={
              <RutaProtegida usuario={usuario}>
                <RegistroCandidato
                  onAgregar={handleGuardarCandidato}
                  onCancelar={() => navigate('/candidatos')}
                />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </div>
  )
}