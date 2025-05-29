import express from 'express';
import { criarUsuario, deletarUsuario } from '../controllers/UsuarioController.js';

const router = express.Router();

router.post('/', criarUsuario);
router.delete('/:id', deletarUsuario);

export default router;