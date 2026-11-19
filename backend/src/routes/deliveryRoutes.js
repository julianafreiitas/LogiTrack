import { Router } from 'express';
import { createDelivery, getDeliveries } from '../controllers/deliveryController.js';

const router = Router();

// Lista as entregas/rotas com as coordenadas extraídas
router.get('/', getDeliveries);

// Cria uma entrega a partir de nome do cliente + endereço (geocodificado no backend)
router.post('/', createDelivery);

export default router;