import mongoose from 'mongoose';

const disponibilidadeSchema = new mongoose.Schema({
  local:     { type: mongoose.Schema.Types.ObjectId, ref: 'locals', required: true },
  diaDaSemana: { type: Number, required: true },
  horarioInicio: { type: String, required: true }, 
  horarioFinal:   { type: String, required: true },
  estaDisponivel: { type: Boolean, default: true }
});

export const Disponibilidade = mongoose.model('Disponibilidade', disponibilidadeSchema);
