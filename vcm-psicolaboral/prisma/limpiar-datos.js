import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiar() {
  console.log('Limpiando registros ficticios y de prueba...');

  await prisma.solicitudEvaluacion.deleteMany({});
  await prisma.postulacion.deleteMany({});
  await prisma.postulante.deleteMany({});
  await prisma.oferta.deleteMany({});

  console.log('Base de datos limpia: 0 ofertas, 0 postulantes, 0 postulaciones.');
  console.log('Los usuarios de sistema (Analista / Evaluador) se mantienen activos.');
}

limpiar()
  .catch((e) => {
    console.error('Error al limpiar:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });