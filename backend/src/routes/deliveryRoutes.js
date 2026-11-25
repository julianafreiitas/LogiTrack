import { Router } from 'express';
import { createDelivery, getDeliveries, quoteDelivery } from '../controllers/deliveryController.js';

const router = Router();

// Lista as entregas/rotas com as coordenadas extraídas
router.get('/', getDeliveries);

router.post('/quote', quoteDelivery);

// Cria uma entrega a partir de nome do cliente + endereço (geocodificado no backend)
router.post('/', createDelivery);

export default router;
