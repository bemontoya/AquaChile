import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import { verificarToken, permitirRoles } from './middlewares/auth.js';
import { configurarSwagger } from './swagger.js';
import { uploadCV } from './middlewares/uploadCV.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Activar documentación Swagger en http://localhost:3001/api-docs
configurarSwagger(app);

// ==========================================
// UTILIDAD: EXTRACCIÓN DE TEXTO DE CV (PDF / DOCX)
// ==========================================
async function extraerTextoDesdeBuffer(buffer, nombreArchivo) {
  try {
    const ext = path.extname(nombreArchivo || '').toLowerCase();
    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      return (data.text || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
    }
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return (result.value || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
    }
    return '';
  } catch (err) {
    console.error('Error extrayendo texto del CV:', err.message);
    return '';
  }
}

// ==========================================
// 0. HEALTH CHECK & WARM-UP (DESPERTAR RENDER + NEON)
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'warming_up', error: error.message });
  }
});

// ==========================================
// 1. AUTENTICACIÓN (JWT)
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
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
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
});

// ==========================================
// 2. GESTIÓN DE OFERTAS LABORALES (CRUD)
// ==========================================

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
// 3. POSTULACIONES, CV PERSISTENTE Y EVALUACIONES
// ==========================================

app.get('/api/postulaciones', verificarToken, async (req, res) => {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      select: {
        id: true,
        postulanteId: true,
        ofertaId: true,
        carpetaNombre: true,
        cvRutaArchivo: true,
        cvNombreOriginal: true,
        resumenIA: true,
        puntajeIA: true,
        preguntasIA: true,
        estado: true,
        fechaPostulacion: true,
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

app.get('/api/postulaciones/:id/cv', verificarToken, async (req, res) => {
  try {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!postulacion) {
      return res.status(404).json({ error: 'No se encontró la postulación en la base de datos.' });
    }

    const nombreDescarga = postulacion.cvNombreOriginal || 'CV_Postulante.pdf';

    if (postulacion.cvRutaArchivo && fs.existsSync(path.resolve(postulacion.cvRutaArchivo))) {
      return res.download(path.resolve(postulacion.cvRutaArchivo), nombreDescarga);
    }

    if (postulacion.cvContenidoBase64) {
      const buffer = Buffer.from(postulacion.cvContenidoBase64, 'base64');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nombreDescarga)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.send(buffer);
    }

    return res.status(404).json({ error: 'El archivo CV no está disponible en el servidor.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/postulaciones', uploadCV.single('cv'), async (req, res) => {
  const { ofertaId, nombre, rut, email, telefono, cargo, familiaCargo, ubicacion, unidad } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Debe adjuntar un archivo CV válido (PDF o DOCX, máx. 5MB).' });
  }

  try {
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

    const postulante = await prisma.postulante.upsert({
      where: { rut },
      update: { nombre, email, telefono },
      create: { nombre, rut, email, telefono },
    });

    const fileBuffer = fs.readFileSync(req.file.path);
    const textoCV = await extraerTextoDesdeBuffer(fileBuffer, req.file.originalname);
    const base64CV = fileBuffer.toString('base64');

    const postulacion = await prisma.postulacion.create({
      data: {
        postulanteId: postulante.id,
        ofertaId: ofertaFinalId,
        carpetaNombre: req.carpetaPostulante,
        cvRutaArchivo: req.file.path,
        cvNombreOriginal: req.file.originalname,
        cvTextoExtraido: textoCV || null,
        cvContenidoBase64: base64CV,
      },
      include: { oferta: true },
    });

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
      postulacion: {
        id: postulacion.id,
        postulanteId: postulacion.postulanteId,
        ofertaId: postulacion.ofertaId,
        carpetaNombre: postulacion.carpetaNombre,
        cvNombreOriginal: postulacion.cvNombreOriginal,
        oferta: postulacion.oferta,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya registraste una postulación para esta oferta.' });
    }
    res.status(400).json({ error: error.message });
  }
});

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

app.delete('/api/postulaciones/:id', verificarToken, permitirRoles('ANALISTA'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
      include: { postulante: { include: { _count: { select: { postulaciones: true } } } } },
    });

    if (!postulacion) {
      return res.status(404).json({ error: 'No se encontró la postulación en la base de datos.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.solicitudEvaluacion.deleteMany({
        where: { postulacionId: id },
      });

      await tx.postulacion.delete({
        where: { id },
      });

      if (postulacion.postulante?._count?.postulaciones <= 1) {
        await tx.postulante.delete({
          where: { id: postulacion.postulanteId },
        });
      }
    });

    return res.json({ mensaje: 'Candidato y postulación eliminados permanentemente.' });
  } catch (error) {
    console.error('Error al eliminar postulación:', error);
    return res.status(500).json({ error: 'No se pudo eliminar la postulación: ' + error.message });
  }
});

// ==========================================
// 4. NOTIFICACIONES POR CORREO (BREVO API HTTP - PUERTO 443)
// ==========================================

app.post(['/api/enviar-confirmacion', '/api/api/enviar-confirmacion'], async (req, res) => {
  const { nombre, email, cargo, fecha, hora, notas } = req.body;

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({ success: false, error: 'Falta BREVO_API_KEY en Render.' });
  }

  console.log(`Enviando correo vía Brevo API a: ${email}`);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'AquaChile Reclutamiento',
          email: process.env.EMAIL_USER || 'benjamin.montoya2006@gmail.com',
        },
        to: [{ email, name: nombre }],
        subject: 'Notificación de Proceso - AquaChile',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0d3c61;">Hola ${nombre},</h2>
            <p>Te confirmamos la gestión asociada al cargo de <strong>${cargo}</strong>.</p>
            ${fecha ? `<p><strong>Fecha:</strong> ${fecha}${hora ? ` a las ${hora}` : ''}</p>` : ''}
            ${notas ? `<p><strong>Detalles:</strong> ${notas}</p>` : ''}
            <p>Tu proceso de evaluación psicolaboral continúa activo en nuestro sistema.</p>
            <br/>
            <p>Atentamente,<br/><strong>Equipo de Reclutamiento y Selección - AquaChile</strong></p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ERROR BREVO API:', data);
      return res.status(response.status).json({ success: false, error: data.message || data });
    }

    console.log('Correo enviado con éxito vía Brevo:', data.messageId);
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    console.error('ERROR DE RED BREVO:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. ASISTENTE DE INTELIGENCIA ARTIFICIAL (GROQ + CV REAL + OFERTA REAL)
// ==========================================

app.post('/api/ia/analizar-candidato', verificarToken, async (req, res) => {
  const { postulacionId, cargo, familiaCargo, observacionesPrevias } = req.body;

  if (!cargo && !postulacionId) {
    return res.status(400).json({ error: 'Se requiere postulacionId o cargo para el análisis.' });
  }

  try {
    let postulacionDB = null;
    if (postulacionId) {
      postulacionDB = await prisma.postulacion.findUnique({
        where: { id: Number(postulacionId) },
        include: {
          oferta: true,
          evaluacion: true,
        },
      });
    }

    const cargoBruto = postulacionDB?.oferta?.cargo || cargo || 'Cargo no especificado';
    const cargoLimpio = cargoBruto.replace(/\s*Test\s*\d+$/i, '').trim() || cargoBruto;
    const familiaReal = postulacionDB?.oferta?.familiaCargo || familiaCargo || 'Operaciones y Producción';
    const descripcionOferta = postulacionDB?.oferta?.descripcion || 'No especificada';
    const funcionesOferta = postulacionDB?.oferta?.funciones || 'No especificadas';
    const requisitosOferta = postulacionDB?.oferta?.requisitos || 'No especificados';
    const obsReales =
      (observacionesPrevias && observacionesPrevias.trim()) ||
      postulacionDB?.evaluacion?.observaciones ||
      '';

    // Prioriza texto persistido en Neon; si no existe, intenta extraer desde disco o Base64
    let textoCV = postulacionDB?.cvTextoExtraido || '';
    if (!textoCV && postulacionDB?.cvRutaArchivo && fs.existsSync(path.resolve(postulacionDB.cvRutaArchivo))) {
      const diskBuffer = fs.readFileSync(path.resolve(postulacionDB.cvRutaArchivo));
      textoCV = await extraerTextoDesdeBuffer(diskBuffer, postulacionDB.cvNombreOriginal);
    } else if (!textoCV && postulacionDB?.cvContenidoBase64) {
      const dbBuffer = Buffer.from(postulacionDB.cvContenidoBase64, 'base64');
      textoCV = await extraerTextoDesdeBuffer(dbBuffer, postulacionDB.cvNombreOriginal);
    }

    // Anonimización PII antes de enviar a Groq
    if (textoCV) {
      textoCV = textoCV
        .replace(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/g, '[RUT_ANONIMIZADO]')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_ANONIMIZADO]')
        .replace(/(\+?56\s?9\s?\d{4}\s?\d{4})/g, '[TELEFONO_ANONIMIZADO]');
    }

    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
    if (!groqApiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY no configurada en Render.' });
    }

    const promptReal = `Eres un Psicólogo Laboral Senior de AquaChile (industria salmonicultora/acuícola en el sur de Chile).
Analiza de forma objetiva, rigurosa y consistente la adecuación de un candidato para el cargo real indicado, basándote EXCLUSIVAMENTE en los antecedentes entregados (sin inventar experiencia que no aparezca en el CV ni en las observaciones).

=== PERFIL DEL CARGO ===
- Cargo: ${cargoLimpio}
- Familia ocupacional: ${familiaReal}
- Descripción del puesto: ${descripcionOferta}
- Funciones principales: ${funcionesOferta}
- Requisitos del perfil: ${requisitosOferta}

=== ANTECEDENTES DEL CANDIDATO (ANONIMIZADOS) ===
- Contenido extraído del CV: ${
      textoCV
        ? textoCV
        : 'ATENCIÓN: No se encontró texto legible en el CV adjunto (puede ser un archivo escaneado sin OCR o postulación sin texto). Evalúa con cautela indicando esta limitación.'
    }
- Observaciones clínicas/entrevista previas del evaluador: ${obsReales ? obsReales : 'Sin observaciones registradas aún.'}

=== REGLAS ESTRICTAS DE EVALUACIÓN ===
1. "puntajeOrientativo" (entero de 0 a 100):
  - Si el CV está vacío o no tiene relación con "${cargoLimpio}", asigna un puntaje bajo/moderado realista (entre 35 y 60) explicando que falta evidencia documental.
  - Si el CV cumple parcialmente los requisitos de "${cargoLimpio}", asigna entre 61 y 79.
  - Solo asigna 80 o más si el CV demuestra experiencia directa y verificable en funciones y requisitos de "${cargoLimpio}".
2. "resumen": 2 a 3 oraciones técnicas que contrasten directamente lo encontrado en el CV/observaciones con los requisitos reales de "${cargoLimpio}".
3. "criteriosEvaluados": exactamente 3 puntos concretos sobre brechas o fortalezas reales detectadas respecto a "${cargoLimpio}" (ej. años de experiencia, certificaciones, conocimientos técnicos específicos del puesto).
4. "preguntasSugeridas": exactamente 3 preguntas de entrevista conductual (metodología STAR) diseñadas específicamente para validar los requisitos críticos y brechas detectadas para "${cargoLimpio}" (prohibido usar preguntas genéricas de relleno).

Responde ÚNICAMENTE con un JSON válido:
{
  "puntajeOrientativo": 55,
  "resumen": "...",
  "criteriosEvaluados": ["...", "...", "..."],
  "preguntasSugeridas": ["...", "...", "..."]
}`;

    // 1. Obtener automáticamente un LLM generativo vigente en tu cuenta de Groq
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${groqApiKey}` },
    });

    if (!modelsRes.ok) {
      const errModelos = await modelsRes.text();
      return res.status(502).json({
        error: 'Error Groq Models (' + modelsRes.status + '): ' + errModelos,
      });
    }

    const modelsData = await modelsRes.json();
    const modelosChat = (modelsData.data || [])
      .map((m) => m.id)
      .filter((id) => {
        const lower = id.toLowerCase();
        return (
          !lower.includes('whisper') &&
          !lower.includes('guard') &&
          !lower.includes('safeguard') &&
          !lower.includes('tts') &&
          !lower.includes('embed') &&
          !lower.includes('orpheus') &&
          !lower.includes('playai') &&
          !lower.includes('compound')
        );
      });

    const modeloActivo =
      modelosChat.find((id) => id.toLowerCase().includes('llama-4')) ||
      modelosChat.find((id) => id.toLowerCase().includes('gpt-oss-120b')) ||
      modelosChat.find((id) => id.toLowerCase().includes('gpt-oss')) ||
      modelosChat.find((id) => id.toLowerCase().includes('qwen')) ||
      modelosChat.find((id) => id.toLowerCase().includes('70b')) ||
      modelosChat.find((id) => id.toLowerCase().includes('8b')) ||
      modelosChat[0];

    if (!modeloActivo) {
      return res.status(502).json({
        error: 'No hay modelos generativos disponibles en Groq: ' + JSON.stringify((modelsData.data || []).map((m) => m.id)),
      });
    }

    // 2. Ejecutar el análisis psicolaboral con el modelo activo detectado
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modeloActivo,
        messages: [
          {
            role: 'system',
            content:
              'Eres un psicólogo laboral experto en selección acuícola. Respondes exclusivamente en JSON válido en español, con criterios técnicos estrictos y consistentes.',
          },
          { role: 'user', content: promptReal },
        ],
        temperature: 0.1,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errDetalle = await groqRes.text();
      console.error('Error Groq API:', groqRes.status, errDetalle);
      return res.status(502).json({
        error: 'Error Groq (' + groqRes.status + ') con modelo ' + modeloActivo + ': ' + errDetalle,
      });
    }

    const groqData = await groqRes.json();
    const parsed = JSON.parse(groqData.choices[0].message.content);

    const resultado = {
      puntajeOrientativo: Math.min(100, Math.max(0, Number(parsed.puntajeOrientativo) || 50)),
      resumen: parsed.resumen,
      criteriosEvaluados: Array.isArray(parsed.criteriosEvaluados) ? parsed.criteriosEvaluados : [],
      preguntasSugeridas: Array.isArray(parsed.preguntasSugeridas) ? parsed.preguntasSugeridas : [],
    };

    if (postulacionId) {
      await prisma.postulacion.update({
        where: { id: Number(postulacionId) },
        data: {
          puntajeIA: resultado.puntajeOrientativo,
          resumenIA: resultado.resumen,
          preguntasIA: resultado.preguntasSugeridas.join('\n'),
        },
      });
    }

    return res.json(resultado);
  } catch (error) {
    console.error('Error interno en /api/ia/analizar-candidato:', error);
    return res.status(500).json({
      error: 'Error interno IA: ' + (error?.message || String(error)),
    });
  }
});

// ==========================================
// INICIAR SERVIDOR (ASEGURANDO COLUMNAS EN BD)
// ==========================================

const PORT = process.env.PORT || 3001;

function iniciarServidor() {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
    });
  }

  prisma
    .$executeRawUnsafe('ALTER TABLE "Postulacion" ADD COLUMN IF NOT EXISTS "cvTextoExtraido" TEXT;')
    .then(() =>
      prisma.$executeRawUnsafe(
        'ALTER TABLE "Postulacion" ADD COLUMN IF NOT EXISTS "cvContenidoBase64" TEXT;'
      )
    )
    .then(() => console.log('Columnas cvTextoExtraido y cvContenidoBase64 listas en PostgreSQL.'))
    .catch((err) => console.error('Error al verificar columnas en PostgreSQL:', err.message));
}

iniciarServidor();

export default app;