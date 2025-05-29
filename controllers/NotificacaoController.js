import { Notificacao } from '../models/Notificacao';

// GET /api/notifications/:userId
export async function listarNotificacao(req, res) {
  const { userId } = req.params;
  const notes = await Notificacao.find({ user: userId }).sort('-createdAt');
  res.json(notes);
}

// PUT /api/notifications/:id/read
export async function marcarComoLido(req, res) {
  const { id } = req.params;
  const note = await Notificacao.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!note) return res.status(404).json({ message: 'Notificação não encontrada' });
  res.json(note);
}
