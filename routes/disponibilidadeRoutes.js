import { Router } from 'express';
import * as disponibilidadeCtrl from '../controllers/DisponibilidadeController.js';
import autenticarToken from '../middlewares/autenticarToken.js';
import { requireRole } from '../middlewares/checarRole.js';

const router = Router();

// GET: listar disponibilidades para um local num dia
// Ex: GET /api/disponibilidade/:localId/:dia
router.get(
  '/:localId/:dia',
  disponibilidadeCtrl.getDisponibilidade
);

// POST: criar uma nova disponibilidade (marcar disponível)
router.post(
  '/',
  disponibilidadeCtrl.criarDisponibilidade
);

// DELETE: remover disponibilidade (marcar indisponível)
router.delete(
  '/:id',
  disponibilidadeCtrl.deletarDisponibilidade
);

// Opcional PUT caso queira permitir editar diaSemana/horarioInicio
router.put(
  '/:id',
  disponibilidadeCtrl.atualizarDisponibilidade
);

export default router;
