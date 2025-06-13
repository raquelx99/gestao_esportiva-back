import { Router } from 'express';
import * as carteirinhaCtrl from '../controllers/CarteirinhaController.js';
import { requireRole } from '../middlewares/checarRole.js';
import upload from '../middlewares/upload.js';
import { Carteirinha } from '../models/Carteirinha.js';
import autenticarToken from '../middlewares/autenticarToken.js';

const router = Router();

router.get('/pendentes', carteirinhaCtrl.getCarteirinhasPendentes);

// Criação de uma nova carteirinha (após cadastro de estudante)
router.post(
  '/',
  upload.single('foto'), 
  carteirinhaCtrl.criarCarteirinha
);

// Renovação de carteirinha (apenas para o dono)
router.put(
  '/carteirinhas/:id/renovar', 
  upload.single('foto'), 
  carteirinhaCtrl.renovarCarteirinha
);

// Consulta por matrícula
router.get(
  '/matricula/:matricula',
  carteirinhaCtrl.getByMatricula
);

// Consulta por ID
router.get(
  '/:id',
  carteirinhaCtrl.getCarteirinha
);

// Renovação (aluno que é dono pode renovar)
router.put(
  '/renovar/:id',
  carteirinhaCtrl.renovarCarteirinha
);

// Aprovação (apenas funcionários)
router.put(
  '/aprovar/:id',
  carteirinhaCtrl.aprovarCarteirinha
);

// Rejeição (apenas funcionários)
router.put(
  '/rejeitar/:id',
  carteirinhaCtrl.rejeitarCarteirinha
);

// Listagem geral (admin ou staff)
router.get(
  '/',
  carteirinhaCtrl.listarCarteirinhas
);

router.patch(
  '/liberar/:estudanteId',
  carteirinhaCtrl.liberarCarteirinha
);

router.get('/estudante/:estudanteId', carteirinhaCtrl.getByEstudanteId);
router.get('/:id/foto', carteirinhaCtrl.getFotoCarteirinha);
router.get('/status/:status', carteirinhaCtrl.getCarteirinhasPorStatus);

export default router;
