import { isPasswordValid } from "../utils/hash.js";
import { Usuario } from "../models/Usuario.js";
import { Estudante }        from "../models/Estudante.js";
import { Funcionario }      from "../models/Funcionario.js";
import { gerarToken } from "../utils/jwt.js";

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
            return res.status(401).json({ erro: "Senha inválida." });
        }

        const token = gerarToken(usuario);

        res.status(200).json({
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                role: usuario.role
            }
        });

    } catch (err) {
        console.log("Erro: ", err);
        return res.status(500).json({ erro: "Erro ao realizar login." });
    }
}
