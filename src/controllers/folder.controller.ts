import {Request, Response} from 'express'
import Folder from '../models/folder';
import User from '../models/user';
import { extractId } from './user.idExtractor';


// CREATE FOLDER
/**
 * req.body must only have:
 * req.body.folderName (OPTIONAL if not passed it'll be "New Folder")
 * The folder owner is extracted from the Authorization header and is then inserted into a creation JSON
 */
export const createFolder = async (req: Request, res: Response) =>{
  const folderName = req.body.folderName || 'Nueva Coleccion';

  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }
  console.log("createFolder executed by:", user.username);

  const folderData = {
    folderOwner:userId,
    folderName:folderName
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
/**
 * For this one you don't have to pass nothing to the body, it'll be done using the authorization
 */
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

  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const folder = await Folder.findOne({_id: req.body.folderId})

  if(!folder){
    return res.status(400).json({msg:`No folder by the ID:${req.body.folderId}`})
  }

  // Una string si puede ser comparada a un objectId pero TypeScript se puso poppy y dijo que no se puede ¬¬
  // @ts-ignore
  if(folder.folderOwner == userId){
    await Folder.deleteOne({_id: req.body.folderId});
    return res.status(200).json({msg:`Deleted Folder with folderId: ${req.body.folderId}`})
  }
  else{
    return res.status(400).json({msg:"This user is not the owner of the folder to delete"})
  }

}

// DELETE ALL FOLDERS BY USER ID
export const deleteUserFolders = async (req: Request, res: Response) =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }

  await Folder.deleteMany({folderOwner: userId});
  return res.status(200).json({msg:`All folders from user ${user.username} were deleted`})
}