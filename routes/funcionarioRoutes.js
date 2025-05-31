import { Router }                 from 'express';
import * as funcionarioCtrl       from '../controllers/FuncionarioController.js';

const router = Router();

router.put('/availability/:id', funcionarioCtrl.atualizarDisponibilidade);

export default router;