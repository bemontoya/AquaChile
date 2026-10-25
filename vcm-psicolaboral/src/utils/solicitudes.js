// Genera el siguiente correlativo: SOL-2026-018, SOL-2026-019, ...
export function siguienteIdSolicitud(solicitudes){
    const max = solicitudes.reduce((acc, solicitud) => {
        const numero = Number(solicitud.id.split('-').pop());
        return Number.isNaN(numero) ? acc : Math.max(acc, numero);
    }, 0);

    const anio = new Date().getFullYear();
    return `SOL-${anio}-${String(max+1).padStart(3,'0')}`;
}

// Fecha de hoy en formato dd/mm/aaaa, igual al resto de los datos
function fechaHoy(){
    const hoy= new Date();
    const dia = String(hoy.getDate()).padStart(2,'0');
    const mes = String(hoy.getMonth()+1).padStart(2,'0');
    return `${dia}/${mes}/${hoy.getFullYear()}`;
}

// Convierte un candidato recién registrado en una solicitud Pendiente
export function crearSolicitudDesdeCandidato(candidato, solicitudes) {
    return{
        id: siguienteIdSolicitud(solicitudes),
        candidato: candidato.nombre,
        rut: candidato.rut,
        email: candidato.email,
        telefono: candidato.telefono,
        cargo: candidato.cargo,
        familia: candidato.familiaCargo,
        area: candidato.unidad || 'Por asignar',
        ubicacion: candidato.ubicacion,
        origen: 'Externo',
        requiereReferencia: false,
        ceco: '',
        fecha: fechaHoy(),
        fechaInforme: '',
        tiempo: null,
        evaluador: 'Por asignar',
        evaluadorInit: '-',
        estado: 'Pendiente',
        categoria: ''
    };
}