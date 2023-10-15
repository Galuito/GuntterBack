import { Schema, model, Document } from "mongoose";

export interface INote extends Document{
  title: string;
  desc: string;
  noteFolder: Schema.Types.ObjectId;
  color: string; //Hexadecimal
  noteOwner: Schema.Types.ObjectId;
}

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  noteFolder: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    required: false
  },
  color:{
    type: String
  },
  noteOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

// No middleware for now, maybe later
// Se esta rompiendo la tecla A de mi teclado :(
// Toda mi laptop se esta rompiendo :(, yo se que nada
// es eterno pero esto me pone muy triste

export default model<INote>('Note', noteSchema);