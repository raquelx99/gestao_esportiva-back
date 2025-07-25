import mongoose from 'mongoose';

const carteirinhaSchema = new mongoose.Schema({
  estudante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudante',
    required: true,
    unique: true
  },
  validade: {
    type: Date,
    required: true
  },
  espacos: [{
    type: String,
    enum: [
      'Piscina',
      'Quadra',
      'Campo Society',
      'Quadra de Tênis',
      'Quadra de Areia',
      'Pista de Atletismo'
    ],
    required: true
  }],
  status: {
    type: String,
    enum: ['pendente','aprovado','rejeitado', 'expirado'],
    default: 'pendente',
    required: true
  },
  liberadoPosValidacao: { type: Boolean, default: false },
  dataRequisicao: {
    type: Date,
    default: Date.now
  },
  foto: {
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
}
}, { timestamps: true });

export const Carteirinha = mongoose.model('Carteirinha', carteirinhaSchema);
