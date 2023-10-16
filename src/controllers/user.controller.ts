import {Request, Response} from 'express'
import User, {IUser} from '../models/user';
import jwt from 'jsonwebtoken';
import config from '../config/config'
import { extractId } from './user.idExtractor';


// Expira en 1209600 Segundos o 14 dias
function createtoken(user: IUser){
  return jwt.sign({id: user.id, email: user.email}, config.jwtSecret, {
    expiresIn: 604800
  });
}

/**
 * 
 * Todas estas notas estan escritas en ingles porque se me hace mas facil pensar en ingles cuando estoy programando
 * en caso de que se lo estuviera preguntando o en caso de que este leyendo esto Profe Mario
 * No pongo acentos porque se buguean cuando guardo los archivos
 */

// Comment this method out once everything is done
export const testerRoute = (req: Request, res: Response) =>{

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
 * email => string
 * username => string
 * password => string
 * name => string
 * lastName => string
 * 
 */
export const signUp = async (req: Request, res: Response): Promise<Response> =>{
  if(!req.body.email || !req.body.password || !req.body.username || !req.body.name || !req.body.lastName){
    return res.status(400).json({msg: 'Please. Provide with all the fields of a User (email, password, username, name and lastName)'});
  }
  // previous check that didn't work with multi checks
  // const user = await User.findOne({email: req.body.email, username: req.body.username});

  // This check should be separated so that you know if it was the email or the username
  const foundUsers = await User.find({
    $or:[
      {email: req.body.email},
      {username: req.body.username}
    ]
  });

  // If no user is found, it returns an empty array which is always true, therefore, you need to check 
  // the array length to determine wether or not there was a user with the same email or username
  // console.log(foundUsers);
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
  if (!req.body.email || !req.body.password){
    return res.status(400).json({msg:'Please. Send your email and password'});
  }

  const user = await User.findOne({email: req.body.email})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const isMatch = await user.comparePassword(req.body.password);
  if (isMatch){
    return res.status(200).json({token: createtoken(user)})
  }

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
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> =>{
  // Checks the authorization header and manages if it were to be undefined
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  try{
    // If there is an authorization header and it passed the verification.
    if (userId) {
      await User.deleteOne({_id: userId});
      return res.status(200).json({msg:`Deleted User with userId: ${userId}`})
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

// UPDATE USER NAMES (not username)
/**
 * 
 * The new name and lastName will be located in the request rather than the headers.
 * Don't pass an empty string or the user will have an empty name or lastname or both.
 * req.body.newName
 * req.body.newLastName
 */
export const modifyUserNames = async (req: Request, res: Response): Promise<Response> =>{
  // Checks the authorization header and manages if it were to be undefined
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  // Makes sure that the user passes the parameters for the modifyNames user method
  if(!req.body.newName || !req.body.newLastName){
    return res.status(400).json({msg: "Please, pass req.body.newName and req.body.newLastName"})
  }
  try{
    if (userId) {
        const user = await User.findOne({_id: userId})
        if(!user){
          return res.status(400).json({msg: 'The user does not exist'});
        }
        // returns user.username
        const modifiedUser = await user.modifyNames(req.body.newName, req.body.newLastName);
        if(modifiedUser){
          return res.status(200).json({msg:`User ${modifiedUser} modified successfully with Name: ${req.body.newName} and Last Name: ${req.body.newLastName}`});
        }else{
          return res.status(500).json({msg:"Something went wrong modifying the user"})
        }
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

    try{
      // If there is an authorization header and it passed the verification.
      if (userId) {
          const user = await User.findOne({_id: userId})
          if(!user){
            return res.status(400).json({msg: 'The user does not exist'});
          }

          return res.status(200).json(
            {
              msg: "User data sent", 
              id:`${user._id}`,
              username:`${user.username}`,
              email:`${user.email}`,
              name:`${user.name}`,
              lastName:`${user.lastName}`,
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