import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FAMILIAS_CANDIDATOS } from '../data/catalogos';
import { crearEventoCalendario } from '../utils/googleCalendar';

const COLOR_MARCA = '#0d3c61';

const RUTA_LISTADO = '/candidatos';

const TIPOS_SESION = [
  'Entrevista Psicolaboral por Competencias',
  'Evaluación Psicométrica',
  'Entrevista de Cierre',
];


const EVALUADORES = [
  { nombre: 'Dra. Marcela Vidal', email: 'benjamin.montoya2006@gmail.com' },
  { nombre: 'Claudio Arriagada', email: 'benjamin.montoya2006@gmail.com' },
  { nombre: 'Claudia Rios', email: 'benjamin.montoya2006@gmail.com' },
];

const BLOQUES_HORARIOS = [
  '09:00 hrs - 10:00 hrs',
  '10:30 hrs - 11:30 hrs',
  '12:00 hrs - 13:00 hrs',
  '15:00 hrs - 16:00 hrs',
];

const hoy = new Date().toISOString().split('T')[0];

export default function DetalleCandidato({ candidatos }) {
  const navigate = useNavigate();


  const { id } = useParams();

  const candidato = candidatos.find((c) => String(c.id) === id);


  const [form, setForm] = useState({
    nombre: candidato?.nombre ?? '',
    telefono: candidato?.telefono ?? '',
    email: candidato?.email ?? '',
    cargo: candidato?.cargo ?? '',
    familiaCargo: candidato?.familiaCargo ?? '',
    notas: candidato?.notas ?? '',
  });


  const [agenda, setAgenda] = useState({
    tipoSesion: TIPOS_SESION[0],
    evaluador: EVALUADORES[0].email,
    emailDestinatario: candidato?.email ?? '',
    fecha: '',
    bloque: BLOQUES_HORARIOS[1],
    enviarCitacion: true,
  });


  const [mensaje, setMensaje] = useState(null);


  const [guardando, setGuardando] = useState(false);


  const manejarCambioForm = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


  const manejarCambioAgenda = (e) => {
    const { name, value, type, checked } = e.target;
    setAgenda({ ...agenda, [name]: type === 'checkbox' ? checked : value });
  };

  const confirmarReunion = async (e) => {
    e.preventDefault(); 
    
    if (!agenda.emailDestinatario.includes('@')) {
      setMensaje({ tipo: 'danger', texto: 'Ingresa un correo destinatario válido.' });
      return;
    }
    if (!agenda.fecha) {
      setMensaje({ tipo: 'danger', texto: 'Selecciona la fecha de la cita.' });
      return;
    }


    const evaluador = EVALUADORES.find((ev) => ev.email === agenda.evaluador);

    setGuardando(true); 
    setMensaje(null);   

    try {
      const resultado = await crearEventoCalendario({
        titulo: `${agenda.tipoSesion} - ${candidato.nombre}`,
        descripcion:
          `Candidato: ${candidato.nombre} (RUT ${candidato.rut})\n` +
          `Cargo: ${form.cargo}\n` +
          `Evaluador: ${evaluador.nombre}`,
        fecha: agenda.fecha,
        bloque: agenda.bloque,
        invitados: [agenda.emailDestinatario, evaluador.email],
        notificar: agenda.enviarCitacion,
      });

      setMensaje({
        tipo: 'success',
        texto: `Reunión agendada para el ${agenda.fecha} (${agenda.bloque}).`,
        enlaceEvento: resultado.enlaceEvento,
        enlaceMeet: resultado.enlaceMeet,
      });
    } catch (error) {
    
      setMensaje({ tipo: 'danger', texto: error.message });
    } finally {
      setGuardando(false);
    }
  };


  if (!candidato) {
    return (
      <div className="w-100 text-center py-5">
        <h2 className="h4 fw-bold text-dark">Candidato no encontrado</h2>
        <p className="text-muted">Revisa el enlace o vuelve al listado.</p>
        <button
          type="button"
          className="btn text-white"
          style={{ backgroundColor: COLOR_MARCA, borderColor: COLOR_MARCA }}
          onClick={() => navigate(RUTA_LISTADO)}
        >
          Volver al Listado de Candidatos
        </button>
      </div>
    );
  }

  return (
    <div className="w-100">

      
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <nav className="small text-muted d-flex align-items-center gap-2">
          <i className="bi bi-people"></i>
          <span role="button" onClick={() => navigate(RUTA_LISTADO)}>Candidatos</span>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
          <span className="text-dark">{candidato.nombre}</span>
        </nav>

        <button
          type="button"
          className="btn btn-light border btn-sm d-flex align-items-center gap-2"
          onClick={() => navigate(RUTA_LISTADO)}
        >
          <i className="bi bi-arrow-left"></i> Volver al Listado de Candidatos
        </button>
      </div>

      
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">

         
          <div className="position-relative">
            <div
              className="bg-primary-subtle rounded-3 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '80px', height: '80px', fontSize: '1.5rem', color: COLOR_MARCA }}
            >
              {candidato.iniciales}
            </div>
            <span
              className="position-absolute bg-success rounded-circle border border-2 border-white"
              style={{ width: '18px', height: '18px', bottom: '-4px', right: '-4px' }}
            ></span>
          </div>

          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <h2 className="h3 fw-bold mb-0 text-dark">{candidato.nombre}</h2>
              
              <span className="badge bg-light text-secondary border fw-normal font-monospace">
                RUT: {candidato.rut}
              </span>
            </div>

         
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-success-subtle text-success fw-medium rounded-pill">
              </span>
              <span className="badge bg-primary-subtle text-primary fw-medium rounded-pill">
                <i className="bi bi-building me-1"></i>Cargo: {candidato.cargo}
              </span>
              
              <span className="badge bg-light text-secondary border fw-normal rounded-pill">
              </span>
            </div>
          </div>
        </div>
      </div>


      <div className="row g-4">

        
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
            <div className="card-header bg-light border-0 px-4 py-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-vcard fs-5" style={{ color: COLOR_MARCA }}></i>
              <h5 className="mb-0 fw-bold" style={{ color: COLOR_MARCA }}>Información del Candidato</h5>
            </div>

            <div className="card-body p-4">
              
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Nombre Completo <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={manejarCambioForm}
                />
              </div>

              
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold">RUT Candidato</label>
                    <span className="small text-primary">Identificador único</span>
                  </div>
                  
                  <input type="text" className="form-control bg-light" value={candidato.rut} readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Teléfono de Contacto</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-telephone"></i></span>
                    <input
                      type="text"
                      name="telefono"
                      className="form-control"
                      value={form.telefono}
                      onChange={manejarCambioForm}
                    />
                  </div>
                </div>
              </div>

              
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={manejarCambioForm}
                  />
                </div>
              </div>

             
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Cargo de Postulación</label>
                  <input
                    type="text"
                    name="cargo"
                    className="form-control"
                    value={form.cargo}
                    onChange={manejarCambioForm}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Familia de Cargo</label>
                  <select
                    name="familiaCargo"
                    className="form-select"
                    value={form.familiaCargo}
                    onChange={manejarCambioForm}
                  >
                    
                    {FAMILIAS_CANDIDATOS.map((familia) => (
                      <option key={familia} value={familia}>{familia}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between">
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
            
            <div
              className="card-header border-0 px-4 py-3 d-flex align-items-center gap-2 text-white"
              style={{ backgroundColor: COLOR_MARCA }}
            >
              <i className="bi bi-calendar-week fs-5"></i>
              <h5 className="mb-0 fw-bold">Agendar Reunión / Entrevista</h5>
            </div>

            <form className="card-body p-4" onSubmit={confirmarReunion}>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Tipo de Sesión</label>
                <select name="tipoSesion" className="form-select" value={agenda.tipoSesion} onChange={manejarCambioAgenda}>
                  {TIPOS_SESION.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Evaluador / Responsable</label>
                <select name="evaluador" className="form-select" value={agenda.evaluador} onChange={manejarCambioAgenda}>
                  {EVALUADORES.map((ev) => <option key={ev.email} value={ev.email}>{ev.nombre}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Correo Electrónico Destinatario <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    name="emailDestinatario"
                    className="form-control"
                    value={agenda.emailDestinatario}
                    onChange={manejarCambioAgenda}
                  />
                </div>
                <div className="form-text">Correo al cual se enviará la convocatoria y enlace de la reunión.</div>
              </div>

      
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Fecha de la Cita</label>
                  {/* min={hoy} bloquea fechas pasadas */}
                  <input type="date" name="fecha" min={hoy} className="form-control" value={agenda.fecha} onChange={manejarCambioAgenda} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Bloque Horario</label>
                  <select name="bloque" className="form-select" value={agenda.bloque} onChange={manejarCambioAgenda}>
                    {BLOQUES_HORARIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

  
              <div className="form-check bg-light rounded-3 p-3 ps-5 mb-3 small">
                <input
                  type="checkbox"
                  id="enviarCitacion"
                  name="enviarCitacion"
                  className="form-check-input"
                  checked={agenda.enviarCitacion}
                  onChange={manejarCambioAgenda}
                />
                <label className="form-check-label" htmlFor="enviarCitacion">
                  Enviar citación automática y calendario al correo destinatario
                  (<strong>{agenda.emailDestinatario || 'sin correo'}</strong>).
                </label>
              </div>

              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} py-2 small`} role="alert">
                  {mensaje.texto}

                  {mensaje.enlaceMeet && (
                    <div className="mt-1">
                      <a href={mensaje.enlaceMeet} target="_blank" rel="noreferrer">Enlace de Google Meet</a>
                    </div>
                  )}
                  {mensaje.enlaceEvento && (
                    <div>
                      <a href={mensaje.enlaceEvento} target="_blank" rel="noreferrer">Ver en Google Calendar</a>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: COLOR_MARCA, borderColor: COLOR_MARCA }}
              >
                <i className="bi bi-calendar-check"></i>
                {guardando ? 'Agendando en Google Calendar...' : 'Confirmar y Agendar Reunión'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}