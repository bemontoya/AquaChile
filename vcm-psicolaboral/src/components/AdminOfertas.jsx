import { useState, useEffect } from 'react';
import { FAMILIAS_CANDIDATOS, UBICACIONES, UNIDADES } from '../data/catalogos';
import {
  obtenerOfertasAdmin,
  crearOfertaAPI,
  editarOfertaAPI,
  togglePublicarOfertaAPI,
} from '../services/api';

const FORM_INICIAL = {
  cargo: '',
  familiaCargo: '',
  ubicacion: '',
  unidad: '',
  modalidad: 'PRESENCIAL',
  cupos: 1,
  descripcion: '',
  funciones: '',
  requisitos: '',
  beneficios: '',
  rangoSalarial: '',
  publicada: true,
};

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ofertaEditandoId, setOfertaEditandoId] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarOfertas = async () => {
    try {
      const data = await obtenerOfertasAdmin();
      setOfertas(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarOfertas();
  }, []);

  const abrirNueva = () => {
    setOfertaEditandoId(null);
    setFormData(FORM_INICIAL);
    setError('');
    setMostrarFormulario(true);
  };

  const abrirEditar = (oferta) => {
    setOfertaEditandoId(oferta.id);
    setFormData({
      cargo: oferta.cargo,
      familiaCargo: oferta.familiaCargo,
      ubicacion: oferta.ubicacion,
      unidad: oferta.unidad || '',
      modalidad: oferta.modalidad,
      cupos: oferta.cupos,
      descripcion: oferta.descripcion,
      funciones: oferta.funciones,
      requisitos: oferta.requisitos,
      beneficios: oferta.beneficios || '',
      rangoSalarial: oferta.rangoSalarial || '',
      publicada: oferta.publicada,
    });
    setError('');
    setMostrarFormulario(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (ofertaEditandoId) {
        await editarOfertaAPI(ofertaEditandoId, formData);
      } else {
        await crearOfertaAPI(formData);
      }
      setMostrarFormulario(false);
      cargarOfertas();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleTogglePublicar = async (oferta) => {
    try {
      await togglePublicarOfertaAPI(oferta.id, !oferta.publicada);
      cargarOfertas();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold mb-1 text-dark">Administración de Ofertas Laborales</h2>
          <p className="text-muted small mb-0">
            Crea, edita y controla las vacantes visibles en el Portal Público de Empleos
          </p>
        </div>
        <button
          type="button"
          className="btn text-white fw-bold"
          style={{ backgroundColor: '#0d3c61' }}
          onClick={abrirNueva}
        >
          <i className="bi bi-plus-lg me-1"></i> Nueva Oferta Laboral
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {mostrarFormulario && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-light fw-bold small text-secondary">
            {ofertaEditandoId ? 'EDITAR OFERTA LABORAL' : 'PUBLICAR NUEVA OFERTA LABORAL'}
          </div>
          <div className="card-body">
            <form onSubmit={handleGuardar} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Cargo *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Categoría / Familia *</label>
                <select
                  className="form-select"
                  value={formData.familiaCargo}
                  onChange={(e) => setFormData({ ...formData, familiaCargo: e.target.value })}
                  required
                >
                  <option value="">Seleccione familia</option>
                  {FAMILIAS_CANDIDATOS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Ubicación *</label>
                <select
                  className="form-select"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  required
                >
                  <option value="">Seleccione ubicación</option>
                  {UBICACIONES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Unidad</label>
                <select
                  className="form-select"
                  value={formData.unidad}
                  onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                >
                  <option value="">Seleccione unidad</option>
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Modalidad *</label>
                <select
                  className="form-select"
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="REMOTA">Remota</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold">Cupos *</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.cupos}
                  onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Rango Salarial</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: $1.600.000 - $1.900.000 líquido"
                  value={formData.rangoSalarial}
                  onChange={(e) => setFormData({ ...formData, rangoSalarial: e.target.value })}
                />
              </div>

              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkPublicada"
                    checked={formData.publicada}
                    onChange={(e) => setFormData({ ...formData, publicada: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="checkPublicada">
                    Publicar inmediatamente en el Portal Público
                  </label>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">Descripción del cargo *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Funciones principales *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.funciones}
                  onChange={(e) => setFormData({ ...formData, funciones: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Requisitos *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">Beneficios</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ej: Seguro complementario de salud, bono de alimentación, buses de acercamiento"
                  value={formData.beneficios}
                  onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                />
              </div>

              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: '#0d3c61' }} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de ofertas registradas */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Cargo</th>
                <th>Categoría</th>
                <th>Ubicación / Modalidad</th>
                <th>Cupos</th>
                <th>Postulantes</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => (
                <tr key={o.id}>
                  <td className="fw-bold text-dark">{o.cargo}</td>
                  <td>{o.familiaCargo}</td>
                  <td>{o.ubicacion} · <span className="badge bg-light text-dark border">{o.modalidad}</span></td>
                  <td>{o.cupos}</td>
                  <td>{o._count?.postulaciones ?? 0}</td>
                  <td>
                    <span className={`badge ${o.publicada ? 'bg-success' : 'bg-secondary'}`}>
                      {o.publicada ? 'Publicada' : 'Oculta'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => abrirEditar(o)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${o.publicada ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => handleTogglePublicar(o)}
                    >
                      {o.publicada ? 'Despublicar' : 'Publicar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}