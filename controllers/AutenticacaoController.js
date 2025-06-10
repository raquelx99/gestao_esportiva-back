import { Usuario }       from '../models/Usuario.js';
import { Estudante }     from '../models/Estudante.js';
import { Funcionario }   from '../models/Funcionario.js';
import { Carteirinha }   from '../models/Carteirinha.js';
import { isPasswordValid } from '../utils/hash.js';
import { gerarToken }      from '../utils/jwt.js';

export const login = async (req, res) => {
  const { matricula, senha } = req.body;

  try {
    const usuarioExistente = await Usuario.findOne({ matricula });

    if (!usuarioExistente) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const userId = usuarioExistente._id;

    const estudante = await Estudante.findOne({ user: userId });
    const funcionario = await Funcionario.findOne({ user: userId });

    const usuarioRelacionado = estudante || funcionario;
    if (!usuarioRelacionado) {
      return res.status(404).json({ mensagem: 'Perfil de usuário não encontrado' });
    }

    const senhaValida = await isPasswordValid(senha, usuarioExistente.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida.' });
    }

    const token = gerarToken(usuarioExistente);

    let carteirinha = null;
    if (usuarioExistente.role === 'estudante' && estudante) {
      carteirinha = await Carteirinha
        .findOne({ estudante: estudante._id })
        .populate(
          'estudante',
          'matricula nome curso centro telefone telefoneUrgencia semestreInicio'
        );
    }

    return res.status(200).json({
      token,
      usuario: {
        id: usuarioExistente._id,
        nome: usuarioExistente.nome,
        matricula: usuarioExistente.matricula,
        role: usuarioExistente.role
      },
      perfil: {
        tipo: usuarioExistente.role,
        dados: usuarioExistente.role === 'estudante'
          ? {
              _id: estudante._id,
              curso: estudante.curso,
              centro: estudante.centro,
              telefone: estudante.telefone,
              telefoneUrgencia: estudante.telefoneUrgencia,
              semestreInicio: estudante.semestreInicio
            }
          : null
      },
      carteirinha: carteirinha
        ? {
            _id: carteirinha._id,
            status: carteirinha.status,
            espacos: carteirinha.espacos,
            validade: carteirinha.validade,
            liberadoPosValidacao: carteirinha.liberadoPosValidacao,
            estudante: carteirinha.estudante
          }
        : null
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
};
