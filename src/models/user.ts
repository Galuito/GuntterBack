import { model, Schema, Document} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document{
  email: string;
  username: string;
  password: string;
  name: string;
  lastName: string;
  comparePassword: (password:string)=> Promise<boolean>;
  modifyNames: (newName:string, newLastName:string)=> Promise<string>;
  modifyPassword: (newPassword:string)=> Promise<string>;
}

interface Data{
  name: string;
  lastName: string;
  email: string;
  username: string;
}

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true,
    trim: true
  },
  lastName:{
    type: String,
    required: true,
    trim: true
  }
});

userSchema.pre<IUser>('save', async function(next){
  const user = this;
  if (!user.isModified('password')) return next();

  // This only executes if there was a change to the password
  // otherwise, nothing happens and next() is executed
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

// User Methods

userSchema.methods.comparePassword = async function(password: string): Promise<boolean>{
  return await bcrypt.compare(password ,this.password);
}

userSchema.methods.modifyNames = async function(newName: string, newLastName: string): Promise<string>{
  this.name = newName;
  this.lastName = newLastName;
  await this.save();
  console.log(`User: ${this.username} was modified (names) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyPassword = async function(newPassword: string): Promise<string>{
  this.password = newPassword;
  await this.save();
  console.log(`User: ${this.username} was modified (password) and saved successfully`);
  return this.username;
}

export default model<IUser>('User', userSchema);