import express from 'express';
import { login } from '../controllers/AutenticacaoController.js';

const router = express.Router();

// Rota para login
router.post('/', login);

export default router;