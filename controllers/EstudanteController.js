import { Estudante } from '../models/Estudante.js';

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
