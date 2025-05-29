import { Router }                from 'express';
import * as estudanteCtrl        from '../controllers/EstudanteController.js';
import { autenticarToken }        from '../middleware/autenticarToken';

const router = Router();

router
  .get('/:userId', autenticarToken('estudante'), estudanteCtrl.getEstudante)
  .put('/:userId', autenticarToken('estudante'), estudanteCtrl.updateEstudante)
  .post('/:userId/renewals', autenticarToken('estudante'), estudanteCtrl.solicitarRenovacao);

export default router;