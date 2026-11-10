import { Router } from 'express';
import { createDelivery } from '../controllers/deliveryController.js';
import db from '../config/database.js';

const router = Router();

// Rota GET para listar as entregas/rotas reais do banco de dados com coordenadas extraídas
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                id_entregas AS id,
                codigo_rastreio AS titulo,
                'Motorista Atribuído' AS motorista,
                status,
                endereco_destino,
                ST_X(coordenadas_destino) AS destino_lng,
                ST_Y(coordenadas_destino) AS destino_lat,
                -23.550520 AS origem_lat,
                -46.633308 AS origem_lng
            FROM entregas
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar entregas:', error);
        next(error);
    }
});

export default router;