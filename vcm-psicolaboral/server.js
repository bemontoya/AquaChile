import express from 'express';
import cors from 'cors';
import {Resend} from 'resend';
import dotenv from 'dotenv';

//para cargar las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//obtiene la api key desde el entorno env
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/enviar-confirmacion', async (req, res) =>{
    const {nombre, email, cargo} = req.body;

    try {
        const data = await resend.emails.send({
            from: 'AquaChile Reclutamiento <onboarding@resend.dev>',
            to: [email],
            subject: 'Confirmación de Postulación - AquaChile',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #0d3c61;">Hola ${nombre},</h2>
                    <p>Te confirmamos que hemos recibido tus antecedentes para el cargo de <strong>${cargo}</strong>.</p>
                    <p>Tu proceso de evaluación se encuentra iniciado.</p>
                    <br/>
                    <p>Atentamente,<br/><strong>Equipo de reclutamiento y Selección - AquaChile</strong></p>
            `
        });
        return res.status(200).json({success: true, data});

    }catch (error){
        return res.status(500).json({success: false, error: error.message});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});    