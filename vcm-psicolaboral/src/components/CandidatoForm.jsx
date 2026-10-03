import React, { useState } from 'react';

// se recibe 'onCancelar' desde App.jsx para permitir regresar a las solicitudes
export default function CandidatoForm({ onCancelar }) {

  // estado para guardar los campos ingresados por el usuario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cargo: '',
    familiaCargo: ''
  });

  // actualiza de forma dinamica el estado de un formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // acción al enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita el refresco de la página
    alert(`Candidato "${formData.nombre}" registrado exitosamente.`);//muestra un mensaje cuando se registre correctamente
    
    // regresa automaticamente a la pantalla solicitudes
    if (onCancelar) {
      onCancelar();
    }
  };

  return (
    <div className="w-100">
      
      {/* 1. ruta de navegación */}
      <div className="text-muted small mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
        <i className="bi bi-folder2-open"></i> Candidatos / <span className="fw-semibold text-dark">Registrar Nuevo Candidato</span>
      </div>

      {/* 2. título principal de la pantalla */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="h4 fw-bold mb-1 text-dark">Registrar Nuevo Candidato</h2>
          <p className="text-muted small mb-0">
            Complete los datos personales y laborales del postulante para iniciar su proceso evaluativo.
          </p>
        </div>

        <div>
          <span className="badge bg-light text-secondary border px-3 py-2 fw-normal d-flex align-items-center gap-1">
            <i className="bi bi-shield-check text-secondary"></i> PROCESO CONVOCATORIA 2026
          </span>
        </div>
      </div>

      {/* 3. tarjeta contenedora de la ficha técnica */}
      <div className="card border-0 shadow-sm rounded-3">
        
        {/* parte superior de la tarjeta */}
        <div className="card-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <span className="small fw-bold text-secondary d-flex align-items-center gap-2">
            <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem' }}></i>
            FICHA TÉCNICA DE ADMISIÓN
          </span>
        </div>

        {/* cuerpo del formulario */}
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            {/* bloque de datos personales y contacto del postulante */}
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <i className="bi bi-person-fill text-primary"></i> Datos Personales y Contacto
            </h6>

            <div className="row g-3 mb-4">
              {/* campo de nombre completo */}
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Nombre completo <span className="text-danger">*</span>
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

              {/* campo de correo electronico */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Correo electrónico <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-md"
                  placeholder="ejemplo@correo.cl"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* campo de teléfono de contacto */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Teléfono de contacto <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  className="form-control form-control-md"
                  placeholder="Ej: +56 9 1234 5678"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* asignacion laboral y perfil */}
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <i className="bi bi-briefcase-fill text-primary"></i> Asignación Laboral y Perfil
            </h6>

            <div className="row g-3 mb-4">
              {/* campo cargo al que postula */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Cargo al que postula <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="cargo"
                  className="form-control form-control-md"
                  placeholder="Ej: Jefe de Turno Planta Quellón"
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* select familia de cargo */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Familia de cargo <span className="text-danger">*</span>
                </label>
                <select
                  name="familiaCargo"
                  className="form-select form-select-md"
                  value={formData.familiaCargo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una familia</option>
                  <option value="Operaciones Planta">Operaciones Planta</option>
                  <option value="Engorda">Engorda / Centro Mar</option>
                  <option value="Mantenimiento">Mantenimiento Electromecánico</option>
                </select>
              </div>
            </div>

            {/* botones de accion */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-3 gap-3 border-top">
              <span className="text-muted small">
                <span className="text-danger">*</span> Campos obligatorios
              </span>

              <div className="d-flex gap-2 justify-content-end">
                {/* boton cancelar */}
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-medium"
                  onClick={onCancelar}
                >
                  <i className="bi bi-x-lg me-1"></i> Cancelar
                </button>

                {/* boton guardar */}
                <button
                  type="submit"
                  className="btn text-white px-4 fw-bold"
                  style={{ backgroundColor: '#0d3c61', borderColor: '#0d3c61' }}
                >
                  <i className="bi bi-floppy me-1"></i> Guardar Candidato
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}