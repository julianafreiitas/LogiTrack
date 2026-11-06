import { Router } from 'express';
import { createDelivery } from '../controllers/deliveryController.js';

const router = Router();

// Como no app.js registamos o prefixo /api/deliveries, aqui usamos '/'
router.post('/', createDelivery);

export default router;