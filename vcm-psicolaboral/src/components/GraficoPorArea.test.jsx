import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GraficoPorArea from './GraficoPorArea';

describe('Pruebas en <GraficoPorArea />', () => {
  // Datos simulados de prueba (Mock Data)
  const solicitudesDePrueba = [
    { id: 'SOL-001', area: 'Industrial', estado: 'Pendiente' },
    { id: 'SOL-002', area: 'Industrial', estado: 'En proceso' },
    { id: 'SOL-003', area: 'Corporativo', estado: 'Finalizada' },
  ];

  it('Debe renderizar el título del gráfico correctamente', () => {
    render(<GraficoPorArea solicitudes={solicitudesDePrueba} />);
    expect(screen.getByText('Evaluaciones por Unidad')).toBeInTheDocument();
  });

  it('Debe calcular y mostrar el total correcto de procesos', () => {
    render(<GraficoPorArea solicitudes={solicitudesDePrueba} />);
    // Verifica que se muestre "3 proceso(s)" según el arreglo de prueba
    expect(screen.getByText('3 proceso(s)')).toBeInTheDocument();
  });
});