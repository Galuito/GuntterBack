import {Request, Response} from 'express'
import User, {IUser} from '../models/user';
import Goont from "../models/goont";
import jwt from 'jsonwebtoken';
import config from '../config/config'
import { extractId } from './user.idExtractor';
import * as fuzzy from 'fuzzy';



// Expira en 1209600 Segundos o 14 dias
function createtoken(user: IUser){
  return jwt.sign({id: user.id, email: user.email}, config.jwtSecret, {
    expiresIn: 604800
  });
}

// This is a tester controller that is used to print request and response data so that everything
// behaves correctly, and the correct data is being sent/received
export const testerController = (req: Request, res: Response) =>{

  console.log("Received body: ",req.body);
  // console.log("Received headers: ",req.headers);
  console.log("Authorization header: ", req.headers.authorization)

  // Use optional chaining to safely access req.headers.authorization
  const authorization: string | undefined = req.headers?.authorization;

  const userId = extractId(authorization);
  console.log("Extracted ID:",userId);


  return res.status(200).json({msg:"Reached the end"});
}

// CREATE USER
/**
 * 
 * Simple sign up function that creates a user, please pass the following parameters in the body.
 * OBLIGATORY
 * email => string
 * username => string
 * password => string
 * fullname => string
 * 
 * OPTIONAL
 * bio => string
 * PFP => string
 */
export const signUp = async (req: Request, res: Response): Promise<Response> =>{
  if(!req.body.email || !req.body.password || !req.body.username || !req.body.fullname){
    return res.status(400).json({msg: 'Please. Provide with all the fields of a User (email, password, username and fullname)'});
  }

  // This checks wether if the user or email is already used to avoid creating a user with
  // an already existing credential
  const foundUsers = await User.find({
    $or:[
      {email: req.body.email},
      {username: req.body.username}
    ]
  });

  // If the returned array is lenght 0 that means there's no found user, therefore, the user 
  // may be created
  if(!(foundUsers.length === 0)){
    return res.status(400).json({msg: "The username or email are already used"});
  }

  // Important that the parameters in the body have the same name as the model
  const newUser = new User(req.body);
  await newUser.save();

  return res.status(201).json(newUser);
}

// GENERATE JWT FROM USER
/**
 * 
 * This is a simple signIn function that returns a json web token so that the user is able to browse the 
 * application and see its notes
 */
export const signIn = async (req: Request, res: Response) =>{
  if (!req.body.password){
    return res.status(400).json({msg:'Please. Send your password'});
  }

  if(req.body.email){
    const user = await User.findOne({email: req.body.email})
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch){
      return res.status(200).json({token: createtoken(user)})
    }

  }else if(req.body.username){
    const user = await User.findOne({username: req.body.username});
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch){
      return res.status(200).json({token: createtoken(user)})
    }

  }else{
    return res.status(400).json({msg:'Please. Send email or username'})
  }

  // Code should never reach this far, the code should at least return in the last else statement
  return res.status(400).json({
    msg: 'The email or password are incorrect' 
  })

}

//DELETE USER
/**
 * 
 * This function extracts the JWT from the header passes it to the extracId function and then operates based
 * on the result, if there is no userId and the result is undefined it returns an error
 * 
 * The function now handles the user password, it is sent the password and if it doesn't match
 * then the deletion does not proceed
 * 
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> =>{
  // Checks the authorization header and manages if it were to be undefined
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.password){
    return res.status(400).json({msg:"Please. Send the password"});
  }

  try{
    // If there is an authorization header and it passed the verification.
    if (userId) {
      const user = await User.findOne({_id: userId})
      if(!user){
        return res.status(400).json({msg:"User does not exist"});
      }
      const isMatch = await user.comparePassword(req.body.password);

      if(isMatch){
        await User.deleteOne({_id: userId})
        await Goont.updateMany({likes: userId}, {$pull: {likes: userId}, $inc: {likesInt: -1}});
        return res.status(200).json({msg:`Deleted User with username: ${user.username} and removed its likes`});
      }
      else{
        return res.status(400).json({msg:"Password did not match"});
      }
    }
    else {
      console.log("User ID is undefined");
      return res.status(400).json({msg:"A problem arised with the UserId"});
    }

  }catch(error){
    console.error('Error arised in deleteUser controller:', error)
    return res.status(500).json({msg:`Something went wrong ${error}`})
  }
}

async function isUsernameAvailable(newUsername: String, currentUsername: String) {
  // Query the database to check if the new username is already in use
  const existingUser = await User.findOne({ username: newUsername });

  // If no user with the new username is found or the found user is the current user, the username is available
  return !existingUser || (existingUser.username === currentUsername);
}

export const checkUsername = async (req: Request, res: Response): Promise<Response> => {
  if(!req.body.newUsername || !req.body.username){
    return res.status(400).json({msg:"Please. Pass the usernames to check"})
  }
  const isAvailable = await isUsernameAvailable(req.body.newUsername, req.body.username);
  if(isAvailable){
    return res.status(200).json({isValidUsername: true, msg:"Username is Available."})
  }
  return res.status(400).json({isValidUsername: false, msg:"Username is not Available."} )
}

// UPDATE USER VALUES 
/**
 * 
 * Everything is located in the request body
 * Empty values are handled by the function, so even if you pass only one or none it will work
 * as it should
 * req.body.newUsername
 * req.body.newFullname
 * req.body.newBio
 * 
 * This function is able to handle multiple changes and submit them in the end, even if the 
 * username is not valid, it will work, only that it'll return that the username change failed
 * but everything else worked fine
 * 
 * THIS FUNCTION CAN TAKE SOME SECONDS TO EXECUTE
 */
export const modifyUser = async (req: Request, res: Response): Promise<Response> =>{
  // Checks the authorization header and manages if it were to be undefined
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  // Makes sure that the user passes the parameters for the modifyNames user method
  if(!req.body.newUsername && !req.body.newFullname && !req.body.newBio){
    return res.status(400).json({msg: "No parameters passed. No changes to the user", missingParams:"newUsername, newFullname, newBio"})
  }
  try{
    if (userId) {
        const user = await User.findOne({_id: userId})
        if(!user){
          return res.status(400).json({msg: 'The user does not exist'});
        }

        var modifiedFields: {
          username: string;
          bio: string;
          fullname: string;
        } = {
          username: "unchanged",
          bio: "unchanged",
          fullname: "unchanged"
        };

        var changeFail:boolean = false;

        // I need to return flags as to what was changed correctly
        if(req.body.newUsername){
          const isAvailable = await isUsernameAvailable(req.body.newUsername, user.username);
          if(isAvailable){
            await user.modifyUsername(req.body.newUsername)
            modifiedFields['username'] = "Changed Successfully!";
          }
          else{
            modifiedFields['username'] = "Error! Unavailable."
            changeFail = true;
          }
        }
        if(req.body.newBio){
          await user.modifyBio(req.body.newBio);
          modifiedFields['bio'] = "Changed Successfully!"
        }
        if(req.body.newFullname){
          await user.modifyFullname(req.body.newFullname);
          modifiedFields['fullname'] = "Changed Successfully!"
        }

        if(changeFail){
          // Partial Success Status
          return res.status(207).json({msg:"Partial Success on the changes", modifiedFields})
        }

        return res.status(200).json({msg:"Changes were done correctly",modifiedFields})

    }
    else {
      console.log("Used Id is undefined");
      return res.status(400).json({msg:"A problem arised with the JWT"});
    }
  }
  catch(error){
    console.error('Error decoding JWT:', error)
    return res.status(500).json({msg:`Something went wrong ${error}`})
  }
}

// UPDATE PFP
export const changeProfilePicture = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.newProfilePicture){
    return res.status(400).json({msg:"Please. Provide with the profile picture link"})
  }

  if(userId){
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }
    await user.modifyPFP(req.body.newProfilePicture);
    return res.status(200).json({msg: "Profile Picture modified correctly"})

  }else{
    return res.status(400).json({msg: "Error parsing the JWT"})
  }
}

// UPDATE BANNER
export const changeBanner = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.newBanner){
    return res.status(400).json({msg:"Please. Provide with the banner link"})
  }

  if(userId){
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }
    await user.modifyBanner(req.body.newBanner);
    return res.status(200).json({msg: "Banner modified correctly"})

  }else{
    return res.status(400).json({msg: "Error parsing the JWT"})
  }
}

// UPDATE USER PASSWORD
/**
 * 
 * Don't you dare pass an empty password
 * req.body.newPassword
 */
export const modifyUserPassword = async (req: Request, res: Response): Promise<Response>=>{
    // Checks the authorization header and manages if it were to be undefined
    const authorization: string | undefined = req.headers?.authorization;
    const userId = extractId(authorization);
    if(!req.body.newPassword){
      return res.status(400).json({msg: "Please pass the req.body.newPassword"})
    }
    try{
      // If there is an authorization header and it passed the verification.
      if (userId) {
          const user = await User.findOne({_id: userId})
          if(!user){
            return res.status(400).json({msg: 'The user does not exist'});
          }
          const modifiedUser = await user.modifyPassword(req.body.newPassword);
          if(modifiedUser){
            return res.status(200).json({msg:`User ${modifiedUser} modified successfully with New Password`});
          }else{
            return res.status(500).json({msg:"Something went wrong modifying the user"})
          }
      }
      else {
        console.log("User Id is undefined");
        return res.status(400).json({msg:"A problem arised with the JWT"});
      }
  
    }catch(error){
      console.error('Error decoding JWT:', error)
      return res.status(500).json({msg:`Something went wrong ${error}`})
    }
}

// READ USER DATA
export const getUserData = async (req: Request, res: Response): Promise<Response>=>{
    // Checks the authorization header and manages if it were to be undefined
    const authorization: string | undefined = req.headers?.authorization;
    const userId = extractId(authorization);

    if(!req.body.userId){
      return res.status(400).json({msg: "Please. Provide with the desired userId"})
    }

    try{
      // If there is an authorization header and it passed the verification.
      if (userId) {
          const user = await User.findOne({_id: req.body.userId})
          if(!user){
            return res.status(400).json({msg: 'The user does not exist'});
          }

          return res.status(200).json(
            {
              msg: "User data sent", 
              id:`${user._id}`,
              username:`${user.username}`,
              fullname:`${user.fullname}`,
              bio:`${user.bio}`,
              PFP:`${user.profilePicture}`,
              banner:`${user.bannerPicture}`,
              followerAmount:`${user.followersInt}`,
              followingAmount:`${user.followingInt}`
            });
        
      }
      else {
        console.log("User Id is undefined");
        return res.status(400).json({msg:"A problem arised with the JWT"});
      }
  
    }catch(error){
      console.error('Error decoding JWT:', error)
      return res.status(500).json({msg:`Something went wrong ${error}`})
    }
}

// CHECK IF USER FOLLOWS TARGET USER
export const checkFollowing = async (req: Request, res: Response): Promise<Response>=>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.targetUser){
    return res.status(400).json({msg:"Please. Send the target user's ID"})
  }

  if (userId) {
    const user = await User.findOne({_id: userId});
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }
    
    const targetUser = await User.findOne({_id: req.body.targetUser});
    if(!targetUser){
      return res.status(400).json({msg: 'The target user does not exist'});
    }
    
    const isFollowing = await user.isFollowing(req.body.targetUser);
    if(isFollowing){
      return res.status(200).json({msg: 'The user follows the target user', isFollowing:true})
    }

    return res.status(200).json({msg: 'The user does not follow the target user', isFollowing:false})
  
  }
  else {
    console.log("User Id is undefined");
    return res.status(400).json({msg:"A problem arised with the JWT"});
  }
}

// GET FOLLOWING
/**
 * Returns an array with the information of the users that the user follows
 */
export const getFollowing = async (req: Request, res: Response): Promise<Response>=>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  const user = await User.findOne({_id: userId});
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  if(!req.body.targetUser){
    return res.status(400).json({msg: "Please. Provide with the targetUser Id"});
  }

  const targetUser = await User.findOne({_id: req.body.targetUser});
  if(!targetUser){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const followingList = targetUser.following;
  const followingUsers = await User.find({_id: {$in: followingList}}, { username:true, fullname:true, bio:true, profilePicture:true})
  return res.status(200).json({msg:"Following Users Sent", followingUsers:followingUsers});
}

//GET FOLLOWERS
/**
 * Returns an array with the information of the users that follow the user
 */
export const getFollowers = async (req: Request, res: Response): Promise<Response>=>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  const user = await User.findOne({_id: userId});
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  if(!req.body.targetUser){
    return res.status(400).json({msg: "Please. Provide with the targetUser Id"});
  }

  const targetUser = await User.findOne({_id: req.body.targetUser});
  if(!targetUser){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const followersList = targetUser.followers;
  const followerUsers = await User.find({_id: {$in: followersList}}, { username:true, fullname:true, bio:true, profilePicture:true})
  return res.status(200).json({msg:"Following Users Sent", followerUsers:followerUsers});
}

// FOLLOW USER
/**
 * This function will be in charge of adding a user to its following array, it will also add the 
 * same user to the target user's followers array
 * 
 * The function uses the userId from the authorization header and req.body.targetUser, which is the 
 * targetUser ID, before doing anything, it checks if both users exist.
 */
export const followUser = async (req: Request, res: Response): Promise<Response>=>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.targetUser){
    return res.status(400).json({msg:"Please. Send the target user's ID"})
  }

  try{
    // If there is an authorization header and it passed the verification.
    if (userId) {
        const user = await User.findOne({_id: userId});
        if(!user){
          return res.status(400).json({msg: 'The user does not exist'});
        }
        
        const targetUser = await User.findOne({_id: req.body.targetUser});
        if(!targetUser){
          return res.status(400).json({msg: 'The target user does not exist'});
        }
        
        const isFollowing = await user.isFollowing(req.body.targetUser);
        if(isFollowing){
          return res.status(400).json({msg: 'The target user is already followed by the user'})
        }

        user.followUser(req.body.targetUser)
        targetUser.addFollower(userId);

        return res.status(200).json({msg:"User followed and added successfully"});
      
    }
    else {
      console.log("User Id is undefined");
      return res.status(400).json({msg:"A problem arised with the JWT"});
    }

  }catch(error){
    console.error('Error decoding JWT:', error)
    return res.status(500).json({msg:`Something went wrong ${error}`})
  }
} 


// UNFOLLOW USER
/**
 * It will do the same as the previous function but backwards, it will remove the user from both
 * arrays.
 */
export const unfollowUser = async (req: Request, res: Response): Promise<Response>=>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.targetUser){
    return res.status(400).json({msg:"Please. Send the target user's ID"})
  }

  try{
    // If there is an authorization header and it passed the verification.
    if (userId) {
        const user = await User.findOne({_id: userId});
        if(!user){
          return res.status(400).json({msg: 'The user does not exist'});
        }
        
        const targetUser = await User.findOne({_id: req.body.targetUser});
        if(!targetUser){
          return res.status(400).json({msg: 'The target user does not exist'});
        }
        
        const isFollowing = await user.isFollowing(req.body.targetUser);
        if(!isFollowing){
          return res.status(400).json({msg: 'The target user is not followed by the user'})
        }

        user.unfollowUser(req.body.targetUser)
        targetUser.removeFollower(userId);

        return res.status(200).json({msg:"User unfollowed and removed successfully"});
      
    }
    else {
      console.log("User Id is undefined");
      return res.status(400).json({msg:"A problem arised with the JWT"});
    }

  }catch(error){
    console.error('Error decoding JWT:', error)
    return res.status(500).json({msg:`Something went wrong ${error}`})
  }
} 

export const fuzzySearchUsers = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.username){
    return res.status(400).json({msg: "Please. Provide with the username to search"})
  }

  const user = await User.findOne({_id: userId});
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const allUsers = await User.find({}, 'username fullname profilePicture bio');
  const results = fuzzy.filter(req.body.username, allUsers, { extract: user => user.username });

    // Extract matched users from the fuzzy matching results
  const matchedUsers = results.map(result => result.original);

  return res.status(200).json({msg:"Users sent", users:matchedUsers});
}