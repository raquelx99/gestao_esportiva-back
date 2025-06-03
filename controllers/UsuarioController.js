import { Usuario }    from '../models/Usuario.js';
import { Estudante }  from '../models/Estudante.js';
import { Funcionario } from '../models/Funcionario.js';

export const criarUsuario = async (req, res) => {
  try {
    const { nome, senha, role } = req.body;

    if (!nome || !senha || !role) {
      return res
        .status(400)
        .json({ erro: 'Campos obrigatórios ausentes: nome, senha e role.' });
    }
    if (!['estudante', 'funcionario'].includes(role)) {
      return res
        .status(400)
        .json({ erro: 'Role inválido. Deve ser "estudante" ou "funcionario".' });
    }

    const novoUsuario = new Usuario({ nome, senha, role });
    await novoUsuario.save();

    let perfilCriado = null;

    if (role === 'estudante') {
      const {
        matricula,
        curso,
        centro,
        telefone,
        telefoneUrgencia
      } = req.body;

      if (!matricula || !curso || !centro || !telefone || !telefoneUrgencia) {
        await Usuario.findByIdAndDelete(novoUsuario._id);
        return res.status(400).json({
          erro:
            'Para role "estudante", é necessário enviar: matricula, curso, centro, telefone e telefoneUrgencia.'
        });
      }

      const novoEstudante = new Estudante({
        user: novoUsuario._id,
        matricula,
        nome,     
        curso,
        centro,
        telefone,
        telefoneUrgencia,
      });
      await novoEstudante.save();
      perfilCriado = { tipo: 'estudante', dados: novoEstudante };

    } else if (role === 'funcionario') {
      const { matricula, cargo } = req.body;
      if (!matricula || !cargo) {
        await Usuario.findByIdAndDelete(novoUsuario._id);
        return res.status(400).json({
          erro: 'Para role "funcionario", é necessário enviar: matricula e cargo.'
        });
      }

      const novoFuncionario = new Funcionario({
        user: novoUsuario._id,
        matricula,
        cargo
      });
      await novoFuncionario.save();
      perfilCriado = { tipo: 'funcionario', dados: novoFuncionario };
    }

    return res.status(201).json({
      usuario: novoUsuario,
      perfil: perfilCriado
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log('*** ERRO 11000 ***', err.keyValue);
      return res
        .status(409)
        .json({
          erro: 'Já existe um usuário ou matrícula cadastrada com esses dados.',
          detalhe: err.keyValue
        });
    }
    return res.status(500).json({ erro: err.message });
  }
};

export const deletarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};
