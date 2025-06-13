import { Router }                from 'express';
import * as estudanteCtrl        from '../controllers/EstudanteController.js';

const router = Router();

router
  .get('/:userId', estudanteCtrl.getEstudante)
  .put('/:userId', estudanteCtrl.updateEstudante)
  .get('/matricula/:matricula', estudanteCtrl.getEstudanteByMatricula)

export default router;