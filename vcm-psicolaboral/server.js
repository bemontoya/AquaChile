import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { verificarToken, permitirRoles } from './middlewares/auth.js';
import { configurarSwagger } from './swagger.js';
import fs from 'fs';
import { uploadCV } from './middlewares/uploadCV.js';

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Activar documentaciÃ³n Swagger en http://localhost:3001/api-docs
configurarSwagger(app);

// ==========================================
// 1. AUTENTICACIÃ“N (JWT)
// ==========================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesiÃ³n interna (Analista o Evaluador)
 *     tags: [AutenticaciÃ³n]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: analista@aquachile.cl
 *               password:
 *                 type: string
 *                 example: AquaChile2026!
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT
 *       401:
 *         description: Credenciales invÃ¡lidas
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales invÃ¡lidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales invÃ¡lidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al iniciar sesiÃ³n' });
  }
});

// ==========================================
// 2. GESTIÃ“N DE OFERTAS LABORALES (CRUD)
// ==========================================

/**
 * @swagger
 * /api/ofertas/publicas:
 *   get:
 *     summary: Obtener ofertas publicadas (Portal PÃºblico sin login)
 *     tags: [Ofertas]
 *     responses:
 *       200:
 *         description: Lista de ofertas activas
 */
app.get('/api/ofertas/publicas', async (req, res) => {
  const { familiaCargo, busqueda } = req.query;
  try {
    const ofertas = await prisma.oferta.findMany({
      where: {
        publicada: true,
        ...(familiaCargo && { familiaCargo }),
        ...(busqueda && {
          OR: [
            { cargo: { contains: busqueda, mode: 'insensitive' } },
            { ubicacion: { contains: busqueda, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { fechaPublicacion: 'desc' },
    });
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ofertas:
 *   get:
 *     summary: Listar todas las ofertas (Panel Admin protegido)
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las ofertas registradas
 */
app.get('/api/ofertas', verificarToken, async (req, res) => {
  try {
    const ofertas = await prisma.oferta.findMany({
      include: { _count: { select: { postulaciones: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ofertas:
 *   post:
 *     summary: Crear nueva oferta laboral (Solo Analista)
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Oferta creada exitosamente
 */
app.post('/api/ofertas', verificarToken, permitirRoles('ANALISTA'), async (req, res) => {
  try {
    const nuevaOferta = await prisma.oferta.create({
      data: {
        ...req.body,
        cupos: Number(req.body.cupos) || 1,
        creadorId: req.usuario.id,
      },
    });
    res.status(201).json(nuevaOferta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ofertas/{id}:
 *   put:
 *     summary: Editar una oferta laboral existente (Solo Analista)
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Oferta actualizada
 */
app.put('/api/ofertas/:id', verificarToken, permitirRoles('ANALISTA'), async (req, res) => {
  const { id } = req.params;
  try {
    const ofertaActualizada = await prisma.oferta.update({
      where: { id: Number(id) },
      data: {
        ...req.body,
        ...(req.body.cupos && { cupos: Number(req.body.cupos) }),
      },
    });
    res.json(ofertaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ofertas/{id}/publicar:
 *   patch:
 *     summary: Publicar o despublicar una oferta laboral (Solo Analista)
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado de publicaciÃ³n actualizado
 */
app.patch('/api/ofertas/:id/publicar', verificarToken, permitirRoles('ANALISTA'), async (req, res) => {
  const { id } = req.params;
  const { publicada } = req.body;
  try {
    const oferta = await prisma.oferta.update({
      where: { id: Number(id) },
      data: { publicada: Boolean(publicada) },
    });
    res.json(oferta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 3. POSTULACIONES, CV PRIVADO Y EVALUACIONES
// ==========================================

/**
 * @swagger
 * /api/postulaciones:
 *   post:
 *     summary: Enviar postulaciÃ³n pÃºblica con CV adjunto (PDF/DOCX)
 *     tags: [Postulaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ofertaId:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               rut:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: PostulaciÃ³n registrada y CV almacenado en carpeta privada
 */

/**
 * @swagger
 * /api/postulaciones:
 *   get:
 *     summary: Listar todas las postulaciones y sus evaluaciones (Panel Interno)
 *     tags: [Postulaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado completo para tabla y Kanban
 */
app.get('/api/postulaciones', verificarToken, async (req, res) => {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      include: {
        postulante: true,
        oferta: true,
        evaluacion: {
          include: { responsable: { select: { id: true, nombre: true, email: true } } },
        },
      },
      orderBy: { fechaPostulacion: 'desc' },
    });
    res.json(postulaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/postulaciones/{id}/cv:
 *   get:
 *     summary: Descargar CV privado del postulante (Solo usuarios autenticados)
 *     tags: [Postulaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Descarga del archivo CV
 */
app.post('/api/postulaciones', uploadCV.single('cv'), async (req, res) => {
  const { ofertaId, nombre, rut, email, telefono, cargo, familiaCargo, ubicacion, unidad } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Debe adjuntar un archivo CV válido (PDF o DOCX, máx. 5MB).' });
  }

  try {
    // 1. Resolver oferta: usar ofertaId si viene, o buscar/crear por nombre de cargo
    let ofertaFinalId = ofertaId ? Number(ofertaId) : null;

    if (!ofertaFinalId && cargo) {
      let ofertaExistente = await prisma.oferta.findFirst({
        where: { cargo: { equals: cargo.trim(), mode: 'insensitive' } },
      });

      if (!ofertaExistente) {
        const creador = await prisma.usuario.findFirst({ where: { rol: 'ANALISTA' } });
        ofertaExistente = await prisma.oferta.create({
          data: {
            cargo: cargo.trim(),
            familiaCargo: familiaCargo || 'Operaciones y Centros de Cultivo',
            ubicacion: ubicacion || 'Puerto Montt',
            unidad: unidad || 'General',
            descripcion: `Proceso de admisión directa para ${cargo.trim()}`,
            funciones: `Funciones asociadas al cargo de ${cargo.trim()}`,
            requisitos: `Requisitos estándar del perfil para ${cargo.trim()}`,
            creadorId: creador.id,
          },
        });
      }
      ofertaFinalId = ofertaExistente.id;
    }

    // 2. Crear o actualizar datos del postulante por RUT
    const postulante = await prisma.postulante.upsert({
      where: { rut },
      update: { nombre, email, telefono },
      create: { nombre, rut, email, telefono },
    });

    // 3. Registrar postulación vinculada a la carpeta privada del CV
    const postulacion = await prisma.postulacion.create({
      data: {
        postulanteId: postulante.id,
        ofertaId: ofertaFinalId,
        carpetaNombre: req.carpetaPostulante,
        cvRutaArchivo: req.file.path,
        cvNombreOriginal: req.file.originalname,
      },
      include: { oferta: true },
    });

    // 4. Crear automáticamente la solicitud de evaluación en estado PENDIENTE
    const evaluadorDefault = await prisma.usuario.findFirst({
      where: { rol: 'EVALUADOR' },
    });

    if (evaluadorDefault) {
      await prisma.solicitudEvaluacion.create({
        data: {
          postulacionId: postulacion.id,
          responsableId: evaluadorDefault.id,
          estado: 'PENDIENTE',
        },
      });
    }

    res.status(201).json({
      mensaje: 'Postulación registrada correctamente',
      postulacion,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya registraste una postulación para esta oferta.' });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   patch:
 *     summary: Actualizar estado, fechas, observaciones o Meet de evaluaciÃ³n psicolaboral
 *     tags: [Evaluaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: EvaluaciÃ³n actualizada
 */
app.patch('/api/evaluaciones/:id', verificarToken, async (req, res) => {
  const { estado, fechaEvaluacion, observaciones, responsableId, googleEventId, meetLink } = req.body;
  try {
    const evaluacion = await prisma.solicitudEvaluacion.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(estado && { estado }),
        ...(fechaEvaluacion && { fechaEvaluacion: new Date(fechaEvaluacion) }),
        ...(observaciones !== undefined && { observaciones }),
        ...(responsableId && { responsableId: Number(responsableId) }),
        ...(googleEventId && { googleEventId }),
        ...(meetLink && { meetLink }),
      },
      include: {
        postulacion: { include: { postulante: true, oferta: true } },
        responsable: { select: { id: true, nombre: true } },
      },
    });
    res.json(evaluacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 4. NOTIFICACIONES POR CORREO (RESEND)
// ==========================================

/**
 * @swagger
 * /api/enviar-confirmacion:
 *   post:
 *     summary: Enviar correo electrÃ³nico de confirmaciÃ³n de postulaciÃ³n
 *     tags: [Notificaciones]
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 */
app.post('/api/enviar-confirmacion', async (req, res) => {
  const { nombre, email, cargo } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'AquaChile Reclutamiento <onboarding@resend.dev>',
      to: [email],
      subject: 'ConfirmaciÃ³n de PostulaciÃ³n - AquaChile',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0d3c61;">Hola ${nombre},</h2>
          <p>Te confirmamos que hemos recibido tus antecedentes para el cargo de <strong>${cargo}</strong>.</p>
          <p>Tu proceso de evaluaciÃ³n se encuentra iniciado.</p>
          <br/>
          <p>Atentamente,<br/><strong>Equipo de Reclutamiento y SelecciÃ³n - AquaChile</strong></p>
        </div>
      `,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. ASISTENTE DE INTELIGENCIA ARTIFICIAL
// ==========================================

/**
 * @swagger
 * /api/ia/analizar-candidato:
 *   post:
 *     summary: Generar anÃ¡lisis preliminar y guÃ­a de entrevista psicolaboral con IA
 *     tags: [Inteligencia Artificial]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombrePostulante:
 *                 type: string
 *               cargo:
 *                 type: string
 *               familiaCargo:
 *                 type: string
 *               observacionesPrevias:
 *                 type: string
 *     responses:
 *       200:
 *         description: AnÃ¡lisis y preguntas sugeridas generadas
 */
app.post('/api/ia/analizar-candidato', verificarToken, async (req, res) => {
  const { nombrePostulante, cargo, familiaCargo, observacionesPrevias } = req.body;

  if (!nombrePostulante || !cargo) {
    return res.status(400).json({ error: 'nombrePostulante y cargo son obligatorios.' });
  }

  const competenciasPorFamilia = {
    'Operaciones y Centros de Cultivo': [
      'Tolerancia a condiciones climÃ¡ticas adversas y turnos en centros aislados',
      'Apego estricto a protocolos de seguridad marÃ­tima y bioseguridad',
      'Trabajo colaborativo en equipos reducidos bajo presiÃ³n operativa',
    ],
    'Plantas de Proceso': [
      'OrientaciÃ³n a estÃ¡ndares de inocuidad alimentaria (HACCP) y calidad',
      'Resistencia al ritmo continuo y cumplimiento de metas de producciÃ³n',
      'CoordinaciÃ³n efectiva en lÃ­neas operativas',
    ],
    'Mantenimiento y LogÃ­stica': [
      'DiagnÃ³stico preventivo y resoluciÃ³n rÃ¡pida de fallas crÃ­ticas',
      'PlanificaciÃ³n logÃ­stica en zonas extremas (RegiÃ³n de Los Lagos / AysÃ©n)',
      'AutonomÃ­a tÃ©cnica y responsabilidad en terreno',
    ],
  };

  const competencias = competenciasPorFamilia[familiaCargo] || [
    'Adaptabilidad organizacional y orientaciÃ³n a resultados',
    'ComunicaciÃ³n efectiva y trabajo en equipo multidisciplinario',
    'Compromiso con seguridad y sostenibilidad acuÃ­cola',
  ];

  const analisis = {
    resumenEjecutivo: `Candidato ${nombrePostulante} postulando a "${cargo}" (${familiaCargo || 'Ãrea General'}). Se recomienda focalizar la entrevista psicolaboral en estabilidad en turnos, adherencia a normas de seguridad y resoluciÃ³n de imprevistos operativos.`,
    competenciasClave: competencias,
    preguntasSugeridas: [
      'CuÃ©ntame sobre una situaciÃ³n crÃ­tica en terreno o turno donde tuviste que tomar una decisiÃ³n rÃ¡pida sin supervisiÃ³n directa.',
      'Â¿CÃ³mo manejas el cumplimiento estricto de protocolos de seguridad cuando existe presiÃ³n por cumplir tiempos de entrega o producciÃ³n?',
      'Describe una experiencia trabajando en equipos con alta exigencia operativa o aislamiento geogrÃ¡fico.',
    ],
    notaObservaciones: observacionesPrevias
      ? `Contexto considerado: "${observacionesPrevias}".`
      : 'Sin observaciones previas registradas; se sugiere levantar historial de estabilidad laboral en los Ãºltimos 3 aÃ±os.',
  };

  res.json(analisis);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`DocumentaciÃ³n Swagger disponible en http://localhost:${PORT}/api-docs`);
});


