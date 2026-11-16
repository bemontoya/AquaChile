const API_URL = 'http://localhost:3001/api';

const MAPA_ESTADO_DESDE_BD = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  EVALUADO: 'Evaluado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

const MAPA_ESTADO_A_BD = {
  Pendiente: 'PENDIENTE',
  'En Proceso': 'EN_PROCESO',
  Evaluado: 'EVALUADO',
  Aprobado: 'APROBADO',
  Rechazado: 'RECHAZADO',
};

function formatearFechaCL(isoString) {
  if (!isoString) return '';
  const fecha = new Date(isoString);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function obtenerIniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '-';
}

// Inicia sesión automáticamente con el analista semilla si no hay token guardado
export async function asegurarTokenSesion() {
  let token = localStorage.getItem('aquachile_token');
  if (token) return token;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'analista@aquachile.cl',
      password: 'AquaChile2026!',
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem('aquachile_token', data.token);
  return data.token;
}

// Obtiene las postulaciones desde PostgreSQL en el formato exacto de tu frontend
export async function cargarDatosDesdeBD() {
  const token = await asegurarTokenSesion();
  if (!token) return null;

  const res = await fetch(`${API_URL}/postulaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const postulaciones = await res.json();

  const solicitudesBD = postulaciones.map((p) => {
    const nombreEvaluador = p.evaluacion?.responsable?.nombre || 'Por asignar';
    const estadoRaw = p.evaluacion?.estado || 'PENDIENTE';

    return {
      id: `SOL-2026-${String(p.id).padStart(3, '0')}`,
      postulacionId: p.id,
      evaluacionId: p.evaluacion?.id,
      candidato: p.postulante.nombre,
      rut: p.postulante.rut,
      email: p.postulante.email,
      telefono: p.postulante.telefono || '',
      cargo: p.oferta.cargo,
      familia: p.oferta.familiaCargo,
      area: p.oferta.unidad || p.oferta.familiaCargo,
      ubicacion: p.oferta.ubicacion,
      origen: 'Externo',
      requiereReferencia: false,
      ceco: '',
      fecha: formatearFechaCL(p.fechaPostulacion),
      fechaInforme: formatearFechaCL(p.evaluacion?.fechaEvaluacion),
      tiempo: null,
      evaluador: nombreEvaluador,
      evaluadorInit: nombreEvaluador === 'Por asignar' ? '-' : obtenerIniciales(nombreEvaluador),
      estado: MAPA_ESTADO_DESDE_BD[estadoRaw] || estadoRaw,
      categoria: '',
      cvNombreOriginal: p.cvNombreOriginal,
    };
  });

  const candidatosBD = postulaciones.map((p) => ({
    id: p.postulante.id,
    nombre: p.postulante.nombre,
    rut: p.postulante.rut,
    email: p.postulante.email,
    telefono: p.postulante.telefono || '',
    cargo: p.oferta.cargo,
    familiaCargo: p.oferta.familiaCargo,
    unidad: p.oferta.unidad || p.oferta.familiaCargo,
    ubicacion: p.oferta.ubicacion,
    estado: MAPA_ESTADO_DESDE_BD[p.evaluacion?.estado] || 'Pendiente',
    fechaRegistro: formatearFechaCL(p.fechaPostulacion),
  }));

  return { solicitudesBD, candidatosBD };
}

// Sincroniza cambios de estado (ej. arrastrar tarjeta en Kanban) hacia PostgreSQL
export async function sincronizarEstadoEvaluacion(evaluacionId, nuevoEstadoUI) {
  if (!evaluacionId) return;
  const token = await asegurarTokenSesion();
  if (!token) return;

  const estadoBD = MAPA_ESTADO_A_BD[nuevoEstadoUI] || nuevoEstadoUI;
  await fetch(`${API_URL}/evaluaciones/${evaluacionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado: estadoBD }),
  });
}

// Descarga el CV privado desde el servidor
export async function descargarCV(postulacionId, nombreArchivo = 'CV.pdf') {
  const token = await asegurarTokenSesion();
  if (!token) return;

  const res = await fetch(`${API_URL}/postulaciones/${postulacionId}/cv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}