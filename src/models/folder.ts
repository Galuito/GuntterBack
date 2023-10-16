import { Schema, model, Document } from "mongoose";


// folderOwner is going to be the username, it should work
export interface IFolder extends Document{
  folderName: string;
  folderOwner: Schema.Types.ObjectId;
  modifyName: (newName:string)=> Promise<string>;
}

const folderSchema = new Schema({
  folderName: {
    type: String,
    required: true,
    trim: true
  },
  folderOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

// Don't need to do a middleware for this model
folderSchema.pre<IFolder>('save', async function(next){
  const folder = this;
  next();
})

// Folder Methods
folderSchema.methods.modifyName = async function(newName:string){
  this.folderName = newName;
  await this.save();
  console.log(`Folder: ${this._id} was modified (folderName) and saved successfully`);
  return this._id;
}

export default model<IFolder>('Folder', folderSchema);