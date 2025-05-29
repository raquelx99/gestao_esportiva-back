import { Router }            from 'express';
import * as localCtrl        from '../controllers/LocalController.js';
import { autenticarToken }    from '../middleware/autenticarToken';

const router = Router();

router.get('/', autenticarToken(), localCtrl.listarLocais);
router.post('/', autenticarToken('funcionario'), localCtrl.criarLocal);
router.put('/:id', autenticarToken('funcionario'), localCtrl.atualizarLocal);
router.delete('/:id', autenticarToken('funcionario'), localCtrl.deletarLocal);

export default router;