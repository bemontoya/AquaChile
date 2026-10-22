import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubHeader from './SubHeader';

describe('Pruebas en <SubHeader />', () => {
  const solicitudesMock = [
    { id: '1', estado: 'Pendiente' },
    { id: '2', estado: 'En proceso' },
  ];

  it('Debe renderizar los botones de filtro de estado', () => {
    render(
      <SubHeader
        filtroActual="Todos"
        setFiltroActual={() => {}}
        busqueda=""
        setBusqueda={() => {}}
        solicitudes={solicitudesMock}
      />
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('En proceso')).toBeInTheDocument();
    expect(screen.getByText('Finalizadas')).toBeInTheDocument();
  });

  it('Debe llamar a setBusqueda cuando el usuario escribe en el input', () => {
    const mockSetBusqueda = vi.fn();

    render(
      <SubHeader
        filtroActual="Todos"
        setFiltroActual={() => {}}
        busqueda=""
        setBusqueda={mockSetBusqueda}
        solicitudes={solicitudesMock}
      />
    );

    // Busca el input por rol o por coincidencia parcial de placeholder
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Juan' } });

    expect(mockSetBusqueda).toHaveBeenCalledWith('Juan');
  });
});