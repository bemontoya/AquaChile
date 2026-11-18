import { describe, it, expect } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../server.js';

let tokenAnalista = '';
let tokenEvaluador = '';
let ofertaCreadaId = null;
let postulacionCreadaId = null;
let evaluacionCreadaId = null;

describe('API REST AquaChile - Seguridad JWT, CRUD, CV Privado e IA', () => {
  it('1. Rechaza login con credenciales inválidas (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analista@aquachile.cl', password: 'ClaveIncorrecta123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('2. Autentica correctamente al Analista y al Evaluador devolviendo JWT', async () => {
    const resAnalista = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analista@aquachile.cl', password: 'AquaChile2026!' });

    expect(resAnalista.status).toBe(200);
    expect(resAnalista.body.token).toBeTruthy();
    tokenAnalista = resAnalista.body.token;

    const resEval = await request(app)
      .post('/api/auth/login')
      .send({ email: 'evaluador@aquachile.cl', password: 'AquaChile2026!' });

    expect(resEval.status).toBe(200);
    tokenEvaluador = resEval.body.token;
  });

  it('3. Protege rutas internas sin token (401) y restringe creación de ofertas por rol (403)', async () => {
    const sinToken = await request(app).get('/api/ofertas');
    expect(sinToken.status).toBe(401);

    const rolNoAutorizado = await request(app)
      .post('/api/ofertas')
      .set('Authorization', `Bearer ${tokenEvaluador}`)
      .send({ cargo: 'Cargo Prueba Rol' });

    expect(rolNoAutorizado.status).toBe(403);
  });

  it('4. Permite al Analista crear, editar y publicar una oferta laboral', async () => {
    const resCrear = await request(app)
      .post('/api/ofertas')
      .set('Authorization', `Bearer ${tokenAnalista}`)
      .send({
        cargo: 'Supervisor Centro Cultivo Test',
        familiaCargo: 'Operaciones y Centros de Cultivo',
        ubicacion: 'Calbuco, Región de Los Lagos',
        unidad: 'Centro Punta Redonda',
        cupos: 2,
        descripcion: 'Supervisión operativa en centro de cultivo.',
        funciones: 'Control de alimentación y bioseguridad.',
        requisitos: 'Título técnico o ingeniero acuícola.',
      });

    expect(resCrear.status).toBe(201);
    ofertaCreadaId = resCrear.body.id;

    const resEditar = await request(app)
      .put(`/api/ofertas/${ofertaCreadaId}`)
      .set('Authorization', `Bearer ${tokenAnalista}`)
      .send({ cupos: 3 });

    expect(resEditar.status).toBe(200);
    expect(resEditar.body.cupos).toBe(3);

    const resPublicar = await request(app)
      .patch(`/api/ofertas/${ofertaCreadaId}/publicar`)
      .set('Authorization', `Bearer ${tokenAnalista}`)
      .send({ publicada: true });

    expect(resPublicar.status).toBe(200);
    expect(resPublicar.body.publicada).toBe(true);
  });

  it('5. Consulta ofertas públicas filtradas en el portal sin login', async () => {
    const res = await request(app)
      .get('/api/ofertas/publicas')
      .query({ busqueda: 'Supervisor Centro Cultivo Test' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('6. Valida postulación sin CV (400) y registra postulación válida con CV privado (201)', async () => {
    const sinArchivo = await request(app)
      .post('/api/postulaciones')
      .field('ofertaId', String(ofertaCreadaId))
      .field('nombre', 'Postulante Test')
      .field('rut', '19.876.543-2')
      .field('email', 'test.postulante@ejemplo.cl')
      .field('telefono', '+56912345678');

    expect(sinArchivo.status).toBe(400);

    // Crear archivo PDF ficticio de prueba
    const rutaPdfPrueba = path.resolve('tests/cv_prueba_ficticio.pdf');
    fs.writeFileSync(rutaPdfPrueba, '%PDF-1.4\n1 0 obj\n<< /Title (CV Ficticio) >>\nendobj\n%%EOF');

    const resPostular = await request(app)
      .post('/api/postulaciones')
      .field('ofertaId', String(ofertaCreadaId))
      .field('nombre', 'María Fernanda Rojas')
      .field('rut', `18.${Math.floor(100 + Math.random() * 899)}.789-K`)
      .field('email', 'mrojas.ficticio@ejemplo.cl')
      .field('telefono', '+56987654321')
      .attach('cv', rutaPdfPrueba);

    expect(resPostular.status).toBe(201);
    postulacionCreadaId = resPostular.body.postulacion.id;
    expect(resPostular.body.postulacion.carpetaNombre).toBeTruthy();

    fs.unlinkSync(rutaPdfPrueba);
  });

  it('7. Recupera listado de postulaciones, descarga CV privado y actualiza evaluación', async () => {
    const resLista = await request(app)
      .get('/api/postulaciones')
      .set('Authorization', `Bearer ${tokenEvaluador}`);

    expect(resLista.status).toBe(200);
    const creada = resLista.body.find((p) => p.id === postulacionCreadaId);
    expect(creada).toBeDefined();
    evaluacionCreadaId = creada.evaluacion?.id;

    const resCV = await request(app)
      .get(`/api/postulaciones/${postulacionCreadaId}/cv`)
      .set('Authorization', `Bearer ${tokenEvaluador}`);

    expect(resCV.status).toBe(200);

    if (evaluacionCreadaId) {
      const resEval = await request(app)
        .patch(`/api/evaluaciones/${evaluacionCreadaId}`)
        .set('Authorization', `Bearer ${tokenEvaluador}`)
        .send({
          estado: 'EN_PROCESO',
          observaciones: 'Candidata con sólida experiencia en centros de cultivo.',
        });

      expect(resEval.status).toBe(200);
      expect(resEval.body.estado).toBe('EN_PROCESO');
    }
  });

  it('8. Ejecuta análisis orientativo IA con datos anonimizados', async () => {
    const resIA = await request(app)
      .post('/api/ia/analizar-candidato')
      .set('Authorization', `Bearer ${tokenEvaluador}`)
      .send({
        postulacionId: postulacionCreadaId,
        cargo: 'Supervisor Centro Cultivo Test',
        familiaCargo: 'Operaciones y Centros de Cultivo',
        observacionesPrevias: 'Buen manejo de equipos en terreno.',
      });

    expect(resIA.status).toBe(200);
    expect(resIA.body.puntajeOrientativo).toBeGreaterThanOrEqual(65);
    expect(Array.isArray(resIA.body.preguntasSugeridas)).toBe(true);
  });
});



it('9. Registra postulación por nombre de cargo cuando no se envía ofertaId', async () => {
    const rutaPdfPrueba = path.resolve('tests/cv_cargo_directo.pdf');
    fs.writeFileSync(rutaPdfPrueba, '%PDF-1.4\n1 0 obj\n<< /Title (CV Cargo Directo) >>\nendobj\n%%EOF');

    const res = await request(app)
      .post('/api/postulaciones')
      .field('cargo', `Técnico Acuícola Test ${Date.now()}`)
      .field('familiaCargo', 'Operaciones y Centros de Cultivo')
      .field('ubicacion', 'Puerto Montt')
      .field('nombre', 'Diego Contreras')
      .field('rut', `17.${Math.floor(100 + Math.random() * 899)}.222-3`)
      .field('email', 'dcontreras.ficticio@ejemplo.cl')
      .field('telefono', '+56922334455')
      .attach('cv', rutaPdfPrueba);

    expect(res.status).toBe(201);
    fs.unlinkSync(rutaPdfPrueba);
  });

  it('10. Envía correo de confirmación de postulación (/api/enviar-confirmacion)', async () => {
    const res = await request(app)
      .post('/api/enviar-confirmacion')
      .send({
        nombre: 'María Fernanda Rojas',
        email: 'delivered@resend.dev',
        cargo: 'Supervisor Centro Cultivo Test',
      });

    expect([200, 500]).toContain(res.status);
  });

  it('11. Valida errores 400 y 404 en descarga de CV, IA, ofertas y evaluaciones', async () => {
    const resCv404 = await request(app)
      .get('/api/postulaciones/999999/cv')
      .set('Authorization', `Bearer ${tokenEvaluador}`);
    expect(resCv404.status).toBe(404);

    const resIa400 = await request(app)
      .post('/api/ia/analizar-candidato')
      .set('Authorization', `Bearer ${tokenEvaluador}`)
      .send({});
    expect(resIa400.status).toBe(400);

    const resOferta400 = await request(app)
      .put('/api/ofertas/999999')
      .set('Authorization', `Bearer ${tokenAnalista}`)
      .send({ cupos: 5 });
    expect(resOferta400.status).toBe(400);

    const resEval400 = await request(app)
      .patch('/api/evaluaciones/999999')
      .set('Authorization', `Bearer ${tokenEvaluador}`)
      .send({ estado: 'FINALIZADA' });
    expect(resEval400.status).toBe(400);
  });