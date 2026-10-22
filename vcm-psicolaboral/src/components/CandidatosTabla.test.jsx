import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CandidatosTabla from './CandidatosTabla';
import { candidatosIniciales } from '../data/candidatosData';

describe('Pruebas en <CandidatosTabla />', () => {
  it('Debe mostrar el nombre y datos del candidato enviado por props', () => {
    render(<CandidatosTabla candidatos={candidatosIniciales} />);

    // toma el primer candidato real (Rodrigo Andrés Valenzuela Soto)
    const primerCandidato = candidatosIniciales[0];

    expect(screen.getByText(primerCandidato.nombre)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(primerCandidato.rut))).toBeInTheDocument();
    expect(screen.getByText(primerCandidato.ubicacion)).toBeInTheDocument();
  });
});