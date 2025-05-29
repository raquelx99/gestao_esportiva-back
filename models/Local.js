import mongoose from 'mongoose';

const localSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  tipo: { type: String }
});

export const Local = mongoose.model('Local', localSchema);
