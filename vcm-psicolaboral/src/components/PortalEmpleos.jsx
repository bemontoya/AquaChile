import { API_URL } from '../services/api';
import { useState, useEffect } from 'react';
import { FAMILIAS_CANDIDATOS } from '../data/catalogos';
import { obtenerOfertasPublicas, enviarPostulacionPublica } from '../services/api';

// Color principal de AquaChile: es el único color de acento de la pantalla
const COLOR_PRIMARIO = '#0d3c61';

// Estilo común de las tarjetas: borde fino y sin sombra
const tarjeta = { border: '1px solid #e5e7eb', boxShadow: 'none' };

// Etiqueta pequeña en mayúsculas (se repite en varias partes)
const estiloEtiqueta = { fontSize: '0.7rem', letterSpacing: '0.05em' };

// Bloque pequeño "título + valor" que se usa en el detalle de la oferta
function Dato({ etiqueta, valor }) {
  return (
    <div className="col-sm-4">
      <div className="border rounded-3 p-2 px-3 h-100">
        <div className="text-muted text-uppercase" style={estiloEtiqueta}>
          {etiqueta}
        </div>
        <div className="small fw-medium text-dark">{valor}</div>
      </div>
    </div>
  );
}

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
      await fetch(`${API_URL}/api/enviar-confirmacion`, {
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

  // Actualiza un campo del formulario de postulación (evita repetir código en cada input)
  const cambiarCampo = (campo) => (e) =>
    setFormPostulacion({ ...formPostulacion, [campo]: e.target.value });

  return (
    <div className="container py-4">
      {/* Estilos: foco azul marino en los campos y efecto al pasar el mouse */}
      <style>{`
        .portal-input:focus {
          border-color: ${COLOR_PRIMARIO};
          box-shadow: 0 0 0 0.2rem rgba(13, 60, 97, 0.12);
        }
        .btn-principal:hover:not(:disabled) { background-color: #0a2f4d !important; }
        .oferta:hover { border-color: #cbd5e1 !important; }
      `}</style>

      {/* Encabezado: texto simple sobre el fondo, sin bloque de color */}
      <div className="mb-4">
        <div className="text-muted text-uppercase mb-1" style={estiloEtiqueta}>
          Trabaja con nosotros
        </div>
        <h1 className="h4 fw-semibold text-dark mb-1">Oportunidades laborales AquaChile</h1>
        <p className="text-muted small mb-0">
          Explora nuestras vacantes activas en el sur de Chile y postula adjuntando tu currículum en formato PDF o DOCX.
        </p>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="alert alert-success alert-dismissible fade show small" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {mensajeExito}
          <button type="button" className="btn-close" onClick={() => setMensajeExito('')}></button>
        </div>
      )}

      {/* Buscador y filtro por categoría/familia */}
      <div className="card rounded-3 mb-4" style={tarjeta}>
        <div className="card-body p-3">
          <form onSubmit={handleBuscar} className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-medium text-secondary">
                Buscar por cargo o ubicación
              </label>
              <input
                type="text"
                className="form-control portal-input"
                placeholder="Ej: Jefe de Turno, Puerto Montt, Veterinario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-medium text-secondary">
                Categoría / Familia de cargo
              </label>
              <select
                className="form-select portal-input"
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
              <button
                type="submit"
                className="btn btn-principal text-white w-100 fw-semibold"
                style={{ backgroundColor: COLOR_PRIMARIO }}
              >
                <i className="bi bi-search me-1"></i> Filtrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Listado de ofertas publicadas */}
      {cargando ? (
        <div className="text-center py-5 text-muted small">Cargando ofertas publicadas...</div>
      ) : ofertas.length === 0 ? (
        <div className="card rounded-3 text-center py-5" style={tarjeta}>
          <div className="card-body">
            <i className="bi bi-briefcase fs-2 text-muted"></i>
            <h5 className="fs-6 fw-semibold text-dark mt-3 mb-1">
              No hay ofertas publicadas con los filtros seleccionados
            </h5>
            <p className="text-muted small mb-0">Prueba limpiando los filtros de búsqueda.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {/* key = id + posición, por si llegan ofertas con el mismo id */}
          {ofertas.map((oferta, indice) => (
            <div key={`${oferta.id}-${indice}`} className="col-md-6 col-lg-4">
              <div className="card oferta h-100 rounded-3" style={tarjeta}>
                <div className="card-body d-flex flex-column p-4">
                  {/* Familia de cargo como texto pequeño, sin badge */}
                  <div className="text-muted text-uppercase mb-2" style={estiloEtiqueta}>
                    {oferta.familiaCargo}
                  </div>

                  <h5 className="fs-6 fw-semibold text-dark mb-1">{oferta.cargo}</h5>

                  <div className="text-muted small mb-3">
                    <div>
                      <i className="bi bi-geo-alt me-1"></i>
                      {oferta.ubicacion}
                    </div>
                    <div>
                      {oferta.modalidad} · {oferta.cupos} {oferta.cupos === 1 ? 'cupo' : 'cupos'}
                    </div>
                  </div>

                  <p
                    className="text-secondary small flex-grow-1"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {oferta.descripcion}
                  </p>

                  <div className="d-flex gap-2 pt-3 border-top mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border text-secondary w-50"
                      onClick={() => setOfertaDetalle(oferta)}
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-principal text-white fw-semibold w-50"
                      style={{ backgroundColor: COLOR_PRIMARIO }}
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

      {/* MODAL DE DETALLE DE LA OFERTA */}
      {ofertaDetalle && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-3">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fs-6 fw-semibold text-dark mb-0">{ofertaDetalle.cargo}</h5>
                  <small className="text-muted">
                    {ofertaDetalle.familiaCargo} · {ofertaDetalle.ubicacion}
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setOfertaDetalle(null)}></button>
              </div>

              <div className="modal-body">
                <div className="row g-2 mb-4">
                  <Dato etiqueta="Modalidad" valor={ofertaDetalle.modalidad} />
                  <Dato etiqueta="Cupos" valor={ofertaDetalle.cupos} />
                  <Dato etiqueta="Rango salarial" valor={ofertaDetalle.rangoSalarial || 'A convenir'} />
                </div>

                <h6 className="small fw-semibold text-dark">Descripción del cargo</h6>
                <p className="small text-secondary mb-4">{ofertaDetalle.descripcion}</p>

                <h6 className="small fw-semibold text-dark">Funciones principales</h6>
                <p className="small text-secondary mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {ofertaDetalle.funciones}
                </p>

                <h6 className="small fw-semibold text-dark">Requisitos</h6>
                <p className="small text-secondary mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {ofertaDetalle.requisitos}
                </p>

                {ofertaDetalle.beneficios && (
                  <>
                    <h6 className="small fw-semibold text-dark">Beneficios</h6>
                    <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {ofertaDetalle.beneficios}
                    </p>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light border text-secondary"
                  onClick={() => setOfertaDetalle(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-principal text-white fw-semibold px-4"
                  style={{ backgroundColor: COLOR_PRIMARIO }}
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
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fs-6 fw-semibold text-dark">Postular: {ofertaPostular.cargo}</h5>
                <button type="button" className="btn-close" onClick={() => setOfertaPostular(null)}></button>
              </div>

              <form onSubmit={handleConfirmarPostulacion}>
                <div className="modal-body">
                  {errorPostulacion && (
                    <div className="alert alert-danger py-2 small">{errorPostulacion}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-secondary">Nombre completo *</label>
                    <input
                      type="text"
                      className="form-control portal-input"
                      placeholder="Ej: Valentina Soto Pérez"
                      value={formPostulacion.nombre}
                      onChange={cambiarCampo('nombre')}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-secondary">RUT *</label>
                    <input
                      type="text"
                      className="form-control portal-input"
                      placeholder="Ej: 18.765.432-1"
                      value={formPostulacion.rut}
                      onChange={cambiarCampo('rut')}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-secondary">Correo electrónico *</label>
                    <input
                      type="email"
                      className="form-control portal-input"
                      placeholder="postulante@correo.cl"
                      value={formPostulacion.email}
                      onChange={cambiarCampo('email')}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-secondary">Teléfono *</label>
                    <input
                      type="text"
                      className="form-control portal-input"
                      placeholder="+56 9 8765 4321"
                      value={formPostulacion.telefono}
                      onChange={cambiarCampo('telefono')}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-medium text-secondary">
                      Adjuntar CV (PDF o DOCX, máx. 5MB) *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="form-control portal-input"
                      onChange={(e) => setArchivoCV(e.target.files[0] || null)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light border text-secondary"
                    onClick={() => setOfertaPostular(null)}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-principal text-white fw-semibold"
                    style={{ backgroundColor: COLOR_PRIMARIO }}
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : 'Confirmar postulación'}
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