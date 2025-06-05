import { Disponibilidade } from "../models/Disponibilidade.js";

// GET /api/availability/:spaceId/:day
export async function getDisponibilidade(req, res) {
  const { localId, dia } = req.params;
  const slots = await Disponibilidade.find({ local: localId, diaDaSemana: Number(dia) });
  res.json(slots);
}