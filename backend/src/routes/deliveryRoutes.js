import { Router } from 'express';
import { createDelivery } from '../controllers/deliveryController.js';

const router = Router();

// Como no app.js já registámos como app.use('/api', deliveryRoutes),
// aqui o caminho deve ser apenas '/' para resultar em /api/deliveries
router.post('/deliveries', createDelivery);

export default router;