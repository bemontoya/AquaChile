-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ANALISTA', 'EVALUADOR');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'HIBRIDA', 'REMOTA');

-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('RECIBIDA', 'EN_EVALUACION', 'SELECCIONADO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "EstadoEvaluacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ANALISTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oferta" (
    "id" SERIAL NOT NULL,
    "cargo" TEXT NOT NULL,
    "familiaCargo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "unidad" TEXT,
    "modalidad" "Modalidad" NOT NULL DEFAULT 'PRESENCIAL',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cupos" INTEGER NOT NULL DEFAULT 1,
    "descripcion" TEXT NOT NULL,
    "funciones" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "beneficios" TEXT,
    "rangoSalarial" TEXT,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadorId" INTEGER NOT NULL,

    CONSTRAINT "Oferta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulante" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Postulante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" SERIAL NOT NULL,
    "postulanteId" INTEGER NOT NULL,
    "ofertaId" INTEGER NOT NULL,
    "carpetaNombre" TEXT NOT NULL,
    "cvRutaArchivo" TEXT NOT NULL,
    "cvNombreOriginal" TEXT NOT NULL,
    "resumenIA" TEXT,
    "puntajeIA" INTEGER,
    "preguntasIA" TEXT,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'RECIBIDA',
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudEvaluacion" (
    "id" SERIAL NOT NULL,
    "postulacionId" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "estado" "EstadoEvaluacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEvaluacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "googleEventId" TEXT,
    "meetLink" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Postulante_rut_key" ON "Postulante"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_postulanteId_ofertaId_key" ON "Postulacion"("postulanteId", "ofertaId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudEvaluacion_postulacionId_key" ON "SolicitudEvaluacion"("postulacionId");

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudEvaluacion" ADD CONSTRAINT "SolicitudEvaluacion_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudEvaluacion" ADD CONSTRAINT "SolicitudEvaluacion_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
