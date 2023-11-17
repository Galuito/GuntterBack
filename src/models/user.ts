import { model, Schema, Document} from 'mongoose';
import bcrypt from 'bcrypt';
import { IGoont } from './goont';

export interface IUser extends Document{
  email: string;
  username: string;
  password: string;
  fullname: string;
  bio: string;
  profilePicture: string;
  bannerPicture: string;
  followers: Array<Schema.Types.ObjectId | IUser>;
  followersInt: number;
  following: Array<Schema.Types.ObjectId | IUser>;
  followingInt: number;
  goonts: Array<Schema.Types.ObjectId | IGoont>;
  createdAt: Date;
  comparePassword: (password:string)=> Promise<boolean>;
  modifyFullname: (newFullname:string)=> Promise<string>;
  modifyBio: (newBio:string)=> Promise<string>;
  modifyPFP: (newPFP:string)=> Promise<string>;
  modifyBanner: (newBanner:string)=> Promise<string>;
  modifyUsername: (newUsername:string)=> Promise<string>;
  modifyPassword: (newPassword:string)=> Promise<string>;
  addFollower: (newFollower:string)=> Promise<string>;
  removeFollower: (oldFollower: string) => Promise<string>;
  followUser: (userToFollow:string)=> Promise<string>;
  unfollowUser: (userToUnfollow: string) => Promise<string>;
  isFollowing: (userToCheck: string) =>Promise<boolean>;
  addGoont: (goontId: string) => Promise<string>;
  removeGoont: (goontId: string) => Promise<string>;
}

// One "small" comment regarding the user schema instead of creating a whole different
// model, the same userSchema model was used to hold the followers and followed users of
// every user, this was done because of the size of this university project, because our users
// won't have more than 50 followers/followed users this won't present a problem, if the 
// application was to be deployed in a real enviroment this would present issues, specifically
// scalability issues because of the amount of data that would have to be loaded every time
// a user is found in the database.
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
  fullname:{
    type: String,
    required: true,
    trim: true
  },
  bio:{
    type: String,
    default:"Ready to guntt!",
    maxlength: 70
  },
  profilePicture:{
    type: String,
    default: 'default_profile_picture.jpg'
  },
  bannerPicture:{
    type: String,
    default: 'https://cdn.wallpapersafari.com/19/73/A9lgnE.jpg'
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followersInt:{
    type: Number,
    default: 0
  },
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followingInt:{
    type: Number,
    default: 0
  },
  goonts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Goont'
    }
  ],
  createdAt:{
    type: Date,
    default: Date.now
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

userSchema.methods.modifyFullname = async function(newFullname: string): Promise<string>{
  this.fullname = newFullname;
  await this.save();
  console.log(`User: ${this.username} was modified (fullname) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyBio = async function(newBio: string): Promise<string>{
  this.bio = newBio;
  await this.save();
  console.log(`User: ${this.username} was modified (bio) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyPFP = async function(newPFP: string): Promise<string>{
  this.profilePicture = newPFP;
  await this.save();
  console.log(`User: ${this.username} was modified (PFP) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyBanner = async function(newBanner: string): Promise<string>{
  this.bannerPicture = newBanner;
  await this.save();
  console.log(`User: ${this.username} was modified (Banner) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyUsername = async function(newUsername: string): Promise<string>{
  this.username = newUsername;
  await this.save();
  console.log(`User: ${this.username} was modified (username) and saved successfully`);
  return this.username;
}

userSchema.methods.modifyPassword = async function(newPassword: string): Promise<string>{
  this.password = newPassword;
  await this.save();
  console.log(`User: ${this.username} was modified (password) and saved successfully`);
  return this.username;
}

//This function will add a user ID to the followers array and add 1 to the followersInt
userSchema.methods.addFollower = async function(newFollower: string): Promise<string>{
  this.followers.push(newFollower);
  this.followersInt = this.followersInt + 1;
  await this.save();
  console.log(`User: ${this.username} was followed by user ${newFollower} successfully`);
  return this.username;
}

userSchema.methods.removeFollower = async function(oldFollower: string): Promise<string>{
  this.followers.pull(oldFollower);
  this.followersInt = this.followersInt - 1;
  await this.save();
  console.log(`User: ${this.username} was unfollowed by user ${oldFollower} successfully`);
  return this.username;
}

// This function will add a user ID to the following array and add 1 to the followingInt
userSchema.methods.followUser = async function(userToFollow: string):Promise<string>{
  this.following.push(userToFollow);
  this.followingInt = this.followingInt + 1;
  await this.save();
  console.log(`User: ${this.username} followed user ${userToFollow} successfully`);
  return this.username;
  
}

// This function will remove a user ID from the following array and subtract 1 from the followingInt
userSchema.methods.unfollowUser = async function(userToUnfollow: string):Promise<string>{
  this.following.pull(userToUnfollow);
  this.followingInt = this.followingInt - 1;
  await this.save();
  console.log(`User: ${this.username} unfollowed user ${userToUnfollow} successfully`);
  return this.username;
}

userSchema.methods.isFollowing = async function(userToCheck: string):Promise<Boolean>{
  return this.following.includes(userToCheck);
}

userSchema.methods.addGoont = async function(goontId: string): Promise<string>{
  this.goonts.push(goontId);
  await this.save();
  console.log(`Goont added successfully to user ${this.username}`);
  return this.username;
}

userSchema.methods.removeGoont = async function(goontId: string): Promise<string>{
  this.goonts.pull(goontId);
  await this.save();
  console.log(`Goont removed successfully from user ${this.username}`);
  return this.username;
}

export default model<IUser>('User', userSchema);