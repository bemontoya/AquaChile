import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nombreLimpio = (req.body.nombre || 'postulante')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    const carpetaUnica = `${nombreLimpio}_${Date.now()}`;
    const rutaDestino = path.join(process.cwd(), 'uploads_privados', carpetaUnica);

    fs.mkdirSync(rutaDestino, { recursive: true });
    req.carpetaPostulante = carpetaUnica;
    cb(null, rutaDestino);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `CV_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no válido. Solo se permiten archivos PDF o DOCX.'), false);
  }
};

export const uploadCV = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5 MB
});