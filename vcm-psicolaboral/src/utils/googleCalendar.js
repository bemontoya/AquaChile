//este archivo pide permiso al usuario con iniciar sesion con google (google identity services)
//con este permiso se crea un evento en google calendar con enlace de meet

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

const ZONA_HORARIA = 'America/Santiago';

let tokenGuardado = null; 

let promesaScript = null;


//se carga el script oficial de google
function cargarScriptGoogle(){
    if(promesaScript) return promesaScript;

    promesaScript = new Promise((resolve, reject) => {

        if (window.google?.accounts?.oauth2) return resolve();

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => {
            promesaScript = null; //permite reintentar si es que falló
            reject(new Error ('No se pudo cargar el servicio de Google. Revisa tu conexión.'));
        };
        document.head.appendChild(script);
    });
    
    return promesaScript;
}


async function obtenerToken() {
  if (!CLIENT_ID) {
    throw new Error('Falta VITE_GOOGLE_CLIENT_ID en el archivo .env (y reiniciar Vite).');
  }
 
  if (tokenGuardado && Date.now() < tokenGuardado.expiraEn) {
    return tokenGuardado.valor;
  }
 
  await cargarScriptGoogle();
 
  return new Promise((resolve, reject) => {
    const cliente = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      // Se ejecuta cuando Google responde.
      callback: (respuesta) => {
        if (respuesta.error) {
          return reject(new Error('No se autorizó el acceso a Google Calendar.'));
        }
        tokenGuardado = {
          valor: respuesta.access_token,
          expiraEn: Date.now() + (Number(respuesta.expires_in) - 60) * 1000,
        };
        resolve(respuesta.access_token);
      },
      error_callback: () => {
        reject(new Error('Se cerró o bloqueó la ventana de Google. Intenta de nuevo.'));
      },
    });
 
    // abre la ventana de Google.
    cliente.requestAccessToken();
  });
}
 
export async function crearEventoCalendario({ titulo, descripcion, fecha, bloque, invitados, notificar }) {
  const horas = bloque.match(/(\d{2}:\d{2}).*?(\d{2}:\d{2})/);
  if (!horas) throw new Error('El bloque horario no tiene un formato válido.');
  const [, horaInicio, horaFin] = horas;
 
  const token = await obtenerToken();
 
  const evento = {
    summary: titulo,
    description: descripcion,
    start: { dateTime: `${fecha}T${horaInicio}:00`, timeZone: ZONA_HORARIA },
    end: { dateTime: `${fecha}T${horaFin}:00`, timeZone: ZONA_HORARIA },
    attendees: invitados.filter(Boolean).map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(), 
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };
 

  const url =
    'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
    `?conferenceDataVersion=1&sendUpdates=${notificar ? 'all' : 'none'}`;
 
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(evento),
  });
 
  if (!respuesta.ok) {
    if (respuesta.status === 401) tokenGuardado = null;
    const detalle = await respuesta.json().catch(() => null);
    throw new Error(detalle?.error?.message || 'Google Calendar rechazó la solicitud.');
  }
 
  const creado = await respuesta.json();
  return {
    enlaceEvento: creado.htmlLink, // abre el evento en Google Calendar
    enlaceMeet: creado.hangoutLink, // enlace de la videollamada
  };
}