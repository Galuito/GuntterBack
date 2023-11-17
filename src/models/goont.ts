import { Document, Schema, model } from 'mongoose';
import { IUser } from './user';

export interface IGoont extends Document {
  content: string;
  author: Schema.Types.ObjectId | IUser;
  likes: Array<Schema.Types.ObjectId | IUser>;
  likesInt: number;
  createdAt: Date;
  image: string;
  parentGoont: Schema.Types.ObjectId;
  isComment: boolean;
  isEdited: boolean;
  modifyContent: (newContent:string) => Promise<string>;
  isOwner: (userId: string) => Promise<boolean>;
  addLike: (userId: string) => Promise<string>;
  removeLike: (userId: string) => Promise<string>;
  isLiked: (userToCheck: string) => Promise<string>;
}

const goontSchema: Schema<IGoont> = new Schema({
  content: {
    type: String,
    required: true,
    maxlength: 160, // Setting a specific character limit for the goonts 
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  likesInt:{
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: false
  },
  parentGoont: {
    type: Schema.Types.ObjectId,
    ref: 'Goont',
    required: false
  },
  isComment:{
    type: Boolean,
    default: false
  },
  isEdited:{
    type: Boolean,
    default: false
  }
});

goontSchema.methods.modifyContent = async function(newContent: string): Promise<string>{
  this.content = newContent;
  this.isEdited = true;
  await this.save()
  return 'Goont modified correctly';
}

goontSchema.methods.isOwner = async function(userId: string): Promise<boolean>{
  return this.author == userId;
}

goontSchema.methods.addLike = async function(userId: string): Promise<string>{
  this.likes.push(userId);
  this.likesInt = this.likesInt + 1;
  await this.save();
  console.log(`Like added successfully to goont ${this._id}`);
  return 'like added';
}

goontSchema.methods.removeLike = async function(userId: string): Promise<string>{
  this.likes.pull(userId);
  this.likesInt = this.likesInt - 1;
  await this.save();
  console.log(`Like removed successfully from goont ${this._id}`);
  return 'like removed';
}

// This returns if the user already likes this goont to see if it can like it again or dislike it.
goontSchema.methods.isLiked = async function(userToCheck: string):Promise<Boolean>{
  return this.likes.includes(userToCheck);
}

export default model<IGoont>('Goont', goontSchema);

