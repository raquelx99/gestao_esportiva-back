import dayjs from 'dayjs';
import { Carteirinha } from '../models/Carteirinha';
import { Estudante }  from '../models/Estudante';

// POST /api/carteirinha
export async function criarCarteirinha(req, res, next) {
  try {
    const {
      estudanteId,
      espacos = [],
      periodoEmSemestres = 1
    } = req.body;

    const estudante = await Estudante.findById(estudanteId);
    if (!estudante) {
      return res.status(404).json({ erro: 'Estudante não encontrado' });
    }

    const validade = dayjs().add(6 * periodoEmSemestres, 'month').toDate();

    const existente = await Carteirinha.findOne({ estudante: estudanteId });
    if (existente) {
      return res.status(409).json({ erro: 'Carteirinha já existe para este estudante' });
    }

    const nova = await Carteirinha.create({
      estudante: estudanteId,
      validade,
      espacos,
      status: 'pendente',
      historicoRenovacoes: []
    });

    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/:id
export async function getCarteirinha(req, res, next) {
  try {
    const carteirinha = await Carteirinha
      .findById(req.params.id)
      .populate('estudante', 'matricula nome curso centro telefone telefoneUrgencia semestreInicio');

    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }
    res.json(carteirinha);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/matricula/:matricula
export async function getByMatricula(req, res, next) {
  try {
    const { matricula } = req.params;
    // Primeiro acha o Estudante
    const estudante = await Estudante.findOne({ matricula });
    if (!estudante) {
      return res.status(404).json({ erro: 'Estudante não encontrado' });
    }
    // Depois a Carteirinha
    const carteirinha = await Carteirinha
      .findOne({ estudante: estudante._id })
      .populate('estudante', 'matricula nome curso centro telefone telefoneUrgencia semestreInicio');
    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }
    res.json(carteirinha);
  } catch (err) {
    next(err);
  }
}

// PUT /api/carteirinha/:id/renovar
export async function renovarCarteirinha(req, res, next) {
  try {
    const { id } = req.params;
    const { periodoEmSemestres = 1 } = req.body; 

    const carteirinha = await Carteirinha.findById(id);
    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }

    if (carteirinha.estudante.toString() !== req.user.id) {
      return res.status(403).json({ erro: 'Sem permissão para renovar' });
    }

    const meses = 6 * periodoEmSemestres;
    const atual = dayjs(carteirinha.validade);
    const novaValidade = atual.isAfter(dayjs())
      ? atual.add(meses, 'month')
      : dayjs().add(meses, 'month');

    carteirinha.validade = novaValidade.toDate();
    carteirinha.status = 'pendente';
    carteirinha.historicoRenovacoes.push({
      dataRenovacao: new Date(),
      periodoEmSemestres
    });

    await carteirinha.save();
    res.json(carteirinha);
  } catch (err) {
    next(err);
  }
}

// PUT /api/carteirinha/:id/approve
export async function aprovarCarteirinha(req, res, next) {
  try {
    const { id } = req.params;
    const carteirinha = await Carteirinha.findById(id);
    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }
    carteirinha.status = 'aprovado';
    await carteirinha.save();
    res.json(carteirinha);
  } catch (err) {
    next(err);
  }
}

// PUT /api/carteirinha/:id/reject
export async function rejeitarCarteirinha(req, res, next) {
  try {
    const { id } = req.params;
    const carteirinha = await Carteirinha.findById(id);
    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }
    carteirinha.status = 'rejeitado';
    await carteirinha.save();
    res.json(carteirinha);
  } catch (err) {
    next(err);
  }
}


// GET /api/carteirinha
export async function listarCarteirinhas(req, res, next) {
  try {
    const all = await Carteirinha.find()
      .populate('estudante', 'matricula nome');
    res.json(all);
  } catch (err) {
    next(err);
  }
}
