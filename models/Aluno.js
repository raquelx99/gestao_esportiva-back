import mongoose from 'mongoose';

const estudanteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },

  matricula:           { type: String, required: true, unique: true },
  curso:               { type: String, required: true },
  centro:              { type: String, required: true },
  telefone:            { type: String, required: true},
  telefoneUrgencia:    { type: String, required: true },
  semestreInicio:      { type: Date,   required: true },
  validadeCarteirinha: { type: Date,   required: true }
});

export const Estudante = mongoose.model('Estudante', estudanteSchema);
