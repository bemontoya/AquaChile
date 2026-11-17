import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../services/api';

export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('analista@aquachile.cl');
  const [password, setPassword] = useState('AquaChile2026!');
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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img src="/Logo-Aqua.png" alt="Logo AquaChile" width="160" className="mb-2" />
                <h5 className="fw-bold text-dark mb-1">Acceso Equipo RRHH</h5>
                <p className="text-muted small mb-0">Gestión de Reclutamiento y Evaluación Psicolaboral</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Correo corporativo</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn text-white w-100 fw-bold py-2"
                  style={{ backgroundColor: '#0d3c61' }}
                  disabled={cargando}
                >
                  {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-top">
                <div className="small text-muted mb-2 fw-semibold">Accesos de prueba (Roles):</div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-50"
                    onClick={() => {
                      setEmail('analista@aquachile.cl');
                      setPassword('AquaChile2026!');
                    }}
                  >
                    Analista RRHH
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-50"
                    onClick={() => {
                      setEmail('evaluador@aquachile.cl');
                      setPassword('AquaChile2026!');
                    }}
                  >
                    Evaluador Psicolaboral
                  </button>
                </div>
              </div>

              <div className="text-center mt-3">
                <Link to="/empleos" className="small text-decoration-none">
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