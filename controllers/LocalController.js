import { Local } from "../models/Local.js";

// GET /api/spaces
export async function listarLocais(req, res) {
  const locais = await Local.find();
  res.json(locais);
}

// POST /api/spaces
export async function criarLocal(req, res) {
  const local = await Local.create(req.body);
  res.status(201).json(local);
}

// PUT /api/spaces/:id
export async function atualizarLocal(req, res) {
  const { id } = req.params;
  const local = await Local.findByIdAndUpdate(id, req.body, { new: true });
  if (!local) return res.status(404).json({ message: 'Espaço não encontrado' });
  res.json(local);
}

// DELETE /api/spaces/:id
export async function deletarLocal(req, res) {
  const { id } = req.params;
  await Local.findByIdAndDelete(id);
  res.sendStatus(204);
}