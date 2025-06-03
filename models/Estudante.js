import mongoose from 'mongoose';

const estudanteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  matricula:        { type: String, required: true, unique: true },
  nome:             { type: String, required: true },
  curso:            { type: String, required: true },
  centro:           { type: String, required: true },
  telefone:         { type: String, required: true },
  telefoneUrgencia: { type: String, required: true },
  semestreInicio:   { type: Date, default: null}
});

export const Estudante = mongoose.model('Estudante', estudanteSchema);
