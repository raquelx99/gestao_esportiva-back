import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import autenticarToken from './middlewares/autenticarToken.js'
import autenticacaoRoutes from './routes/autenticacaoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js'
import estudanteRoutes    from './routes/estudanteRoutes.js';
import funcionarioRoutes  from './routes/funcionarioRoutes.js';
import localRoutes        from './routes/localRoutes.js';
import disponibilidadeRoutes from './routes/disponibilidadeRoutes.js';
import carteirinhaRoutes from './routes/carteirinhaRoutes.js'
import notificacaoRoutes from './routes/notificacoesRoutes.js'
import horarioRoutes from './routes/notificacoesRoutes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 MongoDB conectado'))
    .catch((err) => console.error('🔴 Erro ao conectar MongoDB:', err));

// Rotas
app.use('/api/auth', autenticacaoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estudantes', estudanteRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/disponibilidade', disponibilidadeRoutes);
app.use('/api/carteirinhas', carteirinhaRoutes);
app.use('/api/notifications', notificacaoRoutes);

// Se o token for válido, o usuário poderá acessar essa rota caso contrário fica na tela de login
app.get('/verificar-token', autenticarToken, (req, res) => {
    res.json({
        usuario: req.user,
        mensagem: 'Token válido'
    });
});


// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});