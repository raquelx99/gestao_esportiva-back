import { Router }               from 'express';
import * as renovacaoCtrl         from '../controllers/RenovacaoController.js';
import { autenticarToken }       from '../middleware/autenticarToken';

const router = Router();

// reusa a listagem de funcionarios
router.get('/', autenticarToken('funcionario'), renovacaoCtrl.listarTodasRenovacoes);

export default router;
