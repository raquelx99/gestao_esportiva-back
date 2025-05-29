import { Renovacao } from "../models/Renovacao";

// GET /api/renewals (idem a funcionario.listarRenovacoes)
export async function listarTodasRenovacoes(req, res) {
  const renovacoes = await Renovacao.find().populate('estudante');
  res.json(renovacoes);
}
