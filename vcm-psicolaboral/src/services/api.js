export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MAPA_ESTADO_DESDE_BD = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  FINALIZADA: 'Finalizada',
};

const MAPA_ESTADO_A_BD = {
  Pendiente: 'PENDIENTE',
  'En Proceso': 'EN_PROCESO',
  Finalizada: 'FINALIZADA',
  Evaluado: 'FINALIZADA',
  Aprobado: 'FINALIZADA',
};

function formatearFechaCL(isoString) {
  if (!isoString) return '';
  const fecha = new Date(isoString);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function obtenerIniciales(nombre = '') {
  return (
    nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '-'
  );
}

// --- SESIÃ“N Y JWT ---
export function getToken() {
  return localStorage.getItem('aquachile_token');
}

export function getUsuarioActual() {
  const raw = localStorage.getItem('aquachile_usuario');
  return raw ? JSON.parse(raw) : null;
}

export function cerrarSesion() {
  localStorage.removeItem('aquachile_token');
  localStorage.removeItem('aquachile_usuario');
}

export async function loginAPI(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Credenciales invÃ¡lidas');

  localStorage.setItem('aquachile_token', data.token);
  localStorage.setItem('aquachile_usuario', JSON.stringify(data.usuario));
  return data;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- PORTAL PÃšBLICO DE OFERTAS (SIN LOGIN) ---
export async function obtenerOfertasPublicas({ familiaCargo = '', busqueda = '' } = {}) {
  const params = new URLSearchParams();
  if (familiaCargo) params.append('familiaCargo', familiaCargo);
  if (busqueda) params.append('busqueda', busqueda);

  const res = await fetch(`${API_URL}/ofertas/publicas?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar oportunidades laborales');
  return res.json();
}

export async function enviarPostulacionPublica({ ofertaId, nombre, rut, email, telefono, archivoCV }) {
  const formData = new FormData();
  formData.append('ofertaId', ofertaId);
  formData.append('nombre', nombre);
  formData.append('rut', rut);
  formData.append('email', email);
  formData.append('telefono', telefono);
  formData.append('cv', archivoCV);

  const res = await fetch(`${API_URL}/postulaciones`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo registrar la postulaciÃ³n');
  return data;
}

// --- ADMINISTRACIÃ“N DE OFERTAS (PROTEGIDO CON JWT) ---
export async function obtenerOfertasAdmin() {
  const res = await fetch(`${API_URL}/ofertas`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No autorizado o error al cargar ofertas');
  return res.json();
}

export async function crearOfertaAPI(datos) {
  const res = await fetch(`${API_URL}/ofertas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...datos, cupos: Number(datos.cupos) || 1 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear la oferta');
  return data;
}

export async function editarOfertaAPI(id, datos) {
  const res = await fetch(`${API_URL}/ofertas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...datos, cupos: Number(datos.cupos) || 1 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar la oferta');
  return data;
}

export async function togglePublicarOfertaAPI(id, publicada) {
  const res = await fetch(`${API_URL}/ofertas/${id}/publicar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ publicada }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cambiar estado de publicaciÃ³n');
  return data;
}

// --- POSTULACIONES Y EVALUACIONES INTERNAS (PROTEGIDO CON JWT) ---
export async function cargarDatosDesdeBD() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/postulaciones`, {
    headers: authHeaders(),
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
      carpetaNombre: p.carpetaNombre,
    };
  });

  const candidatosBD = postulaciones.map((p) => ({
    id: p.postulante.id,
    postulacionId: p.id,
    evaluacionId: p.evaluacion?.id,
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
    cvNombreOriginal: p.cvNombreOriginal,
    carpetaNombre: p.carpetaNombre,
    observaciones: p.evaluacion?.observaciones || '',
    resumenIA: p.resumenIA || '',
    puntajeIA: p.puntajeIA ?? null,
    preguntasIA: p.preguntasIA || '',
  }));

  return { solicitudesBD, candidatosBD };
}

export async function sincronizarEstadoEvaluacion(evaluacionId, nuevoEstadoUI) {
  if (!evaluacionId) return;
  const estadoBD = MAPA_ESTADO_A_BD[nuevoEstadoUI] || nuevoEstadoUI;
  await fetch(`${API_URL}/evaluaciones/${evaluacionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ estado: estadoBD }),
  });
}

// --- BLOQUE 2: DESCARGA SEGURA DE CV, EVALUACIÃ“N E INTELIGENCIA ARTIFICIAL ---
export async function descargarCVPrivado(postulacionId, nombreArchivo = 'CV_Postulante.pdf') {
  const res = await fetch(`${API_URL}/postulaciones/${postulacionId}/cv`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'No se pudo descargar el archivo CV');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}

export async function actualizarEvaluacionAPI(evaluacionId, { estado, observaciones, fechaEvaluacion }) {
  const estadoBD = MAPA_ESTADO_A_BD[estado] || estado;
  const res = await fetch(`${API_URL}/evaluaciones/${evaluacionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      estado: estadoBD,
      observaciones,
      fechaEvaluacion: fechaEvaluacion || undefined,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar la evaluaciÃ³n');
  return data;
}

export async function analizarCandidatoConIA({
  postulacionId,
  nombrePostulante,
  cargo,
  familiaCargo,
  observacionesPrevias = '',
}) {
  const res = await fetch(`${API_URL}/ia/analizar-candidato`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      postulacionId,
      nombrePostulante,
      cargo,
      familiaCargo,
      observacionesPrevias,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al ejecutar análisis de IA');
  return data;
}
