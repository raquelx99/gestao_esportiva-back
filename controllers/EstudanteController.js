import { Estudante } from '../models/estudante.model.js';
import { Renovacao }   from '../models/renovacao.model.js';

// GET /api/estudantes/:userId
export async function getEstudante(req, res) {
  const { userId } = req.params;
  const est = await Estudante.findOne({ user: userId });
  if (!est) return res.status(404).json({ message: 'Estudante não encontrado' });
  res.json(est);
}

// PUT /api/estudantes/:userId
export async function updateEstudante(req, res) {
  const { userId } = req.params;
  const data = req.body;
  const est = await Estudante.findOneAndUpdate({ user: userId }, data, { new: true });
  if (!est) return res.status(404).json({ message: 'Estudante não encontrado' });
  res.json(est);
}

// POST /api/estudantes/:userId/renovacoes
export async function solicitarRenovacao(req, res) {
  const { userId } = req.params;
  const est = await Estudante.findOne({ user: userId });
  if (!est) return res.status(404).json({ message: 'Estudante não encontrado' });

  const renovacao = await Renovacao.create({ estudante: est._id });
  res.status(201).json(renovacao);
}
