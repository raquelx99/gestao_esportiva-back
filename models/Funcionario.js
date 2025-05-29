import mongoose from 'mongoose';

const funcionarioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  cargo: { type: String, required: true }
})

export const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
