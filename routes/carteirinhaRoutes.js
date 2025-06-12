import { Router } from 'express';
import * as carteirinhaCtrl from '../controllers/CarteirinhaController.js';
import { requireRole } from '../middlewares/checarRole.js';

const router = Router();

// Criação de uma nova carteirinha (após cadastro de estudante)
router.post(
  '/', 
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
  '/:id/renovar',
  carteirinhaCtrl.renovarCarteirinha
);

// Aprovação (apenas funcionários)
router.put(
  '/:id/approve',
  requireRole('staff'),
  carteirinhaCtrl.aprovarCarteirinha
);

// Rejeição (apenas funcionários)
router.put(
  '/:id/reject',
  requireRole('staff'),
  carteirinhaCtrl.rejeitarCarteirinha
);

// Listagem geral (admin ou staff)
router.get(
  '/',
  requireRole('staff'),
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

router.get('/pendentes', carteirinhaCtrl.getCarteirinhasPendentes);

export default router;
