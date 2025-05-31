import { Router }            from 'express';
import * as localCtrl        from '../controllers/LocalController.js';

const router = Router();

router.get('/', localCtrl.listarLocais);
router.post('/',  localCtrl.criarLocal);
router.put('/:id', localCtrl.atualizarLocal);
router.delete('/:id', localCtrl.deletarLocal);

export default router;