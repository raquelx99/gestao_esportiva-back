import jwt from 'jsonwebtoken';

export const gerarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};
