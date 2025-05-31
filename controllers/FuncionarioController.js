import { Disponibilidade } from "../models/Disponibilidade.js";

// PUT /api/availability/:id
export async function atualizarDisponibilidade(req, res) {
  const { id } = req.params;
  const data = req.body; // { estaDisponivel: boolean }
  const slot = await Disponibilidade.findByIdAndUpdate(id, data, { new: true });
  if (!slot) return res.status(404).json({ message: 'Horário não encontrado' });
  res.json(slot);
}
