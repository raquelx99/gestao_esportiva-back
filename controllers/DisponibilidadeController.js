import { Disponibilidade } from "../models/Disponibilidade.js";
import mongoose from "mongoose";
import { Local } from "../models/Local.js";

// GET /api/availability/:spaceId/:day
export async function getDisponibilidade(req, res, next) {
  try {
    const { localId, dia } = req.params;
    if (!mongoose.Types.ObjectId.isValid(localId)) {
      return res.status(400).json({ erro: 'localId inválido' });
    }
    const diaNum = parseInt(dia, 10);
    if (isNaN(diaNum) || diaNum < 0 || diaNum > 6) {
      return res.status(400).json({ erro: 'diaSemana inválido (0-6)' });
    }
    const local = await Local.findById(localId);
    if (!local) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }
    const disponibilidades = await Disponibilidade.find({
      local: localId,
      diaDaSemana: diaNum
    });
    return res.json(disponibilidades);
  } catch (err) {
    next(err);
  }
}

// PUT /api/availability/:localId
export async function atualizarDisponibilidade(req, res, next) {
  try {
    const { localId } = req.params;
    const { diaSemana, horarioInicio, estaDisponivel } = req.body;

    if (!mongoose.Types.ObjectId.isValid(localId)) {
      return res.status(400).json({ erro: 'localId inválido' });
    }
    const local = await Local.findById(localId);
    if (!local) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }
    if (typeof diaSemana !== 'number' || diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ erro: 'diaSemana deve ser número entre 0 e 6' });
    }
    if (typeof horarioInicio !== 'string' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioInicio)) {
      return res.status(400).json({ erro: 'horarioInicio deve estar no formato HH:mm' });
    }
    if (typeof estaDisponivel !== 'boolean') {
      return res.status(400).json({ erro: 'estaDisponivel deve ser booleano' });
    }

    const filtro = { local: localId, diaSemana, horarioInicio };

    const disponibilidade = await Disponibilidade.findOneAndUpdate(
      filtro,
      { estaDisponivel },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ sucesso: true, disponibilidadeAtualizada: disponibilidade });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Disponibilidade duplicada' });
    }
    next(err);
  }
}

export async function criarDisponibilidade(req, res, next) {
  try {
    const { localId, diaDaSemana, horarioInicio, horarioFinal} = req.body;

    const diaSemana = parseInt(req.body.diaSemana, 10);
    console.log('diaSemana:', diaSemana);

    console.log('--- BACK-END RECEBEU REQUISIÇÃO PARA CRIAR ---');
    console.log('Corpo da Requisição (req.body):', req.body);
    console.log('Tipo de req.body.diaSemana:', typeof req.body.diaSemana);
    console.log('-------------------------------------------');

    if (!mongoose.Types.ObjectId.isValid(localId)) {
      return res.status(400).json({ erro: 'localId inválido' });
    }
    const local = await Local.findById(localId);
    if (!local) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }
    if (typeof diaDaSemana !== 'number' || diaDaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ erro: 'diaDaSemana deve ser número entre 0 e 6' });
    }
    if (typeof horarioInicio !== 'string' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioInicio)) {
      return res.status(400).json({ erro: 'horarioInicio deve estar no formato HH:mm' });
    }

    const nova = new Disponibilidade({
      local: localId,
      diaDaSemana,
      horarioInicio,
      horarioFinal,
      estaDisponivel: true
    });
    await nova.save();
    return res.status(201).json({ sucesso: true, disponibilidade: nova });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Disponibilidade já existe para este horário' });
    }
    next(err);
  }
}

export async function deletarDisponibilidade(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID de disponibilidade inválido' });
    }
    const disp = await Disponibilidade.findById(id);
    if (!disp) {
      return res.status(404).json({ erro: 'Disponibilidade não encontrada' });
    }
    await disp.deleteOne();
    return res.json({ sucesso: true, mensagem: 'Disponibilidade removida (indisponível)' });
  } catch (err) {
    next(err);
  }

}