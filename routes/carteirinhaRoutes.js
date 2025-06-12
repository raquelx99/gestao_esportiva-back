import { Router } from 'express';
import * as carteirinhaCtrl from '../controllers/CarteirinhaController.js';
import { requireRole } from '../middlewares/checarRole.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/pendentes', carteirinhaCtrl.getCarteirinhasPendentes);

// Criação de uma nova carteirinha (após cadastro de estudante)
router.post(
  '/',
  upload.single('foto'), 
  carteirinhaCtrl.criarCarteirinha
);

// Consulta por ID
router.get(
  '/:id',
  carteirinhaCtrl.getCarteirinha
);

// Consulta por matrícula
router.get(
  '/matricula/:matricula',
  carteirinhaCtrl.getByMatricula
);

// Renovação (aluno que é dono pode renovar)
router.put(
  '/renovar/:id',
  carteirinhaCtrl.renovarCarteirinha
);

// Aprovação (apenas funcionários)
router.put(
  '/aprovar/:id',
  requireRole('funcionario'),
  carteirinhaCtrl.aprovarCarteirinha
);

// Rejeição (apenas funcionários)
router.put(
  '/rejeitar/:id',
  requireRole('funcionario'),
  carteirinhaCtrl.rejeitarCarteirinha
);

// Listagem geral (admin ou staff)
router.get(
  '/',
  requireRole('funcionario'),
  carteirinhaCtrl.listarCarteirinhas
);

router.patch('/liberar/:estudanteId', async (req, res) => {
  try {
    const { estudanteId } = req.params;
    const carteirinha = await Carteirinha.findOne({ estudante: estudanteId });

    if (!carteirinha || carteirinha.status !== 'aprovada') {
      return res.status(400).json({ erro: 'Carteirinha não encontrada ou não aprovada.' });
    }

    carteirinha.liberadoPosValidacao = true;
    await carteirinha.save();

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

router.get('/estudante/:estudanteId', carteirinhaCtrl.getByEstudanteId);

router.get('/api/carteirinha/:id/foto', carteirinhaCtrl.getFotoCarteirinha);

export default router;
