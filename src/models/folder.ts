import { Schema, model, Document } from "mongoose";


// folderOwner is going to be the username, it should work
export interface IFolder extends Document{
  folderName: string;
  folderOwner: Schema.Types.ObjectId;
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

// No method for now

export default model<IFolder>('Folder', folderSchema);