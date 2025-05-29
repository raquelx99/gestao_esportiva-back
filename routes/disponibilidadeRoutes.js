import { Router }                    from 'express';
import * as disponibilidadeCtrl         from '../controllers/DisponibilidadeController.js';
import { autenticarToken }            from '../middleware/autenticarToken';

const router = Router();

router.get('/:localId/:dia', autenticarToken(), disponibilidadeCtrl.getDisponibilidade);

export default router;
