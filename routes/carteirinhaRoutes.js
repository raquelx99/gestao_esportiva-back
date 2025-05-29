import { Router } from 'express';
import * as carteirinhaCtrl from '../controllers/CarteirinhaController.js';
import autenticarToken from '../middlewares/autenticarToken.js';
import { requireRole } from '../middlewares/checarRole.js';

const router = Router();

// Criação de uma nova carteirinha (após cadastro de estudante)
router.post(
  '/', 
  autenticarToken(), 
  carteirinhaCtrl.criarCarteirinha
);

// Consulta por ID
router.get(
  '/:id',
  autenticarToken(),
  carteirinhaCtrl.getCarteirinha
);

// Consulta por matrícula
router.get(
  '/matricula/:matricula',
  autenticarToken(),
  carteirinhaCtrl.getByMatricula
);

// Renovação (aluno que é dono pode renovar)
router.put(
  '/:id/renovar',
  autenticarToken(),
  carteirinhaCtrl.renovarCarteirinha
);

// Aprovação (apenas funcionários)
router.put(
  '/:id/approve',
  autenticarToken(),
  requireRole('staff'),
  carteirinhaCtrl.aprovarCarteirinha
);

// Rejeição (apenas funcionários)
router.put(
  '/:id/reject',
  autenticarToken(),
  requireRole('staff'),
  carteirinhaCtrl.rejeitarCarteirinha
);

// Listagem geral (admin ou staff)
router.get(
  '/',
  autenticarToken(),
  requireRole('staff'),
  carteirinhaCtrl.listarCarteirinhas
);

export default router;
