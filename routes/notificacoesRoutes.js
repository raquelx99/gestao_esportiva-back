import { Router }                   from 'express';
import * as notificacaonCtrl        from '../controllers/NotificacaoController.js';

const router = Router();

router.get('/:userId', notificacaonCtrl.listarNotificacao);
router.put('/:id/read',notificacaonCtrl.marcarComoLido);

export default router;
