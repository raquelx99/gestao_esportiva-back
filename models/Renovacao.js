import mongoose from 'mongoose';

const renovacaoSchema = new mongoose.Schema({
  estudante:   { type: mongoose.Schema.Types.ObjectId, ref: 'Estudante', required: true },
  submittedAt: { type: Date, default: () => new Date() },
  status:      { type: String, enum: ['pendente','aprovado','rejeitado'], default: 'pendente' }
});

export const Renovacao = mongoose.model('Renovacao', renovacaoSchema);
