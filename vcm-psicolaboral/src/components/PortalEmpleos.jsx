import { useState, useEffect } from 'react';
import { FAMILIAS_CANDIDATOS } from '../data/catalogos';
import { obtenerOfertasPublicas, enviarPostulacionPublica } from '../services/api';

export default function PortalEmpleos() {
  const [ofertas, setOfertas] = useState([]);
  const [familiaFiltro, setFamiliaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [ofertaDetalle, setOfertaDetalle] = useState(null);
  const [ofertaPostular, setOfertaPostular] = useState(null);

  const [formPostulacion, setFormPostulacion] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
  });
  const [archivoCV, setArchivoCV] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorPostulacion, setErrorPostulacion] = useState('');

  const cargarOfertas = async () => {
    setCargando(true);
    try {
      const lista = await obtenerOfertasPublicas({
        familiaCargo: familiaFiltro,
        busqueda,
      });
      setOfertas(lista);
    } catch {
      setOfertas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOfertas();
  }, [familiaFiltro]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarOfertas();
  };

  const abrirFormularioPostulacion = (oferta) => {
    setOfertaDetalle(null);
    setOfertaPostular(oferta);
    setMensajeExito('');
    setErrorPostulacion('');
    setArchivoCV(null);
    setFormPostulacion({ nombre: '', rut: '', email: '', telefono: '' });
  };

  const handleConfirmarPostulacion = async (e) => {
    e.preventDefault();
    setErrorPostulacion('');
    setEnviando(true);

    try {
      const res = await enviarPostulacionPublica({
        ofertaId: ofertaPostular.id,
        ...formPostulacion,
        archivoCV,
      });

      // Enviar correo de confirmación con Resend
      await fetch('http://localhost:3001/api/enviar-confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formPostulacion.nombre,
          email: formPostulacion.email,
          cargo: ofertaPostular.cargo,
        }),
      }).catch(() => {});

      setMensajeExito(
        `Postulación registrada con éxito para "${ofertaPostular.cargo}". Carpeta creada: ${res.postulacion.carpetaNombre}.`
      );
      setOfertaPostular(null);
    } catch (err) {
      setErrorPostulacion(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Encabezado Portal Público */}
      <div className="p-4 rounded-3 text-white mb-4 shadow-sm" style={{ backgroundColor: '#0d3c61' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-info text-dark mb-2">TRABAJA CON NOSOTROS</span>
            <h2 className="fw-bold mb-1">Oportunidades Laborales AquaChile</h2>
            <p className="mb-0 opacity-75 small">
              Explora nuestras vacantes activas en el sur de Chile y postula adjuntando tu currículum en formato PDF o DOCX.
            </p>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {mensajeExito}
          <button type="button" className="btn-close" onClick={() => setMensajeExito('')}></button>
        </div>
      )}

      {/* Buscador y filtro por categoría/familia */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleBuscar} className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-semibold">Buscar por cargo o ubicación</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Jefe de Turno, Puerto Montt, Veterinario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-semibold">Categoría / Familia de cargo</label>
              <select
                className="form-select"
                value={familiaFiltro}
                onChange={(e) => setFamiliaFiltro(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {FAMILIAS_CANDIDATOS.map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-semibold">
                <i className="bi bi-search me-1"></i> Filtrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Listado de ofertas publicadas */}
      {cargando ? (
        <div className="text-center py-5 text-muted">Cargando ofertas publicadas...</div>
      ) : ofertas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-briefcase fs-1 text-muted"></i>
            <h5 className="mt-2">No hay ofertas publicadas con los filtros seleccionados</h5>
            <p className="text-muted small mb-0">Prueba limpiando los filtros de búsqueda.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {ofertas.map((oferta) => (
            <div key={oferta.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-primary border">{oferta.familiaCargo}</span>
                    <span className="badge bg-secondary-subtle text-dark">{oferta.modalidad}</span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{oferta.cargo}</h5>
                  <div className="text-muted small mb-3">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {oferta.ubicacion} · {oferta.cupos} {oferta.cupos === 1 ? 'cupo' : 'cupos'}
                  </div>

                  <p className="text-secondary small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {oferta.descripcion}
                  </p>

                  <div className="d-flex gap-2 pt-3 border-top mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-50"
                      onClick={() => setOfertaDetalle(oferta)}
                    >
                      Ver Detalle
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm text-white fw-bold w-50"
                      style={{ backgroundColor: '#0d3c61' }}
                      onClick={() => abrirFormularioPostulacion(oferta)}
                    >
                      Postular
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL / PANEL DE DETALLE DE LA OFERTA */}
      {ofertaDetalle && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ backgroundColor: '#0d3c61' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">{ofertaDetalle.cargo}</h5>
                  <small className="opacity-75">
                    {ofertaDetalle.familiaCargo} · {ofertaDetalle.ubicacion}
                  </small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOfertaDetalle(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2 mb-3 small">
                  <div className="col-sm-4">
                    <div className="p-2 bg-light rounded">
                      <strong>Modalidad:</strong> {ofertaDetalle.modalidad}
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-2 bg-light rounded">
                      <strong>Cupos:</strong> {ofertaDetalle.cupos}
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-2 bg-light rounded">
                      <strong>Rango Salarial:</strong> {ofertaDetalle.rangoSalarial || 'A convenir'}
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold">Descripción del cargo</h6>
                <p className="small text-secondary">{ofertaDetalle.descripcion}</p>

                <h6 className="fw-bold">Funciones principales</h6>
                <p className="small text-secondary" style={{ whiteSpace: 'pre-line' }}>{ofertaDetalle.funciones}</p>

                <h6 className="fw-bold">Requisitos</h6>
                <p className="small text-secondary" style={{ whiteSpace: 'pre-line' }}>{ofertaDetalle.requisitos}</p>

                {ofertaDetalle.beneficios && (
                  <>
                    <h6 className="fw-bold">Beneficios</h6>
                    <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>{ofertaDetalle.beneficios}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setOfertaDetalle(null)}>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn text-white fw-bold px-4"
                  style={{ backgroundColor: '#0d3c61' }}
                  onClick={() => abrirFormularioPostulacion(ofertaDetalle)}
                >
                  Postular a esta oferta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE POSTULACIÓN Y SUBIDA DE CV */}
      {ofertaPostular && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ backgroundColor: '#0d3c61' }}>
                <h5 className="modal-title fw-bold">Postular: {ofertaPostular.cargo}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOfertaPostular(null)}></button>
              </div>
              <form onSubmit={handleConfirmarPostulacion}>
                <div className="modal-body">
                  {errorPostulacion && (
                    <div className="alert alert-danger py-2 small">{errorPostulacion}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nombre completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Valentina Soto Pérez"
                      value={formPostulacion.nombre}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">RUT *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: 18.765.432-1"
                      value={formPostulacion.rut}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, rut: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Correo electrónico *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="postulante@correo.cl"
                      value={formPostulacion.email}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Teléfono *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+56 9 8765 4321"
                      value={formPostulacion.telefono}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, telefono: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Adjuntar CV (PDF o DOCX, máx. 5MB) *</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="form-control"
                      onChange={(e) => setArchivoCV(e.target.files[0] || null)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setOfertaPostular(null)} disabled={enviando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: '#0d3c61' }} disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Confirmar Postulación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}