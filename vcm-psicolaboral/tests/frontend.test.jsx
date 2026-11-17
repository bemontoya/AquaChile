import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../src/components/Login';
import PortalEmpleos from '../src/components/PortalEmpleos';
import DetalleCandidato from '../src/components/DetalleCandidato';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('Frontend AquaChile - Pruebas Funcionales RTL + user-event', () => {
  it('1. Login: valida campos y autentica correctamente al usuario interno', async () => {
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

    const inputEmail = screen.getByPlaceholderText(/analista@aquachile\.cl/i);
    const inputPass = screen.getByPlaceholderText(/••••••••/i);
    const btnIngresar = screen.getByRole('button', { name: /ingresar/i });

    await user.clear(inputEmail);
    await user.type(inputEmail, 'analista@aquachile.cl');
    await user.clear(inputPass);
    await user.type(inputPass, 'AquaChile2026!');
    await user.click(btnIngresar);

    await waitFor(() => {
      expect(onLoginExitoso).toHaveBeenCalledTimes(1);
    });
  });

  it('2. Portal Público: filtra ofertas, abre formulario de postulación y adjunta CV', async () => {
    const user = userEvent.setup();

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 10,
            cargo: 'Jefe de Centro de Cultivo',
            familiaCargo: 'Operaciones y Centros de Cultivo',
            ubicacion: 'Chiloé, Los Lagos',
            unidad: 'Centro Quellón',
            cupos: 1,
            descripcion: 'Gestión integral de centro de cultivo.',
            funciones: 'Planificación productiva y cumplimiento normativo.',
            requisitos: 'Ingeniero en Acuicultura con 3 años de experiencia.',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: 'Postulación registrada correctamente',
          postulacion: { id: 99, carpetaNombre: '17654321-8_Andres_Valdes' },
        }),
      });

    render(
      <MemoryRouter>
        <PortalEmpleos />
      </MemoryRouter>
    );

    const tituloOferta = await screen.findByText(/Jefe de Centro de Cultivo/i);
    expect(tituloOferta).toBeInTheDocument();

    const btnPostular = screen.getAllByRole('button', { name: /postular/i })[0];
    await user.click(btnPostular);

    await user.type(screen.getByPlaceholderText(/Ej: Juan Pérez/i), 'Andrés Valdés');
    await user.type(screen.getByPlaceholderText(/12\.345\.678-9/i), '17.654.321-8');
    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.cl/i), 'andres.ficticio@ejemplo.cl');
    await user.type(screen.getByPlaceholderText(/\+56 9/i), '+56911223344');

    const archivoCV = new File(['contenido pdf'], 'CV_Andres_Valdes.pdf', {
      type: 'application/pdf',
    });
    const inputArchivo = document.querySelector('input[type="file"]');
    await user.upload(inputArchivo, archivoCV);

    const btnEnviar = screen.getByRole('button', { name: /enviar postulación/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(screen.getByText(/Postulación registrada/i)).toBeInTheDocument();
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
});