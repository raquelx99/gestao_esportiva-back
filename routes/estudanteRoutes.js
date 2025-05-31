import { Router }                from 'express';
import * as estudanteCtrl        from '../controllers/EstudanteController.js';

const router = Router();

router
  .get('/:userId', estudanteCtrl.getEstudante)
  .put('/:userId', estudanteCtrl.updateEstudante)

export default router;