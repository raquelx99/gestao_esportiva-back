import { Usuario } from '../models/Usuario.js';

export const criarUsuario = async (req, res) => {
  try {
    const novoUsuario = new Usuario(req.body);
    await novoUsuario.save();

    res.status(201).json({
      usuario: novoUsuario,
    });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const deletarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id)
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}