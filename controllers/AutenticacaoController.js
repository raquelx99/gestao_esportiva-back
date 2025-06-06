import { Usuario }       from '../models/Usuario.js';
import { Estudante }     from '../models/Estudante.js';
import { Funcionario }   from '../models/Funcionario.js';
import { Carteirinha }   from '../models/Carteirinha.js';
import { isPasswordValid } from '../utils/hash.js';
import { gerarToken }      from '../utils/jwt.js';

export const login = async (req, res) => {
  const { matricula, senha } = req.body;

  try {
    const estudante = await Estudante.findOne({ matricula }).populate('user');

    const funcionario = await Funcionario.findOne({ matricula }).populate('user');

    const usuarioRelacionado = estudante || funcionario;
    if (!usuarioRelacionado) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const usuario = usuarioRelacionado.user;

    const senhaValida = await isPasswordValid(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida.' });
    }

    const token = gerarToken(usuario);

    let carteirinha = null;
    if (usuario.role === 'estudante' && estudante) {
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
        id: usuario._id,
        nome: usuario.nome,
        matricula: estudante.matricula,
        role: usuario.role
      },
      perfil: {
        tipo: usuario.role,
        dados: usuario.role === 'estudante'
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

