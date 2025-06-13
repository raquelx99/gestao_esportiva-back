import { Estudante } from '../models/Estudante.js';
import { Usuario } from '../models/Usuario.js';

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

export async function getEstudanteByMatricula(req, res) {
  try {
    const { matricula } = req.params;

    const usuario = await Usuario.findOne({ matricula });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado com essa matrícula' });
    }

    const estudante = await Estudante.findOne({ user: usuario._id });
    if (!estudante) {
      return res.status(404).json({ message: 'Estudante não encontrado para este usuário' });
    }

    res.json(estudante);
  } catch (error) {
    console.error('Erro ao buscar estudante por matrícula:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
}