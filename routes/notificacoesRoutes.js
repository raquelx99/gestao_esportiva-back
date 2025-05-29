import { Router }                   from 'express';
import * as notificacaonCtrl        from '../controllers/NotificacaoController.js';
import { autenticarToken }           from '../middleware/autenticarToken';

const router = Router();

router.get('/:userId', autenticarToken(), notificacaonCtrl.listarNotificacao);
router.put('/:id/read', autenticarToken(), notificacaonCtrl.marcarComoLido);

export default router;
