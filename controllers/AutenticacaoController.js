import { isPasswordValid } from "../utils/hash.js";
import { Usuario } from "../models/Usuario.js";
import { gerarToken } from "../utils/jwt.js";

export const login = async (req, res) => {

    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ erro: "Email inválido." });
        }

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
                email: usuario.email
            }
        });

    } catch (err) {
        console.log("Erro: ", err);
        return res.status(500).json({ erro: "Erro ao realizar login." });
    }
}
