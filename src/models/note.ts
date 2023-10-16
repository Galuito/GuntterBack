import { Schema, model, Document } from "mongoose";

export interface INote extends Document{
  title: string;
  desc: string;
  noteFolder: Schema.Types.ObjectId;
  color: string; //Hexadecimal
  noteOwner: Schema.Types.ObjectId;
  modifyTitle: (newTitle:string)=> Promise<string>;
  modifyContent: (newContent:string)=> Promise<string>;
  removeFolder: ()=> Promise<string>;
  changeFolder: (newFolder:string)=> Promise<string>;
  modifyColor: (newColor:string)=> Promise<string>;
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
    trim: false
  },
  noteFolder: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    required: false
  },
  color:{
    type: String,
    required: false
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

// Methods
noteSchema.methods.modifyTitle = async function(newTitle: string): Promise<string>{
  this.title = newTitle;
  await this.save();
  console.log(`User: ${this.noteOwner} has modified note: ${this.title} (title) and saved it successfully`);
  return this.title;
}

noteSchema.methods.modifyContent = async function(newContent: string): Promise<string>{
  this.desc = newContent;
  await this.save();
  console.log(`User: ${this.noteOwner} has modified note: ${this.title} (content) and saved it successfully`);
  return this.title;
}

noteSchema.methods.removeFolder = async function(): Promise<string>{
  this.noteFolder = null;
  await this.save();
  console.log(`User: ${this.noteOwner} has removed the folder from note: ${this.title} and saved it successfully`);
  return this.title;
}

noteSchema.methods.changeFolder = async function(newFolder: string): Promise<string>{
  this.noteFolder = newFolder;
  await this.save();
  console.log(`User: ${this.noteOwner} has changed the folder from note: ${this.title} and saved it successfully`);
  return this.title;
}

noteSchema.methods.modifyColor = async function(newColor: string): Promise<string>{
  this.color = newColor;
  await this.save();
  console.log(`User: ${this.noteOwner} has modified note: ${this.title} (color) and saved it successfully`);
  return this.title;
}

export default model<INote>('Note', noteSchema);