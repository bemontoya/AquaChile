import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('AquaChile2026!', 10);

  // 1. Crear Analista de Reclutamiento
  const analista = await prisma.usuario.upsert({
    where: { email: 'analista@aquachile.cl' },
    update: {},
    create: {
      nombre: 'Camila Soto (Analista RRHH)',
      email: 'analista@aquachile.cl',
      password: passwordHash,
      rol: 'ANALISTA',
    },
  });

  // 2. Crear Profesional Evaluador
  await prisma.usuario.upsert({
    where: { email: 'evaluador@aquachile.cl' },
    update: {},
    create: {
      nombre: 'Dr. Martín Rojas (Psicólogo Laboral)',
      email: 'evaluador@aquachile.cl',
      password: passwordHash,
      rol: 'EVALUADOR',
    },
  });

  // 3. Crear oferta publicada de prueba
  const ofertaExistente = await prisma.oferta.findFirst({
    where: { cargo: 'Jefe de Turno Planta Proceso' },
  });

  if (!ofertaExistente) {
    await prisma.oferta.create({
      data: {
        cargo: 'Jefe de Turno Planta Proceso',
        familiaCargo: 'Operaciones y Producción',
        ubicacion: 'Planta Calbuco',
        unidad: 'Procesamiento Salmón',
        modalidad: 'PRESENCIAL',
        cupos: 2,
        descripcion: 'Liderar los equipos operativos en línea de proceso asegurando cumplimiento de metas productivas y estándares de calidad.',
        funciones: '- Supervisar dotación de turno\n- Controlar KPIs de rendimiento y merma\n- Velar por normas de seguridad e inocuidad.',
        requisitos: '- Título técnico o profesional en Alimentos, Acuicultura o Industrial.\n- Experiencia mínima de 2 años en plantas de proceso.',
        beneficios: 'Bus de acercamiento, casino en planta, seguro complementario de salud.',
        rangoSalarial: '$1.400.000 - $1.650.000 líquido',
        publicada: true,
        creadorId: analista.id,
      },
    });
  }

  console.log('Seed ejecutado correctamente: Usuarios y oferta de prueba creados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });