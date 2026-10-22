import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CandidatosTabla from './CandidatosTabla';
import { candidatosIniciales } from '../data/candidatosData';

describe('Pruebas en <CandidatosTabla />', () => {
  it('Debe mostrar el nombre y datos del candidato enviado por props', () => {
    render(
      <BrowserRouter>
        <CandidatosTabla candidatos={candidatosIniciales} />
      </BrowserRouter>
    );

    // verifica con el primer candidato de los datos reales (Rodrigo Andrés Valenzuela Soto)
    const primerCandidato = candidatosIniciales[0];

    expect(screen.getByText(primerCandidato.nombre)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(primerCandidato.rut))).toBeInTheDocument();
  });
});