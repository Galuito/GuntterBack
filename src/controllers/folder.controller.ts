import {Request, Response} from 'express'
import Folder from '../models/folder';
import User from '../models/user';
import jwt from 'jsonwebtoken';

// Interface for TypeScript
interface JwtPayLoad{
  id: string;
  email: string;
}

function extractId(authorization:string | undefined){
  if (authorization) {
    // Extracts the JWT from the bearer
    const receivedJwt = authorization.split(" ")[1];
    // Decodes the encoded header
    const decodedToken = jwt.decode(receivedJwt) as JwtPayLoad;
    
    // Extracts the ID from the decoded token
    if(decodedToken.id){
      // console.log("Correct JWT returning existing userId")
      return decodedToken.id;
    
    }else{
      console.error('Invalid JWT');
      return undefined;
    }
    
  }
  else {
    console.log("SOMEHOW authorization header is undefined");
    return undefined;
  }
}

// CREATE FOLDER
/**
 * req.body must only have:
 * req.body.folderName
 * The folder owner is extracted from the Authorization header and is then inserted into a creation JSON
 */
export const createFolder = async (req: Request, res: Response) =>{
  if(!req.body.folderName){
    return res.status(400).json({msg:'Folder Name not received'})
  }

  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }
  console.log("createFolder executed by:", user.username);

  const folderData = {
    folderOwner:userId,
    folderName:req.body.folderName
  }

  const newFolder = new Folder(folderData);
  await newFolder.save();

  // Return status 201, alongside with the created new folder for folderOwner
  return res.status(201).json(newFolder);
}

// UPDATE FOLDER NAME
/**
 * req.body must have:
 * req.body.folderId
 * req.body.newFolderName
 */
export const changeFolderName = async (req: Request, res: Response) =>{
  if(!req.body.folderId){
    return res.status(400).json({msg: "No Folder Id was received."})
  }
  if(!req.body.newFolderName){
    return res.status(400).json({msg: "No New Folder Name was received"})
  }

  const folder = await Folder.findOne({_id:req.body.folderId});
  if(!folder){
    return res.status(400).json({msg:`No folder with id ${req.body.folderId}`})
  }
  // folder id
  const modifiedFolder = await folder.modifyName(req.body.newFolderName);
  if(modifiedFolder){
    return res.status(200).json({msg:`Folder ${modifiedFolder} modified successfully with Name: ${req.body.newFolderName}`});
  }else{
    return res.status(500).json({msg:"Something went wrong modifying the user"})
  }
}

// READ ALL USER FOLDERS
export const getUserFolders = async (req: Request, res: Response) =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }

  const folders = await Folder.find({folderOwner:userId})

  res.status(200).json(folders);
}

// DELETE ONE FOLDER BY ID
export const deleteFolder = async (req: Request, res: Response) =>{
  if(!req.body.folderId){
    return res.status(400).json({msg:"No folder ID was received"});
  }
  await Folder.deleteOne({_id: req.body.folderId});
  return res.status(200).json({msg:`Deleted Folder with folderId: ${req.body.folderId}`})

}

// DELETE ALL FOLDERS BY USER ID
export const deleteAllFolders = async (req: Request, res: Response) =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }

  await Folder.deleteMany({folderOwner: userId});
  return res.status(200).json({msg:`All folders from user ${user.username} were deleted`})
}