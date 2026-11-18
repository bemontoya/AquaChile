import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../services/api';

const COLOR_PRIMARIO = '#0d3c61';
const MOSTRAR_ACCESOS_PRUEBA = true; // poner en false al pasar a producción

export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await loginAPI(email, password);
      if (onLoginExitoso) onLoginExitoso(data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const usarCuentaPrueba = (correo) => {
    setEmail(correo);
    setPassword('AquaChile2026!');
  };

  return (
    <div className="container py-5">
      <style>{`
        .login-input:focus {
          border-color: ${COLOR_PRIMARIO};
          box-shadow: 0 0 0 0.2rem rgba(13, 60, 97, 0.12);
        }
        .login-btn:hover:not(:disabled) { background-color: #0a2f4d !important; }
        .login-link { color: #6c757d; }
        .login-link:hover { color: ${COLOR_PRIMARIO}; }
      `}</style>

      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-4">
          <div
            className="card rounded-3"
            style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}
          >
            <div className="card-body p-4 p-md-5">
              {/* Encabezado */}
              <div className="text-center mb-4">
                <img src="/Logo-Aqua.png" alt="Logo AquaChile" width="140" className="mb-4" />
                <h5 className="fw-semibold text-dark mb-1">Acceso Equipo RRHH</h5>
                <p className="text-muted small mb-0">
                  Gestión de Reclutamiento y Evaluación Psicolaboral
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label small fw-medium text-secondary">
                    Correo corporativo
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control login-input"
                    placeholder="nombre@aquachile.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label small fw-medium text-secondary">
                    Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      id="password"
                      type={verPassword ? 'text' : 'password'}
                      className="form-control login-input border-end-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn bg-white border border-start-0 text-muted"
                      onClick={() => setVerPassword(!verPassword)}
                      aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      tabIndex={-1}
                    >
                      <i className={`bi ${verPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn login-btn text-white w-100 fw-semibold py-2"
                  style={{ backgroundColor: COLOR_PRIMARIO }}
                  disabled={cargando}
                >
                  {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>

              {/* Accesos de prueba (solo desarrollo) */}
              {MOSTRAR_ACCESOS_PRUEBA && (
                <div className="mt-4 pt-3 border-top">
                  <div
                    className="text-muted text-uppercase mb-2"
                    style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
                  >
                    Accesos de prueba
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border text-secondary w-50"
                      onClick={() => usarCuentaPrueba('analista@aquachile.cl')}
                    >
                      Analista RRHH
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-light border text-secondary w-50"
                      onClick={() => usarCuentaPrueba('evaluador@aquachile.cl')}
                    >
                      Evaluador Psicolaboral
                    </button>
                  </div>
                </div>
              )}

              {/* Enlace al portal público */}
              <div className="text-center mt-4">
                <Link to="/empleos" className="small text-decoration-none login-link">
                  <i className="bi bi-arrow-left me-1"></i>Ir al Portal Público de Empleos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}