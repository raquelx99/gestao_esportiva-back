import { Router }                 from 'express';
import * as funcionarioCtrl       from '../controllers/FuncionarioController.js';
import { autenticarToken }         from '../middleware/autenticarToken';

const router = Router();

router.get('/renewals', autenticarToken('funcionario'), funcionarioCtrl.listarRenovacoes);
router.put('/renewals/:id/approve', autenticarToken('funcionario'), funcionarioCtrl.aprovarRenovacao);
router.put('/renewals/:id/reject', autenticarToken('funcionario'), funcionarioCtrl.rejeitarRenovacao);

router.put('/availability/:id', autenticarToken('funcionario'), funcionarioCtrl.atualizarDisponibilidade);

export default router;