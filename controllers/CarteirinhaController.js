import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { Carteirinha } from '../models/Carteirinha.js';
import { Estudante }  from '../models/Estudante.js';
import sharp from 'sharp';
import { Usuario } from '../models/Usuario.js';

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
    obj.urlFoto = hasFoto ? `/api/carteirinhas/${carteirinha._id}/foto` : null;

    return res.json(obj);
  } catch (err) {
    next(err);
  }
}

// GET /api/carteirinha/matricula/:matricula
export async function getByMatricula(req, res, next) {
  try {
    const { matricula } = req.params;

    const usuario = await Usuario.findOne({ matricula });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado com essa matrícula' });
    }

    const estudante = await Estudante.findOne({ user: usuario._id });
    if (!estudante) {
      return res.status(404).json({ erro: 'Estudante não encontrado para este usuário' });
    }

    let carteirinha = await Carteirinha
      .findOne({ estudante: estudante._id })
      .populate({
        path: 'estudante',
        select: 'curso centro telefone telefoneUrgencia semestreInicio user',
        populate: {
          path: 'user',
          select: 'nome matricula'
        }
      });

    if (!carteirinha) {
      return res.status(404).json({ erro: 'Carteirinha não encontrada para este estudante' });
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
    obj.urlFoto = hasFoto ? `/api/carteirinhas/${carteirinha._id}/foto` : null;

    return res.json(obj);
  } catch (err) {
    next(err);
  }
}

// PUT /api/carteirinha/:id/renovar
export async function renovarCarteirinha(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const {
      nome,
      matricula,
      curso,
      centro,
      telefone,
      telefoneUrgencia,
      espacos = [],
      periodoEmSemestres = 1
    } = req.body;

    const carteirinha = await Carteirinha.findById(id).session(session);
    if (!carteirinha) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }

    const estudante = await Estudante.findById(carteirinha.estudante).session(session);
    if (!estudante) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Estudante não encontrado' });
    }

    const usuario = await Usuario.findById(estudante.user).session(session);
    if (!usuario) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.nome = nome || usuario.nome;
    usuario.matricula = matricula || usuario.matricula;
    await usuario.save({ session });

    estudante.curso = curso || estudante.curso;
    estudante.centro = centro || estudante.centro;
    estudante.telefone = telefone || estudante.telefone;
    estudante.telefoneUrgencia = telefoneUrgencia || estudante.telefoneUrgencia;
    estudante.semestreInicio = new Date();
    await estudante.save({ session });

    if (!req.file) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ erro: 'Nova imagem da carteirinha é obrigatória.' });
    }

    const novaFoto = await sharp(req.file.buffer)
      .resize(300, 400)
      .jpeg({ quality: 80 })
      .toBuffer();

    const novaValidade = dayjs().add(6 * periodoEmSemestres, 'month').toDate();

    carteirinha.validade = novaValidade;
    carteirinha.espacos = espacos;
    carteirinha.foto = {
      data: novaFoto,
      contentType: 'image/jpeg'
    };
    carteirinha.status = 'pendente';
    carteirinha.liberadoPosValidacao = false;
    carteirinha.dataRequisicao = new Date();
    await carteirinha.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ mensagem: 'Carteirinha renovada com sucesso!' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erro ao renovar carteirinha:', err);
    return next(err);
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

    const estudanteId = carteirinha.estudante._id;
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const carteirinha = await Carteirinha.findById(id).session(session);
    if (!carteirinha) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Carteirinha não encontrada' });
    }

    const estudanteId = carteirinha.estudante;
    const estudante = await Estudante.findById(estudanteId).session(session);
    if (!estudante) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Estudante não encontrado para esta carteirinha' });
    }

    const usuarioId = estudante.user;
    const usuario = await Usuario.findById(usuarioId).session(session);
    if (!usuario) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ erro: 'Usuário não encontrado para este estudante' });
    }

    await Carteirinha.deleteOne({ _id: id }).session(session);
    await Estudante.deleteOne({ _id: estudanteId }).session(session);
    await Usuario.deleteOne({ _id: usuarioId }).session(session);

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Carteirinha rejeitada e usuário/estudante removidos'
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err);
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
      obj.urlFoto = hasFoto ? `/api/carteirinhas/${doc._id}/foto` : null;
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
    obj.urlFoto = hasFoto ? `/api/carteirinhas/${carteirinha._id}/foto` : null;

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
      obj.urlFoto = hasFoto ? `/api/carteirinhas/${doc._id}/foto` : null;
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

export async function getCarteirinhasPorStatus(req, res, next) {
  try {
    const { status } = req.params;
    const carteirinhas = await Carteirinha.find({ status })
      .populate({
        path: 'estudante',
        select: 'nome matricula curso centro telefone telefoneUrgencia semestreInicio user',
        populate: {
          path: 'user',
          select: 'nome matricula'
        }
      });

    const resultado = carteirinhas.map(doc => {
      const obj = doc.toObject({ getters: true, versionKey: false });
      const hasFoto = !!doc.foto?.data;
      if (obj.foto) {
        delete obj.foto.data;
        delete obj.foto.contentType;
      }
      obj.temFoto = hasFoto;
      obj.urlFoto = hasFoto ? `/api/carteirinhas/${doc._id}/foto` : null;
      return obj;
    });

    res.json(resultado);
  } catch (err) {
    next(err);
  }

}

export async function liberarCarteirinha(req, res, next) {
  try {
    const { estudanteId } = req.params;

    const carteirinha = await Carteirinha.findOne({ estudante: estudanteId });

    if (!carteirinha || carteirinha.status !== 'aprovado') {
      return res.status(400).json({ erro: 'Carteirinha não encontrada ou não aprovada.' });
    }

    carteirinha.liberadoPosValidacao = true;
    await carteirinha.save();

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
  
}
