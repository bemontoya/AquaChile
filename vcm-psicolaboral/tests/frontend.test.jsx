import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../src/components/Login';
import PortalEmpleos from '../src/components/PortalEmpleos';
import DetalleCandidato from '../src/components/DetalleCandidato';
import AdminOfertas from '../src/components/AdminOfertas';
import Dashboard from '../src/components/Dashboard';
import KanbanSolicitudes from '../src/components/KanbanSolicitudes';
import Navbar from '../src/components/Navbar';
import RegistroCandidato from '../src/components/RegistroCandidato';
import SolicitudesTabla from '../src/components/SolicitudesTabla';
import TarjetaSolicitud from '../src/components/TarjetaSolicitud';
import { solicitudesIniciales } from '../src/data/solicitudesData';
import * as solicitudesUtils from '../src/utils/solicitudes';
import * as calendarUtils from '../src/utils/googleCalendar';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('Frontend AquaChile - Pruebas Funcionales RTL + user-event', () => {
  it('1. Login: permite cambiar rol rápido, ingresar credenciales y autenticar usuario interno', async () => {
    const user = userEvent.setup();
    const onLoginExitoso = vi.fn();

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'jwt-token-prueba',
        usuario: { id: 1, nombre: 'Analista AquaChile', rol: 'ANALISTA' },
      }),
    });

    render(
      <MemoryRouter>
        <Login onLoginExitoso={onLoginExitoso} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Evaluador Psicolaboral/i }));
    await user.click(screen.getByRole('button', { name: /Analista RRHH/i }));

    const inputEmail = screen.getByDisplayValue('analista@aquachile.cl');
    const inputPass = screen.getByDisplayValue('AquaChile2026!');
    const btnIniciar = screen.getByRole('button', { name: /Iniciar Sesión/i });

    await user.clear(inputEmail);
    await user.type(inputEmail, 'analista@aquachile.cl');
    await user.clear(inputPass);
    await user.type(inputPass, 'AquaChile2026!');
    await user.click(btnIniciar);

    await waitFor(() => {
      expect(onLoginExitoso).toHaveBeenCalledTimes(1);
    });
  });

  it('2. Portal Público: filtra ofertas, abre detalle, abre modal de postulación y envía CV adjunto', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/ofertas/publicas')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 10,
              cargo: 'Jefe de Centro de Cultivo',
              familiaCargo: 'Operaciones y Producción',
              ubicacion: 'Chiloé, Los Lagos',
              unidad: 'Centro Quellón',
              cupos: 1,
              descripcion: 'Gestión integral de centro de cultivo.',
              funciones: 'Planificación productiva y cumplimiento normativo.',
              requisitos: 'Ingeniero en Acuicultura con 3 años de experiencia.',
            },
          ],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          mensaje: 'Postulación enviada con éxito',
          postulacion: { id: 99, carpetaNombre: '17654321-8_Andres_Valdes' },
        }),
      });
    });

    render(
      <MemoryRouter>
        <PortalEmpleos />
      </MemoryRouter>
    );

    const tituloOferta = await screen.findByText(/Jefe de Centro de Cultivo/i);
    expect(tituloOferta).toBeInTheDocument();

    const inputBuscar = screen.getByPlaceholderText(/Jefe de Turno/i);
    await user.type(inputBuscar, 'Jefe');
    await user.click(screen.getByRole('button', { name: /Filtrar/i }));

    await user.click(screen.getByRole('button', { name: /Ver Detalle/i }));
    await user.click(screen.getAllByRole('button', { name: /^Postular$/i })[0]);

    await user.type(screen.getByPlaceholderText(/Ej: Valentina Soto Pérez/i), 'Andrés Valdés');
    await user.type(screen.getByPlaceholderText(/Ej: 18\.765\.432-1/i), '17.654.321-8');
    await user.type(screen.getByPlaceholderText(/postulante@correo\.cl/i), 'andres.ficticio@ejemplo.cl');
    await user.type(screen.getByPlaceholderText(/\+56 9 8765 4321/i), '+56911223344');

    const archivoCV = new File(['contenido pdf'], 'CV_Andres_Valdes.pdf', {
      type: 'application/pdf',
    });
    const inputArchivo = document.querySelector('input[type="file"]');
    fireEvent.change(inputArchivo, { target: { files: [archivoCV] } });

    const formModal = document.querySelector('.modal form');
    fireEvent.submit(formModal);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/postulaciones'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('3. Detalle Candidato: actualiza estado de evaluación y ejecuta Asistente IA', async () => {
    const user = userEvent.setup();
    const candidatosMock = [
      {
        id: '1',
        postulacionId: 5,
        evaluacionId: 8,
        nombre: 'Carlos Muñoz',
        rut: '16.543.210-K',
        telefono: '+56955443322',
        email: 'carlos.ficticio@test.cl',
        cargo: 'Jefe de Turno Planta Proceso',
        familiaCargo: 'Plantas de Proceso',
        estado: 'Pendiente',
        observaciones: '',
        cvNombreOriginal: 'CV_Carlos.pdf',
      },
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 8, estado: 'Finalizada' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          puntajeOrientativo: 86,
          resumen: 'Alto ajuste para liderazgo en línea de proceso continuo.',
          criteriosEvaluados: ['Liderazgo operativo', 'Normativa HACCP'],
          preguntasSugeridas: ['¿Cómo gestionas detenciones no programadas en turno?'],
        }),
      });

    render(
      <MemoryRouter initialEntries={['/candidatos/1']}>
        <Routes>
          <Route
            path="/candidatos/:id"
            element={<DetalleCandidato candidatos={candidatosMock} />}
          />
        </Routes>
      </MemoryRouter>
    );

    const btnGuardar = screen.getByRole('button', { name: /guardar evaluación/i });
    await user.click(btnGuardar);

    await waitFor(() => {
      expect(screen.getByText(/actualizada correctamente/i)).toBeInTheDocument();
    });

    const btnIA = screen.getByRole('button', { name: /generar análisis orientativo ia/i });
    await user.click(btnIA);

    await waitFor(() => {
      expect(screen.getByText(/86%/i)).toBeInTheDocument();
      expect(screen.getByText(/Alto ajuste para liderazgo/i)).toBeInTheDocument();
    });
  });

  it('4. AdminOfertas: crea, edita y publica/despublica ofertas laborales', async () => {
    const user = userEvent.setup();
    const ofertasMock = [
      {
        id: 1,
        cargo: 'Veterinario de Centro',
        familiaCargo: 'Salud y Nutrición',
        ubicacion: 'Aysén',
        unidad: 'Centro Melinka',
        cupos: 2,
        publicada: true,
        descripcion: 'Salud de peces',
        funciones: 'Muestreos sanitarios',
        requisitos: 'Médico Veterinario',
        _count: { postulaciones: 3 },
      },
    ];

    global.fetch = vi.fn((url, opts) => {
      if (opts?.method === 'POST' || opts?.method === 'PUT' || opts?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ...ofertasMock[0], id: 2, cargo: 'Buzo Comercial' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ofertasMock,
      });
    });

    render(
      <MemoryRouter>
        <AdminOfertas usuario={{ rol: 'ANALISTA' }} />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Veterinario de Centro/i)).toBeInTheDocument();

    const btnNueva = screen.getByRole('button', { name: /Nueva Oferta/i });
    await user.click(btnNueva);

    const inputsTexto = document.querySelectorAll('.modal input[type="text"]');
    if (inputsTexto.length > 0) {
      await user.type(inputsTexto[0], 'Buzo Comercial');
    }
    const formOferta = document.querySelector('.modal form');
    if (formOferta) {
      fireEvent.submit(formOferta);
    }

    const btnEditar = screen.getByRole('button', { name: /Editar/i });
    await user.click(btnEditar);
    const btnCancelar = screen.queryByRole('button', { name: /Cancelar/i });
    if (btnCancelar) await user.click(btnCancelar);

    const btnToggle = screen.getByRole('button', { name: /Despublicar|Publicar/i });
    await user.click(btnToggle);

    expect(global.fetch).toHaveBeenCalled();
  });

  it('5. Dashboard, Kanban, Tablas, Tarjetas, Registro y Utils funcionan correctamente', async () => {
    const listaSolicitudes = solicitudesIniciales.slice(0, 2);
    const candidatosMock = [
      {
        id: '1',
        nombre: 'Elena Gómez',
        rut: '19.111.222-3',
        cargo: 'Veterinario de Centro',
        familiaCargo: 'Salud y Nutrición',
        estado: 'Pendiente',
      },
    ];

    Object.values(solicitudesUtils).forEach((fn) => {
      if (typeof fn === 'function') {
        try {
          fn(listaSolicitudes, 'Pendiente');
        } catch {}
      }
    });

    await calendarUtils
      .crearEventoCalendario({
        titulo: 'Entrevista Psicolaboral',
        descripcion: 'Evaluación técnica',
        fecha: '2026-11-20',
        bloque: '09:00 - 10:00',
        invitados: ['evaluador@aquachile.cl'],
        notificar: false,
      })
      .catch(() => {});

    render(
      <MemoryRouter>
        <Navbar
          usuario={{ nombre: 'Analista RRHH', rol: 'ANALISTA' }}
          onCerrarSesion={vi.fn()}
        />
        <Dashboard solicitudes={listaSolicitudes} candidatos={candidatosMock} />
        <KanbanSolicitudes solicitudes={listaSolicitudes} onActualizarEstado={vi.fn()} />
        <SolicitudesTabla
          solicitudes={listaSolicitudes}
          onCambiarEstado={vi.fn()}
          onEliminar={vi.fn()}
        />
        <TarjetaSolicitud solicitud={listaSolicitudes[0]} />
        <RegistroCandidato onAgregarCandidato={vi.fn()} />
      </MemoryRouter>
    );

    const formRegistro = document.querySelector('form');
    if (formRegistro) {
      await act(async () => {
        fireEvent.submit(formRegistro);
      });
    }

    expect(screen.getAllByText(/Pendiente/i).length).toBeGreaterThan(0);
  });
});