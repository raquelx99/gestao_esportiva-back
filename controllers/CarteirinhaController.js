import dayjs from 'dayjs';
import { Carteirinha } from '../models/Carteirinha.js';
import { Estudante }  from '../models/Estudante.js';
import sharp from 'sharp';

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

    if (!req.file) {
      return res.status(400).json({ erro: 'Imagem da carteirinha é obrigatória.' });
    }

    const imagemRedimensionada = await sharp(req.file.buffer)
      .resize(300, 400, { fit: 'cover' }) 
      .jpeg({ quality: 80 })
      .toBuffer();


    const novaCarteirinha = await Carteirinha.create({
      estudante: estudanteId,
      validade,
      espacos,
      status: 'pendente',
      foto: {
        data: imagemRedimensionada,
        contentType: 'image/jpeg'
      }
    });

    res.status(201).json(novaCarteirinha);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/:id
export async function getCarteirinha(req, res, next) {
  try {
    const carteirinha = await Carteirinha
      .findById(req.params.id)
      .populate({
        path: 'estudante',
        select: 'curso centro telefone telefoneUrgencia semestreInicio user',
        populate: {
          path: 'user',
          select: 'nome matricula'
        }
      });

    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }

    const agora = dayjs();
    const validade = dayjs(carteirinha.validade);
    if (validade.isBefore(agora) && carteirinha.status !== 'expirado') {
      carteirinha.status = 'expirado';
      carteirinha.liberadoPosValidacao = false;
      await carteirinha.save();
    }

    // Converter para objeto e remover buffer
    const obj = carteirinha.toObject({ getters: true, versionKey: false });
    const hasFoto = !!carteirinha.foto?.data;
    if (obj.foto) {
      delete obj.foto.data;
      delete obj.foto.contentType;
    }
    obj.temFoto = hasFoto;
    obj.urlFoto = hasFoto ? `/api/carteirinha/${carteirinha._id}/foto` : null;

    return res.json(obj);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/matricula/:matricula
export async function getByMatricula(req, res, next) {
  try {
    const { matricula } = req.params;
    const estudante = await Estudante.findOne({ matricula });
    if (!estudante) {
      return res.status(404).json({ erro: 'Estudante não encontrado' });
    }
    let carteirinha = await Carteirinha
      .findOne({ estudante: estudante._id })
      .populate('estudante', 'matricula nome curso centro telefone telefoneUrgencia semestreInicio');

    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }

    const agora = dayjs();
    const validade = dayjs(carteirinha.validade);
    if (validade.isBefore(agora) && carteirinha.status !== 'expirado') {
      carteirinha.status = 'expirado';
      carteirinha.liberadoPosValidacao = false;
      await carteirinha.save();
    }

    const obj = carteirinha.toObject({ getters: true, versionKey: false });
    const hasFoto = !!carteirinha.foto?.data;
    if (obj.foto) {
      delete obj.foto.data;
      delete obj.foto.contentType;
    }
    obj.temFoto = hasFoto;
    obj.urlFoto = hasFoto ? `/api/carteirinha/${carteirinha._id}/foto` : null;

    return res.json(obj);
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

    const estudanteId = carteirinha.estudante.id;
    const estudante = await Estudante.findById(estudanteId);
    if (!estudante) {
      return res.status(404).json({ erro: 'Estudante não encontrado para esta carteirinha' });
    }

    estudante.semestreInicio = new Date();
    await estudante.save();

    const agora = dayjs();
    const validade = dayjs(carteirinha.validade);
    if (validade.isBefore(agora) && carteirinha.status !== 'expirado') {
      carteirinha.status = 'expirado';
      await carteirinha.save();
    }

    return res.json(carteirinha);
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

    const resultado = all.map(doc => {
      const obj = doc.toObject({ getters: true, versionKey: false });
      const hasFoto = !!doc.foto?.data;
      if (obj.foto) {
        delete obj.foto.data;
        delete obj.foto.contentType;
      }
      obj.temFoto = hasFoto;
      obj.urlFoto = hasFoto ? `/api/carteirinha/${doc._id}/foto` : null;
      return obj;
    });

    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/estudante/:estudanteId
export async function getByEstudanteId(req, res, next) {
  try {
    const { estudanteId } = req.params;

    const carteirinha = await Carteirinha
      .findOne({ estudante: estudanteId })
      .populate('estudante', 'matricula nome curso centro telefone telefoneUrgencia semestreInicio');

    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada para este estudante.' });
    }

    const obj = carteirinha.toObject({ getters: true, versionKey: false });
    const hasFoto = !!carteirinha.foto?.data;
    if (obj.foto) {
      delete obj.foto.data;
      delete obj.foto.contentType;
    }
    obj.temFoto = hasFoto;
    obj.urlFoto = hasFoto ? `/api/carteirinha/${carteirinha._id}/foto` : null;

    res.json(obj);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/pendentes
export async function getCarteirinhasPendentes(req, res, next) {
  try {
    const pendentes = await Carteirinha.find({ status: 'pendente' })
      .populate({
        path: 'estudante',
        select: 'nome matricula curso centro telefone telefoneUrgencia semestreInicio user',
        populate: {
          path: 'user',
          select: 'nome matricula'
        }
      });

    const resultado = pendentes.map(doc => {
      const obj = doc.toObject({ getters: true, versionKey: false });
      const hasFoto = !!doc.foto?.data;
      if (obj.foto) {
        delete obj.foto.data;
        delete obj.foto.contentType;
      }
      obj.temFoto = hasFoto;
      obj.urlFoto = hasFoto ? `/api/carteirinha/${doc._id}/foto` : null;
      return obj;
    });

    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function getFotoCarteirinha(req, res, next) {
  try {
    const { id } = req.params;
    const carteirinha = await Carteirinha.findById(id).select('foto');
    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }
    if (!carteirinha.foto || !carteirinha.foto.data) {
      return res.status(404).json({ erro: 'Imagem não encontrada para esta carteirinha' });
    }
    res.contentType(carteirinha.foto.contentType);
    return res.send(carteirinha.foto.data);
  } catch (err) {
    next(err);
  }
}