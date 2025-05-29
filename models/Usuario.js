import mongoose from 'mongoose';
import { hashPassword } from '../utils/hash.js';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, required: true, enum: ['estudante','funcionario'] }
});

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await hashPassword(this.senha);
  next();
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);
