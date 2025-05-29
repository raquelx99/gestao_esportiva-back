import mongoose from 'mongoose';

const notificacaoSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  type:      { type: String, required: true },
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false }
}, { timestamps: true });

export const Notificacao = mongoose.model('Notificacao', notificacaoSchema);
