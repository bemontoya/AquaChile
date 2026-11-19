import { API_URL } from '../services/api';
import { useState } from 'react';
import { FAMILIAS_CANDIDATOS, UBICACIONES, UNIDADES } from '../data/catalogos';

// se reciben 'onCancelar' y 'onAgregar' desde App.jsx
export default function RegistroCandidato({ onCancelar, onAgregar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    cargo: '',
    unidad: '',
    ubicacion: '',
    familiaCargo: ''
  });
  const [archivoCV, setArchivoCV] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorBackend, setErrorBackend] = useState('');

  // actualiza de forma dinamica el estado del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // accion al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');
    setEnviando(true);

    // Iniciales: primera letra del nombre + primera del apellido paterno
    const palabras = formData.nombre.trim().split(/\s+/);
    const iniciales = ((palabras[0]?.[0] || '') + (palabras[2]?.[0] || palabras[1]?.[0] || '')).toUpperCase();

    try {
      // 1. Guardar postulante + CV privado en PostgreSQL
      const payload = new FormData();
      payload.append('nombre', formData.nombre);
      payload.append('rut', formData.rut);
      payload.append('email', formData.email);
      payload.append('telefono', formData.telefono);
      payload.append('cargo', formData.cargo);
      payload.append('familiaCargo', formData.familiaCargo);
      payload.append('ubicacion', formData.ubicacion);
      payload.append('unidad', formData.unidad);
      if (archivoCV) {
        payload.append('cv', archivoCV);
      }

      const resPostulacion = await fetch(`${API_URL}/api/postulaciones`, {
        method: 'POST',
        body: payload
      });

      const dataPostulacion = await resPostulacion.json();
      if (!resPostulacion.ok) {
        throw new Error(dataPostulacion.error || 'Error al guardar postulación en base de datos');
      }

      // 2. Enviar correo de confirmación con Resend
      await fetch(`${API_URL}/api/enviar-confirmacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          cargo: formData.cargo
        })
      }).catch((err) => console.error('Error al enviar correo:', err));

      // 3. Actualizar estado inmediato en App.jsx
      if (onAgregar) {
        onAgregar({ id: dataPostulacion.postulacion?.id || Date.now(), iniciales, ...formData });
      }
    } catch (error) {
      setErrorBackend(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-100">
      {/* 1. ruta de navegación */}
      <div className="text-muted small mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
        <i className="bi bi-folder2-open"></i>Registro de Candidato / <span className="fw-semibold text-dark">Registrar Nuevo Candidato</span>
      </div>

      {/* 2. Título principal de la pantalla */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="h4 fw-bold mb-1 text-dark">Registrar Nuevo Candidato</h2>
          <p className="text-muted small mb-0">Complete los datos personales y laborales del postulante para iniciar su proceso evaluativo</p>
        </div>

        <div>
          <span className="badge bg-light text-secondary border px-3 py-2 fw-normal d-flex align-items-center gap-1">
            <i className="bi bi-shield-check text-secondary"></i> PROCESO CONVOCATORIA 2026
          </span>
        </div>
      </div>

      {/* 3. Tarjeta contendeora de la ficha técnica */}
      <div className="card border-0 shadow-sm rounded-3">
        {/* parte superior de la tarjeta */}
        <div className="card-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <span className="small fw-bold text-secondary d-flex align-items-center gap-2">
            <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem' }}></i>FICHA TÉCNICA DE ADMISIÓN
          </span>
        </div>

        {/* cuerpo del formulario */}
        <div className="card-body p-4">
          {errorBackend && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorBackend}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* bloque de datos personales y contacto del postulante */}
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <i className="bi bi-person-fill text-primary"></i>Datos Personales y Contacto
            </h6>

            <div className="row g-3 mb-4">
              {/* campo de nombre completo */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Nombre completo
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control form-control-md"
                  placeholder="Ej: Matías Nicolás Almonacid Vera"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* campo de RUT */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">RUT
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="rut"
                  className="form-control form-control-md"
                  placeholder="Ej: 16.428.910-3"
                  value={formData.rut}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* campo de correo electronico */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Correo electrónico
                  <span className="text-danger">*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  className='form-control form-control-md'
                  placeholder='ejemplo@correo.cl'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* campo de teléfono de contacto */}
              <div className='col-md-6'>
                <label className='form-label small fw-semibold'>Teléfono de contacto
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='telefono'
                  className='form-control form-control-md'
                  placeholder='Ej: +56 9 1234 5678'
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <hr className='my-4 text-muted opacity-25' />

            {/* asignacion laboral y perfil */}
            <h6 className='fw-bold mb-3 d-flex align-items-center gap-2 text-dark'>
              <i className='bi bi-briefcase-fill text-primary'></i>Asignación Laboral y Perfil
            </h6>

            <div className='row g-3 mb-4'>
              {/* campo cargo al que postula */}
              <div className='col-md-6'>
                <label className='form-label small fw-semibold'>Cargo al que postula
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='cargo'
                  className='form-control form-control-md'
                  placeholder='Ej: Jefe de Turno Planta Quellón'
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* select familia de cargo */}
              <div className='col-md-6'>
                <label className='form-label small fw-semibold'>Familia de cargo
                  <span className='text-danger'>*</span>
                </label>
                <select
                  name='familiaCargo'
                  className='form-select form-select-md'
                  value={formData.familiaCargo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una familia</option>
                  {FAMILIAS_CANDIDATOS.map((familia) => (
                    <option key={familia} value={familia}>{familia}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='row g-3 mb-4'>
              {/* select ubicación */}
              <div className='col-md-6'>
                <label className='form-label small fw-semibold'>Ubicación
                  <span className='text-danger'>*</span>
                </label>
                <select
                  name='ubicacion'
                  className='form-select form-select-md'
                  value={formData.ubicacion}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una ubicación</option>
                  {UBICACIONES.map((ubi) => (
                    <option key={ubi} value={ubi}>{ubi}</option>
                  ))}
                </select>
              </div>

              {/* select unidad */}
              <div className='col-md-6'>
                <label className='form-label small fw-semibold'>Unidad
                  <span className='text-danger'>*</span>
                </label>
                <select
                  name='unidad'
                  className='form-select form-select-md'
                  value={formData.unidad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una unidad</option>
                  {UNIDADES.map((unidad) => (
                    <option key={unidad} value={unidad}>{unidad}</option>
                  ))}
                </select>
              </div>

              {/* campo adjuntar Currículum Vitae */}
              <div className='col-md-12'>
                <label className='form-label small fw-semibold'>Currículum Vitae (PDF o DOCX, máx. 5MB)
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='file'
                  accept='.pdf,.doc,.docx'
                  className='form-control form-control-md'
                  onChange={(e) => setArchivoCV(e.target.files[0] || null)}
                  required
                />
              </div>
            </div>

            {/* botones de accion */}
            <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-3 gap-3 border-top'>
              <span className='text-muted small'>
                <span className='text-danger'>*</span> Campos obligatorios
              </span>

              <div className='d-flex gap-2 justify-content-end'>
                {/* boton cancelar */}
                <button
                  type='button'
                  className='btn btn-outline-secondary px-4 fw-medium'
                  onClick={onCancelar}
                  disabled={enviando}
                >
                  <i className='bi bi-x-lg me-1'></i> Cancelar
                </button>

                {/* boton guardar */}
                <button
                  type='submit'
                  className='btn text-white px-4 fw-bold'
                  style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}
                  disabled={enviando}
                >
                  <i className='bi bi-floppy me-1'></i> {enviando ? 'Guardando...' : 'Guardar Candidato'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}