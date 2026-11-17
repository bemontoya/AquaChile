import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FAMILIAS_CANDIDATOS } from '../data/catalogos';
import { crearEventoCalendario } from '../utils/googleCalendar';
import {
  descargarCVPrivado,
  actualizarEvaluacionAPI,
  analizarCandidatoConIA,
} from '../services/api';

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

const ESTADOS_EVALUACION = ['Pendiente', 'En Proceso', 'Finalizada'];

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
    estado: candidato?.estado ?? 'Pendiente',
    observaciones: candidato?.observaciones ?? candidato?.notas ?? '',
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
  const [mensajeEval, setMensajeEval] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardandoEval, setGuardandoEval] = useState(false);
  const [descargandoCV, setDescargandoCV] = useState(false);

  // Estado para el Asistente de IA (Punto 9 de la pauta)
  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(
    candidato?.resumenIA
      ? {
          puntajeOrientativo: candidato.puntajeIA,
          resumen: candidato.resumenIA,
          preguntasSugeridas: candidato.preguntasIA ? candidato.preguntasIA.split('\n') : [],
          criteriosEvaluados: [
            'Alineación de experiencia con funciones del cargo',
            'Coherencia de ubicación y familia ocupacional',
            'Competencias transversales declaradas en antecedentes',
          ],
          advertencia:
            'Herramienta de apoyo orientativo. No toma decisiones automáticas de contratación ni descarte; requiere validación clínica y humana obligatoria.',
        }
      : null
  );

  const manejarCambioForm = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const manejarCambioAgenda = (e) => {
    const { name, value, type, checked } = e.target;
    setAgenda({ ...agenda, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDescargarCV = async () => {
    if (!candidato?.postulacionId) {
      setMensajeEval({ tipo: 'warning', texto: 'Este registro demo no tiene archivo CV en servidor.' });
      return;
    }
    setDescargandoCV(true);
    setMensajeEval(null);
    try {
      await descargarCVPrivado(candidato.postulacionId, candidato.cvNombreOriginal || 'CV_Postulante.pdf');
    } catch (error) {
      setMensajeEval({ tipo: 'danger', texto: error.message });
    } finally {
      setDescargandoCV(false);
    }
  };

  const handleGuardarEvaluacion = async (e) => {
    e.preventDefault();
    if (!candidato?.evaluacionId) {
      setMensajeEval({ tipo: 'warning', texto: 'Este candidato es de muestra estática y no tiene ID en BD.' });
      return;
    }
    setGuardandoEval(true);
    setMensajeEval(null);
    try {
      await actualizarEvaluacionAPI(candidato.evaluacionId, {
        estado: form.estado,
        observaciones: form.observaciones,
        fechaEvaluacion: form.estado === 'Finalizada' ? new Date().toISOString() : undefined,
      });
      setMensajeEval({ tipo: 'success', texto: 'Evaluación psicolaboral actualizada correctamente en PostgreSQL.' });
    } catch (error) {
      setMensajeEval({ tipo: 'danger', texto: error.message });
    } finally {
      setGuardandoEval(false);
    }
  };

  const handleEjecutarIA = async () => {
    if (!candidato?.postulacionId) {
      setMensajeEval({ tipo: 'warning', texto: 'El análisis IA requiere una postulación almacenada en base de datos.' });
      return;
    }
    setAnalizandoIA(true);
    setMensajeEval(null);
    try {
      const data = await analizarCandidatoConIA(candidato.postulacionId, form.observaciones);
      setResultadoIA(data);
    } catch (error) {
      setMensajeEval({ tipo: 'danger', texto: error.message });
    } finally {
      setAnalizandoIA(false);
    }
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
      {/* Navegación superior */}
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

      {/* Cabecera del candidato + Descarga segura de CV */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="position-relative">
              <div
                className="bg-primary-subtle rounded-3 d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '80px', height: '80px', fontSize: '1.5rem', color: COLOR_MARCA }}
              >
                {candidato.iniciales || candidato.nombre?.slice(0, 2).toUpperCase()}
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
                  Estado: {form.estado}
                </span>
                <span className="badge bg-primary-subtle text-primary fw-medium rounded-pill">
                  <i className="bi bi-building me-1"></i>Cargo: {candidato.cargo}
                </span>
                {candidato.carpetaNombre && (
                  <span className="badge bg-light text-secondary border fw-normal rounded-pill">
                    <i className="bi bi-folder2-open me-1"></i>Carpeta: {candidato.carpetaNombre}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botón recuperación segura de CV desde servidor privado */}
          <div className="d-flex flex-column align-items-end gap-1">
            <button
              type="button"
              className="btn btn-outline-primary fw-semibold d-flex align-items-center gap-2"
              onClick={handleDescargarCV}
              disabled={descargandoCV || !candidato.postulacionId}
            >
              <i className="bi bi-file-earmark-arrow-down-fill"></i>
              {descargandoCV ? 'Descargando CV...' : 'Descargar CV Privado'}
            </button>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              {candidato.cvNombreOriginal || 'Sin archivo adjunto en BD'}
            </small>
          </div>
        </div>
      </div>

      {mensajeEval && (
        <div className={`alert alert-${mensajeEval.tipo} py-2 small mb-4`} role="alert">
          {mensajeEval.texto}
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Columna Izquierda: Ficha + Evaluación Psicolaboral */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
            <div className="card-header bg-light border-0 px-4 py-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-vcard fs-5" style={{ color: COLOR_MARCA }}></i>
              <h5 className="mb-0 fw-bold" style={{ color: COLOR_MARCA }}>Información y Evaluación Psicolaboral</h5>
            </div>

            <form className="card-body p-4" onSubmit={handleGuardarEvaluacion}>
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

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={manejarCambioForm}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Estado de Evaluación</label>
                  <select
                    name="estado"
                    className="form-select fw-semibold"
                    value={form.estado}
                    onChange={manejarCambioForm}
                  >
                    {ESTADOS_EVALUACION.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
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

              <div className="mb-3">
                <label className="form-label small fw-semibold">Observaciones e Informe Psicolaboral</label>
                <textarea
                  name="observaciones"
                  rows="3"
                  className="form-control"
                  placeholder="Registre observaciones de entrevista, competencias conductuales y conclusiones..."
                  value={form.observaciones}
                  onChange={manejarCambioForm}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn text-white fw-bold px-4"
                  style={{ backgroundColor: COLOR_MARCA }}
                  disabled={guardandoEval}
                >
                  <i className="bi bi-check2-circle me-1"></i>
                  {guardandoEval ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Agendar Reunión Google Calendar */}
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
                  {EVALUADORES.map((ev) => <option key={ev.nombre} value={ev.email}>{ev.nombre}</option>)}
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

      {/* PANEL DE APOYO INTELIGENCIA ARTIFICIAL (Punto 9 de la rúbrica) */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-light border-0 px-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-stars fs-5 text-primary"></i>
            <h5 className="mb-0 fw-bold text-dark">Asistente IA de Apoyo Psicolaboral</h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary fw-semibold"
            onClick={handleEjecutarIA}
            disabled={analizandoIA || !candidato.postulacionId}
          >
            <i className="bi bi-cpu me-1"></i>
            {analizandoIA ? 'Analizando antecedentes...' : 'Generar Análisis Orientativo IA'}
          </button>
        </div>

        <div className="card-body p-4">
          <div className="alert alert-warning py-2 small mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-shield-exclamation fs-5"></i>
            <div>
              <strong>Uso ético y supervisión humana:</strong> Este modelo de IA entrega una puntuación orientativa y sugerencias de entrevista como apoyo al evaluador. <strong>No toma decisiones automáticas de contratación ni descarte</strong> y requiere revisión humana obligatoria.
            </div>
          </div>

          {resultadoIA ? (
            <div className="row g-3 small">
              <div className="col-md-3">
                <div className="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                  <span className="text-muted mb-1">Adecuación Orientativa</span>
                  <div className="display-6 fw-bold text-primary">{resultadoIA.puntajeOrientativo}%</div>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Índice referencial</span>
                </div>
              </div>

              <div className="col-md-9">
                <h6 className="fw-bold mb-1">Resumen de adecuación al perfil</h6>
                <p className="text-secondary mb-2">{resultadoIA.resumen}</p>

                {resultadoIA.criteriosEvaluados && (
                  <div className="mb-2">
                    <strong>Criterios utilizados:</strong>
                    <ul className="mb-1 text-secondary">
                      {resultadoIA.criteriosEvaluados.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {resultadoIA.preguntasSugeridas && resultadoIA.preguntasSugeridas.length > 0 && (
                  <div>
                    <strong>Preguntas sugeridas para entrevista por competencias:</strong>
                    <ul className="mb-0 text-secondary">
                      {resultadoIA.preguntasSugeridas.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted small mb-0">
              Presiona <strong>Generar Análisis Orientativo IA</strong> para obtener un resumen del perfil, criterios de evaluación y preguntas sugeridas para la entrevista psicolaboral.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}