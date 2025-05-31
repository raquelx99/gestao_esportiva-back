import { Router }                    from 'express';
import * as disponibilidadeCtrl         from '../controllers/DisponibilidadeController.js';

const router = Router();

router.get('/:localId/:dia', disponibilidadeCtrl.getDisponibilidade);

export default router;
