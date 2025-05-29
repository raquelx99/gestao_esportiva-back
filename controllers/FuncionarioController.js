import { Disponibilidade } from "../models/Disponibilidade.js";
import { Renovacao } from "../models/Renovacao.js";


// GET /api/renewals
export async function listarRenovacoes(req, res) {
  const renovacoes = await Renovacao.find().populate('estudante');
  res.json(renovacoes);
}

// PUT /api/renewals/:id/approve
export async function aprovarRenovacao(req, res) {
  const { id } = req.params;
  const renovacao = await Renovacao.findByIdAndUpdate(id, { status: 'aprovado' }, { new: true });
  if (!renovacao) return res.status(404).json({ message: 'Renovação não encontrada' });
  res.json(renovacao);
}

// PUT /api/renewals/:id/reject
export async function rejeitarRenovacao(req, res) {
  const { id } = req.params;
  const renovacao = await Renovacao.findByIdAndUpdate(id, { status: 'rejeitado' }, { new: true });
  if (!renovacao) return res.status(404).json({ message: 'Renovação não encontrada' });
  res.json(renovacao);
}

// PUT /api/availability/:id
export async function atualizarDisponibilidade(req, res) {
  const { id } = req.params;
  const data = req.body; // { estaDisponivel: boolean }
  const slot = await Disponibilidade.findByIdAndUpdate(id, data, { new: true });
  if (!slot) return res.status(404).json({ message: 'Horário não encontrado' });
  res.json(slot);
}
